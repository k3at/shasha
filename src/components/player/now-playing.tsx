"use client";

import type { Channel } from "@/lib/m3u";
import { ChannelAvatar } from "@/components/player/channel-avatar";
import { IconButton } from "@/components/ui/button";
import { ChevronNextIcon, ExternalIcon, LinkIcon, StarIcon } from "@/components/player/icons";
import { formatCount } from "@/lib/format";

export function NowPlaying({
  channel,
  playlistName,
  index,
  total,
  favorite,
  onToggleFavorite,
  onCopy,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  channel: Channel | null;
  playlistName: string;
  index: number;
  total: number;
  favorite: boolean;
  onToggleFavorite: () => void;
  onCopy: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}) {
  if (!channel) {
    return null;
  }

  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-white/5 bg-white/[0.02] p-2 sm:gap-3 sm:p-2.5">
      <ChannelAvatar
        name={channel.name}
        logo={channel.logo}
        group={channel.group}
        className="size-11 rounded-xl sm:size-12"
      />

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-extrabold sm:text-base">{channel.name}</h2>
        <p className="mt-0.5 truncate text-[10px] text-muted sm:text-[11px]">
          <span>{channel.group}</span>
          <span className="mx-1.5 opacity-40">•</span>
          <span>{playlistName}</span>
          {total > 0 && (
            <>
              <span className="mx-1.5 opacity-40">•</span>
              <span className="tabular-nums" dir="ltr">
                {formatCount(index)} / {formatCount(total)}
              </span>
            </>
          )}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        <IconButton
          label={favorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
          aria-pressed={favorite}
          onClick={onToggleFavorite}
          className={favorite ? "text-warning" : undefined}
        >
          <StarIcon filled={favorite} className="size-4.5" />
        </IconButton>

        <IconButton label="نسخ رابط البث" onClick={onCopy}>
          <LinkIcon className="size-4.5" />
        </IconButton>

        <a
          href={channel.url}
          target="_blank"
          rel="noreferrer"
          aria-label="فتح البث في تبويب جديد"
          title="فتح البث في تبويب جديد"
          className="hidden size-11 place-items-center rounded-xl text-muted transition-colors hover:bg-white/[0.07] hover:text-foreground sm:grid"
        >
          <ExternalIcon className="size-4.5" />
        </a>

        <span className="mx-1 hidden h-6 w-px bg-white/10 sm:block" aria-hidden="true" />

        <IconButton
          label="القناة السابقة"
          onClick={onPrev}
          disabled={!hasPrev}
          className="hidden sm:grid"
        >
          <ChevronNextIcon className="size-4" />
        </IconButton>

        <IconButton
          label="القناة التالية"
          onClick={onNext}
          disabled={!hasNext}
          className="hidden sm:grid"
        >
          <ChevronNextIcon className="size-4 rotate-180" />
        </IconButton>
      </div>
    </div>
  );
}
