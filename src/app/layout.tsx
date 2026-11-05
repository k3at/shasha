import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Cairo } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: ["IPTV", "M3U", "M3U8", "مشغل IPTV", "قنوات", "بث مباشر", "شاشة", "عربي", "RTL"],
  authors: [{ name: site.author }],
  openGraph: {
    type: "website",
    locale: "ar_SA",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#060a10",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full`}>
      <body className="h-dvh overflow-hidden bg-surface font-sans text-foreground antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:right-3 focus:z-50 focus:rounded-lg focus:bg-brand-500 focus:px-4 focus:py-2 focus:font-semibold focus:text-slate-950"
        >
          تخطَّ إلى المحتوى
        </a>
        {children}
      </body>
    </html>
  );
}
