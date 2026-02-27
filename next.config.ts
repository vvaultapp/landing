import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return [
      { source: "/homepage", destination: "/", permanent: false },
      { source: "/auth", destination: "/", permanent: false },
      { source: "/book-call", destination: "/", permanent: false },
      { source: "/dashboard", destination: "/", permanent: false },
      { source: "/privacy", destination: "/", permanent: false },
      { source: "/terms", destination: "/", permanent: false },
      { source: "/data-deletion", destination: "/", permanent: false },
      { source: "/messages", destination: "/", permanent: false },
      { source: "/outreach", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
