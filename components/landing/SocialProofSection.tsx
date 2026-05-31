"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { Reveal } from "@/components/landing/Reveal";
import type { Locale } from "@/components/landing/content";
import {
  FALLBACK_REVIEWS_EN,
  FALLBACK_REVIEWS_FR,
  type LandingReview,
  type LandingReviewApi,
} from "@/lib/landing-reviews";

const DEFAULT_TRUSTPILOT_SCORE = "4.7";

type Review = LandingReview;
type ApiReview = LandingReviewApi;

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-[#00b67a]">
          <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.33L10 13.27l-4.77 2.51.91-5.33L2.27 6.68l5.34-.78L10 1z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewCard({
  review,
  state,
  className = "",
}: {
  review: Review;
  state: "entering" | "visible" | "exiting";
  className?: string;
}) {
  return (
    <div
      className={`flex w-full flex-col items-center gap-3 rounded-2xl px-6 py-5 text-center transition-all duration-700 ease-in-out sm:px-8 sm:py-6 ${className}`}
      style={{
        opacity: state === "visible" ? 1 : 0,
        filter: state === "visible" ? "blur(0px)" : "blur(8px)",
        transform:
          state === "entering"
            ? "translateY(8px)"
            : state === "exiting"
              ? "translateY(-8px)"
              : "translateY(0)",
      }}
    >
      <Stars count={review.rating} />
      {/* Body is line-clamped to 4 lines and forced to that height
         (not min-height) so the card is the EXACT same size whether
         the review is one sentence or four. Without this, longer
         reviews on the pricing page made the section grow vertically
         when the carousel cycled and visibly shifted everything below
         it during the rotation. */}
      <p
        className="text-[13px] leading-relaxed text-white/70 sm:text-[14px]"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 4,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          height: "6.5em",
        }}
      >
        &ldquo;{review.body}&rdquo;
      </p>
      <p className="text-[11px] font-medium text-white/40 sm:text-xs">
        {review.name}
      </p>
    </div>
  );
}

