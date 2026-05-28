"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/components/landing/content";
import { Reveal } from "@/components/landing/Reveal";
import { FEATURED_WINS, type Win } from "@/lib/landing-wins";
import { WinLightbox } from "@/components/landing/WinLightbox";
import { trackButtonClick } from "@/lib/analytics/client";

/* "Wins" wall — real screenshots of producers using vvault. Shows the
   12 featured wins in a masonry (so every screenshot keeps its natural
   aspect ratio and nothing is ever cropped, on desktop or mobile). The
   wall is clipped to a preview height that fades into a centered
   "View wins" button → the full /reviews wall. Tapping any win opens
   it full-size in a lightbox. */
export function WinsSection({ locale = "en" }: { locale?: Locale }) {
  const fr = locale === "fr";
  const [active, setActive] = useState<Win | null>(null);

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

        {/* Masonry + fade. The wall is clipped to a preview height; an
            absolute gradient floor fades the bottom into black, and the
            "View wins" button floats centered over that fade. Each win
            keeps its natural aspect (no crop), so screenshots never get
            cut off — on desktop or mobile. */}
        <div className="relative mt-12 sm:mt-16">
          <div className="max-h-[680px] overflow-hidden sm:max-h-[760px]">
            <div className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4 [&>*]:mb-3 sm:[&>*]:mb-4">
              {FEATURED_WINS.map((win, i) => (
                <Reveal key={win.src} delayMs={(i % 4) * 70}>
                  <button
                    type="button"
                    onClick={() => setActive(win)}
                    aria-label={`Open win: ${win.alt}`}
                    className="block w-full cursor-pointer break-inside-avoid overflow-hidden rounded-2xl transition-transform duration-200 hover:-translate-y-0.5"
                    style={{
                      background: "#0d0d0f",
                      outline: "1px solid rgba(255,255,255,0.08)",
                      outlineOffset: "-1px",
                    }}
                  >
                    <Image
                      src={win.src}
                      alt={win.alt}
                      width={win.w}
                      height={win.h}
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 24vw"
                      className="block h-auto w-full"
                    />
                  </button>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Fade floor — dissolves the clipped bottom of the wall into
              the page so it doesn't end on a hard cut. */}
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

      <WinLightbox win={active} onClose={() => setActive(null)} />
    </section>
  );
}
