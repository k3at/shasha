export const site = {
  name: "شاشة",
  nameEn: "Shasha",
  tagline: "مشغّل IPTV عربي خفيف وسريع",
  description:
    "شاشة مشغّل IPTV عربي خفيف في المتصفح: أضف قائمة M3U من رابط أو ملف، تنقّل بين القنوات والمجموعات، وشاهد HLS بجودة عالية مع حفظ مفضّلاتك على جهازك.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  author: "شاشة",
  nav: [] as { label: string; href: string }[],
} as const;

export type Site = typeof site;
