"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { LandingContent } from "@/components/landing/content";
import { Reveal } from "@/components/landing/Reveal";

type HeroStatementSectionProps = {
  content: LandingContent;
};

export function HeroStatementSection({ content }: HeroStatementSectionProps) {
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    const slider = sliderRef.current;

    if (!slider) {
      return;
    }

    const updateScrollState = () => {
      const maxScrollLeft = slider.scrollWidth - slider.clientWidth;
      setCanScrollPrev(slider.scrollLeft > 8);
      setCanScrollNext(slider.scrollLeft < maxScrollLeft - 8);
    };

    updateScrollState();
    slider.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      slider.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [content.pricingUi.sponsoredVideos]);

  const scrollSponsoredVideos = (direction: "prev" | "next") => {
    const slider = sliderRef.current;

    if (!slider) {
      return;
    }

    const firstCard = slider.querySelector<HTMLElement>("[data-sponsored-card='true']");
    const cardWidth = firstCard?.offsetWidth ?? slider.clientWidth;
    const gap = 16;
    const amount = cardWidth + gap;

    slider.scrollBy({
      left: direction === "next" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <section id="how-it-works" className="pt-8 sm:pt-12">
      <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <Reveal>
          <div id="sponsored" className="mx-auto max-w-[1100px] scroll-mt-28">
            <h3 className="text-center text-xl font-semibold text-white sm:text-2xl">{content.pricingUi.sponsoredTitle}</h3>
            <p className="mt-2 text-center text-sm text-white/58">{content.pricingUi.sponsoredDescription}</p>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => scrollSponsoredVideos("prev")}
                disabled={!canScrollPrev}
                aria-label="Previous sponsored video"
                className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-35 sm:inline-flex"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div
                ref={sliderRef}
                className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {content.pricingUi.sponsoredVideos.map((video) => (
                  <div
                    key={video.url}
                    data-sponsored-card="true"
                    className="min-w-0 shrink-0 snap-start basis-[88%] overflow-hidden rounded-[14px] border border-white/10 bg-[#090909] sm:basis-[calc(50%-8px)] lg:basis-[calc(33.333%-10.67px)]"
                  >
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

              <button
                type="button"
                onClick={() => scrollSponsoredVideos("next")}
                disabled={!canScrollNext}
                aria-label="Next sponsored video"
                className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-35 sm:inline-flex"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-3 flex justify-center gap-3 sm:hidden">
              <button
                type="button"
                onClick={() => scrollSponsoredVideos("prev")}
                disabled={!canScrollPrev}
                aria-label="Previous sponsored video"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => scrollSponsoredVideos("next")}
                disabled={!canScrollNext}
                aria-label="Next sponsored video"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
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
