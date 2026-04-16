"use client";

import Link from "next/link";
import type { Locale } from "@/components/landing/content";
import { LandingCtaLink } from "@/components/landing/LandingCtaLink";
import { Reveal } from "@/components/landing/Reveal";

type HomeConversionCtaProps = {
  locale?: Locale;
};

/* ------------------------------------------------------------------ */
/*  Final conversion section                                           */
/*                                                                     */
/*  The visual story: show the user what they're actually getting — a  */
/*  single vvault link that holds their track, their stats, their      */
/*  audience. A realistic preview card (URL pill, cover art, track     */
/*  meta, play button, waveform) sits below the headline. A soft       */
/*  lavender aurora + subtle dotted grid sets the depth without        */
/*  overpowering the type. The primary button carries the lavender     */
/*  glow (.home-cta-primary) so brand colour is continuous with the    */
/*  rest of the page.                                                  */
/* ------------------------------------------------------------------ */

export function HomeConversionCta({ locale = "en" }: HomeConversionCtaProps) {
  const fr = locale === "fr";

  const headline = fr
    ? "Envoie le track. Possède le lien."
    : "Send the track. Own the link.";
  const sub = fr
    ? "Un vault, une URL, toutes les stats. Rien n'expire. Rien ne se perd."
    : "One vault, one URL, every stat. Nothing expires. Nothing gets lost.";

  const primary = fr ? "Créer ton compte gratuit" : "Create your free account";
  const secondary = fr ? "Ouvrir le vault" : "Open the vault";
  const secondaryHref = fr ? "/fr/features" : "/features";
  const trust = fr
    ? "Gratuit pour toujours · Aucune carte requise · Annule quand tu veux"
    : "Free forever · No credit card · Cancel anytime";

  const trackTitle = fr ? "Minuit à Paris" : "Midnight Drive";
  const trackStatus = fr ? "Nouveau single" : "New single";
  const plays = fr ? "2 412 écoutes" : "2,412 plays";

  /* Waveform bars — fixed heights so server/client match (no hydration
     mismatch). 42 bars with a gentle "song-shaped" rise/fall. */
  const bars = [
    22, 34, 48, 62, 42, 28, 52, 68, 44, 30,
    38, 54, 72, 56, 40, 46, 64, 80, 62, 44,
    30, 44, 60, 76, 58, 40, 48, 66, 52, 36,
    28, 40, 58, 70, 52, 36, 28, 44, 62, 48,
    32, 22,
  ];
  const playedThrough = 14;

  return (
    <section
      id="get-started"
      className="relative overflow-hidden pt-24 sm:pt-36"
    >
      {/* Dotted grid — subtle texture, fades at the edges so the type
          sits on a clean pool of darkness. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.28) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          opacity: 0.35,
          maskImage:
            "radial-gradient(ellipse 62% 55% at 50% 42%, black 0%, rgba(0,0,0,0.5) 50%, transparent 82%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 62% 55% at 50% 42%, black 0%, rgba(0,0,0,0.5) 50%, transparent 82%)",
        }}
      />

      {/* Aurora — two overlapping lavender pools sitting behind the
          headline area. Large, soft, static — no animation. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[780px]"
        style={{
          background:
            "radial-gradient(ellipse 55% 55% at 50% 36%, rgba(196,168,255,0.22) 0%, rgba(196,168,255,0.06) 38%, transparent 68%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[140px] z-0 h-[440px] w-[840px] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse 50% 50% at 28% 50%, rgba(120,100,220,0.14) 0%, transparent 70%), radial-gradient(ellipse 45% 45% at 72% 50%, rgba(220,190,255,0.12) 0%, transparent 70%)",
          filter: "blur(6px)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1080px] px-5 sm:px-8 lg:px-10">
        {/* Headline */}
        <Reveal>
          <div className="text-center">
            <h2 className="mx-auto max-w-[820px] text-[2.3rem] font-medium leading-[1.02] tracking-[-0.022em] text-white sm:text-[3.8rem] lg:text-[4.4rem]">
              {headline}
            </h2>
            <p className="mx-auto mt-5 max-w-[520px] text-[14px] leading-relaxed text-white/55 sm:mt-6 sm:text-[15.5px]">
              {sub}
            </p>
          </div>
        </Reveal>

        {/* Product preview card — a mock vvault link showing what a
            producer's vault looks like in the wild. */}
        <Reveal>
          <div className="relative mx-auto mt-12 max-w-[560px] sm:mt-14">
            {/* Halo glow behind card */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-10 -z-10"
              style={{
                background:
                  "radial-gradient(ellipse 60% 75% at 50% 50%, rgba(196,168,255,0.14) 0%, transparent 72%)",
                filter: "blur(18px)",
              }}
            />
            <div
              className="relative overflow-hidden rounded-2xl p-4 sm:rounded-[20px] sm:p-5"
              style={{
                background:
                  "linear-gradient(180deg, rgba(22,20,30,0.96) 0%, rgba(10,9,14,0.98) 100%)",
                boxShadow:
                  "0 40px 80px -24px rgba(0,0,0,0.8), 0 0 0 1px rgba(196,168,255,0.12), inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            >
              {/* Top glow line — lavender, centered */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(196,168,255,0.4) 50%, transparent 100%)",
                }}
              />

              <div className="flex items-center gap-3 sm:gap-4">
                {/* Cover art */}
                <div
                  className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl sm:h-[68px] sm:w-[68px]"
                  style={{
                    background:
                      "linear-gradient(135deg, #8b6ffb 0%, #c4a8ff 45%, #ff9ec7 100%)",
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(circle at 30% 28%, rgba(255,255,255,0.4) 0%, transparent 55%)",
                    }}
                  />
                  <svg
                    viewBox="0 0 24 24"
                    className="absolute inset-0 m-auto h-5 w-5 fill-none stroke-white/90 stroke-[1.6] sm:h-6 sm:w-6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                  </svg>
                </div>

                {/* Meta */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <svg
                      viewBox="0 0 16 16"
                      className="h-3 w-3 shrink-0 fill-none stroke-white/35 stroke-[1.5]"
                      strokeLinecap="round"
                    >
                      <path d="M6.5 9.5a3 3 0 0 0 4.24 0l2.12-2.12a3 3 0 0 0-4.24-4.24L7.5 4.27" />
                      <path d="M9.5 6.5a3 3 0 0 0-4.24 0L3.14 8.62a3 3 0 0 0 4.24 4.24L8.5 11.73" />
                    </svg>
                    <span className="truncate text-[11px] font-medium tracking-[0.01em] text-white/40 sm:text-[12px]">
                      vvault.app/yourname
                    </span>
                  </div>
                  <div className="mt-1 truncate text-[14.5px] font-semibold text-white sm:text-[15.5px]">
                    {trackTitle}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-white/40 sm:text-[12px]">
                    <span>{trackStatus}</span>
                    <span className="h-[3px] w-[3px] rounded-full bg-white/25" />
                    <span className="tabular-nums">{plays}</span>
                  </div>
                </div>

                {/* Play button — white pill for premium feel */}
                <div
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black sm:h-11 sm:w-11"
                  style={{
                    boxShadow:
                      "0 6px 20px -4px rgba(196,168,255,0.35), inset 0 -2px 4px rgba(0,0,0,0.08)",
                  }}
                >
                  <svg viewBox="0 0 16 16" className="ml-[2px] h-3.5 w-3.5 fill-current">
                    <path d="M4 2.5v11l10-5.5z" />
                  </svg>
                </div>
              </div>

              {/* Waveform — gradient on played bars, muted on the rest */}
              <div className="mt-4 flex h-10 items-end gap-[2px] sm:mt-5 sm:h-12">
                {bars.map((h, i) => {
                  const active = i < playedThrough;
                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-[1.5px]"
                      style={{
                        height: `${h}%`,
                        background: active
                          ? "linear-gradient(180deg, rgba(210,185,255,0.95) 0%, rgba(139,111,251,0.7) 100%)"
                          : "rgba(255,255,255,0.14)",
                      }}
                    />
                  );
                })}
              </div>

              {/* Timestamp row under waveform */}
              <div className="mt-2 flex items-center justify-between text-[10.5px] font-medium tabular-nums text-white/30 sm:text-[11px]">
                <span>0:42</span>
                <span>3:14</span>
              </div>
            </div>
          </div>
        </Reveal>

        {/* CTA stack */}
        <Reveal>
          <div className="mt-12 flex flex-col items-center gap-4 sm:mt-14">
            <LandingCtaLink
              loggedInHref="https://vvault.app/billing"
              loggedOutHref="https://vvault.app/signup"
              className="home-cta-primary group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-[14.5px] font-semibold text-[#0e0e0e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:text-[15.5px]"
            >
              <span>{primary}</span>
              <svg
                viewBox="0 0 20 20"
                className="h-4 w-4 fill-none stroke-current stroke-[1.8] transition-transform duration-200 group-hover:translate-x-0.5"
              >
                <path d="M4 10h11M11 6l4 4-4 4" />
              </svg>
            </LandingCtaLink>

            <Link
              href={secondaryHref}
              className="group inline-flex items-center gap-1.5 text-[13px] font-medium text-white/55 transition-colors duration-200 hover:text-white sm:text-[13.5px]"
            >
              <span>{secondary}</span>
              <svg
                viewBox="0 0 16 16"
                className="h-3.5 w-3.5 fill-none stroke-current stroke-[1.6] transition-transform duration-200 group-hover:translate-x-0.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 8h8M9 5l3 3-3 3" />
              </svg>
            </Link>

            <p className="mt-2 text-center text-[12px] leading-relaxed text-white/35 sm:text-[12.5px]">
              {trust}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
