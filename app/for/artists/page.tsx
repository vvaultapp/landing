import type { Metadata } from "next";
import Link from "next/link";
import { BlogFooter, BottomCta } from "@/components/blog/BlogShell";
import { LandingNavWrapper } from "@/components/landing/LandingNavWrapper";

export const metadata: Metadata = {
  title:
    "vvault for Artists — Organize Releases, Collaborate, and Share Music Professionally",
  description:
    "vvault helps artists organize releases, collaborate with producers, share music with their team, and track who is engaging with their work.",
  alternates: { canonical: "https://get.vvault.app/for/artists" },
  openGraph: {
    type: "website",
    title:
      "vvault for Artists — Organize Releases, Collaborate, and Share Music Professionally",
    description:
      "vvault helps artists organize releases, collaborate with producers, share music with their team, and track who is engaging with their work.",
    url: "https://get.vvault.app/for/artists",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "vvault for Artists",
  url: "https://get.vvault.app/for/artists",
  description:
    "vvault helps artists organize releases, collaborate with producers, share music with their team, and track who is engaging with their work.",
  publisher: {
    "@type": "Organization",
    name: "vvault",
    url: "https://get.vvault.app",
  },
};

export default function ArtistsPage() {
  return (
    <div className="min-h-screen bg-black text-[#f0f0f0]">
      <LandingNavWrapper />

      <main className="mx-auto max-w-[720px] px-5 pt-28 pb-20 sm:px-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[42px] lg:leading-[1.1]">
          vvault for Artists
        </h1>

        <p className="mb-4 mt-6 text-[15px] leading-relaxed text-white/70 sm:text-base">
          Whether you are managing demos, sharing releases with your team,
          collaborating with producers, or pitching to labels, vvault gives you
          one clean workspace for all of it. Stop losing versions across email
          threads and cloud drives. Keep everything organized, shareable, and
          trackable.
        </p>

        <h2 className="mt-10 mb-4 text-xl font-semibold sm:text-2xl">
          Keep Releases and Demos Organized
        </h2>
        <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
          Upload songs, demos, references, and versions. Organize them into
          packs by project, era, or collaborator. Every track keeps its own
          metadata and cover art. Set visibility to private, link-only, or
          public depending on the release stage.
        </p>

        <h2 className="mt-10 mb-4 text-xl font-semibold sm:text-2xl">
          Collaborate Without Chaos
        </h2>
        <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
          Invite up to 10 collaborators to any pack. Producers, engineers,
          managers, and A&amp;Rs can all access and contribute to the same
          workspace without you sending files back and forth.
        </p>

        <h2 className="mt-10 mb-4 text-xl font-semibold sm:text-2xl">
          Share Professionally
        </h2>
        <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
          When it is time to share your music with decision-makers — labels,
          managers, sync libraries, playlist curators — vvault lets you create
          clean, branded packs and send them through email campaigns with
          tracking. Know who listened and when. Learn about{" "}
          <Link
            href="/blog/what-is-tracked-music-sending"
            className="text-white underline decoration-white/30 underline-offset-2 transition-colors hover:decoration-white/60"
          >
            tracked music sending
          </Link>{" "}
          and{" "}
          <Link
            href="/blog/how-to-send-beats-to-artists"
            className="text-white underline decoration-white/30 underline-offset-2 transition-colors hover:decoration-white/60"
          >
            how to send music professionally
          </Link>
          .
        </p>

        <h2 className="mt-10 mb-4 text-xl font-semibold sm:text-2xl">
          Build Your Profile
        </h2>
        <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
          Create a public artist profile with your releases, credits, and
          socials. Share your work with a professional page that represents who
          you are.
        </p>

        <section className="mt-16 rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <h2 className="text-xl font-semibold">
            Organize your music and share it like a pro.
          </h2>
          <a
            href="https://vvault.app/signup"
            className="mt-5 inline-flex items-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-[#0e0e0e] transition-colors hover:bg-white/90"
          >
            Start free
          </a>
        </section>
      </main>

      <BottomCta />
      <BlogFooter />
    </div>
  );
}
