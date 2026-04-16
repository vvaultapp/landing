import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "@supabase/supabase-js"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
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
