import type { Metadata } from "next";
import Link from "next/link";
import { BlogFooter, BottomCta } from "@/components/blog/BlogShell";
import { LandingNavWrapper } from "@/components/landing/LandingNavWrapper";

export const metadata: Metadata = {
  title: "Beat Selling Platform for Producers | vvault",
  description:
    "The producer workspace to organize beats, send packs to labels & artists, track who listened, sell online, and land more placements. Free to start.",
  alternates: { canonical: "https://get.vvault.app/for/producers" },
  openGraph: {
    type: "website",
    title: "Beat Selling Platform for Producers | vvault",
    description:
      "The producer workspace to organize beats, send packs to labels & artists, track who listened, sell online, and land more placements. Free to start.",
    url: "https://get.vvault.app/for/producers",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "vvault for Producers",
  url: "https://get.vvault.app/for/producers",
  description:
    "vvault is the professional workspace built for music producers.",
  publisher: {
    "@type": "Organization",
    name: "vvault",
    url: "https://get.vvault.app",
  },
};

export default function ProducersPage() {
  return (
    <div className="min-h-screen bg-black text-[#f0f0f0]">
      <LandingNavWrapper />

      <main className="mx-auto max-w-[720px] px-5 pt-28 pb-20 sm:px-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[42px] lg:leading-[1.1]">
          vvault for Producers
        </h1>

        <p className="mb-4 mt-6 text-[15px] leading-relaxed text-white/70 sm:text-base">
          Built for independent and professional producers who send beats,
          loops, sample packs, and songs to artists, managers, labels, and
          collaborators. vvault replaces the mess of scattered files, blind
          sending, and random follow-up with one clean system.
        </p>

        <h2 className="mt-10 mb-4 text-xl font-semibold sm:text-2xl">
          Organize Your Catalog
        </h2>
        <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
          Upload any audio or video format. Create packs with individual cover
          art and metadata per track. Use folders, kits, and series to keep your
          entire library structured. Search across everything instantly. Set
          tracks as private, link-only, or public. Collaborate with up to 10
          people per pack. Learn more about{" "}
          <Link
            href="/blog/how-to-organize-your-beat-catalog"
            className="text-white underline decoration-white/30 underline-offset-2 transition-colors hover:decoration-white/60"
          >
            organizing your beat catalog
          </Link>
          .
        </p>

        <h2 className="mt-10 mb-4 text-xl font-semibold sm:text-2xl">
          Send Professionally
        </h2>
        <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
          Create email campaigns in a few clicks. Choose tracks or packs, add
          recipients from your contacts or audience tags, write your message, and
          send. Schedule sends and follow-ups. No more manual attachments or
          messy email threads. Read the full guide on{" "}
          <Link
            href="/blog/how-to-send-beats-to-artists"
            className="text-white underline decoration-white/30 underline-offset-2 transition-colors hover:decoration-white/60"
          >
            how to send beats to artists
          </Link>
          .
        </p>

        <h2 className="mt-10 mb-4 text-xl font-semibold sm:text-2xl">
          Track Every Engagement
        </h2>
        <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
          See who opened your email, clicked through, played which beats, how
          long they listened, who downloaded, and who saved. Get a real-time
          activity feed and analytics dashboard with KPIs, heatmaps, and
          best-time-to-send insights. Learn about{" "}
          <Link
            href="/blog/what-is-tracked-music-sending"
            className="text-white underline decoration-white/30 underline-offset-2 transition-colors hover:decoration-white/60"
          >
            tracked music sending
          </Link>
          .
        </p>

        <h2 className="mt-10 mb-4 text-xl font-semibold sm:text-2xl">
          Follow Up Smarter
        </h2>
        <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
          Use your contact CRM to see each person&apos;s full engagement
          history. Get recommendations for which tracks to send next based on
          their actual listening behavior. Turn suggestions into a prefilled
          campaign in one click.
        </p>

        <h2 className="mt-10 mb-4 text-xl font-semibold sm:text-2xl">
          Build Your Public Presence
        </h2>
        <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
          Create a public producer profile with your packs, kits, credits, and
          socials. Share your work professionally with a branded page under your
          handle. Ultra users get custom backgrounds and theme styling.
        </p>

        <h2 className="mt-10 mb-4 text-xl font-semibold sm:text-2xl">
          Sell Directly
        </h2>
        <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
          Use vvault&apos;s built-in marketplace to sell beats, packs, and
          licenses. Pro users pay 5% commission. Ultra users pay 0%. Payments
          are handled through Stripe.
        </p>

        <section className="mt-16 rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <h2 className="text-xl font-semibold">
            Start your producer workspace for free.
          </h2>
          <a
            href="https://vvault.app/signup"
            className="mt-5 inline-flex items-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#0e0e0e] transition-colors hover:bg-white/90"
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
