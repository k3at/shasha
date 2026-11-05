const FETCH_TIMEOUT = 20_000;

function looksLikePlaylist(text: string): boolean {
  const head = text.trimStart().slice(0, 512).toUpperCase();

  return head.startsWith("#EXTM3U") || head.includes("#EXTINF") || head.includes("#EXT-X-");
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

async function requestText(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    return await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
      headers: { Accept: "application/x-mpegurl, application/vnd.apple.mpegurl, text/plain, */*" },
    });
  } finally {
    clearTimeout(timer);
  }
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

  return `تعذّر جلب القائمة (HTTP ${response.status}).`;
}

function assertPlaylist(text: string): string {
  if (!text.trim()) {
    throw new Error("الملف فارغ. تأكد أن الرابط يعيد قائمة M3U.");
  }

  if (!looksLikePlaylist(text)) {
    throw new Error("الرابط يعيد صفحة ويب وليس ملف M3U. تأكد من استخدام رابط القائمة المباشر.");
  }

  return text;
}

/**
 * يجلب نص القائمة عبر وسيط الخادم أولاً (يتجاوز CORS)، ثم يعود للطلب المباشر
 * عند العمل كموقع ثابت لا يوفّر Route Handlers.
 */
export async function fetchPlaylistText(rawUrl: string): Promise<string> {
  let url: URL;

  try {
    url = new URL(rawUrl.trim());
  } catch {
    throw new Error("أدخل رابطاً صالحاً يبدأ بـ http:// أو https://");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("يدعم شاشة روابط http وhttps فقط.");
  }

  let proxyError: Error | null = null;
  let proxyStatus = 0;

  try {
    const proxy = new URL("api/playlist", document.baseURI);
    proxy.searchParams.set("url", url.toString());

    const response = await requestText(proxy.toString());
    proxyStatus = response.status;

    if (response.ok) {
      return assertPlaylist(await response.text());
    }

    if (response.status === 400 || response.status === 413) {
      proxyError = new Error(await errorMessage(response));
    }
  } catch (error) {
    if (isAbortError(error)) {
      throw new Error("انتهت مهلة جلب القائمة. تحقق من الرابط أو سرعة الاتصال.");
    }

    if (error instanceof Error && error.name === "PlaylistError") {
      throw error;
    }
  }

  if (proxyError) {
    throw proxyError;
  }

  try {
    const response = await requestText(url.toString());

    if (!response.ok) {
      throw new Error(`تعذّر جلب القائمة (HTTP ${response.status}).`);
    }

    return assertPlaylist(await response.text());
  } catch (error) {
    if (isAbortError(error)) {
      throw new Error("انتهت مهلة جلب القائمة. تحقق من الرابط أو سرعة الاتصال.");
    }

    if (
      error instanceof Error &&
      !(error instanceof TypeError) &&
      !error.message.includes("fetch")
    ) {
      throw error;
    }

    const suffix = proxyStatus === 404 ? "" : " قد يمنع الخادم الطلبات الخارجية (CORS).";

    throw new Error(`تعذّر جلب القائمة من المتصفح.${suffix} نزّل ملف M3U وأضفه من تبويب «ملف».`);
  }
}
