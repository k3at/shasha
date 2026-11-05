"use client";

import { cn } from "@/lib/cn";
import { formatCount } from "@/lib/format";
import {
  ClockIcon,
  GridIcon,
  ListIcon,
  LockIcon,
  StarIcon,
  TvIcon,
} from "@/components/player/icons";

export type GroupStat = { name: string; count: number };

function RailItem({
  active,
  label,
  count,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  icon: typeof ListIcon;
  onClick: () => void;
}) {
  return (
    <li className="relative">
      {active && (
        <span
          className="absolute inset-y-1.5 start-0 w-0.5 rounded-full bg-brand-400"
          aria-hidden="true"
        />
      )}
      <button
        type="button"
        aria-pressed={active}
        onClick={onClick}
        className={cn(
          "flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-xs font-semibold transition-colors",
          active
            ? "bg-white/[0.07] text-foreground"
            : "text-muted hover:bg-white/[0.04] hover:text-foreground",
        )}
      >
        <Icon className={cn("size-4 shrink-0", active ? "text-brand-300" : "text-muted")} />
        <span className="min-w-0 flex-1 truncate text-start">{label}</span>
        <span className="shrink-0 text-[10px] font-medium text-muted tabular-nums">
          {formatCount(count)}
        </span>
      </button>
    </li>
  );
}

export function GroupRail({
  groups,
  total,
  favoritesCount,
  recentCount,
  activeGroup,
  onSelect,
}: {
  groups: GroupStat[];
  total: number;
  favoritesCount: number;
  recentCount: number;
  activeGroup: string;
  onSelect: (group: string) => void;
}) {
  return (
    <aside className="flex h-full min-h-0 flex-col border-e border-white/5 bg-white/[0.015]">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h2 className="text-[10px] font-extrabold tracking-[0.18em] text-slate-400">المكتبة</h2>
        <span className="text-[10px] text-muted tabular-nums">{formatCount(total)}</span>
      </div>

      <nav
        aria-label="تصفية القنوات"
        className="scroll-area min-h-0 flex-1 overflow-y-auto px-2 pb-3"
      >
        <ul className="space-y-0.5">
          <RailItem
            active={activeGroup === "all"}
            label="كل القنوات"
            count={total}
            icon={ListIcon}
            onClick={() => onSelect("all")}
          />
          <RailItem
            active={activeGroup === "favorites"}
            label="المفضلة"
            count={favoritesCount}
            icon={StarIcon}
            onClick={() => onSelect("favorites")}
          />
          <RailItem
            active={activeGroup === "recent"}
            label="شوهد حديثاً"
            count={recentCount}
            icon={ClockIcon}
            onClick={() => onSelect("recent")}
          />
        </ul>

        <div className="mt-4 mb-1.5 flex items-center gap-1.5 px-2.5">
          <GridIcon className="size-3 text-muted" />
          <h3 className="text-[9px] font-extrabold tracking-[0.18em] text-slate-500">المجموعات</h3>
        </div>

        <ul className="space-y-0.5">
          {groups.map((group) => (
            <li key={group.name} className="relative">
              {activeGroup === group.name && (
                <span
                  className="absolute inset-y-1.5 start-0 w-0.5 rounded-full bg-brand-400"
                  aria-hidden="true"
                />
              )}
              <button
                type="button"
                aria-pressed={activeGroup === group.name}
                onClick={() => onSelect(group.name)}
                className={cn(
                  "flex h-8 w-full items-center gap-2 rounded-lg px-2.5 text-[11px] transition-colors",
                  activeGroup === group.name
                    ? "bg-white/[0.07] font-bold text-foreground"
                    : "font-medium text-muted hover:bg-white/[0.04] hover:text-foreground",
                )}
              >
                <TvIcon
                  className={cn(
                    "size-3.5 shrink-0",
                    activeGroup === group.name ? "text-brand-300" : "text-slate-600",
                  )}
                />
                <span className="min-w-0 flex-1 truncate text-start">{group.name}</span>
                <span className="shrink-0 text-[9px] text-muted tabular-nums">
                  {formatCount(group.count)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-white/5 px-4 py-3">
        <p className="flex items-center gap-1.5 text-[9px] leading-4 text-muted">
          <LockIcon className="size-3 shrink-0" />
          قوائمك ومفضّلاتك تبقى على جهازك.
        </p>
      </div>
    </aside>
  );
}
