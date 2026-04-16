"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { LandingContent, Locale } from "@/components/landing/content";
import { Reveal } from "@/components/landing/Reveal";

type HeroStatementSectionProps = {
  content: LandingContent;
  locale: Locale;
};

export function HeroStatementSection({ content, locale }: HeroStatementSectionProps) {
  const fr = locale === "fr";
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef({
    isDragging: false,
    pointerId: -1,
    startX: 0,
    startScrollLeft: 0,
  });
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(1);

  useEffect(() => {
    const slider = sliderRef.current;

    if (!slider) {
      return;
    }

    const updateActiveVideo = () => {
      const cards = Array.from(
        slider.querySelectorAll<HTMLElement>("[data-sponsored-card='true']"),
      );

      if (!cards.length) {
        setActiveVideoIndex(0);
        setVisibleCards(1);
        return;
      }

      const firstCard = cards[0];
      const secondCard = cards[1];
      const gap = secondCard ? secondCard.offsetLeft - firstCard.offsetLeft - firstCard.offsetWidth : 0;
      const cardSpan = firstCard.offsetWidth + Math.max(gap, 0);
      const cardsPerView = cardSpan > 0 ? Math.max(1, Math.round((slider.clientWidth + Math.max(gap, 0)) / cardSpan)) : 1;

      const nearestIndex = cards.reduce((bestIndex, card, index) => {
        const bestDistance = Math.abs(cards[bestIndex].offsetLeft - slider.scrollLeft);
        const currentDistance = Math.abs(card.offsetLeft - slider.scrollLeft);
        return currentDistance < bestDistance ? index : bestIndex;
      }, 0);

      setVisibleCards(cardsPerView);
      setActiveVideoIndex(nearestIndex);
    };

    updateActiveVideo();
    slider.addEventListener("scroll", updateActiveVideo, { passive: true });
    window.addEventListener("resize", updateActiveVideo, { passive: true });

    return () => {
      slider.removeEventListener("scroll", updateActiveVideo);
      window.removeEventListener("resize", updateActiveVideo);
    };
  }, [content.pricingUi.sponsoredVideos]);

  const scrollToSponsoredVideo = (index: number) => {
    const slider = sliderRef.current;

    if (!slider) {
      return;
    }

    const cards = slider.querySelectorAll<HTMLElement>("[data-sponsored-card='true']");
    const targetCard = cards[index];

    if (!targetCard) {
      return;
    }

    slider.scrollTo({
      left: targetCard.offsetLeft,
      behavior: "smooth",
    });
  };

  const pageCount = Math.ceil(content.pricingUi.sponsoredVideos.length / visibleCards);
  const activePage = Math.min(pageCount - 1, Math.floor(activeVideoIndex / visibleCards));

  const scrollToPage = (pageIndex: number) => {
    scrollToSponsoredVideo(pageIndex * visibleCards);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") {
      return;
    }

    const slider = sliderRef.current;

    if (!slider) {
      return;
    }

    dragStateRef.current = {
      isDragging: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: slider.scrollLeft,
    };

    slider.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const slider = sliderRef.current;
    const dragState = dragStateRef.current;

    if (!slider || !dragState.isDragging || dragState.pointerId !== event.pointerId) {
      return;
    }

    slider.scrollLeft = dragState.startScrollLeft - (event.clientX - dragState.startX);
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    const slider = sliderRef.current;
    const dragState = dragStateRef.current;

    if (!slider || !dragState.isDragging || dragState.pointerId !== event.pointerId) {
      return;
    }

    dragStateRef.current.isDragging = false;
    slider.releasePointerCapture(event.pointerId);
  };

  return (
    <section id="how-it-works" className="pt-36 sm:pt-52">
      <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <Reveal>
          <div id="sponsored" className="mx-auto max-w-[1100px] scroll-mt-28">
            <h3 className="text-center text-xl font-semibold text-white sm:text-2xl">{content.pricingUi.sponsoredTitle}</h3>
            <p className="mt-2 text-center text-sm text-white/58">{content.pricingUi.sponsoredDescription}</p>

            <div className="mt-6">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => scrollToPage(Math.max(0, activePage - 1))}
                  disabled={activePage === 0}
                  aria-label={fr ? "Page précédente" : "Previous page"}
                  className="absolute -left-8 top-1/2 z-10 -translate-y-1/2 p-1 text-white/75 transition hover:text-white disabled:opacity-25 sm:-left-10 lg:-left-14"
                >
                  <ChevronLeft className="h-7 w-7" />
                </button>

                <div
                  ref={sliderRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerEnd}
                  onPointerCancel={handlePointerEnd}
                  className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:cursor-grab md:active:cursor-grabbing"
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
                  onClick={() => scrollToPage(Math.min(pageCount - 1, activePage + 1))}
                  disabled={activePage >= pageCount - 1}
                  aria-label={fr ? "Page suivante" : "Next page"}
                  className="absolute -right-8 top-1/2 z-10 -translate-y-1/2 p-1 text-white/75 transition hover:text-white disabled:opacity-25 sm:-right-10 lg:-right-14"
                >
                  <ChevronRight className="h-7 w-7" />
                </button>
              </div>
            </div>

            <div className="mt-4 flex justify-center gap-2">
              {Array.from({ length: pageCount }).map((_, index) => {
                const isActive = index === activePage;

                return (
                  <button
                    key={`indicator-${index}`}
                    type="button"
                    onClick={() => scrollToPage(index)}
                    aria-label={`Go to page ${index + 1}`}
                    aria-pressed={isActive}
                    className={`h-2.5 rounded-full transition ${
                      isActive ? "w-8 bg-white" : "w-2.5 bg-white/25 hover:bg-white/45"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
