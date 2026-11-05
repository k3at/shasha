"use client";

import { useDeferredValue, useMemo, useRef } from "react";
import type { Channel } from "@/lib/m3u";
import type { GroupStat } from "@/components/player/group-rail";
import { ChannelAvatar } from "@/components/player/channel-avatar";
import {
  CloseIcon,
  ListIcon,
  LockIcon,
  SearchIcon,
  StarIcon,
  TvIcon,
} from "@/components/player/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { formatCount } from "@/lib/format";
import { matchesQuery, normalizeSearch } from "@/lib/search";
import { useVirtualList } from "@/lib/use-virtual-list";

const ROW_HEIGHT = 68;

const specialGroups = [
  { id: "all", label: "الكل" },
  { id: "favorites", label: "المفضلة" },
  { id: "recent", label: "حديثاً" },
] as const;

function groupLabel(group: string): string {
  if (group === "all") {
    return "كل القنوات";
  }

  if (group === "favorites") {
    return "المفضلة";
  }

  if (group === "recent") {
    return "شوهد حديثاً";
  }

  return group;
}

function Equalizer() {
  return (
    <span className="flex h-3 items-end gap-0.5" aria-label="قيد التشغيل">
      <span className="animate-equalize h-2 w-0.5 rounded-full bg-brand-400" />
      <span className="animate-equalize-delay h-3 w-0.5 rounded-full bg-brand-400" />
      <span className="animate-equalize-slow h-1.5 w-0.5 rounded-full bg-brand-400" />
    </span>
  );
}

