"use client";

import Link from "next/link";
import { useEffect } from "react";
import { BlogFooter, BottomCta } from "@/components/blog/BlogShell";
import { LandingNavWrapper } from "@/components/landing/LandingNavWrapper";
import { useLocale } from "@/lib/useLocale";

const comparisons = (fr: boolean) => [
  {
    href: "/blog/vvault-vs-google-drive-for-producers",
    title: "vvault vs Google Drive",
    summary: fr
      ? "Drive stocke des fichiers. vvault te montre ce qui s'est passé après les avoir envoyés."
      : "Drive stores files. vvault shows you what happened after you sent them.",
  },
  {
    href: "/blog/vvault-vs-dropbox-for-producers",
    title: "vvault vs Dropbox",
    summary: fr
      ? "Dropbox partage des fichiers. vvault traque l'engagement et gère ton workflow d'envoi."
      : "Dropbox shares files. vvault tracks engagement and manages your sending workflow.",
  },
  {
    href: "/blog/vvault-vs-beatstars",
    title: "vvault vs BeatStars",
    summary: fr
      ? "BeatStars est une marketplace. vvault est un espace d'envoi avec tracking. La plupart des producteurs sérieux utilisent les deux."
      : "BeatStars is a marketplace. vvault is a tracked sending workspace. Most serious producers use both.",
  },
  {
    href: "/blog/best-tools-for-sending-beats",
    title: fr
      ? "Les meilleurs outils pour envoyer des beats en 2026"
      : "Best Tools for Sending Beats in 2026",
    summary: fr
      ? "Un comparatif complet de tous les outils que les producteurs utilisent pour envoyer leur musique."
      : "A full ranked comparison of every tool producers use to send music.",
  },
];

export default function ComparePage() {
  const [locale] = useLocale();
  const fr = locale === "fr";

  useEffect(() => {
    document.title = fr
      ? "vvault Comparé — Comment vvault se positionne face aux autres outils"
      : "vvault Compared — How vvault Stacks Up Against Other Tools";
  }, [fr]);

  const items = comparisons(fr);

  return (
    <div className="min-h-screen bg-black text-[#f0f0f0]">
      <LandingNavWrapper />

      <main className="mx-auto max-w-[720px] px-5 pt-28 pb-20 sm:px-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[42px] lg:leading-[1.1]">
          {fr ? "Comment vvault se compare" : "How vvault Compares"}
        </h1>

        <p className="mb-4 mt-6 text-[15px] leading-relaxed text-white/70 sm:text-base">
          {fr
            ? "vvault est un espace de travail musical conçu sur mesure. Voici comment il se compare aux outils génériques que la plupart des producteurs utilisent actuellement pour envoyer, stocker et partager leur musique."
            : "vvault is a purpose-built music workspace. Here is how it compares to the general-purpose tools most producers currently use for sending, storing, and sharing music."}
        </p>

        <div className="mt-10 grid gap-4">
          {items.map((item) => (
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
