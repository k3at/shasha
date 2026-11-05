import { cn } from "@/lib/cn";

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-accent-500 text-slate-950 shadow-lg shadow-brand-500/25",
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
        <path d="M9 6.2 18.4 12 9 17.8V6.2Z" />
      </svg>
      <span className="absolute inset-0 rounded-xl ring-1 ring-white/25 ring-inset" />
    </span>
  );
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <Logo />
      {!compact && (
        <span className="leading-none">
          <span className="block text-lg font-extrabold tracking-tight text-foreground">شاشة</span>
          <span className="mt-1 block text-[9px] font-semibold tracking-[0.32em] text-muted">
            SHASHA
          </span>
        </span>
      )}
    </span>
  );
}
