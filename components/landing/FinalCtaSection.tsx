"use client";

import { landingContent } from "@/components/landing/content";
import { LandingCtaLink } from "@/components/landing/LandingCtaLink";
import { Reveal } from "@/components/landing/Reveal";

export function FinalCtaSection() {
  return (
    <section id="contact" className="pt-56 sm:pt-72">
      <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <Reveal className="px-6 py-2 text-center sm:px-10">
          <h2 className="font-display mx-auto max-w-[680px] text-[3rem] leading-[0.98] text-white sm:text-[5rem]">
            {landingContent.finalCta.title}
          </h2>
          <div className="mt-20 flex flex-wrap justify-center gap-2">
            <LandingCtaLink
              loggedInHref={landingContent.finalCta.primary.href}
              loggedOutHref={landingContent.finalCta.primary.href}
              className="inline-flex items-center rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
            >
              {landingContent.finalCta.primary.label}
            </LandingCtaLink>
            <LandingCtaLink
              loggedInHref={landingContent.finalCta.secondary.href}
              loggedOutHref={landingContent.finalCta.secondary.href}
              className="rounded-2xl px-4 py-2.5 text-sm text-white/58 transition-colors duration-200 hover:bg-white/[0.05] hover:text-white/78 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
            >
              {landingContent.finalCta.secondary.label}
            </LandingCtaLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
