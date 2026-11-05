import type { NextRequest } from "next/server";
import { makeChannel, type Channel } from "@/lib/m3u";
import { createRateLimiter, fetchPublicUrl, parsePublicUrl } from "@/lib/server/net-guard";

export const dynamic = "force-dynamic";

const TIMEOUT_MS = 15_000;
const MAX_BYTES = 16 * 1024 * 1024;
const MAX_CHANNELS = 10_000;
const MAX_REDIRECTS = 3;
const rateLimited = createRateLimiter(20, 60_000);

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36";

type JsonResult = { ok: true; data: unknown } | { ok: false; status: number; message: string };

function jsonError(message: string, status: number): Response {
  return Response.json(
    { error: message },
    { status, headers: { "cache-control": "no-store", "x-content-type-options": "nosniff" } },
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function textOf(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** يقبل معرّفات Xtream الرقمية والنصية. */
function idOf(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return typeof value === "string" ? value.trim() : "";
}

/**
 * يطبّع رابط الخادم: يضيف http عند الحاجة، ويحذف مسار API أو مسار بث ملصق.
 * يعيد null إذا كان الرابط غير صالح أو يشير إلى شبكة محلية.
 */
function normalizeServer(value: string): URL | null {
  const raw = value.trim();

  if (!raw || /\s/.test(raw)) {
    return null;
  }

  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw)
    ? raw
    : /^[a-z][a-z0-9+.-]*:/i.test(raw)
      ? raw
      : `http://${raw}`;

  let url: URL;

  try {
    url = new URL(withScheme);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return null;
  }

  url.username = "";
  url.password = "";
  url.search = "";
  url.hash = "";

  let path = url.pathname.replace(/\/+$/, "");

  // المستخدم قد يلصق رابط API كاملاً أو رابط بث بدل رابط الخادم.
  path = path.replace(/\/(?:player_api|panel_api|get|xmltv)\.php$/i, "");
  path = path.replace(/\/(?:live|movie|series)\/.*$/i, "");
  path = path.replace(/\/+$/, "");

  url.pathname = path || "/";

  return parsePublicUrl(url.toString());
}

function apiUrl(base: URL, username: string, password: string, action?: string): URL {
  const url = new URL(base.toString());
  const prefix = base.pathname.replace(/\/+$/, "");

  url.pathname = `${prefix}/player_api.php`;
  url.search = "";
  url.searchParams.set("username", username);
  url.searchParams.set("password", password);

  if (action) {
    url.searchParams.set("action", action);
  }

  return url;
}

async function fetchJson(url: URL): Promise<JsonResult> {
  const result = await fetchPublicUrl(url, {
    timeoutMs: TIMEOUT_MS,
    maxRedirects: MAX_REDIRECTS,
    headers: (target) => ({
      Accept: "application/json, text/plain, */*",
      "User-Agent": USER_AGENT,
      Referer: target.origin,
    }),
  });

  if (!result.ok) {
    if (result.reason === "timeout") {
      return { ok: false, status: 504, message: "انتهت مهلة الاتصال بخادم Xtream." };
    }

    if (result.reason === "invalid-redirect") {
      return { ok: false, status: 400, message: "إعادة توجيه الخادم تقود إلى عنوان غير مسموح." };
    }

    if (result.reason === "too-many-redirects") {
      return { ok: false, status: 502, message: "عدد مرات إعادة التوجيه كبير جداً." };
    }

    return { ok: false, status: 502, message: "تعذّر الوصول إلى خادم Xtream. تحقق من الرابط." };
  }

  const response = result.response;

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      return {
        ok: false,
        status: 401,
        message: "رفض الخادم بيانات الدخول. تحقق من اسم المستخدم وكلمة المرور.",
      };
    }

    if (response.status === 404) {
      return {
        ok: false,
        status: 404,
        message: "لم نجد واجهة Xtream على هذا الخادم. تأكد من رابط الخادم.",
      };
    }

    return {
      ok: false,
      status: 502,
      message: `أعاد خادم Xtream خطأ HTTP ${response.status}.`,
    };
  }

  const declaredLength = Number(response.headers.get("content-length") ?? "0");

  if (declaredLength > MAX_BYTES) {
    return { ok: false, status: 413, message: "استجابة Xtream أكبر من الحد المسموح." };
  }

  try {
    const text = await response.text();

    if (text.length > MAX_BYTES) {
      return { ok: false, status: 413, message: "استجابة Xtream أكبر من الحد المسموح." };
    }

    return { ok: true, data: JSON.parse(text) };
  } catch {
    return {
      ok: false,
      status: 502,
      message: "الخادم لا يستجيب كواجهة Xtream صالحة. تأكد من رابط الخادم.",
    };
  }
}

