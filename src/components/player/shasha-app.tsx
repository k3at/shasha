"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type DragEvent,
} from "react";
import type { Channel } from "@/lib/m3u";
import { parseM3U, suggestPlaylistName } from "@/lib/m3u";
import { DEMO_M3U, DEMO_PLAYLIST_NAME } from "@/lib/demo";
import { fetchPlaylistText } from "@/lib/playlist-source";
import { fetchXtreamPlaylist } from "@/lib/xtream";
import {
  createPlaylistId,
  EMPTY_LIBRARY,
  loadLibrary,
  saveLibrary,
  type LibraryState,
  type Playlist,
} from "@/lib/storage";
import { formatChannelCount } from "@/lib/format";
import { AppHeader } from "@/components/player/app-header";
import { GroupRail } from "@/components/player/group-rail";
import { ChannelPanel } from "@/components/player/channel-panel";
import { VideoStage } from "@/components/player/video-stage";
import { NowPlaying } from "@/components/player/now-playing";
import { AddPlaylistDialog, type AddTab } from "@/components/player/add-playlist-dialog";
import { ShortcutsDialog } from "@/components/player/shortcuts-dialog";
import { Toast, type ToastTone } from "@/components/player/toast";
import { KeyboardIcon, LoaderIcon, UploadIcon } from "@/components/player/icons";
import { Logo } from "@/components/player/logo";

const EMPTY_CHANNELS: Channel[] = [];

const subscribeToHydration = () => () => undefined;
const getClientHydrated = () => true;
const getServerHydrated = () => false;

function initialSelection(library: LibraryState): string | null {
  if (library.playlists.length === 0) {
    return null;
  }

  const active =
    library.playlists.find((playlist) => playlist.id === library.activeId) ?? library.playlists[0];
  const lastId = library.lastChannel[active.id];
  const channel = active.channels.find((item) => item.id === lastId) ?? active.channels[0];

  return channel?.id ?? null;
}

