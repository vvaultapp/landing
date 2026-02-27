import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Integrity | Revenue Operating System",
  description:
    "Built to triage conversations fast, track lead stages, and automate your outreach with an AI setter.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-[#080808] text-[#f0f0f0] font-sans">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
