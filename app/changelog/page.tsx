"use client";

import { useEffect } from "react";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Reveal } from "@/components/landing/Reveal";
import { getLandingContent } from "@/components/landing/content";
import { useLocale } from "@/lib/useLocale";

const entries = [
  {
    date: "Mar 2026",
    title: "Dropdown Navigation Menus",
    description:
      "Redesigned nav with smooth dropdown menus for better navigation across features, testimonials, company pages, and resources.",
  },
  {
    date: "Feb 2026",
    title: "Campaign Performance Clarity",
    description:
      "Play-duration and engagement signals are now cleaner across campaign and link analytics. Easier to spot which beats resonate and which contacts are most engaged.",
  },
  {
    date: "Feb 2026",
    title: "Marketplace Checkout Reliability",
    description:
      "Purchase and delivery flow stability improved for paid licenses. Fewer failed checkouts and faster file delivery after payment.",
  },
  {
    date: "Jan 2026",
    title: "Series Automation Controls",
    description:
      "Ultra workflows now include tighter controls for recurring releases and timed access. Schedule drip campaigns and auto-expire links with precision.",
  },
  {
    date: "Dec 2025",
    title: "Certificate of Deposit",
    description:
      "Hash-certified certificates that prove music ownership and establish anterority. Generate tamper-proof proof of creation for any track in your library.",
  },
  {
    date: "Nov 2025",
    title: "Link in Bio",
    description:
      "One customizable link page for all your content. Share your beats, social links, and marketplace in a single branded page.",
  },
  {
    date: "Oct 2025",
    title: "CRM & Pipeline",
    description:
      "Full contact management with timeline, notes, tasks, and scoring. Track every interaction with A&Rs, artists, and managers in one place.",
  },
];

export default function ChangelogPage() {
  const [locale] = useLocale();
  const content = getLandingContent(locale);
  const fr = locale === "fr";
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = fr ? "vvault | Journal des mises à jour" : "vvault | Changelog";
  }, [fr]);

  return (
    <div className="landing-root min-h-screen bg-black font-sans text-[#f0f0f0]">
      <LandingNav locale={locale} content={content} showPrimaryLinks={true} />
      <main className="relative z-10 mx-auto max-w-[720px] px-5 pb-32 pt-40 sm:px-8 sm:pt-48">
        {/* Header */}
        <Reveal>
          <h1
            className="text-center text-3xl font-medium leading-tight tracking-tight sm:text-[2.8rem]"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.45) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {fr ? "Journal des mises à jour" : "Changelog"}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-center text-[15px] leading-relaxed text-white/40 sm:text-[16px]">
            {fr ? "Les nouveautés de vvault." : "What\u0027s new in vvault."}
          </p>
        </Reveal>

        {/* Timeline */}
        <div className="relative mt-20 ml-4 border-l border-white/[0.06] pl-8">
          {entries.map((entry, i) => (
            <Reveal key={i} delayMs={i * 60}>
              <div className="relative pb-12 last:pb-0">
                {/* Dot */}
                <div
                  className="absolute -left-[41px] top-[6px] h-[9px] w-[9px] rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.25)",
                    boxShadow: "0 0 6px rgba(255,255,255,0.08)",
                  }}
                />
                {/* Date badge */}
                <span className="inline-block rounded-full bg-white/[0.05] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-white/40">
                  {entry.date}
                </span>
                <h3 className="mt-3 text-[15px] font-medium text-white/80 sm:text-[16px]">
                  {entry.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-white/35 sm:text-[14px]">
                  {entry.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </main>
      <LandingFooter locale={locale} content={content} showColumns={false} inlineLegalWithBrand />
    </div>
  );
}
