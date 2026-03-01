"use client";

import type { LandingContent } from "@/components/landing/content";
import { Reveal } from "@/components/landing/Reveal";

type HeroStatementSectionProps = {
  content: LandingContent;
};

export function HeroStatementSection({ content }: HeroStatementSectionProps) {
  return (
    <section className="pt-32 sm:pt-44">
      <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <Reveal>
          <div>
            <p className="max-w-[980px] text-[1.6rem] font-semibold leading-[1.12] tracking-tight text-white sm:text-[2.2rem] lg:text-[3rem]">
              <span className="text-white">{content.heroStatement.strong}</span>{" "}
              <span className="text-[rgba(255,255,255,0.36)]">{content.heroStatement.muted}</span>
            </p>

            <div className="mx-auto mt-12 w-full max-w-[980px]">
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
          </div>
        </Reveal>
      </div>
    </section>
  );
}
