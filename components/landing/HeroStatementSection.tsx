"use client";

import { landingContent } from "@/components/landing/content";
import { Reveal } from "@/components/landing/Reveal";

export function HeroStatementSection() {
  return (
    <section className="pt-32 sm:pt-44">
      <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <Reveal>
          <div>
            <p className="max-w-[980px] text-[1.6rem] font-semibold leading-[1.12] tracking-tight text-white sm:text-[2.2rem] lg:text-[3rem]">
              <span className="text-white">{landingContent.heroStatement.strong}</span>{" "}
              <span className="text-[rgba(255,255,255,0.36)]">{landingContent.heroStatement.muted}</span>
            </p>

            <div className="mx-auto mt-12 w-full max-w-[980px]">
              <div className="relative w-full overflow-hidden rounded-[18px] border border-white/10 pb-[56.25%]">
                <iframe
                  src="https://www.youtube.com/embed/nKfITo6LLts"
                  title="vvault demo video"
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
