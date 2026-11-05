import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components / Partial Prefetching غير مفعّلة لأنها غير متوافقة مع التصدير الثابت.
  // فعّلها إذا كان النشر على Cloudflare/VPS فقط.
  typedRoutes: true,
  poweredByHeader: false,
  // يسمح بتجربة التطوير عبر 127.0.0.1 وليس localhost فقط (يمنع حجب HMR).
  allowedDevOrigins: ["127.0.0.1", "localhost"],

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
