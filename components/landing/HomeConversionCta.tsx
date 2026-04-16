"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import type { Locale } from "@/components/landing/content";
import { LandingCtaLink } from "@/components/landing/LandingCtaLink";
import { Reveal } from "@/components/landing/Reveal";

const LaserFlow = dynamic(() => import("@/components/landing/LaserFlow"), {
  ssr: false,
});

type HomeConversionCtaProps = {
  locale?: Locale;
};

/* ------------------------------------------------------------------ */
/*  Final conversion section                                           */
/*                                                                     */
/*  The LaserFlow beam sits in a full-width container behind every-    */
/*  thing (z-0). The CTA tile is an opaque black card on top (z-10) —  */
/*  so the beam visually TERMINATES at the tile's top edge because     */
/*  the opaque card hides the beam below that line. A bright 2px       */
/*  horizontal flash + a wide upward splash + an inner glow pool sell  */
/*  the impact moment, making the beam appear to rest on the card.    */
/*                                                                     */
/*  Text legibility is handled with (a) a dark radial backdrop blob    */
/*  behind the headline + sub, which darkens the beam in that area,   */
/*  and (b) a strong multi-layer dark text-shadow that haloes each     */
/*  character so white type reads against the bright beam.             */
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

  return (
    <section
      id="get-started"
      className="relative overflow-hidden pt-20 sm:pt-32"
    >
      {/* LaserFlow beam — fades IN from the top, then stays solid.
          No bottom fade-out: the opaque black CTA tile itself is what
          visually terminates the beam, so the beam literally rests on
          the tile's top edge. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[900px] sm:h-[1060px]"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.18) 8%, rgba(0,0,0,0.55) 18%, black 30%, black 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.18) 8%, rgba(0,0,0,0.55) 18%, black 30%, black 100%)",
        }}
      >
        <LaserFlow
          color="#ebd7ff"
          horizontalBeamOffset={0.0}
          verticalBeamOffset={0.05}
          horizontalSizing={0.52}
          verticalSizing={1.9}
          wispDensity={0.85}
          wispSpeed={13}
          wispIntensity={4.4}
          flowSpeed={0.42}
          flowStrength={0.22}
          fogIntensity={0.42}
          fogScale={0.28}
          fogFallSpeed={0.5}
          decay={1.22}
          falloffStart={1.05}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
        {/* Headline block — a dark radial backdrop sits behind the type
            so white characters read cleanly against the bright beam. */}
        <Reveal>
          <div className="relative pt-[120px] text-center sm:pt-[170px]">
            {/* Dark backdrop blob — darkens the beam in the text zone */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-[60px] -z-0 h-[320px] sm:top-[90px] sm:h-[440px]"
              style={{
                background:
                  "radial-gradient(ellipse 55% 65% at 50% 45%, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.38) 42%, rgba(0,0,0,0.12) 70%, transparent 88%)",
              }}
            />
            <h2
              className="relative z-10 mx-auto max-w-[860px] text-[2.3rem] font-medium leading-[1.02] tracking-[-0.022em] text-white sm:text-[3.8rem] lg:text-[4.6rem]"
              style={{
                textShadow:
                  "0 2px 24px rgba(0,0,0,0.85), 0 0 44px rgba(0,0,0,0.65), 0 1px 2px rgba(0,0,0,0.6)",
              }}
            >
              {headline}
            </h2>
            <p
              className="relative z-10 mx-auto mt-5 max-w-[540px] text-[14px] leading-relaxed text-white/90 sm:mt-6 sm:text-[15.5px]"
              style={{
                textShadow:
                  "0 1px 14px rgba(0,0,0,0.85), 0 0 22px rgba(0,0,0,0.55)",
              }}
            >
              {sub}
            </p>
          </div>
        </Reveal>

        {/* CTA tile — opaque black card. The beam ends at its top edge
            because the tile is drawn ON TOP of the beam (higher z-index
            + opaque bg). An impact flash, a side-spray splash, and an
            inner glow pool sell the moment the beam lands. */}
        <Reveal>
          <div className="relative mt-10 sm:mt-12">
            {/* Splash — an elliptical burst that straddles the tile's
                top edge and extends a bit past its sides, selling "light
                sprays outward on impact". Sits above the tile (z-0
                inside the wrapper) but BELOW the tile body. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 -top-6 z-0 h-[140px] w-[820px] -translate-x-1/2 sm:-top-8 sm:h-[180px] sm:w-[960px]"
              style={{
                background:
                  "radial-gradient(ellipse 40% 100% at 50% 45%, rgba(235,215,255,0.7) 0%, rgba(235,215,255,0.28) 22%, rgba(235,215,255,0.08) 48%, transparent 75%)",
              }}
            />

            <div
              className="relative z-10 mx-auto max-w-[580px] overflow-hidden rounded-[24px] sm:rounded-[28px]"
              style={{
                background: "#000000",
                boxShadow:
                  "0 60px 120px -32px rgba(0,0,0,0.95), 0 0 0 1px rgba(235,215,255,0.08)",
              }}
            >
              {/* Impact flash — very bright hairline on the top edge */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-[2px]"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(235,215,255,0.4) 10%, rgba(255,255,255,1) 50%, rgba(235,215,255,0.4) 90%, transparent 100%)",
                  boxShadow:
                    "0 0 40px 4px rgba(235,215,255,0.85), 0 0 20px rgba(255,255,255,0.6)",
                }}
              />
              {/* Inner glow pool — light pooling on the tile top surface */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[520px] -translate-x-1/2 -translate-y-[48%]"
                style={{
                  background:
                    "radial-gradient(ellipse 55% 55% at 50% 50%, rgba(235,215,255,0.5) 0%, rgba(235,215,255,0.16) 35%, rgba(235,215,255,0.04) 60%, transparent 78%)",
                }}
              />
              {/* Subtle top border that fades with depth */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-[inherit]"
                style={{
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderBottom: "none",
                  maskImage:
                    "linear-gradient(to bottom, black 0%, black 30%, transparent 100%)",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, black 0%, black 30%, transparent 100%)",
                }}
              />

              {/* CTA content */}
              <div className="relative flex flex-col items-center gap-5 px-6 pb-9 pt-14 text-center sm:gap-6 sm:px-10 sm:pb-11 sm:pt-16">
                <LandingCtaLink
                  loggedInHref="https://vvault.app/billing"
                  loggedOutHref="https://vvault.app/signup"
                  className="home-cta-primary group inline-flex w-full max-w-[360px] items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-[14.5px] font-semibold text-[#0e0e0e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:text-[15.5px]"
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

                <div
                  className="mt-1 h-px w-24 sm:w-28"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.14) 50%, transparent 100%)",
                  }}
                />

                <p className="text-[12px] leading-relaxed text-white/50 sm:text-[12.5px]">
                  {trust}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

    </section>
  );
}
