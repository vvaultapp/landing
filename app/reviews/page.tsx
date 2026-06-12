"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { getLandingContent } from "@/components/landing/content";
import {
  TestimonialsColumn,
  type ReviewCard,
} from "@/components/ui/testimonials-columns-1";
import {
  FALLBACK_REVIEWS_EN,
  FALLBACK_REVIEWS_FR,
  type LandingReview,
  type LandingReviewApi,
} from "@/lib/landing-reviews";
import { WINS, type Win } from "@/lib/landing-wins";
import { WinLightbox } from "@/components/landing/WinLightbox";
import { useLocale } from "@/lib/useLocale";

const TRUSTPILOT_URL = "https://www.trustpilot.com/review/vvault.app";
const APP_STORE_URL = "https://apps.apple.com/us/app/vvault/id6759256796";

/* Low-opacity themed fill the review cards use — light grey in light
   mode, subtle white in dark — so the page reads as deliberately
   understated while the black/white text always stays legible. */
const CARD_BG = "rgb(var(--ov) / 0.05)";
const CARD_OUTLINE = "none";

export default function ReviewsPage() {
  const [locale] = useLocale();
  const content = getLandingContent(locale);
  const [activeWin, setActiveWin] = useState<Win | null>(null);

  /* Hydrate from the locale-specific fallback list — same path the
     SocialProofSection uses. As soon as /api/landing-stats responds
     with admin-curated rows we swap them in. */
  const [reviews, setReviews] = useState<LandingReview[]>(() =>
    locale === "fr" ? FALLBACK_REVIEWS_FR : FALLBACK_REVIEWS_EN,
  );

  useEffect(() => {
    /* Whenever locale flips, reset to the locale-specific fallback
       FIRST so the visible review bodies switch languages even before
       the fetch resolves. The fetch then overlays admin-curated rows
       (which carry both bodyEn and bodyFr per row). */
    setReviews(locale === "fr" ? FALLBACK_REVIEWS_FR : FALLBACK_REVIEWS_EN);

    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/landing-stats", { cache: "no-store" });
        if (!res.ok || !active) return;
        const payload = (await res.json()) as {
          trustpilotReviews?: LandingReviewApi[];
        };
        const apiReviews = Array.isArray(payload.trustpilotReviews)
          ? payload.trustpilotReviews
          : [];
        if (apiReviews.length > 0 && active) {
          setReviews(
            apiReviews.map((r) => ({
              name: r.name,
              body: locale === "fr" ? r.bodyFr || r.bodyEn : r.bodyEn,
              rating: r.rating,
            })),
          );
        }
      } catch {
        /* keep fallback */
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [locale]);

  /* Split the live review list across 3 motion columns. If we have
     fewer than 9 we slice and let each column repeat — the upstream
     TestimonialsColumn duplicates its array twice for the infinite
     scroll, so even 2-3 reviews per column read as a continuous flow. */
  const columns = useMemo<{ first: ReviewCard[]; second: ReviewCard[]; third: ReviewCard[] }>(
    () => {
      const cards: ReviewCard[] = reviews.map((r) => ({ ...r, source: "Trustpilot" }));
      const third = Math.ceil(cards.length / 3);
      return {
        first: cards.slice(0, third),
        second: cards.slice(third, third * 2),
        third: cards.slice(third * 2),
      };
    },
    [reviews],
  );

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] font-sans text-[rgb(var(--fg))]">
      <LandingNav locale={locale} content={content} showPrimaryLinks={true} />
      <main className="relative z-10 pb-32 pt-40 sm:pt-48">
        <section className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
          {/* Header — same sizing + structure as the pricing page hero. */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <h1 className="font-display text-5xl font-semibold leading-[1.05] text-[rgb(var(--fg))] sm:text-6xl lg:text-7xl">
              {locale === "fr" ? "Wins" : "Wins"}
            </h1>
            <p className="mx-auto mt-5 max-w-[640px] text-lg leading-relaxed text-[rgb(var(--fg)_/_0.55)] sm:text-xl">
              {locale === "fr" ? (
                <>
                  De vrais artistes, de vraies ventes,
                  <br />
                  capturés depuis vvault.
                </>
              ) : (
                <>
                  Real artists, real sales,
                  <br />
                  captured straight from vvault.
                </>
              )}
            </p>
          </motion.div>

          {/* Wins wall — every win screenshot in a masonry of 2/3
              columns so each one shows at its natural aspect ratio
              (no cropping, so the names + totals stay readable). */}
          <div className="mt-12 columns-2 gap-3 sm:mt-16 sm:columns-3 sm:gap-4 lg:columns-4 [&>*]:mb-3 sm:[&>*]:mb-4">
            {WINS.map((win) => (
              <button
                type="button"
                key={win.src}
                onClick={() => setActiveWin(win)}
                aria-label={`Open win: ${win.alt}`}
                className="block w-full cursor-pointer break-inside-avoid overflow-hidden rounded-2xl hover:-translate-y-0.5"
                style={{
                  background: CARD_BG,
                  outline: CARD_OUTLINE,
                  outlineOffset: "-1px",
                }}
              >
                {/* next/image keeps each screenshot's natural aspect
                    (w/h reserve layout space → no CLS in the masonry)
                    and serves an AVIF/WebP variant sized to the column
                    (~25vw on desktop), lazy-loaded so off-screen wins
                    never download. Tap to view full size. */}
                <Image
                  src={win.src}
                  alt={win.alt}
                  width={win.w}
                  height={win.h}
                  sizes="(max-width: 640px) 48vw, (max-width: 1024px) 32vw, 24vw"
                  className="block h-auto w-full"
                />
              </button>
            ))}
          </div>

          {/* Written reviews — the verified Trustpilot / App Store
              text testimonials, below the visual wins wall. */}
          <h2 className="mt-24 text-center text-2xl font-light text-[rgb(var(--fg))] sm:mt-32 sm:text-3xl">
            {locale === "fr" ? "Ce qu'ils en disent" : "What they're saying"}
          </h2>
          <div
            className="mt-10 flex max-h-[740px] justify-center gap-6 overflow-hidden sm:mt-12"
            style={{
              // Both prefixes — Tailwind's [mask-image:…] only emits the
              // unprefixed property, so Safari (and older Chrome) ignored the
              // fade and the overflow-hidden hard-cut made cards pop in/out
              // abruptly at the edges instead of fading.
              maskImage:
                "linear-gradient(to bottom, transparent, black 25%, black 75%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent, black 25%, black 75%, transparent)",
            }}
          >
            <TestimonialsColumn testimonials={columns.first} duration={15} />
            <TestimonialsColumn
              testimonials={columns.second}
              className="hidden md:block"
              duration={19}
            />
            <TestimonialsColumn
              testimonials={columns.third}
              className="hidden lg:block"
              duration={17}
            />
          </div>
        </section>

        <section className="mx-auto mt-24 w-full max-w-[820px] px-5 sm:mt-32 sm:px-8">
          {/* "Read every review" callout — same gradient + outline as
              the pricing cards. */}
          <div
            className="relative overflow-hidden rounded-2xl p-8 sm:p-12"
            style={{
              background: CARD_BG,
              outline: CARD_OUTLINE,
              outlineOffset: "-1px",
            }}
          >
            <h2 className="text-2xl font-light text-[rgb(var(--fg))] sm:text-3xl">
              {locale === "fr" ? "Lire tous les avis" : "Read every review"}
            </h2>
            <p className="mt-3 max-w-[560px] text-[14px] leading-relaxed text-[rgb(var(--fg)_/_0.6)] sm:text-[15px]">
              {locale === "fr"
                ? "Tous nos avis sont publics et vérifiés. Trustpilot pour le web, l'App Store pour le mobile."
                : "Every review is public and verified. Trustpilot for the web, the App Store for mobile."}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href={TRUSTPILOT_URL}
                target="_blank"
                rel="noopener noreferrer"
                data-track-id="reviews.trustpilot"
                className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#00b67a] px-5 text-[13.5px] font-semibold text-white hover:bg-[#009d6a]"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 1.5l2.65 8.16h8.59l-6.95 5.05 2.66 8.16-6.95-5.05-6.95 5.05 2.66-8.16-6.95-5.05h8.59z" />
                </svg>
                {locale === "fr" ? "Voir Trustpilot" : "View on Trustpilot"}
              </a>
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                data-track-id="reviews.app_store"
                className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[rgb(var(--ov)_/_0.06)] px-5 text-[13.5px] font-medium text-[rgb(var(--fg)_/_0.85)] hover:bg-[rgb(var(--ov)_/_0.12)] hover:text-[rgb(var(--fg))]"
              >
                {locale === "fr" ? "Voir sur l'App Store" : "View on the App Store"}
              </a>
            </div>
          </div>
        </section>
      </main>
      {/* Compact inline footer — no watermark, no faint glow lines.
          Earlier the full LandingFooter rendered the giant low-opacity
          "vvault" watermark above the footer block which read as a
          weird grey stripe at the bottom of the /reviews page. The
          inline variant skips both the watermark and the multi-column
          block. */}
      <LandingFooter
        locale={locale}
        content={content}
      />

      <WinLightbox win={activeWin} onClose={() => setActiveWin(null)} />
    </div>
  );
}
