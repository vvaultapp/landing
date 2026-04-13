import type { Metadata } from "next";
import Link from "next/link";
import { ArticleHeader, RelatedArticles } from "@/components/blog/BlogShell";

export const metadata: Metadata = {
  title: "How to Send Beats to Artists & Labels | vvault",
  description:
    "Complete guide to sending beats professionally. Build beat packs, write outreach emails, track who listened, and follow up at the right time.",
  openGraph: {
    title: "How to Send Beats to Artists & Labels | vvault",
    description:
      "Complete guide to sending beats professionally. Build beat packs, write outreach emails, track who listened, and follow up at the right time.",
    url: "https://get.vvault.app/blog/how-to-send-beats-to-artists",
    type: "article",
  },
  alternates: {
    canonical: "https://get.vvault.app/blog/how-to-send-beats-to-artists",
  },
};

export default function HowToSendBeatsToArtistsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "How to Send Beats to Artists Professionally in 2026",
            description:
              "The complete guide to sending beats to artists, rappers, and labels. Learn how to build beat packs, write outreach emails, track who listened, and follow up at the right time.",
            datePublished: "2026-03-15",
            dateModified: "2026-03-15",
            author: {
              "@type": "Organization",
              name: "vvault",
              url: "https://get.vvault.app",
            },
            publisher: {
              "@type": "Organization",
              name: "vvault",
              url: "https://get.vvault.app",
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": "https://get.vvault.app/blog/how-to-send-beats-to-artists",
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Should I send MP3 or WAV when reaching out to artists?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Send MP3 (320kbps) for initial outreach. It is lighter, loads faster, and works on mobile. Keep WAV files ready and send them only when the artist requests stems or high-quality files after showing interest.",
                },
              },
              {
                "@type": "Question",
                name: "How many beats should I put in a pack?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Between 3 and 7 beats works best. Enough variety to show range, not so many that the recipient feels overwhelmed. Tailor every beat to the recipient's style.",
                },
              },
              {
                "@type": "Question",
                name: "How often should I follow up?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Wait 3 to 5 days after the first send. If tracking shows they engaged but did not respond, follow up once with a relevant message. If there is no engagement at all, try one more time with a different subject line after a week. After two follow-ups with zero engagement, move on.",
                },
              },
              {
                "@type": "Question",
                name: "What is the best day and time to send beats?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Tuesday through Thursday, late morning in the recipient's timezone tends to get the highest open rates. Avoid weekends and Monday mornings when inboxes are flooded.",
                },
              },
              {
                "@type": "Question",
                name: "How do I find artists' email addresses?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Check their social media bios, YouTube descriptions, and official websites. Many artists and managers list a business email. You can also use contact finder tools, or build your list through networking and collaborations.",
                },
              },
              {
                "@type": "Question",
                name: "What is tracked music sending?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Tracked music sending means every beat pack you send includes invisible tracking that shows you who opened the email, who clicked the link, who played which beats, how long they listened, and who downloaded files. This gives you real data instead of guessing. vvault does this automatically for every campaign.",
                },
              },
            ],
          }),
        }}
      />

      <ArticleHeader
        title="How to Send Beats to Artists Professionally in 2026"
        description="The complete guide to sending beats to artists, rappers, and labels. Learn how to build beat packs, write outreach emails, track who listened, and follow up at the right time."
        readingTime="12 min"
        publishedDate="2026-03-15"
      />

      <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
        Most producers lose placements not because their beats are bad, but because their sending
        process is broken. Random Drive links, messy email threads, no follow-up system, and zero
        visibility into whether anyone actually listened. This guide covers the full workflow: from
        preparing your beats and building packs, to writing outreach emails, to tracking engagement
        and following up at exactly the right moment.
      </p>

      <h2 className="mt-10 mb-4 text-xl font-semibold sm:text-2xl">
        Why the Way You Send Beats Matters More Than You Think
      </h2>
      <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
        Your beats could be incredible. But if the way you present and deliver them feels
        unorganized, unprofessional, or hard to navigate, artists and A&Rs will move on. The truth
        is that decision-makers receive dozens of beat packs every week. The producers who land
        placements are not always the most talented — they are the most professional, organized, and
        persistent.
      </p>
      <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
        Sending beats professionally means three things: clean packaging, clear communication, and
        smart follow-up. Most producers focus only on the music. The ones who win focus on the
        entire experience around the music.
      </p>

      <h2 className="mt-10 mb-4 text-xl font-semibold sm:text-2xl">
        Step 1 — Prepare Your Beats Before You Send Anything
      </h2>
      <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
        Before you send a single email, your beats need to be ready. That means proper file naming,
        consistent tagging, and clean audio files.
      </p>
      <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
        Name your files with a clear format. Something like: BeatName - BPM - Key -
        YourProducerName. Example: Midnight Run - 140BPM - Cm - ProdByAlex. This helps the
        recipient identify your work instantly and keeps everything organized on their end.
      </p>
      <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
        Tag your beats with your producer tag, but keep it short and non-intrusive. Place it at the
        beginning or during a transition — not looping every four bars. The goal is identification,
        not annoyance.
      </p>
      <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
        Export in high-quality MP3 (320kbps) for initial sends. Do not send WAV files unless
        specifically requested — large files clog inboxes and many artists listen on their phones
        first. Keep WAVs ready for when they ask.
      </p>

      <h2 className="mt-10 mb-4 text-xl font-semibold sm:text-2xl">
        Step 2 — Build Focused Beat Packs, Not Random Dumps
      </h2>
      <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
        Never send a single beat in isolation, and never send 30 beats in a folder. The sweet spot
        is 3 to 7 beats, curated specifically for the recipient.
      </p>
      <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
        Tailor each pack to the artist&apos;s style. If you are reaching out to a melodic rapper, do
        not include hard trap beats just because you made them. Every beat in the pack should feel
        like it could fit on their next project.
      </p>
      <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
        Sequence the pack intentionally. Put your strongest, most relevant beat first. Put your
        second strongest last. The beats in the middle should bridge the style. Think of it like a
        short playlist, not a storage folder.
      </p>
      <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
        Give the pack a clean name. Something like &quot;Pack for [ArtistName] — March 2026&quot;
        is better than &quot;beats_final_v3.&quot;
      </p>
      <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
        With vvault, you can create a pack in seconds: drag and drop your files, add cover art, and
        generate a shareable link. Each track keeps its own metadata and artwork, and the pack looks
        polished and intentional when the recipient opens it.
      </p>

      <h2 className="mt-10 mb-4 text-xl font-semibold sm:text-2xl">
        Step 3 — Write Outreach Emails That Get Opened
      </h2>
      <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
        The email is the vehicle. If it is boring, generic, or too long, nobody reads it.
      </p>
      <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
        Keep the subject line short and personal. Examples that work: &quot;made some joints for
        you,&quot; &quot;beats for [ArtistName] from [YourName],&quot; or &quot;custom pack —
        thought these fit your sound.&quot; Lowercase often feels more personal and less like a
        marketing blast.
      </p>
      <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
        The body should be 3 to 5 sentences maximum. Introduce yourself in one line. Say why you
        are reaching out (you heard their recent track, you think your style fits, etc.). Include
        the link to the pack. Close with a simple ask: &quot;Let me know if anything catches your
        ear.&quot;
      </p>
      <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
        Do not write a paragraph about your life story. Do not attach 6 WAV files directly to the
        email. Do not use all caps or exclamation marks. The goal is to sound like a person, not a
        spam bot.
      </p>

      <h2 className="mt-10 mb-4 text-xl font-semibold sm:text-2xl">
        Step 4 — Track Who Actually Listened
      </h2>
      <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
        This is where most producers operate blind. They send the email and then wait. They have no
        idea if the artist opened it, clicked the link, played a beat, or downloaded anything.
      </p>
      <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
        That guessing game is what separates amateur sending from professional sending.
      </p>
      <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
        With tracked sending, you see exactly what happened after you hit send: who opened the
        email, who clicked through, which beats they played, how long they listened, and whether
        they downloaded anything. This is not a &quot;nice-to-have.&quot; It is the difference
        between following up randomly and following up with intelligence.
      </p>
      <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
        vvault tracks all of this automatically. When you send a campaign through vvault, every
        open, click, play, download, and save is recorded. You see a real-time activity feed
        showing exactly who did what, and when. That means you know which beats resonated, which
        contacts are interested, and who is worth your time.
      </p>
      <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
        Learn more about{" "}
        <Link
          href="/blog/what-is-tracked-music-sending"
          className="text-white underline decoration-white/30 underline-offset-2 transition-colors hover:decoration-white/60"
        >
          tracked music sending
        </Link>
        .
      </p>

      <h2 className="mt-10 mb-4 text-xl font-semibold sm:text-2xl">
        Step 5 — Follow Up Based on Real Signals, Not Hope
      </h2>
      <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
        Following up is not optional. Most placements do not come from the first email. They come
        from the second, third, or fourth touchpoint — if the follow-up is timed right and adds
        value.
      </p>
      <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
        The problem is that most producers follow up blindly. They send &quot;just checking
        in&quot; two weeks later to someone who may have never opened the email. That feels spammy.
      </p>
      <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
        Smart follow-up is different. If your tracking shows that an artist opened the email,
        clicked the link, and played 3 beats but did not respond — that is a warm lead. A follow-up
        like &quot;saw you checked out the pack — happy to send more in that style if anything
        caught your attention&quot; is relevant, not annoying.
      </p>
      <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
        If someone opened but did not click, a short follow-up with a different angle might help:
        &quot;here is a quick preview of the standout track from that pack&quot; with an embedded
        player or a direct link.
      </p>
      <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
        If someone never opened, the follow-up should be a new subject line and a fresh approach —
        not a forward of the same email.
      </p>
      <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
        vvault lets you schedule follow-ups and see the full timeline of each contact&apos;s
        activity, so you are never guessing. Read the full guide on{" "}
        <Link
          href="/blog/how-to-follow-up-after-sending-beats"
          className="text-white underline decoration-white/30 underline-offset-2 transition-colors hover:decoration-white/60"
        >
          how to follow up after sending beats
        </Link>
        .
      </p>

      <h2 className="mt-10 mb-4 text-xl font-semibold sm:text-2xl">
        Step 6 — Build a Repeatable System, Not a One-Time Effort
      </h2>
      <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
        The producers who consistently land placements are not doing anything magical. They have a
        system they run every week: curate packs, send to targeted contacts, track engagement,
        follow up, repeat.
      </p>
      <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
        The mistake is treating beat sending as a sporadic thing you do when inspiration hits. It
        should be a consistent workflow. Upload beats as you finish them. Organize them into packs
        by style. Send to your active contacts list. Review the tracking data. Follow up where
        there is interest. Build new contacts. Repeat.
      </p>
      <p className="mb-4 text-[15px] leading-relaxed text-white/70 sm:text-base">
        vvault is built for exactly this loop. Your library stays organized. Your contacts
        accumulate engagement history over time. Your campaigns are reusable. And every send gives
        you data you can use to send smarter next time. Whether you are an independent{" "}
        <Link
          href="/for/producers"
          className="text-white underline decoration-white/30 underline-offset-2 transition-colors hover:decoration-white/60"
        >
          producer
        </Link>{" "}
        or working with a team, the workflow scales.
      </p>

      <h2 className="mt-10 mb-4 text-xl font-semibold sm:text-2xl">
        Common Mistakes That Kill Your Chances
      </h2>
      <ul className="mb-4 list-disc space-y-2 pl-6 text-[15px] leading-relaxed text-white/70 sm:text-base">
        <li>
          Sending WAV files as email attachments. Most inboxes reject them or artists will not
          download large files from unknown senders.
        </li>
        <li>
          Sending the same generic pack to 200 people. Mass blasting without targeting means low
          relevance and low response.
        </li>
        <li>No follow-up. One email is rarely enough. Persistence with value wins.</li>
        <li>
          Messy links that expire. If you used a temporary Drive link that expires or gets
          reorganized, the recipient finds a dead link when they get around to checking it.
        </li>
        <li>
          No tracking. If you do not know who listened, you cannot prioritize your time.
        </li>
        <li>
          Unprofessional presentation. A folder called &quot;beats 2026 final&quot; with untitled
          MP3s makes you look like you do not take this seriously.
        </li>
      </ul>

      <h2 className="mt-10 mb-4 text-xl font-semibold sm:text-2xl">Frequently Asked Questions</h2>

      <div className="mb-6">
        <h3 className="mb-2 text-base font-semibold text-white/90">
          Q: Should I send MP3 or WAV when reaching out to artists?
        </h3>
        <p className="text-[15px] leading-relaxed text-white/70 sm:text-base">
          A: Send MP3 (320kbps) for initial outreach. It is lighter, loads faster, and works on
          mobile. Keep WAV files ready and send them only when the artist requests stems or
          high-quality files after showing interest.
        </p>
      </div>

      <div className="mb-6">
        <h3 className="mb-2 text-base font-semibold text-white/90">
          Q: How many beats should I put in a pack?
        </h3>
        <p className="text-[15px] leading-relaxed text-white/70 sm:text-base">
          A: Between 3 and 7 beats works best. Enough variety to show range, not so many that the
          recipient feels overwhelmed. Tailor every beat to the recipient&apos;s style.
        </p>
      </div>

      <div className="mb-6">
        <h3 className="mb-2 text-base font-semibold text-white/90">
          Q: How often should I follow up?
        </h3>
        <p className="text-[15px] leading-relaxed text-white/70 sm:text-base">
          A: Wait 3 to 5 days after the first send. If tracking shows they engaged but did not
          respond, follow up once with a relevant message. If there is no engagement at all, try one
          more time with a different subject line after a week. After two follow-ups with zero
          engagement, move on.
        </p>
      </div>

      <div className="mb-6">
        <h3 className="mb-2 text-base font-semibold text-white/90">
          Q: What is the best day and time to send beats?
        </h3>
        <p className="text-[15px] leading-relaxed text-white/70 sm:text-base">
          A: Tuesday through Thursday, late morning in the recipient&apos;s timezone tends to get
          the highest open rates. Avoid weekends and Monday mornings when inboxes are flooded.
        </p>
      </div>

      <div className="mb-6">
        <h3 className="mb-2 text-base font-semibold text-white/90">
          Q: How do I find artists&apos; email addresses?
        </h3>
        <p className="text-[15px] leading-relaxed text-white/70 sm:text-base">
          A: Check their social media bios, YouTube descriptions, and official websites. Many
          artists and managers list a business email. You can also use contact finder tools, or
          build your list through networking and collaborations.
        </p>
      </div>

      <div className="mb-6">
        <h3 className="mb-2 text-base font-semibold text-white/90">
          Q: What is tracked music sending?
        </h3>
        <p className="text-[15px] leading-relaxed text-white/70 sm:text-base">
          A: Tracked music sending means every beat pack you send includes invisible tracking that
          shows you who opened the email, who clicked the link, who played which beats, how long
          they listened, and who downloaded files. This gives you real data instead of guessing.
          vvault does this automatically for every campaign.
        </p>
      </div>

      <RelatedArticles
        articles={[
          {
            slug: "how-to-track-who-listened-to-your-beats",
            title: "How to Track Who Listened to Your Beats After Sending",
            description:
              "Stop sending beats blindly. Learn how to track opens, plays, downloads and follow up based on real engagement data using tracked music sending.",
          },
          {
            slug: "how-to-follow-up-after-sending-beats",
            title: "How to Follow Up After Sending Beats Without Being Annoying",
            description:
              "Following up is where placements happen. Learn when to follow up, what to say, and how to use engagement data to time your follow-ups perfectly.",
          },
          {
            slug: "best-tools-for-sending-beats",
            title: "Best Tools for Sending Beats to Artists in 2026",
            description:
              "A ranked comparison of the best tools producers use to send beats in 2026, from Google Drive and Dropbox to vvault, BeatStars, email, and more.",
          },
        ]}
      />
    </>
  );
}
