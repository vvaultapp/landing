"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
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
/*  Share-link preview — shows what a recipient sees when they open    */
/*  a vvault share. Uses the real /covers/pack-1 art so it reads as    */
/*  product, not mockup.                                               */
/* ------------------------------------------------------------------ */

type Track = { title: string; bpm: string; length: string; key: string };

function getTracks(fr: boolean): Track[] {
  return [
    { title: fr ? "Minuit" : "Midnight", bpm: "140 BPM", length: "3:02", key: "Am" },
    { title: fr ? "Ombres" : "Shadows", bpm: "138 BPM", length: "2:48", key: "F#m" },
    { title: fr ? "Verre" : "Glass", bpm: "142 BPM", length: "3:17", key: "Dm" },
  ];
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current">
      <path d="M6 4l14 8-14 8V4z" />
    </svg>
  );
}

function WaveIcon({ active }: { active: boolean }) {
  return (
    <div className="flex items-end gap-[2px]">
      {[8, 14, 6, 12, 9, 5, 10].map((h, i) => (
        <span
          key={i}
          className={`w-[2px] rounded-full ${
            active ? "bg-[#ebd7ff]/70" : "bg-white/15"
          }`}
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section                                                            */
/* ------------------------------------------------------------------ */

export function HomeConversionCta({ locale = "en" }: HomeConversionCtaProps) {
  const fr = locale === "fr";
  const tracks = getTracks(fr);

  const headline = fr
    ? "Un lien qui ressemble à une sortie."
    : "A link that feels like a release.";
  const subhead = fr
    ? "Ton destinataire ouvre, voit la pochette, lit les tracks, télécharge ou achète — sans jamais quitter ton univers."
    : "Your recipient opens it, sees the cover, plays the tracks, downloads or buys — without ever leaving your world.";

  const primary = fr ? "Commencer gratuitement" : "Start free";
  const trust = fr
    ? "Plan gratuit pour toujours · Aucune carte requise"
    : "Free forever plan · No credit card required";

  return (
    <section
      id="get-started"
      className="relative overflow-hidden pt-36 sm:pt-52"
    >
      {/* LaserFlow beam — positioned so it visually terminates on the card's
          top edge, spilling over and lighting its frame (Huly-style). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[-4%] z-0 h-[880px] sm:h-[1020px]"
      >
        <LaserFlow
          color="#ebd7ff"
          horizontalBeamOffset={0.0}
          verticalBeamOffset={0.08}
          horizontalSizing={0.5}
          verticalSizing={1.75}
          wispDensity={0.9}
          wispSpeed={14}
          wispIntensity={4.5}
          flowSpeed={0.4}
          flowStrength={0.22}
          fogIntensity={0.42}
          fogScale={0.28}
          fogFallSpeed={0.5}
          decay={1.25}
          falloffStart={1.05}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <Reveal>
          <div className="text-center">
            <h2 className="mx-auto max-w-[820px] text-[1.85rem] font-medium leading-[1.06] tracking-tight text-white sm:text-[2.6rem] lg:text-[3.2rem]">
              {headline}{" "}
              <span className="text-white/40">{subhead}</span>
            </h2>
          </div>
        </Reveal>

        {/* Card sits directly under the beam — so the beam "lands" on it */}
        <Reveal>
          <div className="relative mt-[280px] sm:mt-[340px]">
            {/* Laser impact glow — behind the card, slightly above its top edge.
                Creates the Huly-style "beam hits the surface" bloom. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-0 h-[260px] w-[680px] -translate-x-1/2 -translate-y-[60%] sm:h-[320px] sm:w-[820px]"
              style={{
                background:
                  "radial-gradient(ellipse 50% 55% at 50% 40%, rgba(235,215,255,0.45) 0%, rgba(235,215,255,0.18) 35%, transparent 70%)",
                filter: "blur(12px)",
              }}
            />

            <div
              className="relative mx-auto max-w-[560px] overflow-hidden rounded-[24px] sm:rounded-[28px]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(14,12,18,0.98) 0%, rgba(4,4,5,1) 55%)",
                boxShadow:
                  "0 40px 80px -30px rgba(0,0,0,0.8), 0 0 0 1px rgba(235,215,255,0.04), 0 -2px 40px -10px rgba(235,215,255,0.25)",
              }}
            >
              {/* Border overlay — strong at top where beam impacts, fades down */}
              <div
                className="pointer-events-none absolute inset-0 rounded-[inherit]"
                style={{
                  border: "1px solid rgba(235,215,255,0.25)",
                  borderBottom: "none",
                  maskImage:
                    "linear-gradient(to bottom, black 0%, black 18%, rgba(0,0,0,0.4) 55%, transparent 100%)",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, black 0%, black 18%, rgba(0,0,0,0.4) 55%, transparent 100%)",
                }}
              />
              {/* Top edge laser line — bright where beam lands */}
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px]"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(235,215,255,0.3) 10%, rgba(255,255,255,0.95) 50%, rgba(235,215,255,0.3) 90%, transparent 100%)",
                  boxShadow: "0 0 22px rgba(235,215,255,0.55)",
                }}
              />
              {/* Top center radial bleed — beam spilling into card surface */}
              <div
                className="pointer-events-none absolute left-1/2 top-0 h-[240px] w-[520px] -translate-x-1/2 -translate-y-1/3"
                style={{
                  background:
                    "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(235,215,255,0.22) 0%, rgba(235,215,255,0.07) 40%, transparent 75%)",
                }}
              />

              <div className="relative p-3 sm:p-4">
                {/* Browser-chrome header — sells the "this is a real public page" fiction */}
                <div className="mb-3 flex items-center justify-between px-1 sm:mb-4">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-white/15" />
                    <span className="h-2 w-2 rounded-full bg-white/15" />
                    <span className="h-2 w-2 rounded-full bg-white/15" />
                  </div>
                  <div className="flex items-center gap-1.5 rounded-md bg-white/[0.04] px-2 py-[3px] text-[10px] font-medium tabular-nums text-white/45 sm:text-[10.5px]">
                    <svg
                      viewBox="0 0 20 20"
                      className="h-2.5 w-2.5 fill-none stroke-current stroke-[1.8]"
                    >
                      <path d="M8 10V7a2 2 0 114 0v3M6 10h8v6H6z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    vvault.app/kodaa/dark-melodies-vol-3
                  </div>
                  <span className="w-[32px]" />
                </div>

                {/* Hero cover */}
                <div
                  className="relative overflow-hidden rounded-[16px] sm:rounded-[18px]"
                  style={{ aspectRatio: "1.85 / 1" }}
                >
                  <Image
                    src="/covers/pack-1.jpg"
                    alt="Dark Melodies Vol.3"
                    fill
                    sizes="(max-width: 640px) 100vw, 560px"
                    className="object-cover"
                    priority={false}
                  />
                  {/* Cover bottom gradient so text on top reads */}
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-[65%]"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)",
                    }}
                  />
                  {/* Cover overlay content */}
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    <div className="flex items-end justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-white/55">
                          {fr ? "Pack de mélodies" : "Melody pack"}
                        </p>
                        <h3 className="mt-1 truncate text-[20px] font-semibold leading-tight text-white sm:text-[24px]">
                          Dark Melodies Vol.3
                        </h3>
                        <p className="mt-0.5 text-[12px] text-white/55">
                          Kodaa · 12 {fr ? "tracks" : "tracks"} · 140 BPM · Am
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label="Play"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#0e0e0e] shadow-[0_6px_20px_-4px_rgba(235,215,255,0.55)] sm:h-12 sm:w-12"
                        style={{
                          background:
                            "linear-gradient(180deg, #ffffff 0%, #e9dafa 100%)",
                        }}
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current sm:h-[18px] sm:w-[18px]">
                          <path d="M6 4l14 8-14 8V4z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Track list */}
                <div className="mt-3 flex flex-col divide-y divide-white/[0.05] overflow-hidden rounded-xl border border-white/[0.05] bg-white/[0.015]">
                  {tracks.map((t, i) => (
                    <div
                      key={t.title}
                      className="flex items-center justify-between gap-3 px-3 py-2.5 sm:px-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <button
                          type="button"
                          aria-label={`Play ${t.title}`}
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                            i === 0
                              ? "bg-[#ebd7ff] text-[#0e0e0e]"
                              : "bg-white/[0.06] text-white/55"
                          }`}
                        >
                          <PlayIcon />
                        </button>
                        <div className="min-w-0">
                          <p className="truncate text-[12.5px] font-medium text-white/85 sm:text-[13px]">
                            {t.title}
                          </p>
                          <p className="truncate text-[10.5px] text-white/35">
                            {t.bpm} · {t.key}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <WaveIcon active={i === 0} />
                        <span className="tabular-nums text-[11px] text-white/40 sm:text-[11.5px]">
                          {t.length}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-2.5">
                  <div className="flex items-center justify-center gap-2 rounded-xl bg-white/[0.05] px-3 py-2.5 text-[12.5px] font-semibold text-white/85 sm:text-[13px]">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3.5 w-3.5 fill-none stroke-current stroke-[1.8]"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 4v12m0 0l-4-4m4 4l4-4M5 20h14" />
                    </svg>
                    {fr ? "Télécharger WAV" : "Download WAV"}
                  </div>
                  <div
                    className="flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[12.5px] font-semibold text-[#0e0e0e] sm:text-[13px]"
                    style={{
                      background:
                        "linear-gradient(180deg, #ffffff 0%, #ece1fa 100%)",
                    }}
                  >
                    {fr ? "Acheter licence" : "Buy license"}
                    <svg
                      viewBox="0 0 20 20"
                      className="h-3.5 w-3.5 fill-none stroke-current stroke-[2]"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 10h11M11 6l4 4-4 4" />
                    </svg>
                  </div>
                </div>

                {/* Footer meta */}
                <div className="mt-3 flex items-center justify-between px-1 text-[10.5px] text-white/30 sm:text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400"
                      style={{ boxShadow: "0 0 6px rgba(74,222,128,0.65)" }}
                    />
                    {fr ? "Lien live" : "Live link"}
                  </span>
                  <span>
                    {fr ? "Certifié par vvault" : "Certified by vvault"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal>
          <div className="mt-12 flex flex-col items-center sm:mt-16">
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