export function ShashaApp() {
  const hydrated = useSyncExternalStore(subscribeToHydration, getClientHydrated, getServerHydrated);
  const [library, setLibrary] = useState<LibraryState>(() => loadLibrary() ?? EMPTY_LIBRARY);
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    initialSelection(loadLibrary() ?? EMPTY_LIBRARY),
  );
  const [playSignal, setPlaySignal] = useState(0);
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState("all");
  const [isPlaying, setIsPlaying] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addTab, setAddTab] = useState<AddTab>("url");
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [demoBusy, setDemoBusy] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: ToastTone } | null>(null);
  const [savingWarning, setSavingWarning] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const dragDepth = useRef(0);
  const toastTimer = useRef<number | null>(null);
  const libraryRef = useRef(library);

  const showToast = useCallback((message: string, tone: ToastTone = "info") => {
    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current);
    }

    setToast({ message, tone });
    toastTimer.current = window.setTimeout(() => setToast(null), 4200);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        window.clearTimeout(toastTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    libraryRef.current = library;
  }, [library]);

  useEffect(() => {
    const flush = () => {
      saveLibrary(libraryRef.current);
    };

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        flush();
      }
    };

    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const timer = window.setTimeout(() => {
      const result = saveLibrary(library);
      setSavingWarning(!result.ok);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [library, hydrated]);

  const activePlaylist = useMemo(
    () =>
      library.playlists.find((playlist) => playlist.id === library.activeId) ??
      library.playlists[0] ??
      null,
    [library],
  );

  const channels = activePlaylist?.channels ?? EMPTY_CHANNELS;
  const activeId = activePlaylist?.id ?? null;

  const selectedChannel = useMemo(
    () => channels.find((channel) => channel.id === selectedId) ?? null,
    [channels, selectedId],
  );

  const selectedIndex = useMemo(
    () =>
      selectedChannel ? channels.findIndex((channel) => channel.id === selectedChannel.id) : -1,
    [channels, selectedChannel],
  );

  const favorites = useMemo(() => new Set(library.favorites), [library.favorites]);

  const groups = useMemo(() => {
    const counts = new Map<string, number>();

    for (const channel of channels) {
      counts.set(channel.group, (counts.get(channel.group) ?? 0) + 1);
    }

    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((first, second) => first.name.localeCompare(second.name, "ar"));
  }, [channels]);

  const favoritesCount = useMemo(
    () => channels.filter((channel) => favorites.has(channel.id)).length,
    [channels, favorites],
  );

  const recentCount = useMemo(() => {
    const available = new Set(channels.map((channel) => channel.id));

    return library.recent.filter((id) => available.has(id)).length;
  }, [channels, library.recent]);

  const selectChannel = useCallback(
    (channel: Channel) => {
      if (!activeId) {
        return;
      }

      setSelectedId(channel.id);
      setLibrary((previous) => ({
        ...previous,
        recent: [channel.id, ...previous.recent.filter((id) => id !== channel.id)].slice(0, 30),
        lastChannel: { ...previous.lastChannel, [activeId]: channel.id },
      }));
      setPlaySignal((value) => value + 1);
    },
    [activeId],
  );

  const activatePlaylist = useCallback(
    (id: string) => {
      const playlist = library.playlists.find((item) => item.id === id);

      if (!playlist) {
        return;
      }

      const lastId = library.lastChannel[id];
      const channel =
        playlist.channels.find((item) => item.id === lastId) ?? playlist.channels[0] ?? null;

      setLibrary((previous) => ({ ...previous, activeId: id }));
      setSelectedId(channel?.id ?? null);
      setQuery("");
      setActiveGroup("all");
      setIsPlaying(false);

      if (channel) {
        setPlaySignal((value) => value + 1);
      }
    },
    [library.lastChannel, library.playlists],
  );

  const removePlaylist = useCallback(
    (id: string) => {
      const remaining = library.playlists.filter((playlist) => playlist.id !== id);

      setLibrary((previous) => {
        const playlists = previous.playlists.filter((playlist) => playlist.id !== id);
        const nextActive =
          previous.activeId === id ? (playlists[0]?.id ?? null) : previous.activeId;
        const lastChannel = { ...previous.lastChannel };

        delete lastChannel[id];

        return { ...previous, playlists, activeId: nextActive, lastChannel };
      });

      if (library.activeId === id) {
        const next = remaining[0] ?? null;
        const lastId = next ? library.lastChannel[next.id] : undefined;
        const channel =
          next?.channels.find((item) => item.id === lastId) ?? next?.channels[0] ?? null;

        setSelectedId(channel?.id ?? null);
        setQuery("");
        setActiveGroup("all");
        setIsPlaying(false);
      }

      showToast("حُذفت القائمة من مكتبتك.", "info");
    },
    [library.activeId, library.lastChannel, library.playlists, showToast],
  );

  const commitPlaylist = useCallback(
    (playlist: Playlist) => {
      const first = playlist.channels[0] ?? null;

      setLibrary((previous) => ({
        ...previous,
        playlists: [...previous.playlists, playlist],
        activeId: playlist.id,
      }));
      setSelectedId(first?.id ?? null);
      setQuery("");
      setActiveGroup("all");
      setIsPlaying(false);

      if (first) {
        setPlaySignal((value) => value + 1);
      }

      showToast(
        `أُضيفت «${playlist.name}» — ${formatChannelCount(playlist.channels.length)}.`,
        "success",
      );
    },
    [showToast],
  );

  const addFromUrl = useCallback(
    async (rawUrl: string, name: string) => {
      const text = await fetchPlaylistText(rawUrl);
      const parsed = parseM3U(text, rawUrl);

      if (parsed.channels.length === 0) {
        throw new Error("لم نعثر على قنوات في هذه القائمة. تأكد أنها ملف M3U صالح وليس صفحة ويب.");
      }

      commitPlaylist({
        id: createPlaylistId(),
        name: name.trim() || suggestPlaylistName(rawUrl),
        channels: parsed.channels,
        source: rawUrl,
        addedAt: Date.now(),
      });

      return { count: parsed.channels.length };
    },
    [commitPlaylist],
  );

  const addFromText = useCallback(
    async (text: string, name: string) => {
      const parsed = parseM3U(text);

      if (parsed.channels.length === 0) {
        throw new Error("لم نعثر على قنوات في النص الملصق. تأكد أنه محتوى M3U صالح.");
      }

      commitPlaylist({
        id: createPlaylistId(),
        name: name.trim() || "قائمة ملصقة",
        channels: parsed.channels,
        source: null,
        addedAt: Date.now(),
      });

      return { count: parsed.channels.length };
    },
    [commitPlaylist],
  );

  const addFromFile = useCallback(
    async (file: File, name: string) => {
      const text = await file.text();
      const parsed = parseM3U(text);

      if (parsed.channels.length === 0) {
        throw new Error("لم نعثر على قنوات في الملف. تأكد أنه ملف M3U صالح.");
      }

      commitPlaylist({
        id: createPlaylistId(),
        name: name.trim() || file.name.replace(/\.(m3u8?|txt)$/i, "") || "قائمة من ملف",
        channels: parsed.channels,
        source: null,
        addedAt: Date.now(),
      });

      return { count: parsed.channels.length };
    },
    [commitPlaylist],
  );

  const addFromXtream = useCallback(
    async (server: string, username: string, password: string, name: string) => {
      const result = await fetchXtreamPlaylist({ server, username, password });
      const playlistName = name.trim() || result.suggestedName;
      let host = "xtream";

      try {
        const parsed = new URL(
          /^[a-z][a-z0-9+.-]*:\/\//i.test(server.trim())
            ? server.trim()
            : `http://${server.trim()}`,
        );
        host = parsed.host;
      } catch {
        // نحتفظ بالمصدر العام إذا تعذّر تحليل الرابط؛ التحقق تم في الخادم.
      }

      commitPlaylist({
        id: createPlaylistId(),
        name: playlistName,
        channels: result.channels,
        source: `xtream:${host}`,
        addedAt: Date.now(),
      });

      if (result.truncated) {
        showToast(
          `أُضيفت «${playlistName}» — عُرض أول ${formatChannelCount(result.channels.length)} من أصل ${formatChannelCount(result.total)}.`,
          "info",
        );
      }

      return { count: result.channels.length };
    },
    [commitPlaylist, showToast],
  );

  const addDemo = useCallback(async () => {
    const existing = library.playlists.find((playlist) => playlist.source === "demo");

    if (existing) {
      activatePlaylist(existing.id);
      return { count: existing.channels.length };
    }

    const parsed = parseM3U(DEMO_M3U);

    if (parsed.channels.length === 0) {
      throw new Error("تعذّر تجهيز القائمة التجريبية.");
    }

    commitPlaylist({
      id: createPlaylistId(),
      name: DEMO_PLAYLIST_NAME,
      channels: parsed.channels,
      source: "demo",
      addedAt: Date.now(),
    });

    return { count: parsed.channels.length };
  }, [activatePlaylist, commitPlaylist, library.playlists]);

  const handleDemo = useCallback(async () => {
    if (demoBusy) {
      return;
    }

    setDemoBusy(true);

    try {
      await addDemo();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "تعذّر تحميل القائمة التجريبية.", "error");
    } finally {
      setDemoBusy(false);
    }
  }, [addDemo, demoBusy, showToast]);

  const openAdd = useCallback((tab: AddTab = "url") => {
    setAddTab(tab);
    setAddOpen(true);
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setLibrary((previous) => {
      const exists = previous.favorites.includes(id);

      return {
        ...previous,
        favorites: exists
          ? previous.favorites.filter((favorite) => favorite !== id)
          : [...previous.favorites, id],
      };
    });
  }, []);

  const copyStreamUrl = useCallback(async () => {
    if (!selectedChannel) {
      return;
    }

    try {
      await navigator.clipboard.writeText(selectedChannel.url);
      showToast("نُسخ رابط البث إلى الحافظة.", "success");
    } catch {
      showToast("تعذّر النسخ. افتح البث في تبويب جديد وانسخ الرابط من هناك.", "error");
    }
  }, [selectedChannel, showToast]);

  const goRelative = useCallback(
    (delta: number) => {
      if (channels.length === 0) {
        return;
      }

      const currentIndex = selectedChannel
        ? channels.findIndex((channel) => channel.id === selectedChannel.id)
        : -1;
      const nextIndex = (currentIndex + delta + channels.length) % channels.length;
      const next = channels[nextIndex];

      if (next) {
        selectChannel(next);
      }
    },
    [channels, selectChannel, selectedChannel],
  );

  const goNext = useCallback(() => goRelative(1), [goRelative]);
  const goPrev = useCallback(() => goRelative(-1), [goRelative]);

  const handleDragEnter = useCallback((event: DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.types.includes("Files")) {
      return;
    }

    event.preventDefault();
    dragDepth.current += 1;
    setDragActive(true);
  }, []);

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.types.includes("Files")) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDragLeave = useCallback(() => {
    dragDepth.current = Math.max(0, dragDepth.current - 1);

    if (dragDepth.current === 0) {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    async (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      dragDepth.current = 0;
      setDragActive(false);

      const file = event.dataTransfer.files[0];

      if (!file) {
        return;
      }

      if (!/\.(m3u8?|txt)$/i.test(file.name)) {
        showToast("اسحب ملفاً بامتداد m3u أو m3u8.", "error");
        return;
      }

      try {
        await addFromFile(file, "");
      } catch (error) {
        showToast(error instanceof Error ? error.message : "تعذّر قراءة الملف.", "error");
      }
    },
    [addFromFile, showToast],
  );

  if (!hydrated) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4">
        <Logo className="size-12 rounded-2xl" />
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <LoaderIcon className="size-4 text-brand-300" />
          جارٍ تجهيز شاشتك...
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-dvh flex-col"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <AppHeader
        playlists={library.playlists}
        activeId={library.activeId}
        onSelectPlaylist={activatePlaylist}
        onDeletePlaylist={removePlaylist}
        onOpenAdd={openAdd}
        onOpenShortcuts={() => setShortcutsOpen(true)}
      />

      <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[13rem_21rem_minmax(0,1fr)]">
        <div className="hidden min-h-0 lg:order-1 lg:block">
          <GroupRail
            groups={groups}
            total={channels.length}
            favoritesCount={favoritesCount}
            recentCount={recentCount}
            activeGroup={activeGroup}
            onSelect={(group) => {
              setActiveGroup(group);
              setQuery("");
            }}
          />
        </div>

        <div className="order-2 flex min-h-0 flex-1 flex-col lg:order-2">
          <ChannelPanel
            channels={channels}
            groups={groups}
            activeGroup={activeGroup}
            favorites={favorites}
            recentIds={library.recent}
            selectedId={selectedId}
            isPlaying={isPlaying}
            query={query}
            onQueryChange={setQuery}
            onSelectGroup={(group) => {
              setActiveGroup(group);
              setQuery("");
            }}
            onSelect={selectChannel}
            onToggleFavorite={toggleFavorite}
            onOpenAdd={openAdd}
            hasPlaylist={Boolean(activePlaylist)}
            savingWarning={savingWarning}
          />
        </div>

        <section className="order-1 flex shrink-0 flex-col gap-2.5 p-3 sm:p-4 lg:order-3 lg:grid lg:min-h-0 lg:grid-rows-[1fr_auto] lg:overflow-y-auto lg:p-5">
          <div className="flex flex-col justify-center gap-2.5">
            <VideoStage
              key={`${activeId ?? "none"}:${selectedChannel?.id ?? "empty"}`}
              channel={selectedChannel}
              playSignal={playSignal}
              onPlayingChange={setIsPlaying}
              onOpenAdd={openAdd}
              onDemo={handleDemo}
              demoBusy={demoBusy}
              onToast={showToast}
              onNext={goNext}
              onPrev={goPrev}
              hasNext={channels.length > 1}
              hasPrev={channels.length > 1}
            />

            <NowPlaying
              channel={selectedChannel}
              playlistName={activePlaylist?.name ?? ""}
              index={selectedIndex + 1}
              total={channels.length}
              favorite={selectedChannel ? favorites.has(selectedChannel.id) : false}
              onToggleFavorite={() => {
                if (selectedChannel) {
                  toggleFavorite(selectedChannel.id);
                }
              }}
              onCopy={() => void copyStreamUrl()}
              onPrev={goPrev}
              onNext={goNext}
              hasPrev={channels.length > 1}
              hasNext={channels.length > 1}
            />
          </div>

          <div className="hidden items-center gap-2 px-1 pt-1 lg:flex">
            <KeyboardIcon className="size-3.5 text-muted" />
            <p className="text-[10px] text-muted">
              <span className="text-slate-300">مسافة</span> تشغيل ·{" "}
              <span className="text-slate-300">M</span> كتم ·{" "}
              <span className="text-slate-300">F</span> ملء الشاشة ·{" "}
              <span className="text-slate-300">N / P</span> القناة التالية والسابقة
            </p>
          </div>
        </section>
      </div>

      {addOpen && (
        <AddPlaylistDialog
          initialTab={addTab}
          onClose={() => setAddOpen(false)}
          onAddUrl={addFromUrl}
          onAddFile={addFromFile}
          onAddText={addFromText}
          onAddXtream={addFromXtream}
          onDemo={addDemo}
        />
      )}

      <ShortcutsDialog
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
        titleId="keyboard-shortcuts-title"
      />

      {toast && (
        <Toast message={toast.message} tone={toast.tone} onDismiss={() => setToast(null)} />
      )}

      {dragActive && (
        <div
          className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/80 p-6 backdrop-blur-sm"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="pointer-events-none rounded-3xl border-2 border-dashed border-brand-400/50 bg-brand-400/5 px-10 py-12 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-400/15 text-brand-300">
              <UploadIcon className="size-7" />
            </span>
            <p className="mt-4 text-base font-extrabold">أفلت ملف M3U لإضافته</p>
            <p className="mt-1 text-xs text-muted">سيُضاف كقائمة جديدة ويُفعّل فوراً.</p>
          </div>
        </div>
      )}
    </div>
  );
}
