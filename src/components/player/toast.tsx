"use client";

import { AlertIcon, CheckIcon, CloseIcon, InfoIcon } from "@/components/player/icons";
import { cn } from "@/lib/cn";

export type ToastTone = "success" | "error" | "info";

const toneStyles: Record<ToastTone, string> = {
  success: "border-brand-400/30 bg-brand-400/10 text-brand-100",
  error: "border-danger/30 bg-danger/10 text-rose-100",
  info: "border-white/10 bg-surface-soft text-foreground",
};

const toneIcons = {
  success: CheckIcon,
  error: AlertIcon,
  info: InfoIcon,
};

export function Toast({
  message,
  tone,
  onDismiss,
}: {
  message: string;
  tone: ToastTone;
  onDismiss: () => void;
}) {
  const Icon = toneIcons[tone];

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[60] flex justify-center px-4">
      <div
        role={tone === "error" ? "alert" : "status"}
        className={cn(
          "pointer-events-auto flex max-w-md items-center gap-2.5 rounded-2xl border px-3.5 py-2.5 text-xs font-semibold shadow-2xl backdrop-blur-xl",
          toneStyles[tone],
        )}
      >
        <Icon className="size-4 shrink-0" />
        <span className="leading-5">{message}</span>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="إغلاق التنبيه"
          className="grid size-7 shrink-0 place-items-center rounded-lg text-current/70 hover:bg-white/10"
        >
          <CloseIcon className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
