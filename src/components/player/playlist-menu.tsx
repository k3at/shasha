"use client";

import { useEffect, useRef, useState } from "react";
import type { Playlist } from "@/lib/storage";
import { cn } from "@/lib/cn";
import { formatChannelCount, formatCount } from "@/lib/format";
import {
  CheckIcon,
  ChevronDownIcon,
  PlusIcon,
  RadioIcon,
  TrashIcon,
} from "@/components/player/icons";

export function PlaylistMenu({
  playlists,
  activeId,
  onSelect,
  onDelete,
  onAdd,
}: {
  playlists: Playlist[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const active = playlists.find((playlist) => playlist.id === activeId) ?? null;

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointer = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setConfirmId(null);
      }
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setConfirmId(null);
      }
    };

    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative min-w-0">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          setOpen((value) => !value);
          setConfirmId(null);
        }}
        className={cn(
          "group flex h-10 min-w-0 items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 transition-colors",
          "hover:border-white/20 hover:bg-white/[0.06]",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400",
        )}
      >
        <RadioIcon className={cn("size-4 shrink-0", active ? "text-brand-300" : "text-muted")} />
        <span className="min-w-0 text-start">
          <span className="block truncate text-xs font-bold">
            {active?.name ?? "لا توجد قائمة"}
          </span>
          <span className="block truncate text-[10px] text-muted">
            {active ? formatChannelCount(active.channels.length) : "أضف قائمتك الأولى للبدء"}
          </span>
        </span>
        <ChevronDownIcon
          className={cn("size-3.5 shrink-0 text-muted transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="قوائم التشغيل"
          className="absolute end-0 top-full z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-surface-raised shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-white/5 px-3.5 py-2.5">
            <span className="text-[10px] font-bold tracking-wide text-muted">قوائمي</span>
            <span className="text-[10px] text-muted">{formatCount(playlists.length)}</span>
          </div>

          <div className="scroll-area max-h-[50dvh] overflow-y-auto p-1.5">
            {playlists.length === 0 && (
              <p className="px-3 py-6 text-center text-xs leading-6 text-muted">
                لا توجد قوائم بعد.
                <br />
                أضف رابط M3U أو ملفاً للبدء.
              </p>
            )}

            {playlists.map((playlist) => {
              const isActive = playlist.id === activeId;
              const confirming = confirmId === playlist.id;

              return (
                <div
                  key={playlist.id}
                  className={cn(
                    "flex items-center gap-1 rounded-xl px-1 transition-colors",
                    isActive ? "bg-brand-400/10" : "hover:bg-white/[0.04]",
                  )}
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onSelect(playlist.id);
                      setOpen(false);
                      setConfirmId(null);
                    }}
                    className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2 py-2.5 text-start"
                  >
                    <span
                      className={cn(
                        "grid size-6 shrink-0 place-items-center rounded-md",
                        isActive ? "text-brand-300" : "text-muted",
                      )}
                    >
                      {isActive ? (
                        <CheckIcon className="size-4" />
                      ) : (
                        <RadioIcon className="size-4" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold">{playlist.name}</span>
                      <span className="block text-[10px] text-muted">
                        {formatChannelCount(playlist.channels.length)}
                      </span>
                    </span>
                  </button>

                  {confirming ? (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        onDelete(playlist.id);
                        setConfirmId(null);
                      }}
                      className="me-1 shrink-0 rounded-lg px-2 py-1.5 text-[10px] font-bold text-danger hover:bg-danger/15"
                    >
                      تأكيد الحذف
                    </button>
                  ) : (
                    <button
                      type="button"
                      role="menuitem"
                      aria-label={`حذف ${playlist.name}`}
                      onClick={() => setConfirmId(playlist.id)}
                      className="me-1 grid size-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-white/[0.06] hover:text-danger"
                    >
                      <TrashIcon className="size-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              onAdd();
              setOpen(false);
              setConfirmId(null);
            }}
            className="flex w-full items-center gap-2 border-t border-white/5 px-4 py-3 text-xs font-bold text-brand-300 hover:bg-brand-400/10"
          >
            <PlusIcon className="size-4" />
            إضافة قائمة جديدة
          </button>
        </div>
      )}
    </div>
  );
}
