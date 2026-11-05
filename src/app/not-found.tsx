import type { Metadata } from "next";
import Link from "next/link";
import { buttonClass } from "@/components/ui/button";
import { Logo } from "@/components/player/logo";

export const metadata: Metadata = {
  title: "الصفحة غير موجودة",
};

export default function NotFound() {
  return (
    <main
      id="main"
      className="relative grid min-h-dvh place-items-center overflow-hidden px-5 py-16 text-center"
    >
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
      <div
        className="pointer-events-none absolute top-1/4 left-1/2 size-96 -translate-x-1/2 rounded-full bg-gradient-to-br from-brand-500/15 to-accent-500/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative flex flex-col items-center">
        <Logo className="size-12 rounded-2xl" />
        <p className="mt-6 text-xs font-extrabold tracking-[0.3em] text-brand-300">خطأ 404</p>
        <h1 className="mt-2 text-3xl font-extrabold text-balance sm:text-4xl">لم نجد هذه الصفحة</h1>
        <p className="mt-3 max-w-md text-sm leading-7 text-muted">
          قد يكون الرابط قديماً أو نُقلت الصفحة. عُد إلى شاشة وابدأ من قنواتك المحفوظة.
        </p>
        <Link href="/" className={buttonClass("primary", "md", "mt-7")}>
          العودة إلى شاشة
        </Link>
      </div>
    </main>
  );
}
