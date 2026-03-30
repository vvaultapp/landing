import type { Metadata } from "next";
import Link from "next/link";
import { BlogFooter, BottomCta } from "@/components/blog/BlogShell";
import { LandingNavWrapper } from "@/components/landing/LandingNavWrapper";

export const metadata: Metadata = {
  title:
    "vvault for Managers and Labels — Centralize Music, Contacts, and Campaigns",
  description:
    "vvault helps managers and labels organize music across artists and projects, send it professionally to contacts, and track engagement across every campaign.",
  alternates: { canonical: "https://get.vvault.app/for/managers-and-labels" },
  openGraph: {
    type: "website",
    title:
      "vvault for Managers and Labels — Centralize Music, Contacts, and Campaigns",
    description:
      "vvault helps managers and labels organize music across artists and projects, send it professionally to contacts, and track engagement across every campaign.",
    url: "https://get.vvault.app/for/managers-and-labels",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "vvault for Managers and Labels",
  url: "https://get.vvault.app/for/managers-and-labels",
  description:
    "vvault helps managers and labels organize music across artists and projects, send it professionally to contacts, and track engagement across every campaign.",
  publisher: {
    "@type": "Organization",
    name: "vvault",
    url: "https://get.vvault.app",
  },
};

export default function ManagersAndLabelsPage() {
  return (
    <div className="min-h-screen bg-black text-[#f0f0f0]">
      <LandingNavWrapper />

      <main className="mx-auto max-w-[720px] px-5 pt-28 pb-20 sm:px-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[42px] lg:leading-[1.1]">
          vvault for Managers and Labels
        </h1>

        <p className="mb-4 mt-6 text-[15px] leading-relaxed text-white/70 sm:text-base">
          Managing music for multiple artists, projects, and contacts creates
          chaos fast. vvault gives managers and labels one workspace to
          centralize files, run campaigns, track engagement, and keep a clean
          audit trail of what was sent, to whom, and what happened.
        </p>

        <h2 className="mt-10 mb-4 text-xl font-semibold sm:text-2xl">
          Centralize Everything
        </h2>
        <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
          One library for all your artists and projects. Organize with folders,
          packs, and series. Find any file instantly with global search. Control
          access per pack — private, link-only, or public.
        </p>

        <h2 className="mt-10 mb-4 text-xl font-semibold sm:text-2xl">
          Run Campaigns at Scale
        </h2>
        <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
          Send packs to contacts using audience tags and custom segments.
          Schedule sends and follow-ups. Reuse email templates. Track engagement
          across every campaign from one dashboard. Learn how campaigns work
          with{" "}
          <Link
            href="/blog/what-is-tracked-music-sending"
            className="text-white underline decoration-white/30 underline-offset-2 transition-colors hover:decoration-white/60"
          >
            tracked music sending
          </Link>
          .
        </p>

        <h2 className="mt-10 mb-4 text-xl font-semibold sm:text-2xl">
          Manage Contacts Professionally
        </h2>
        <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
          Import contacts by CSV or Excel. See engagement scores, activity
          timelines, and listening profiles for every contact. Add notes, tasks,
          and tags. Know exactly who is engaged and who is not. Read more about{" "}
          <Link
            href="/blog/how-to-follow-up-after-sending-beats"
            className="text-white underline decoration-white/30 underline-offset-2 transition-colors hover:decoration-white/60"
          >
            following up effectively
          </Link>
          .
        </p>

        <h2 className="mt-10 mb-4 text-xl font-semibold sm:text-2xl">
          Team Collaboration
        </h2>
        <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
          Work as a team on vvault. Join or create a team, manage multiple
          artist profiles, and keep everyone aligned with shared access to the
          same packs and campaigns.
        </p>

        <h2 className="mt-10 mb-4 text-xl font-semibold sm:text-2xl">
          Analytics and Reporting
        </h2>
        <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
          Compare campaigns side by side. Export CSVs. Track KPIs over custom
          date ranges. See which contacts, tracks, and campaigns drive the most
          engagement.
        </p>

        <section className="mt-16 rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <h2 className="text-xl font-semibold">
            Centralize your music operation.
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