export async function POST(request: NextRequest) {
  if (rateLimited(request)) {
    return jsonError("طلبات كثيرة جداً. انتظر دقيقة ثم أعد المحاولة.", 429);
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return jsonError("أرسل بيانات Xtream بصيغة JSON صالحة.", 400);
  }

  if (!isRecord(payload)) {
    return jsonError("بيانات Xtream غير صالحة.", 400);
  }

  const server = textOf(payload.server);
  const username = textOf(payload.username);
  const password = typeof payload.password === "string" ? payload.password : "";

  if (!server || !username || !password) {
    return jsonError("أدخل رابط الخادم واسم المستخدم وكلمة المرور.", 400);
  }

  if (server.length > 2_048 || username.length > 128 || password.length > 128) {
    return jsonError("بيانات Xtream أطول من الحد المسموح.", 400);
  }

  const base = normalizeServer(server);

  if (!base) {
    return jsonError(
      "رابط الخادم غير صالح أو يشير إلى عنوان محلي غير مسموح. مثال: http://example.com:8080",
      400,
    );
  }

  const [infoResult, categoriesResult, streamsResult] = await Promise.all([
    fetchJson(apiUrl(base, username, password)),
    fetchJson(apiUrl(base, username, password, "get_live_categories")),
    fetchJson(apiUrl(base, username, password, "get_live_streams")),
  ]);

  if (infoResult.ok && isRecord(infoResult.data)) {
    const userInfo = isRecord(infoResult.data.user_info) ? infoResult.data.user_info : null;

    if (userInfo && userInfo.auth !== undefined && Number(userInfo.auth) !== 1) {
      return jsonError(
        "بيانات الدخول غير صحيحة. تحقق من رابط الخادم واسم المستخدم وكلمة المرور.",
        401,
      );
    }
  }

  if (!streamsResult.ok) {
    return jsonError(streamsResult.message, streamsResult.status);
  }

  if (!Array.isArray(streamsResult.data)) {
    return jsonError("لم يُرجع الخادم قائمة قنوات مباشرة صالحة.", 502);
  }

  const categoryNames = new Map<string, string>();

  if (categoriesResult.ok && Array.isArray(categoriesResult.data)) {
    for (const item of categoriesResult.data) {
      if (!isRecord(item)) {
        continue;
      }

      const id = idOf(item.category_id);
      const name = textOf(item.category_name);

      if (id && name) {
        categoryNames.set(id, name);
      }
    }
  }

  const channels: Channel[] = [];
  const seen = new Set<string>();
  let total = 0;

  for (const item of streamsResult.data) {
    if (!isRecord(item)) {
      continue;
    }

    const streamId = idOf(item.stream_id);

    if (!streamId) {
      continue;
    }

    total += 1;

    if (channels.length >= MAX_CHANNELS) {
      continue;
    }

    const name = textOf(item.name) || `قناة ${streamId}`;
    const group = categoryNames.get(idOf(item.category_id)) ?? "غير مصنّف";
    const url = new URL(base.toString());
    const prefix = base.pathname.replace(/\/+$/, "");

    url.pathname = `${prefix}/live/${encodeURIComponent(username)}/${encodeURIComponent(password)}/${encodeURIComponent(streamId)}.m3u8`;

    const channel = makeChannel({
      name,
      url: url.toString(),
      logo: textOf(item.stream_icon),
      group,
      tvgId: textOf(item.epg_channel_id),
      tvgName: name,
    });

    if (seen.has(channel.id)) {
      continue;
    }

    seen.add(channel.id);
    channels.push(channel);
  }

  if (channels.length === 0) {
    return jsonError(
      "لم نعثر على قنوات مباشرة في هذا الحساب. تأكد أن الحساب نشط ويدعم البث المباشر.",
      404,
    );
  }

  const serverInfo =
    infoResult.ok && isRecord(infoResult.data) && isRecord(infoResult.data.server_info)
      ? infoResult.data.server_info
      : null;
  const serverLabel = textOf(serverInfo?.url) || base.host;

  return Response.json(
    {
      channels,
      suggestedName: `Xtream — ${serverLabel}`,
      total,
      truncated: total > channels.length,
    },
    {
      status: 200,
      headers: {
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
      },
    },
  );
}
