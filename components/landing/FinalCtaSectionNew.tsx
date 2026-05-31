"use client";

import type { LandingNewContent } from "@/components/landing/contentNew";
import { LandingCtaLink } from "@/components/landing/LandingCtaLink";

type FinalCtaSectionNewProps = {
  content: LandingNewContent;
};

/* Simple, small closing line — no glow, no 3D reveal — plus a single
   "Get Started" pill. Matches the minimal feature sections. */
export function FinalCtaSectionNew({ content }: FinalCtaSectionNewProps) {
  const c = content.finalCta;
  return (
    <section id="final-cta" className="py-[150px] sm:py-[214px] lg:py-[278px]">
      <div className="mx-auto w-full max-w-[clamp(1320px,92vw,2400px)] px-5 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[640px] text-center">
          <h2 className="font-display text-[1.25rem] font-medium leading-[1.3] tracking-tight text-white sm:text-[1.55rem] lg:text-[1.8rem]">
            {c.title}
          </h2>
          <p className="mx-auto mt-4 max-w-[440px] text-[13px] leading-relaxed text-white/40">
            {c.sub}
          </p>
          <div className="mt-8 flex justify-center">
            <LandingCtaLink
              loggedInHref={c.ctaHref}
              loggedOutHref={c.ctaHref}
              track={{
                buttonId: "finalCtaNew.get_started",
                surface: "landing.new.final_cta",
              }}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[15px] font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45"
            >
              {c.ctaLabel}
            </LandingCtaLink>
          </div>
        </div>
      </div>
    </section>
  );
}
