"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

const palettes = [
  "from-teal-400/25 to-emerald-500/10 text-teal-200",
  "from-violet-400/25 to-fuchsia-500/10 text-violet-200",
  "from-sky-400/25 to-blue-500/10 text-sky-200",
  "from-amber-400/25 to-orange-500/10 text-amber-200",
  "from-rose-400/25 to-pink-500/10 text-rose-200",
  "from-lime-400/25 to-green-500/10 text-lime-200",
];

function paletteFor(value: string): string {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return palettes[hash % palettes.length];
}

function initialFor(name: string): string {
  const trimmed = name.trim();
  const withoutArticle = trimmed.replace(/^ال/, "");

  return (withoutArticle || trimmed).charAt(0) || "ش";
}

export function ChannelAvatar({
  name,
  logo,
  group,
  className,
}: {
  name: string;
  logo: string | null;
  group: string;
  className?: string;
}) {
  const [failedLogo, setFailedLogo] = useState<string | null>(null);
  const showLogo = logo !== null && failedLogo !== logo;
  const initial = initialFor(name);

  return (
    <span
      className={cn(
        "relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/5 bg-gradient-to-br",
        paletteFor(group || name),
        className,
      )}
      aria-hidden="true"
    >
      {showLogo ? (
        // الشعارات تأتي من نطاقات يحددها المستخدم، لذا نستخدم img عادياً.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="size-full object-contain p-1.5"
          onError={() => setFailedLogo(logo)}
        />
      ) : (
        <span className="text-base font-extrabold">{initial}</span>
      )}
    </span>
  );
}
