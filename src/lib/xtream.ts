import type { Channel } from "./m3u";

export type XtreamResult = {
  channels: Channel[];
  suggestedName: string;
  total: number;
  truncated: boolean;
};

const FETCH_TIMEOUT = 35_000;

function isChannel(value: unknown): value is Channel {
  if (!value || typeof value !== "object") {
    return false;
  }

  const channel = value as Record<string, unknown>;

  return (
    typeof channel.id === "string" &&
    typeof channel.name === "string" &&
    typeof channel.url === "string" &&
    typeof channel.group === "string" &&
    (channel.logo === null || typeof channel.logo === "string") &&
    (channel.tvgId === null || typeof channel.tvgId === "string") &&
    (channel.tvgName === null || typeof channel.tvgName === "string")
  );
}

async function errorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { error?: unknown };

    if (typeof payload.error === "string" && payload.error.trim()) {
      return payload.error;
    }
  } catch {
    // نتجاهل الاستجابة غير الصالحة ونعود لرسالة عامة.
  }

  return `تعذّر جلب قنوات Xtream (HTTP ${response.status}).`;
}

/** يجلب قنوات الحساب عبر وسيط الخادم لتجاوز CORS وحماية بيانات الاعتماد. */
export async function fetchXtreamPlaylist(input: {
  server: string;
  username: string;
  password: string;
}): Promise<XtreamResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const endpoint = new URL("api/xtream", document.baseURI);
    const response = await fetch(endpoint.toString(), {
      method: "POST",
      cache: "no-store",
      signal: controller.signal,
      headers: { "content-type": "application/json", Accept: "application/json" },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(await errorMessage(response));
    }

    const payload = (await response.json()) as {
      channels?: unknown;
      suggestedName?: unknown;
      total?: unknown;
      truncated?: unknown;
    };

    if (
      !Array.isArray(payload.channels) ||
      payload.channels.length === 0 ||
      !payload.channels.every(isChannel)
    ) {
      throw new Error("لم نعثر على قنوات في حساب Xtream هذا.");
    }

    return {
      channels: payload.channels,
      suggestedName:
        typeof payload.suggestedName === "string" && payload.suggestedName.trim()
          ? payload.suggestedName
          : "قائمة Xtream",
      total:
        typeof payload.total === "number" && Number.isFinite(payload.total)
          ? payload.total
          : payload.channels.length,
      truncated: payload.truncated === true,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("انتهت مهلة الاتصال بخادم Xtream. تحقق من الرابط وسرعة الشبكة.");
    }

    if (error instanceof TypeError) {
      throw new Error("تعذّر الوصول إلى خدمة Xtream. تحقق من اتصال الشبكة ثم أعد المحاولة.");
    }

    throw error;
  } finally {
    clearTimeout(timer);
  }
}
