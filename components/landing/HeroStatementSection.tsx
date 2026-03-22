"use client";

import type { LandingContent } from "@/components/landing/content";
import { Reveal } from "@/components/landing/Reveal";

type HeroStatementSectionProps = {
  content: LandingContent;
};

export function HeroStatementSection({ content }: HeroStatementSectionProps) {
  return (
    <section id="how-it-works" className="pt-8 sm:pt-12">
      <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <Reveal>
          <div id="sponsored" className="mx-auto max-w-[1100px] scroll-mt-28">
            <h3 className="text-center text-xl font-semibold text-white sm:text-2xl">{content.pricingUi.sponsoredTitle}</h3>
            <p className="mt-2 text-center text-sm text-white/58">{content.pricingUi.sponsoredDescription}</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {content.pricingUi.sponsoredVideos.map((video) => (
                <div key={video.url} className="overflow-hidden rounded-[14px] border border-white/10 bg-[#090909]">
                  <div className="relative w-full pb-[56.25%]">
                    <iframe
                      className="absolute inset-0 h-full w-full"
                      src={video.url}
                      title={video.title}
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-14 sm:mt-16">
          <div id="workflow-video" className="mx-auto w-full max-w-[980px] scroll-mt-28">
            <div className="relative w-full overflow-hidden rounded-[18px] border border-white/10 pb-[56.25%]">
              <iframe
                src={content.heroStatement.videoUrl}
                title={content.heroStatement.videoTitle}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-16 sm:mt-20">
          <div className="grid gap-8 py-16 sm:py-24 lg:grid-cols-[1fr_1fr] lg:gap-16 lg:py-28">
            <h2 className="font-display text-3xl leading-tight text-white sm:text-5xl">
              {content.howItWorksIntro.title}
            </h2>
            <p className="max-w-[620px] text-base leading-7 text-white/26 sm:text-lg">
              {content.howItWorksIntro.description}
            </p>
          </div>
        </Reveal>

        <Reveal className="mt-20 sm:mt-28">
          <div id="testimonials" className="mx-auto max-w-[980px] scroll-mt-32 text-center">
            <p className="text-xs uppercase tracking-[0.12em] text-white/44">{content.pricingUi.testimonialsLabel}</p>
            <h3 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">{content.pricingUi.testimonialsTitle}</h3>
            <p className="mt-2 text-sm text-white/62">{content.pricingUi.testimonialsDescription}</p>
            <div className="mt-6 overflow-hidden rounded-[16px] border border-white/10 bg-[#090909]">
              <div className="relative w-full pb-[56.25%]">
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={content.pricingUi.testimonialVideoUrl}
                  title={content.pricingUi.testimonialVideoTitle}
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
