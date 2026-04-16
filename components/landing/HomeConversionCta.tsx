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
/*  Section                                                            */
/*                                                                     */
/*  Goal: the user's eye lands inside the beam. A tall, immersive      */
/*  headline sits right where the beam is brightest — gradient text    */
/*  picks up the beam's colour. Below, a single, minimal card          */
/*  catches the beam (the "spill-over" effect), and its content is     */
/*  just one clean piece of information: the link itself. No cover,    */
/*  no track list, no pack metadata — just the moment the URL exists.  */
/* ------------------------------------------------------------------ */

export function HomeConversionCta({ locale = "en" }: HomeConversionCtaProps) {
  const fr = locale === "fr";

  const headline = fr
    ? "Un seul lien et c'est envoyé."
    : "One link and it's out.";
  const sub = fr
    ? "Plus de WeTransfer. Plus de Drive. Un lien qui ressemble à un drop — et qui te dit qui écoute vraiment."
    : "No more WeTransfer. No more Drive. One link that feels like a drop — and tells you who actually listens.";

  const primary = fr ? "Commencer gratuitement" : "Start free";
  const trust = fr
    ? "Plan gratuit pour toujours · Aucune carte requise"
    : "Free forever plan · No credit card required";

  const linkHost = "vvault.app";
  const linkArtist = fr ? "kodaa" : "kodaa";
  const linkSlug = fr ? "le-drop" : "the-drop";

  return (
    <section
      id="get-started"
      className="relative overflow-hidden pt-28 sm:pt-40"
    >
      {/* LaserFlow beam — sits behind everything, fades in from the top
          so the beam appears to emerge from darkness. Extends far past
          the card so it visually "spills" over the card's top edge. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[1100px] sm:h-[1280px]"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.15) 8%, rgba(0,0,0,0.55) 18%, black 32%, black 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.15) 8%, rgba(0,0,0,0.55) 18%, black 32%, black 100%)",
        }}
      >
        <LaserFlow
          color="#ebd7ff"
          horizontalBeamOffset={0.0}
          verticalBeamOffset={0.05}
          horizontalSizing={0.5}
          verticalSizing={1.85}
          wispDensity={0.85}
          wispSpeed={13}
          wispIntensity={4.2}
          flowSpeed={0.4}
          flowStrength={0.22}
          fogIntensity={0.38}
          fogScale={0.28}
          fogFallSpeed={0.5}
          decay={1.25}
          falloffStart={1.05}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
        {/* Immersive headline, positioned right inside the beam's glow.
            Gradient flows white → lavender → faint, so the text reads
            as if it's made of the beam itself. */}
        <Reveal>
          <div className="pt-[180px] text-center sm:pt-[240px]">
            <h2
              className="mx-auto max-w-[900px] text-[2.6rem] font-medium leading-[0.98] tracking-[-0.02em] sm:text-[4.4rem] lg:text-[5.4rem]"
              style={{
                background:
                  "linear-gradient(180deg, #ffffff 0%, #f3e6ff 48%, rgba(235,215,255,0.45) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "0 0 60px rgba(235,215,255,0.12)",
              }}
            >
              {headline}
            </h2>
            <p className="mx-auto mt-5 max-w-[520px] text-[13.5px] leading-relaxed text-white/50 sm:mt-6 sm:text-[15px]">
              {sub}
            </p>
          </div>
        </Reveal>

        {/* Minimal link-drop box — the beam lands on its top edge and
            spills over (Huly-style). One line of content: the URL. */}
        <Reveal>
          <div className="relative mt-14 sm:mt-20">
            <div
              className="relative mx-auto max-w-[580px] overflow-hidden rounded-[22px] sm:rounded-[26px]"
              style={{
                background: "#050607",
                boxShadow:
                  "0 40px 90px -30px rgba(0,0,0,0.9), 0 0 0 1px rgba(235,215,255,0.04), 0 -4px 50px -12px rgba(235,215,255,0.2)",
              }}
            >
              {/* Beam-impact highlight on the top edge — the visible
                  spot where the laser touches the card surface. */}
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px]"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(235,215,255,0.25) 12%, rgba(255,255,255,0.92) 50%, rgba(235,215,255,0.25) 88%, transparent 100%)",
                  boxShadow: "0 0 22px rgba(235,215,255,0.55)",
                }}
              />
              {/* Soft glow pool centered on the impact point */}
              <div
                className="pointer-events-none absolute left-1/2 top-0 h-[240px] w-[460px] -translate-x-1/2 -translate-y-1/3"
                style={{
                  background:
                    "radial-gradient(ellipse 55% 60% at 50% 50%, rgba(235,215,255,0.28) 0%, rgba(235,215,255,0.07) 40%, transparent 75%)",
                }}
              />
              {/* Subtle border fades with depth */}
              <div
                className="pointer-events-none absolute inset-0 rounded-[inherit]"
                style={{
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderBottom: "none",
                  maskImage:
                    "linear-gradient(to bottom, black 0%, black 25%, transparent 100%)",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, black 0%, black 25%, transparent 100%)",
                }}
              />

              {/* Single-line URL "drop" */}
              <div className="relative flex items-center gap-3 px-4 py-4 sm:gap-4 sm:px-5 sm:py-5">
                {/* Lock / secure glyph — says "this link is yours" */}
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-1 ring-white/10 sm:h-11 sm:w-11"
                  style={{ background: "rgba(235,215,255,0.06)" }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-[15px] w-[15px] fill-none stroke-[#ebd7ff] stroke-[1.7] sm:h-4 sm:w-4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10.5 13.5a4.5 4.5 0 0 0 6.36.5l3-3a4.5 4.5 0 0 0-6.36-6.36l-1.5 1.5M13.5 10.5a4.5 4.5 0 0 0-6.36-.5l-3 3a4.5 4.5 0 0 0 6.36 6.36l1.5-1.5" />
                  </svg>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[9.5px] font-semibold uppercase tracking-[0.22em] text-white/35 sm:text-[10.5px]">
                    {fr ? "ton lien" : "your link"}
                  </p>
                  <p className="mt-1 truncate font-mono text-[14px] leading-tight text-white sm:text-[16px]">
                    <span className="text-white/45">{linkHost}/</span>
                    <span className="text-white/70">{linkArtist}/</span>
                    <span className="text-[#ebd7ff]">{linkSlug}</span>
                  </p>
                </div>

                {/* Copy pill — implies the link is ready to ship */}
                <div
                  className="hidden shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80 sm:inline-flex"
                >
                  <svg
                    viewBox="0 0 16 16"
                    className="h-3 w-3 fill-none stroke-current stroke-[1.6]"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 11 9.5 6.5M11 8V4H7" />
                  </svg>
                  <span>{fr ? "Copié" : "Copied"}</span>
                </div>
              </div>

              {/* Thin bottom status line — subtle signal that the link
                  is live and being listened to */}
              <div className="relative flex items-center justify-between border-t border-white/[0.05] px-4 py-3 sm:px-5">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-1.5 w-1.5">
                    <span
                      className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
                      style={{ background: "#a8ff8a" }}
                    />
                    <span
                      className="relative inline-flex h-1.5 w-1.5 rounded-full"
                      style={{ background: "#a8ff8a" }}
                    />
                  </span>
                  <span className="text-[10.5px] font-medium text-white/55 sm:text-[11.5px]">
                    {fr ? "Actif · 3 en écoute" : "Live · 3 listening"}
                  </span>
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 sm:text-[10.5px]">
                  {fr ? "En temps réel" : "Real time"}
                </span>
              </div>
            </div>
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal>
          <div className="mt-14 flex flex-col items-center sm:mt-16">
            <LandingCtaLink
              loggedInHref="https://vvault.app/billing"
              loggedOutHref="https://vvault.app/signup"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-[14px] font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 sm:text-[15px]"
            >
              {primary}
              <svg
                viewBox="0 0 20 20"
                className="h-4 w-4 fill-none stroke-current stroke-[1.8]"
              >
                <path d="M4 10h11M11 6l4 4-4 4" />
              </svg>
            </LandingCtaLink>
            <p className="mt-3 text-[12px] text-white/35 sm:text-[13px]">
              {trust}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
