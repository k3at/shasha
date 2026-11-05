export type Channel = {
  id: string;
  name: string;
  url: string;
  logo: string | null;
  group: string;
  tvgId: string | null;
  tvgName: string | null;
};

export type ParseResult = {
  channels: Channel[];
  groups: string[];
  skipped: number;
};

const ATTRIBUTE_RE = /([\w-]+)\s*=\s*"([^"]*)"/g;
const FALLBACK_GROUP = "غير مصنّف";

/** يبحث عن أول فاصلة خارج علامات الاقتباس في سطر EXTINF. */
function findNameSeparator(value: string): number {
  let quoted = false;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === "," && !quoted) {
      return index;
    }
  }

  return -1;
}

/** بصمة قصيرة وثابتة تعتمد على رابط البث، لتبقى المفضّلة بين القوائم. */
function channelId(url: string): string {
  let hash = 0x811c9dc5;

  for (let index = 0; index < url.length; index += 1) {
    hash ^= url.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return `c${(hash >>> 0).toString(36)}`;
}

function clean(value: string | undefined): string {
  return (value ?? "").trim();
}

function safeLogo(value: string | undefined): string | null {
  const logo = clean(value);

  return /^https?:\/\//i.test(logo) ? logo : null;
}

function resolveStreamUrl(rawUrl: string, baseUrl?: string): string | null {
  try {
    const url = baseUrl ? new URL(rawUrl, baseUrl) : new URL(rawUrl);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

export type ChannelInput = {
  name: string;
  url: string;
  logo?: string | null;
  group?: string | null;
  tvgId?: string | null;
  tvgName?: string | null;
};

/** ينشئ قناة موحّدة مع بصمة ثابتة من رابط البث. */
export function makeChannel(input: ChannelInput): Channel {
  return {
    id: channelId(input.url),
    name: clean(input.name) || "قناة",
    url: input.url,
    logo: safeLogo(input.logo ?? undefined),
    group: clean(input.group ?? "") || FALLBACK_GROUP,
    tvgId: clean(input.tvgId ?? "") || null,
    tvgName: clean(input.tvgName ?? "") || null,
  };
}

/**
 * محلّل M3U/M3U8 متسامح مع الملفات الكبيرة والاختلافات الشائعة:
 * BOM، أسطر CRLF، `#EXTGRP`، سمات `tvg-*`، وروابط نسبية عند تمرير baseUrl.
 */
export function parseM3U(text: string, baseUrl?: string): ParseResult {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  const channels: Channel[] = [];
  const seenUrls = new Set<string>();
  let pendingName = "";
  let pendingAttributes: Record<string, string> | null = null;
  let pendingGroup = "";
  let skipped = 0;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      continue;
    }

    if (line.startsWith("#EXTGRP:")) {
      pendingGroup = line.slice(8).trim();
      continue;
    }

    if (line.startsWith("#EXTINF:")) {
      const info = line.slice(8);
      const separator = findNameSeparator(info);
      const attributesPart = separator >= 0 ? info.slice(0, separator) : info;

      pendingName = separator >= 0 ? info.slice(separator + 1).trim() : "";
      pendingAttributes = {};

      ATTRIBUTE_RE.lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = ATTRIBUTE_RE.exec(attributesPart)) !== null) {
        pendingAttributes[match[1].toLowerCase()] = match[2];
      }

      continue;
    }

    if (line.startsWith("#")) {
      continue;
    }

    const url = resolveStreamUrl(line, baseUrl);

    if (!url) {
      skipped += 1;
      pendingName = "";
      pendingAttributes = null;
      pendingGroup = "";
      continue;
    }

    if (seenUrls.has(url)) {
      pendingName = "";
      pendingAttributes = null;
      pendingGroup = "";
      continue;
    }

    let fallbackName = "";

    try {
      fallbackName = new URL(url).hostname.replace(/^www\./, "");
    } catch {
      fallbackName = "قناة";
    }

    const attributes = pendingAttributes ?? {};
    const name = clean(pendingName) || clean(attributes["tvg-name"]) || fallbackName;
    const group = clean(pendingGroup) || clean(attributes["group-title"]) || FALLBACK_GROUP;

    seenUrls.add(url);
    channels.push(
      makeChannel({
        name,
        url,
        logo: attributes["tvg-logo"],
        group,
        tvgId: attributes["tvg-id"],
        tvgName: attributes["tvg-name"],
      }),
    );

    pendingName = "";
    pendingAttributes = null;
    pendingGroup = "";
  }

  const groups = [...new Set(channels.map((channel) => channel.group))].sort((a, b) =>
    a.localeCompare(b, "ar"),
  );

  return { channels, groups, skipped };
}

/** يقترح اسماً مقروءاً لقائمة من رابطها أو اسم الملف. */
export function suggestPlaylistName(source: string): string {
  const value = source.trim();

  if (!value) {
    return "قائمة جديدة";
  }

  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    const file = url.pathname.split("/").filter(Boolean).pop();

    if (file && /\.(m3u8?|txt)$/i.test(file)) {
      return decodeURIComponent(file).replace(/\.(m3u8?|txt)$/i, "");
    }

    return host || "قائمة جديدة";
  } catch {
    return value.replace(/\.(m3u8?|txt)$/i, "") || "قائمة جديدة";
  }
}

export function isDashStream(url: string): boolean {
  return /\.mpd(\?|#|$)/i.test(url);
}
