import type { NextRequest } from "next/server";

/** يمنع العناوين المحلية والشبكات الخاصة (حماية أساسية من SSRF). */
export function isPrivateHost(hostname: string): boolean {
  const host = hostname
    .toLowerCase()
    .replace(/\.$/, "")
    .replace(/^\[|\]$/g, "");

  if (!host) {
    return true;
  }

  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal")
  ) {
    return true;
  }

  if (host === "::1" || host === "::" || host === "0.0.0.0") {
    return true;
  }

  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);

  if (ipv4) {
    const [a, b] = ipv4.slice(1).map(Number);

    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168)
    );
  }

  if (host.includes(":")) {
    return (
      host.startsWith("fe80") ||
      host.startsWith("fc") ||
      host.startsWith("fd") ||
      host.startsWith("::ffff:127.") ||
      host.startsWith("::ffff:10.") ||
      host.startsWith("::ffff:192.168.")
    );
  }

  return false;
}

/** يقبل روابط http/https العامة فقط. */
export function parsePublicUrl(value: string): URL | null {
  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    if (isPrivateHost(url.hostname)) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

/** محدّد طلبات بسيط في الذاكرة، مناسب لخادم واحد أو عامل واحد. */
export function createRateLimiter(limit: number, windowMs: number) {
  const buckets = new Map<string, { count: number; resetAt: number }>();

  return function rateLimited(request: NextRequest): boolean {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip =
      forwarded?.split(",")[0]?.trim() || request.headers.get("cf-connecting-ip") || "local";
    const now = Date.now();
    const bucket = buckets.get(ip);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(ip, { count: 1, resetAt: now + windowMs });
    } else {
      bucket.count += 1;

      if (bucket.count > limit) {
        return true;
      }
    }

    if (buckets.size > 5_000) {
      for (const [key, value] of buckets) {
        if (value.resetAt <= now) {
          buckets.delete(key);
        }
      }
    }

    return false;
  };
}

export type GuardedFetchResult =
  | { ok: true; response: Response; finalUrl: URL }
  | {
      ok: false;
      reason: "invalid-redirect" | "too-many-redirects" | "timeout" | "network";
    };

type GuardedFetchOptions = {
  timeoutMs?: number;
  maxRedirects?: number;
  method?: "GET" | "POST";
  headers?: HeadersInit | ((url: URL) => HeadersInit);
};

/**
 * طلب خارجي مع مهلة، ومتابعة إعادات التوجيه يدوياً مع إعادة فحص كل وجهة.
 * يمنع إعادة التوجيه إلى عنوان محلي حتى لو كان الرابط الأصلي عاماً.
 */
export async function fetchPublicUrl(
  target: URL,
  options: GuardedFetchOptions = {},
): Promise<GuardedFetchResult> {
  const { timeoutMs = 15_000, maxRedirects = 4, method = "GET", headers } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let current = target;

    for (let hop = 0; hop <= maxRedirects; hop += 1) {
      const resolvedHeaders = typeof headers === "function" ? headers(current) : headers;
      const response = await fetch(current, {
        method,
        redirect: "manual",
        signal: controller.signal,
        cache: "no-store",
        headers: resolvedHeaders,
      });

      if (![301, 302, 303, 307, 308].includes(response.status)) {
        return { ok: true, response, finalUrl: current };
      }

      const location = response.headers.get("location");

      if (!location) {
        return { ok: false, reason: "invalid-redirect" };
      }

      const next = parsePublicUrl(new URL(location, current).toString());

      if (!next) {
        return { ok: false, reason: "invalid-redirect" };
      }

      current = next;
    }

    return { ok: false, reason: "too-many-redirects" };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { ok: false, reason: "timeout" };
    }

    return { ok: false, reason: "network" };
  } finally {
    clearTimeout(timer);
  }
}
