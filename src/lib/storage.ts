import type { Channel } from "./m3u";

export type Playlist = {
  id: string;
  name: string;
  channels: Channel[];
  source: string | null;
  addedAt: number;
};

export type LibraryState = {
  playlists: Playlist[];
  activeId: string | null;
  favorites: string[];
  recent: string[];
  lastChannel: Record<string, string>;
};

export const EMPTY_LIBRARY: LibraryState = {
  playlists: [],
  activeId: null,
  favorites: [],
  recent: [],
  lastChannel: {},
};

const STORAGE_KEY = "shasha:library:v1";

function isChannel(value: unknown): value is Channel {
  if (!value || typeof value !== "object") {
    return false;
  }

  const channel = value as Record<string, unknown>;

  return (
    typeof channel.id === "string" &&
    typeof channel.name === "string" &&
    typeof channel.url === "string" &&
    typeof channel.group === "string"
  );
}

function isPlaylist(value: unknown): value is Playlist {
  if (!value || typeof value !== "object") {
    return false;
  }

  const playlist = value as Record<string, unknown>;

  return (
    typeof playlist.id === "string" &&
    typeof playlist.name === "string" &&
    Array.isArray(playlist.channels) &&
    playlist.channels.every(isChannel)
  );
}

export function loadLibrary(): LibraryState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Record<string, unknown>;

    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.playlists)) {
      return null;
    }

    const playlists = parsed.playlists.filter(isPlaylist);
    const activeId =
      typeof parsed.activeId === "string" && playlists.some((item) => item.id === parsed.activeId)
        ? parsed.activeId
        : (playlists[0]?.id ?? null);

    return {
      playlists,
      activeId,
      favorites: Array.isArray(parsed.favorites)
        ? parsed.favorites.filter((item): item is string => typeof item === "string")
        : [],
      recent: Array.isArray(parsed.recent)
        ? parsed.recent.filter((item): item is string => typeof item === "string").slice(0, 30)
        : [],
      lastChannel:
        parsed.lastChannel && typeof parsed.lastChannel === "object"
          ? Object.fromEntries(
              Object.entries(parsed.lastChannel as Record<string, unknown>).filter(
                (entry): entry is [string, string] => typeof entry[1] === "string",
              ),
            )
          : {},
    };
  } catch {
    return null;
  }
}

export type SaveResult = { ok: true } | { ok: false; reason: "quota" | "unknown" };

export function saveLibrary(state: LibraryState): SaveResult {
  if (typeof window === "undefined") {
    return { ok: false, reason: "unknown" };
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return { ok: true };
  } catch (error) {
    const quota =
      error instanceof DOMException &&
      (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED");

    return { ok: false, reason: quota ? "quota" : "unknown" };
  }
}

export function createPlaylistId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `p${crypto.randomUUID().slice(0, 8)}`;
  }

  return `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
