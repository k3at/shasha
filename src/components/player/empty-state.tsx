"use client";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/player/logo";
import { LoaderIcon, LockIcon, PlayIcon, SparkIcon, UploadIcon } from "@/components/player/icons";

const hints = [
  { icon: PlayIcon, label: "HLS و MP4" },
  { icon: LockIcon, label: "يُحفظ محلياً" },
  { icon: UploadIcon, label: "رابط أو ملف" },
];

export function EmptyState({
  onOpenAdd,
  onDemo,
  demoBusy,
}: {
  onOpenAdd: () => void;
  onDemo: () => void;
  demoBusy: boolean;
}) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden px-4 text-center">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-gradient-to-br from-brand-500/20 to-accent-500/20 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative flex flex-col items-center">
        <div className="relative">
          <span className="absolute inset-0 -m-3 animate-ping rounded-3xl border border-brand-400/20 opacity-30" />
          <Logo className="size-12 rounded-2xl sm:size-14" />
        </div>

        <h2 className="mt-4 text-lg font-extrabold text-balance sm:mt-5 sm:text-2xl">
          شاشتك جاهزة
        </h2>
        <p className="mt-1.5 hidden max-w-sm text-xs leading-6 text-muted sm:block sm:text-sm">
          أضف قائمة M3U واحدة وستظهر قنواتك هنا، مرتبة حسب المجموعات — بلا حساب وبلا إعلانات.
        </p>
        <p className="mt-1 text-[11px] text-muted sm:hidden">أضف قائمة M3U للبدء</p>

        <div className="mt-4 flex flex-col items-center gap-2 sm:mt-6 sm:flex-row">
          <Button onClick={() => onOpenAdd()} size="sm" className="h-10 min-w-40">
            <PlayIcon className="size-4" />
            إضافة قائمة تشغيل
          </Button>
          <Button
            onClick={onDemo}
            variant="secondary"
            size="sm"
            className="h-10 min-w-40"
            disabled={demoBusy}
          >
            {demoBusy ? <LoaderIcon className="size-4" /> : <SparkIcon className="size-4" />}
            {demoBusy ? "جارٍ التحميل..." : "تجربة القائمة التجريبية"}
          </Button>
        </div>

        <div className="mt-5 hidden items-center gap-4 sm:flex">
          {hints.map((hint) => {
            const Icon = hint.icon;

            return (
              <span
                key={hint.label}
                className="flex items-center gap-1.5 text-[10px] font-semibold text-muted"
              >
                <Icon className="size-3.5 text-brand-300/80" />
                {hint.label}
              </span>
            );
          })}
        </div>

        <p className="mt-4 hidden text-[10px] text-muted/70 md:block">
          أو أفلت ملف M3U في أي مكان في الصفحة
        </p>
      </div>
    </div>
  );
}
