import type { Metadata } from "next";
import Link from "next/link";
import { ArticleHeader, RelatedArticles } from "@/components/blog/BlogShell";

export const metadata: Metadata = {
  title: "How to Follow Up After Sending Beats — Without Being Annoying",
  description:
    "Following up is where placements happen. Learn when to follow up, what to say, and how to use engagement data to time your follow-ups perfectly.",
  openGraph: {
    title: "How to Follow Up After Sending Beats — Without Being Annoying",
    description:
      "Following up is where placements happen. Learn when to follow up, what to say, and how to use engagement data to time your follow-ups perfectly.",
    url: "https://get.vvault.app/blog/how-to-follow-up-after-sending-beats",
    type: "article",
  },
  alternates: {
    canonical: "https://get.vvault.app/blog/how-to-follow-up-after-sending-beats",
  },
};

export default function HowToFollowUpAfterSendingBeats() {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How to Follow Up After Sending Beats Without Being Annoying",
    description:
      "Following up is where placements happen. Learn when to follow up, what to say, and how to use engagement data to time your follow-ups perfectly.",
    datePublished: "2026-03-04",
    author: { "@type": "Organization", name: "vvault" },
    publisher: { "@type": "Organization", name: "vvault" },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://get.vvault.app/blog/how-to-follow-up-after-sending-beats",
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How many times should I follow up?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Two follow-ups after the initial send is a safe default. If there is engagement (opens, plays), a third touchpoint is reasonable. If there is zero engagement after two follow-ups, move on and revisit later with fresh material.",
        },
      },
      {
        "@type": "Question",
        name: "Is following up really necessary for landing placements?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Most decision-makers do not respond to the first email. Consistent, relevant follow-up is how serious producers stay on the radar and eventually land opportunities.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <article>
        <ArticleHeader
          title="How to Follow Up After Sending Beats Without Being Annoying"
          description="Following up is where placements happen. Learn when to follow up, what to say, and how to use engagement data to time your follow-ups perfectly."
          readingTime="6 min"
          publishedDate="2026-03-04"
        />

        <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
          The first email rarely gets the placement. The follow-up does. But most producers either
          never follow up at all, or follow up so generically that they damage the relationship. The
          difference between annoying and effective follow-up comes down to timing, relevance, and
          data.
        </p>

        <h2 className="mt-10 mb-4 text-xl font-semibold sm:text-2xl">
          Why Most Producers Skip Follow-Up
        </h2>
        <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
          They feel awkward about it. They do not want to seem pushy. They do not know if the person
          even saw the email. So they wait, hope for a response, and eventually move on. This is
          understandable — but it is also the single biggest reason producers leave placements on the
          table. Decision-makers are busy. Your email competes with hundreds of others. A well-timed,
          relevant follow-up is not annoying. It is expected.
        </p>

        <h2 className="mt-10 mb-4 text-xl font-semibold sm:text-2xl">
          The Problem With Blind Follow-Up
        </h2>
        <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
          Sending &ldquo;just checking in — did you get a chance to listen?&rdquo; five days later to
          someone who may have never opened the email is weak. It adds no value, creates no urgency,
          and makes you sound like you have nothing else going on. Blind follow-up treats every
          contact the same regardless of their actual behavior. That is the wrong approach.
        </p>

        <h2 className="mt-10 mb-4 text-xl font-semibold sm:text-2xl">
          The Right Way — Follow Up Based on Engagement Data
        </h2>
        <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
          If you use a tracked sending tool like vvault, you know exactly what each contact did. That
          changes everything.
        </p>
        <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
          Contact opened the email and played 3 beats? Follow up with: &ldquo;Noticed you checked
          out the pack — if any of those caught your ear, I can send stems or more in that
          style.&rdquo; This is relevant and specific.
        </p>
        <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
          Contact opened but did not click? The subject or preview got their attention, but the
          content did not pull them through. Follow up with a different hook: a standout beat preview,
          a different pack angle, or a personal note.
        </p>
        <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
          Contact never opened? Do not reference the previous email. Send a fresh message with a new
          subject line and a different opening angle. Treat it like a first touchpoint.
        </p>
        <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
          Contact downloaded a beat? This is a high-intent signal. Follow up quickly with next steps:
          &ldquo;Want me to send the stems? Happy to work on this one with you.&rdquo;
        </p>
        <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
          Learn more about{" "}
          <Link
            href="/blog/how-to-track-who-listened-to-your-beats"
            className="text-white underline decoration-white/30 underline-offset-2 transition-colors hover:decoration-white/60"
          >
            how tracking works
          </Link>{" "}
          and{" "}
          <Link
            href="/blog/what-is-tracked-music-sending"
            className="text-white underline decoration-white/30 underline-offset-2 transition-colors hover:decoration-white/60"
          >
            what tracked music sending means
          </Link>
          .
        </p>

        <h2 className="mt-10 mb-4 text-xl font-semibold sm:text-2xl">Timing Rules</h2>
        <ul className="mb-4 list-disc space-y-2 pl-6 text-[15px] leading-relaxed text-white/70 sm:text-base">
          <li>First follow-up: 3 to 5 days after the initial send.</li>
          <li>
            Second follow-up: 5 to 7 days after the first follow-up, only if there was some
            engagement.
          </li>
          <li>
            After two follow-ups with zero engagement: move on. Revisit in 3 to 4 weeks with
            entirely new material.
          </li>
          <li>
            After a download or strong play signal: follow up within 24 to 48 hours. Interest fades
            fast.
          </li>
        </ul>

        <h2 className="mt-10 mb-4 text-xl font-semibold sm:text-2xl">Templates That Work</h2>
        <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
          <strong className="text-white/80">After play engagement:</strong> &ldquo;Hey [Name] — saw
          you checked out the pack. If any of those fit the direction, I have a few more I can send
          over. Just let me know.&rdquo;
        </p>
        <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
          <strong className="text-white/80">After open but no click:</strong> &ldquo;Hey [Name] —
          wanted to make sure this one did not get buried. Here is a quick listen to the standout
          track from that pack: [direct link]. Let me know what you think.&rdquo;
        </p>
        <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
          <strong className="text-white/80">Fresh follow-up after no engagement:</strong> &ldquo;Hey
          [Name] — got some new ones this week I think fit your sound. Different vibe from last time:
          [new pack link]. No pressure — just wanted to keep you in the loop.&rdquo;
        </p>

        <h2 className="mt-10 mb-4 text-xl font-semibold sm:text-2xl">
          How vvault Helps You Follow Up Smarter
        </h2>
        <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
          vvault shows you the full activity timeline for each contact — every email opened, every
          beat played, every download. You can schedule follow-ups directly inside a campaign, and
          vvault&rsquo;s analytics surface the best time to send based on your recipients&rsquo;
          actual engagement patterns.
        </p>
        <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
          The CRM also generates recommendations: based on what a contact has listened to and
          downloaded across your entire catalog, vvault suggests which tracks to send next and can
          turn those suggestions into a prefilled campaign in one click. Whether you are a solo{" "}
          <Link
            href="/for/producers"
            className="text-white underline decoration-white/30 underline-offset-2 transition-colors hover:decoration-white/60"
          >
            producer
          </Link>{" "}
          or part of a{" "}
          <Link
            href="/for/managers-and-labels"
            className="text-white underline decoration-white/30 underline-offset-2 transition-colors hover:decoration-white/60"
          >
            management team
          </Link>
          , the workflow adapts.
        </p>

        <h2 className="mt-10 mb-4 text-xl font-semibold sm:text-2xl">FAQ</h2>

        <div className="mb-6">
          <h3 className="mb-2 text-base font-semibold text-white/90">
            Q: How many times should I follow up?
          </h3>
          <p className="text-[15px] leading-relaxed text-white/70 sm:text-base">
            A: Two follow-ups after the initial send is a safe default. If there is engagement
            (opens, plays), a third touchpoint is reasonable. If there is zero engagement after two
            follow-ups, move on and revisit later with fresh material.
          </p>
        </div>

        <div className="mb-6">
          <h3 className="mb-2 text-base font-semibold text-white/90">
            Q: Is following up really necessary for landing placements?
          </h3>
          <p className="text-[15px] leading-relaxed text-white/70 sm:text-base">
            A: Yes. Most decision-makers do not respond to the first email. Consistent, relevant
            follow-up is how serious producers stay on the radar and eventually land opportunities.
          </p>
        </div>
      </article>

      <RelatedArticles
        articles={[
          {
            slug: "how-to-send-beats-to-artists",
            title: "How to Send Beats to Artists Professionally in 2026",
            description:
              "The complete guide to sending beats to artists, rappers, and labels. Learn how to build beat packs, write outreach emails, track who listened, and follow up at the right time.",
          },
          {
            slug: "how-to-track-who-listened-to-your-beats",
            title: "How to Track Who Listened to Your Beats After Sending",
            description:
              "Stop sending beats blindly. Learn how to track opens, plays, downloads and follow up based on real engagement data using tracked music sending.",
          },
          {
            slug: "what-is-tracked-music-sending",
            title: "What Is Tracked Music Sending and Why Producers Need It",
            description:
              "Tracked music sending replaces blind file sharing with engagement data. Learn what it means, how it works, and why it changes how producers follow up and land placements.",
          },
        ]}
      />
    </>
  );
}
