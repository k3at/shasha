import type { NextRequest } from "next/server";
import { createRateLimiter, fetchPublicUrl, parsePublicUrl } from "@/lib/server/net-guard";

export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024;
const MAX_REDIRECTS = 4;
const TIMEOUT_MS = 15_000;
const rateLimited = createRateLimiter(30, 60_000);

function jsonError(message: string, status: number): Response {
  return Response.json({ error: message }, { status, headers: { "cache-control": "no-store" } });
}

function parseTarget(value: string): URL | null {
  return parsePublicUrl(value);
}

export async function GET(request: NextRequest) {
  if (rateLimited(request)) {
    return jsonError("طلبات كثيرة جداً. انتظر دقيقة ثم أعد المحاولة.", 429);
  }

  const rawUrl = request.nextUrl.searchParams.get("url")?.trim();

  if (!rawUrl) {
    return jsonError("أضف رابط القائمة في المعامل url.", 400);
  }

  let target = parseTarget(rawUrl);

  if (!target) {
    return jsonError("الرابط غير صالح أو يشير إلى عنوان محلي غير مسموح.", 400);
  }

  let authorization: string | undefined;
  let authorizationOrigin: string | null = null;

  if (target.username || target.password) {
    const credentials = `${decodeURIComponent(target.username)}:${decodeURIComponent(target.password)}`;
    authorization = `Basic ${btoa(credentials)}`;
    authorizationOrigin = target.origin;
    target = new URL(target.toString());
    target.username = "";
    target.password = "";
  }

  const result = await fetchPublicUrl(target, {
    timeoutMs: TIMEOUT_MS,
    maxRedirects: MAX_REDIRECTS,
    headers: (url) => ({
      Accept: "application/x-mpegurl, application/vnd.apple.mpegurl, text/plain, */*",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
      Referer: url.origin,
      // لا نرسل بيانات الدخول إلا إلى الخادم الأصلي، لا إلى وجهة إعادة توجيه أخرى.
      ...(authorization && url.origin === authorizationOrigin
        ? { Authorization: authorization }
        : {}),
    }),
  });

  if (!result.ok) {
    if (result.reason === "timeout") {
      return jsonError("انتهت مهلة الاتصال بخادم القائمة.", 504);
    }

    if (result.reason === "invalid-redirect") {
      return jsonError("إعادة التوجيه تقود إلى عنوان غير مسموح.", 400);
    }

    if (result.reason === "too-many-redirects") {
      return jsonError("عدد مرات إعادة التوجيه كبير جداً.", 502);
    }

    return jsonError("تعذّر الوصول إلى خادم القائمة. تحقق من الرابط.", 502);
  }

  const response = result.response;

  if (!response.ok) {
    return jsonError(`أعاد خادم القائمة خطأ HTTP ${response.status}.`, 502);
  }

  const declaredLength = Number(response.headers.get("content-length") ?? "0");

  if (declaredLength > MAX_BYTES) {
    return jsonError("حجم القائمة أكبر من الحد المسموح (8 ميغابايت).", 413);
  }

  try {
    const text = await response.text();

    if (text.length > MAX_BYTES) {
      return jsonError("حجم القائمة أكبر من الحد المسموح (8 ميغابايت).", 413);
    }

    if (!text.trim()) {
      return jsonError("القائمة فارغة.", 502);
    }

    if (text.trimStart().startsWith("<")) {
      return jsonError("الرابط يعيد صفحة ويب وليس ملف M3U.", 415);
    }

    return new Response(text, {
      status: 200,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return jsonError("انقطع الاتصال أثناء قراءة القائمة.", 502);
  }
}
