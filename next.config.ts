import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  /* Allow the dev server's /_next/* resources when the site is opened over the
     LAN (e.g. testing on a phone via the machine's wifi IP). Dev-only. */
  allowedDevOrigins: ["192.168.0.19", "localhost", "127.0.0.1"],
  /* Strip x-powered-by header so responses ship fewer bytes. */
  poweredByHeader: false,
  /* React strict mode catches perf anti-patterns in dev without
     cost in production. */
  reactStrictMode: true,
  /* Gzip/brotli response compression — on by default, set explicitly
     so future edits can't silently turn it off. */
  compress: true,
  experimental: {
    /* These packages ship hundreds of small files; Next's import
       optimizer pulls only the symbols we actually use, shrinking
       the client bundle substantially. */
    optimizePackageImports: [
      "lucide-react",
      "@supabase/supabase-js",
    ],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    /* Cache optimized variants on the CDN for a year. */
    minimumCacheTTL: 31536000,
    remotePatterns: [
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
  async redirects() {
    return [
      /* Landing blackout: EVERY get.vvault.app URL (homepage, /pricing, blog,
         docs — everything) bounces straight to the app at vvault.app. Served
         as an edge redirect (no HTML, no JS, single 307) so there is zero
         friction — the landing never renders. Host-gated so localhost/LAN dev
         still serves the site normally for future landing work. Temporary
         (307, not 308) so browsers/Google don't cache it permanently — remove
         this block to resurrect the landing instantly. Query strings (UTMs
         etc.) are passed through to vvault.app automatically. */
      /* French landing URLs carry explicit French intent (old links/shares to
         get.vvault.app/fr) → the app's French homepage. Must sit BEFORE the
         catch-all (first matching redirect wins). Visitors with a French
         browser are covered either way: www.vvault.app auto-serves French
         from Accept-Language at any entry point. */
      {
        source: "/fr/:path*",
        has: [{ type: "host", value: "get.vvault.app" }],
        destination: "https://www.vvault.app/fr",
        permanent: false,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "get.vvault.app" }],
        /* www is the app's canonical host (vvault.app itself 308s to www) —
           targeting it directly saves visitors a second redirect hop. */
        destination: "https://www.vvault.app",
        permanent: false,
      },
      { source: "/homepage", destination: "/", permanent: true },
      { source: "/auth", destination: "/", permanent: true },
      { source: "/book-call", destination: "/", permanent: true },
      { source: "/dashboard", destination: "/", permanent: true },
      { source: "/data-deletion", destination: "/", permanent: true },
      { source: "/messages", destination: "/", permanent: true },
      { source: "/outreach", destination: "/", permanent: true },
      // Tournament feature removed — send any old shared links home.
      { source: "/tournament", destination: "/", permanent: true },
      { source: "/tournament/:path*", destination: "/", permanent: true },
      { source: "/fr/tournament", destination: "/fr", permanent: true },
      { source: "/fr/tournament/:path*", destination: "/fr", permanent: true },
    ];
  },
};

export default nextConfig;