function ChannelRow({
  channel,
  selected,
  isPlaying,
  favorite,
  onSelect,
  onToggleFavorite,
}: {
  channel: Channel;
  selected: boolean;
  isPlaying: boolean;
  favorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
}) {
  return (
    <div
      className={cn(
        "flex h-[64px] items-center gap-1 rounded-xl border ps-1 pe-0.5 transition-colors",
        selected
          ? "border-brand-400/20 bg-brand-400/10"
          : "border-transparent hover:bg-white/[0.04]",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-current={selected ? "true" : undefined}
        className="flex h-full min-w-0 flex-1 items-center gap-2.5 rounded-lg text-start"
      >
        <ChannelAvatar name={channel.name} logo={channel.logo} group={channel.group} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span
              className={cn(
                "truncate text-xs",
                selected ? "font-extrabold text-foreground" : "font-bold",
              )}
            >
              {channel.name}
            </span>
            {selected && isPlaying && <Equalizer />}
          </span>
          <span className="mt-1 block truncate text-[10px] text-muted">{channel.group}</span>
        </span>
      </button>

      <button
        type="button"
        aria-label={favorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
        aria-pressed={favorite}
        onClick={onToggleFavorite}
        className={cn(
          "grid size-11 shrink-0 place-items-center rounded-lg transition-colors",
          favorite
            ? "text-warning hover:bg-warning/10"
            : "text-slate-600 hover:bg-white/[0.06] hover:text-slate-300",
        )}
      >
        <StarIcon filled={favorite} className="size-4" />
      </button>
    </div>
  );
}

export function ChannelPanel({
  channels,
  groups,
  activeGroup,
  favorites,
  recentIds,
  selectedId,
  isPlaying,
  query,
  onQueryChange,
  onSelectGroup,
  onSelect,
  onToggleFavorite,
  onOpenAdd,
  hasPlaylist,
  savingWarning,
}: {
  channels: Channel[];
  groups: GroupStat[];
  activeGroup: string;
  favorites: Set<string>;
  recentIds: string[];
  selectedId: string | null;
  isPlaying: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  onSelectGroup: (group: string) => void;
  onSelect: (channel: Channel) => void;
  onToggleFavorite: (id: string) => void;
  onOpenAdd: () => void;
  hasPlaylist: boolean;
  savingWarning: boolean;
}) {
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = normalizeSearch(deferredQuery);

  const baseChannels = useMemo(() => {
    if (activeGroup === "favorites") {
      return channels.filter((channel) => favorites.has(channel.id));
    }

    if (activeGroup === "recent") {
      const byId = new Map(channels.map((channel) => [channel.id, channel]));

      return recentIds
        .map((id) => byId.get(id))
        .filter((channel): channel is Channel => Boolean(channel));
    }

    if (activeGroup !== "all") {
      return channels.filter((channel) => channel.group === activeGroup);
    }

    return channels;
  }, [activeGroup, channels, favorites, recentIds]);

  const filtered = useMemo(() => {
    if (!normalizedQuery) {
      return baseChannels;
    }

    return baseChannels.filter((channel) =>
      matchesQuery(`${channel.name} ${channel.group} ${channel.tvgName ?? ""}`, normalizedQuery),
    );
  }, [baseChannels, normalizedQuery]);

  const listRef = useRef<HTMLDivElement>(null);
  const resetKey = `${activeGroup}|${normalizedQuery}|${channels.length}`;
  const virtual = useVirtualList(listRef, filtered.length, ROW_HEIGHT, resetKey);
  const label = groupLabel(activeGroup);

  return (
    <section className="flex h-full min-h-0 flex-col border-e border-white/5 bg-white/[0.01]">
      <div className="shrink-0 px-3 pt-3">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="ابحث عن قناة..."
            aria-label="البحث عن قناة"
            dir="auto"
            className="h-10 w-full rounded-xl border border-border-subtle bg-surface-soft ps-9 pe-9 text-xs outline-none placeholder:text-muted/60 focus:border-brand-400 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="مسح البحث"
              className="absolute end-1.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-muted hover:bg-white/[0.06] hover:text-foreground"
            >
              <CloseIcon className="size-3.5" />
            </button>
          )}
        </div>

        <div className="no-scrollbar -mx-3 mt-2.5 flex gap-1.5 overflow-x-auto px-3 pb-0.5 lg:hidden">
          {[
            ...specialGroups,
            ...groups.map((group) => ({ id: group.name, label: group.name })),
          ].map((group, index) => (
            <button
              key={`${group.id}-${index}`}
              type="button"
              aria-pressed={activeGroup === group.id}
              onClick={() => onSelectGroup(group.id)}
              className={cn(
                "h-8 shrink-0 rounded-full border px-3 text-[11px] font-semibold transition-colors",
                activeGroup === group.id
                  ? "border-brand-400/30 bg-brand-400/15 text-brand-200"
                  : "border-white/10 bg-white/[0.03] text-muted hover:text-foreground",
              )}
            >
              {group.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-2 py-2.5">
          <div className="flex min-w-0 items-center gap-1.5">
            <h2 className="truncate text-xs font-extrabold">{label}</h2>
            <span className="shrink-0 text-[10px] text-muted tabular-nums" aria-live="polite">
              {formatCount(filtered.length)}
            </span>
          </div>
          {normalizedQuery && (
            <span className="shrink-0 text-[10px] font-semibold text-brand-300">نتائج البحث</span>
          )}
        </div>
      </div>

      {!hasPlaylist ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-brand-400/10 text-brand-300">
            <ListIcon className="size-6" />
          </span>
          <p className="mt-3 text-sm font-extrabold">لا توجد قنوات بعد</p>
          <p className="mt-1 max-w-56 text-[11px] leading-5 text-muted">
            أضف قائمة M3U من رابط أو ملف، وستظهر قنواتك هنا مرتبة حسب المجموعات.
          </p>
          <Button size="sm" className="mt-4" onClick={() => onOpenAdd()}>
            إضافة قائمة تشغيل
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-white/[0.04] text-muted">
            <SearchIcon className="size-6" />
          </span>
          <p className="mt-3 text-sm font-extrabold">لا توجد نتائج</p>
          <p className="mt-1 text-[11px] leading-5 text-muted">
            جرّب كلمة أخرى أو اختر مجموعة مختلفة.
          </p>
          <Button
            size="sm"
            variant="secondary"
            className="mt-4"
            onClick={() => {
              onQueryChange("");
              onSelectGroup("all");
            }}
          >
            عرض كل القنوات
          </Button>
        </div>
      ) : (
        <div
          ref={listRef}
          onScroll={virtual.onScroll}
          className="scroll-area relative min-h-0 flex-1 overflow-y-auto px-2"
        >
          <ul className="relative" style={{ height: filtered.length * ROW_HEIGHT }}>
            {filtered.slice(virtual.range.start, virtual.range.end).map((channel, offset) => {
              const index = virtual.range.start + offset;

              return (
                <li
                  key={channel.id}
                  style={{
                    position: "absolute",
                    top: index * ROW_HEIGHT,
                    left: 0,
                    right: 0,
                    height: ROW_HEIGHT,
                  }}
                  className="py-0.5"
                >
                  <ChannelRow
                    channel={channel}
                    selected={channel.id === selectedId}
                    isPlaying={isPlaying}
                    favorite={favorites.has(channel.id)}
                    onSelect={() => onSelect(channel)}
                    onToggleFavorite={() => onToggleFavorite(channel.id)}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="flex h-9 shrink-0 items-center gap-1.5 border-t border-white/5 px-3">
        {savingWarning ? (
          <p className="truncate text-[9px] leading-4 text-warning">
            تعذّر حفظ المكتبة محلياً — مساحة التخزين ممتلئة.
          </p>
        ) : (
          <p className="flex items-center gap-1.5 truncate text-[9px] leading-4 text-muted">
            <LockIcon className="size-3 shrink-0" />
            المفضلة وآخر مشاهدة تُحفظ تلقائياً على جهازك.
          </p>
        )}
        <TvIcon className="ms-auto size-3 shrink-0 text-muted/50" />
      </div>
    </section>
  );
}
