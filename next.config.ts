import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
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
      "@react-three/drei",
      "@react-three/fiber",
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
      { source: "/homepage", destination: "/", permanent: true },
      { source: "/auth", destination: "/", permanent: true },
      { source: "/book-call", destination: "/", permanent: true },
      { source: "/dashboard", destination: "/", permanent: true },
      { source: "/data-deletion", destination: "/", permanent: true },
      { source: "/messages", destination: "/", permanent: true },
      { source: "/outreach", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
