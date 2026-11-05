"use client";

import { Button, IconButton } from "@/components/ui/button";
import { Logo } from "@/components/player/logo";
import { PlaylistMenu } from "@/components/player/playlist-menu";
import { KeyboardIcon, LockIcon, PlusIcon } from "@/components/player/icons";
import type { Playlist } from "@/lib/storage";

export function AppHeader({
  playlists,
  activeId,
  onSelectPlaylist,
  onDeletePlaylist,
  onOpenAdd,
  onOpenShortcuts,
}: {
  playlists: Playlist[];
  activeId: string | null;
  onSelectPlaylist: (id: string) => void;
  onDeletePlaylist: (id: string) => void;
  onOpenAdd: () => void;
  onOpenShortcuts: () => void;
}) {
  return (
    <header className="glass relative z-40 flex h-16 shrink-0 items-center gap-2.5 border-b border-white/5 px-3 sm:gap-3 sm:px-4">
      <div className="flex items-center gap-2.5">
        <Logo />
        <span className="leading-none">
          <span className="block text-lg font-extrabold tracking-tight text-foreground">شاشة</span>
          <span className="mt-1 hidden text-[9px] font-semibold tracking-[0.32em] text-muted sm:block">
            SHASHA
          </span>
        </span>
      </div>

      <span className="mx-0.5 hidden h-7 w-px bg-white/10 sm:block" aria-hidden="true" />

      <div className="min-w-0 flex-1 sm:flex-none">
        <PlaylistMenu
          playlists={playlists}
          activeId={activeId}
          onSelect={onSelectPlaylist}
          onDelete={onDeletePlaylist}
          onAdd={onOpenAdd}
        />
      </div>

      <div className="flex-1" />

      <span className="hidden items-center gap-1.5 text-[10px] font-semibold text-muted md:flex">
        <LockIcon className="size-3.5" />
        محلي وآمن
      </span>

      <IconButton
        label="اختصارات لوحة المفاتيح"
        onClick={onOpenShortcuts}
        className="hidden sm:grid"
      >
        <KeyboardIcon className="size-5" />
      </IconButton>

      <Button
        onClick={() => onOpenAdd()}
        size="sm"
        aria-label="إضافة قائمة تشغيل"
        className="h-10 px-3 sm:px-4"
      >
        <PlusIcon className="size-4" />
        <span className="hidden sm:inline">إضافة قائمة</span>
      </Button>
    </header>
  );
}
