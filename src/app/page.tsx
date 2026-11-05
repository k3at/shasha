import type { Metadata } from "next";
import { ShashaApp } from "@/components/player/shasha-app";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
};

export default function HomePage() {
  return (
    <main id="main" className="h-dvh">
      <ShashaApp />
    </main>
  );
}