export function SocialProofSection({ locale = "en" }: { locale?: Locale }) {
  /* Reviews start from the hardcoded fallbacks so the section
     renders immediately on the server. As soon as the client has
     fresh data from /api/landing-stats (which reads the
     admin-curated landing_trustpilot_reviews table) we swap them
     in. The admin-curated set always wins when it has rows. */
  const [reviews, setReviews] = useState<Review[]>(() =>
    locale === "fr" ? FALLBACK_REVIEWS_FR : FALLBACK_REVIEWS_EN,
  );
  const [trustpilotScore, setTrustpilotScore] = useState(DEFAULT_TRUSTPILOT_SCORE);
  const [slideIndex, setSlideIndex] = useState(0);
  const [state, setState] = useState<"visible" | "exiting" | "entering">("visible");
  const [isMobile, setIsMobile] = useState(false);

  /* Track whether the viewport is below sm (640px). Mobile shows
     ONE review per slide and steps through every review one by one.
     Desktop shows three at a time, so we step three at a time. The
     two layouts share the same `slideIndex` but interpret it
     differently when picking what to render. */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  /* Pull live reviews + trustpilot score from /api/landing-stats.
     The endpoint is also what powers the hero KPIs, so we don't
     need a separate fetch. Re-poll every 60s so a long-open tab
     keeps reflecting reality without a hard reload. */
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/landing-stats", { cache: "no-store" });
        if (!res.ok || !active) return;
        const payload = (await res.json()) as {
          trustpilotScoreLabel?: string;
          trustpilotReviews?: ApiReview[];
        };
        if (!active) return;
        if (typeof payload.trustpilotScoreLabel === "string" && payload.trustpilotScoreLabel.trim()) {
          // The DB stores "4.7/5" but the UI appends "/5" itself, so
          // strip a trailing "/5" if present to avoid "4.7/5/5".
          setTrustpilotScore(payload.trustpilotScoreLabel.replace(/\s*\/\s*5\s*$/, "").trim());
        }
        const apiReviews = Array.isArray(payload.trustpilotReviews) ? payload.trustpilotReviews : [];
        if (apiReviews.length > 0) {
          setReviews(
            apiReviews.map((r) => ({
              name: r.name,
              body: locale === "fr" ? r.bodyFr || r.bodyEn : r.bodyEn,
              rating: r.rating,
            })),
          );
        }
      } catch {
        /* keep fallback values */
      }
    };
    load();
    const id = setInterval(load, 60_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [locale]);

  const slidesCount = useMemo(() => {
    if (reviews.length === 0) return 1;
    return isMobile ? reviews.length : Math.ceil(reviews.length / 3);
  }, [reviews.length, isMobile]);

  /* Whenever the slide grid changes (mobile↔desktop, reviews list
     refreshed) the current slideIndex may now point past the new
     slidesCount. Snap it back so the dot indicators always match. */
  useEffect(() => {
    setSlideIndex((prev) => (prev >= slidesCount ? 0 : prev));
  }, [slidesCount]);

  const cycle = useCallback(() => {
    setState("exiting");
    setTimeout(() => {
      setSlideIndex((prev) => (prev + 1) % slidesCount);
      setState("entering");
      setTimeout(() => setState("visible"), 50);
    }, 700);
  }, [slidesCount]);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    if (slidesCount <= 1) return;

    let intervalId: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      if (!intervalId) intervalId = setInterval(cycle, 5000);
    };
    const stop = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
    start();
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [cycle, slidesCount]);

  const currentSlide = useMemo<Review[]>(() => {
    if (reviews.length === 0) return [];
    if (isMobile) {
      return [reviews[slideIndex % reviews.length]];
    }
    const start = slideIndex * 3;
    return [
      reviews[start % reviews.length],
      reviews[(start + 1) % reviews.length],
      reviews[(start + 2) % reviews.length],
    ];
  }, [reviews, slideIndex, isMobile]);

  return (
    <section id="customers" className="pt-[150px] sm:pt-[214px] lg:pt-[278px]">
      <div className="mx-auto w-full max-w-[clamp(1320px,92vw,2400px)] px-5 sm:px-8 lg:px-10">
        <Reveal>
          {/* Whole card is wrapped in a Next/Link to /reviews. On hover
              (or tap on touch — see CSS group/social), the inner
              content darkens, blurs, and scales down while a "View all
              reviews" overlay fades in over it. */}
          <Link
            href="/reviews"
            data-track-id="home.trustpilot_card"
            aria-label={locale === "fr" ? "Voir tous les avis" : "View all the reviews"}
            className="group/social relative block overflow-hidden rounded-[20px] outline-none sm:rounded-[24px]"
          >
            {/* Inner stack — gets blurred + scaled down on hover */}
            <div className="relative overflow-hidden rounded-[20px] bg-white/[0.05] transition-[filter,transform,opacity] duration-300 ease-out group-hover/social:scale-[0.985] group-hover/social:opacity-65 group-hover/social:blur-[3px] sm:rounded-[24px]">

            {/* Content */}
            <div className="relative px-6 pb-10 pt-12 sm:px-10 sm:pb-12 sm:pt-14">
              {/* Trustpilot label */}
              <span className="inline-flex w-full items-center justify-center gap-2.5">
                {/* Trustpilot green star logo */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 271.3 258"
                  className="h-4 w-4 shrink-0 sm:h-[18px] sm:w-[18px]"
                  style={{ position: "relative", top: "-1px" }}
                >
                  <path
                    fill="#00b67a"
                    d="M271.3 98.6H167.7L135.7 0l-32.1 98.6L0 98.5l83.9 61L51.8 258l83.9-60.9 83.8 60.9-32-98.5 83.8-60.9z"
                  />
                  <path fill="#005128" d="M194.7 181.8l-7.2-22.3-51.8 37.6z" />
                </svg>
                <span className="text-sm text-white/50 sm:text-base">
                  {locale === "fr" ? "Adoré sur Trustpilot" : "Loved on Trustpilot"}
                </span>
                <span className="text-sm font-semibold text-white/50 sm:text-base">
                  {trustpilotScore}/5
                </span>
              </span>

              {/* Review cards. Cards have a fixed body height so the
                 grid never re-flows when the carousel cycles, even
                 with reviews of very different lengths. */}
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
                {currentSlide.map((review, i) => (
                  <ReviewCard
                    key={`${slideIndex}-${i}-${review.name}`}
                    review={review}
                    state={state}
                    className={i > 0 ? "hidden sm:flex" : ""}
                  />
                ))}
              </div>

              {/* Dot indicators */}
              <div className="mt-6 flex items-center justify-center gap-1.5">
                {Array.from({ length: slidesCount }).map((_, i) => (
                  <div
                    key={i}
                    className="h-1 rounded-full transition-all duration-500"
                    style={{
                      width: i === slideIndex ? 16 : 4,
                      backgroundColor:
                        i === slideIndex ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.12)",
                    }}
                  />
                ))}
              </div>
            </div>
            </div>
            {/* Hover overlay — dark scrim + "View all the reviews"
                with a two-stroke diagonal arrow. Only opaque on
                hover/focus-within. */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition-opacity duration-300 group-hover/social:opacity-100 group-focus-visible/social:opacity-100">
              <span className="inline-flex items-center gap-3 text-[16px] font-medium text-white sm:text-[18px]">
                {locale === "fr" ? "Voir tous les avis" : "View all the reviews"}
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  {/* Two diagonal strokes forming an arrow up-and-right */}
                  <path d="M7 17 L17 7" />
                  <path d="M9 7 L17 7 L17 15" />
                </svg>
              </span>
            </div>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
