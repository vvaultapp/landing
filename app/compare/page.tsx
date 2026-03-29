import type { Metadata } from "next";
import Link from "next/link";
import { BlogNav, BlogFooter, BottomCta } from "@/components/blog/BlogShell";

export const metadata: Metadata = {
  title: "vvault Compared — How vvault Stacks Up Against Other Tools",
  description:
    "See how vvault compares to Google Drive, Dropbox, BeatStars, and other tools producers use to send and share music.",
  alternates: { canonical: "https://get.vvault.app/compare" },
  openGraph: {
    type: "website",
    title: "vvault Compared — How vvault Stacks Up Against Other Tools",
    description:
      "See how vvault compares to Google Drive, Dropbox, BeatStars, and other tools producers use to send and share music.",
    url: "https://get.vvault.app/compare",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "vvault Compared — How vvault Stacks Up Against Other Tools",
  url: "https://get.vvault.app/compare",
  description:
    "See how vvault compares to Google Drive, Dropbox, BeatStars, and other tools producers use to send and share music.",
  publisher: {
    "@type": "Organization",
    name: "vvault",
    url: "https://get.vvault.app",
  },
};

const comparisons = [
  {
    href: "/blog/vvault-vs-google-drive-for-producers",
    title: "vvault vs Google Drive",
    summary:
      "Drive stores files. vvault shows you what happened after you sent them.",
  },
  {
    href: "/blog/vvault-vs-dropbox-for-producers",
    title: "vvault vs Dropbox",
    summary:
      "Dropbox shares files. vvault tracks engagement and manages your sending workflow.",
  },
  {
    href: "/blog/vvault-vs-beatstars",
    title: "vvault vs BeatStars",
    summary:
      "BeatStars is a marketplace. vvault is a tracked sending workspace. Most serious producers use both.",
  },
  {
    href: "/blog/best-tools-for-sending-beats",
    title: "Best Tools for Sending Beats in 2026",
    summary:
      "A full ranked comparison of every tool producers use to send music.",
  },
];

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-black text-[#f0f0f0]">
      <BlogNav />

      <main className="mx-auto max-w-[720px] px-5 pt-28 pb-20 sm:px-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[42px] lg:leading-[1.1]">
          How vvault Compares
        </h1>

        <p className="mb-4 mt-6 text-[15px] leading-relaxed text-white/70 sm:text-base">
          vvault is a purpose-built music workspace. Here is how it compares to
          the general-purpose tools most producers currently use for sending,
          storing, and sharing music.
        </p>

        <div className="mt-10 grid gap-4">
          {comparisons.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/20 hover:bg-white/[0.05]"
            >
              <h2 className="text-base font-semibold text-white/90 group-hover:text-white">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/50">
                {item.summary}
              </p>
            </Link>
          ))}
        </div>
      </main>

      <BottomCta />
      <BlogFooter />
    </div>
  );
}
