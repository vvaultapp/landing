"use client";

import dynamic from "next/dynamic";
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
/*  Final conversion section — modelled on Resend / Linear closing     */
/*  heroes: one short declarative tagline, one CTA tile, nothing       */
/*  else. Angle is "ownership of the link" (fresh — not the tracking    */
/*  pitch we already made on the home page). The LaserFlow beam is     */
/*  masked so it visually terminates right on the CTA tile's top       */
/*  edge — so the beam "lands" on the UI instead of floating behind    */
/*  it. A very prominent impact flash + splash + inner glow sell the   */
/*  contact point.                                                     */
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
  const secondary = fr ? "Voir un lien en direct" : "See a live link";
  const trust = fr
    ? "Gratuit pour toujours · Aucune carte requise · Annule quand tu veux"
    : "Free forever · No credit card · Cancel anytime";

  return (
    <section
      id="get-started"
      className="relative overflow-hidden pt-28 sm:pt-40"
    >
      {/* LaserFlow beam — mask fades IN from the top AND fades OUT
          right above the CTA tile, so the beam visually ends on the
          tile surface instead of continuing behind it. The fade-out
          keypoint (~48%) is tuned so the brightest core of the beam
          aligns with the CTA tile's top edge on both mobile and
          desktop. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[980px] sm:h-[1120px]"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.18) 8%, rgba(0,0,0,0.6) 18%, black 30%, black 46%, rgba(0,0,0,0.35) 55%, transparent 66%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.18) 8%, rgba(0,0,0,0.6) 18%, black 30%, black 46%, rgba(0,0,0,0.35) 55%, transparent 66%)",
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
        {/* Headline — solid white, dark backdrop glow so it stays
            legible against the bright beam. */}
        <Reveal>
          <div className="pt-[150px] text-center sm:pt-[200px]">
            <h2
              className="mx-auto max-w-[860px] text-[2.3rem] font-medium leading-[1.02] tracking-[-0.022em] text-white sm:text-[3.8rem] lg:text-[4.6rem]"
              style={{
                textShadow:
                  "0 2px 30px rgba(0,0,0,0.6), 0 0 80px rgba(235,215,255,0.16)",
              }}
            >
              {headline}
            </h2>
            <p className="mx-auto mt-5 max-w-[540px] text-[14px] leading-relaxed text-white/75 sm:mt-6 sm:text-[15.5px]">
              {sub}
            </p>
          </div>
        </Reveal>

        {/* CTA tile — the beam lands here. Three stacked impact layers
            sell the contact point: (1) a bright horizontal flash on the
            top edge, (2) a wide upward splash reaching above the tile
            so the "light falls from the beam onto it", (3) an inner
            downward glow pool inside the tile. */}
        <Reveal>
          <div className="relative mt-14 sm:mt-20">
            {/* Splash — sits above the tile, so the beam's end point
                appears to "spray" light outward just above the surface. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 -top-24 z-0 h-[180px] w-[720px] -translate-x-1/2 sm:-top-28 sm:h-[220px] sm:w-[860px]"
              style={{
                background:
                  "radial-gradient(ellipse 50% 100% at 50% 100%, rgba(235,215,255,0.55) 0%, rgba(235,215,255,0.22) 28%, rgba(235,215,255,0.06) 55%, transparent 78%)",
              }}
            />

            <div
              className="relative z-10 mx-auto max-w-[580px] overflow-hidden rounded-[24px] sm:rounded-[28px]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(18,16,24,0.96) 0%, rgba(6,5,9,1) 100%)",
                boxShadow:
                  "0 60px 120px -32px rgba(0,0,0,0.95), 0 0 0 1px rgba(235,215,255,0.06), 0 -6px 60px -14px rgba(235,215,255,0.28)",
              }}
            >
              {/* Impact flash — a very bright horizontal hairline where
                  the beam meets the tile surface. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-[2px]"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(235,215,255,0.35) 10%, rgba(255,255,255,1) 50%, rgba(235,215,255,0.35) 90%, transparent 100%)",
                  boxShadow:
                    "0 0 36px 4px rgba(235,215,255,0.75), 0 0 18px rgba(255,255,255,0.55)",
                }}
              />
              {/* Inner glow pool — the light that "pooled" on the tile's
                  top surface after the beam hit. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-0 h-[320px] w-[540px] -translate-x-1/2 -translate-y-[45%]"
                style={{
                  background:
                    "radial-gradient(ellipse 55% 55% at 50% 50%, rgba(235,215,255,0.42) 0%, rgba(235,215,255,0.14) 35%, rgba(235,215,255,0.03) 60%, transparent 78%)",
                }}
              />
              {/* Subtle outer border that fades with depth */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-[inherit]"
                style={{
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderBottom: "none",
                  maskImage:
                    "linear-gradient(to bottom, black 0%, black 30%, transparent 100%)",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, black 0%, black 30%, transparent 100%)",
                }}
              />

              {/* CTA content — everything sits inside the tile so the
                  beam visually "powers" the CTA. */}
              <div className="relative flex flex-col items-center gap-5 px-6 pb-9 pt-14 text-center sm:gap-6 sm:px-10 sm:pb-11 sm:pt-16">
                <LandingCtaLink
                  loggedInHref="https://vvault.app/billing"
                  loggedOutHref="https://vvault.app/signup"
                  className="inline-flex w-full max-w-[360px] items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-[14.5px] font-semibold text-[#0e0e0e] shadow-[0_10px_30px_-8px_rgba(255,255,255,0.35)] transition-colors duration-200 hover:bg-white/92 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:text-[15.5px]"
                >
                  {primary}
                  <svg
                    viewBox="0 0 20 20"
                    className="h-4 w-4 fill-none stroke-current stroke-[1.8]"
                  >
                    <path d="M4 10h11M11 6l4 4-4 4" />
                  </svg>
                </LandingCtaLink>

                <a
                  href="https://vvault.app/kodaa/the-drop"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-[13px] font-medium text-white/55 transition-colors duration-200 hover:text-white sm:text-[13.5px]"
                >
                  <span>{secondary}</span>
                  <svg
                    viewBox="0 0 16 16"
                    className="h-3.5 w-3.5 fill-none stroke-current stroke-[1.6]"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 11 11 5M6.5 5H11v4.5" />
                  </svg>
                </a>

                <div
                  className="mt-1 h-px w-24 sm:w-28"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)",
                  }}
                />

                <p className="text-[12px] leading-relaxed text-white/45 sm:text-[12.5px]">
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
