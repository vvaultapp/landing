import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "vvault | The proper way to send your music",
  description:
    "Upload, share, track engagement, run campaigns, and sell your music in one vvault workflow.",
  icons: {
    icon: "/apple-touch-icon.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-[#0e0e0e] text-[#f0f0f0] font-sans">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
