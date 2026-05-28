"use client";

import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/components/landing/content";
import { Reveal } from "@/components/landing/Reveal";
import { FEATURED_WINS } from "@/lib/landing-wins";
import { trackButtonClick } from "@/lib/analytics/client";

/* "Wins" wall — real screenshots of producers using vvault. Shows the
   6 featured wins in a 3-per-row grid; the bottom row fades into black
   with a centered "View wins" button that links to the full /reviews
   wall. */
export function WinsSection({ locale = "en" }: { locale?: Locale }) {
  const fr = locale === "fr";
  return (
    <section className="relative pt-24 pb-20 sm:pt-32 sm:pb-28">
      <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <Reveal>
          <div className="text-center">
            <h2 className="mx-auto max-w-[820px] text-[1.55rem] font-medium leading-tight tracking-tight text-white sm:text-3xl lg:text-[2.2rem]">
              {fr ? "Des wins, tous les jours." : "Wins, every single day."}
              <br />
              <span className="text-white/40">
                {fr
                  ? "Des vrais artistes. De vraies ventes."
                  : "Real artists. Real sales."}
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-[560px] text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
              {fr
                ? "Ce que les producteurs reçoivent depuis qu'ils envoient avec vvault."
                : "What producers get back the moment they start sending with vvault."}
            </p>
          </div>
        </Reveal>

        {/* Grid + fade. The grid holds the 6 featured wins; an absolute
            gradient floor fades the bottom row into black, and the
            "View wins" button floats centered over that fade. */}
        <div className="relative mt-12 sm:mt-16">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {FEATURED_WINS.map((win, i) => (
              <Reveal key={win.src} delayMs={(i % 4) * 70}>
                <div
                  className="relative overflow-hidden rounded-2xl"
                  style={{
                    background: "#0d0d0f",
                    outline: "1px solid rgba(255,255,255,0.08)",
                    outlineOffset: "-1px",
                  }}
                >
                  {/* Fixed aspect so the grid rows stay even. object-top
                      keeps the most important part (names / totals,
                      which sit at the top of every screenshot) in view.
                      next/image fills the box and serves an AVIF/WebP
                      variant sized to the card (~25vw on desktop), so
                      each one is only a few KB and lazy-loads. */}
                  <div className="relative aspect-[4/5] w-full">
                    <Image
                      src={win.src}
                      alt={win.alt}
                      fill
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 24vw"
                      className="object-cover object-top"
                    />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Fade floor — sits over the lower portion of the bottom row
              so it dissolves into the page background. Tall enough to
              swallow roughly the bottom half of row two. */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[260px] sm:h-[300px]"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.9) 75%, #000 100%)",
            }}
          />

          {/* View wins button — centered over the fade. */}
          <div className="absolute inset-x-0 bottom-0 flex justify-center pb-2 sm:pb-4">
            <Link
              href="/reviews"
              onClick={() =>
                trackButtonClick({
                  buttonId: "landing.view_wins",
                  surface: "landing.wins",
                  locale,
                  href: "/reviews",
                })
              }
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-[14px] font-semibold text-black transition-colors duration-200 hover:bg-white/90"
            >
              {fr ? "Voir les wins" : "View wins"}
              <svg
                viewBox="0 0 20 20"
                className="h-3.5 w-3.5 fill-none stroke-current stroke-[2]"
              >
                <path d="M4 10h11M11 6l4 4-4 4" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
