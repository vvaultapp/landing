"use client";

import type { LandingContent } from "@/components/landing/content";
import { LandingCtaLink } from "@/components/landing/LandingCtaLink";
import { Reveal } from "@/components/landing/Reveal";

type FinalCtaSectionProps = {
  content: LandingContent;
};

export function FinalCtaSection({ content }: FinalCtaSectionProps) {
  return (
    <section id="final-cta" className="pt-44 pb-44 sm:pt-64 sm:pb-56">
      <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <Reveal className="text-center">
          {/* Clean gradient text */}
          <div className="relative mx-auto max-w-[480px] sm:max-w-[580px] lg:max-w-[660px]">
            <h2
              className="font-display relative text-[2.6rem] font-semibold leading-[1.05] tracking-tight sm:text-[3.8rem] lg:text-[4.6rem]"
              style={{
                backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(180,180,190,0.38) 50%, rgba(150,150,165,0.28) 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {content.finalCta.title}
            </h2>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:mt-12">
            <LandingCtaLink
              loggedInHref={content.finalCta.primary.href}
              loggedOutHref={content.finalCta.primary.href}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
            >
              {content.finalCta.primary.label}
              <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
                <path d="M7 4l6 6-6 6" />
              </svg>
            </LandingCtaLink>
            <LandingCtaLink
              loggedInHref={content.finalCta.secondary.href}
              loggedOutHref={content.finalCta.secondary.href}
              className="inline-flex items-center gap-1.5 rounded-2xl px-5 py-2.5 text-sm font-medium text-white/58 transition-colors duration-200 hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
            >
              {content.finalCta.secondary.label}
              <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
                <path d="M7 4l6 6-6 6" />
              </svg>
            </LandingCtaLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
