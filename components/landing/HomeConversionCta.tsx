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

type Track = { title: string; meta: string; length: string };

function getTracks(fr: boolean): Track[] {
  return [
    { title: "midnight_v3.wav", meta: "140 BPM · Am", length: "3:02" },
    { title: "shadows_final.wav", meta: "138 BPM · F#m", length: "2:48" },
    { title: "glass_master.wav", meta: "142 BPM · Dm", length: "3:17" },
    { title: fr ? "ombres_v2.wav" : "fog_draft.wav", meta: "136 BPM · Gm", length: "2:51" },
  ];
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

  const primary = fr ? "Commencer gratuitement" : "Start free";
  const trust = fr
    ? "Plan gratuit pour toujours · Aucune carte requise"
    : "Free forever plan · No credit card required";

  return (
    <section
      id="get-started"
      className="relative overflow-hidden pt-32 sm:pt-44"
    >
      {/* LaserFlow beam — extends down past the card's top edge so it
          visually spills over the frame (Huly-style).
          Top is masked to fade in gradually from transparent → full. */}
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
        <Reveal>
          <div className="text-center">
            <h2 className="mx-auto max-w-[720px] text-[2rem] font-medium leading-[1.05] tracking-tight text-white sm:text-[2.8rem] lg:text-[3.4rem]">
              {headline}
            </h2>
          </div>
        </Reveal>

        {/* Card — mirrors the real share-page layout from the vvault app:
            #050607 background, card tone, square cover, compact track list,
            DOWNLOAD PACK uppercase action. Sits directly under the beam so
            the laser appears to land on (and spill over) its top edge. */}
        <Reveal>
          <div className="relative mt-[240px] sm:mt-[310px]">
            <div
              className="relative mx-auto max-w-[820px] overflow-hidden rounded-[28px] sm:rounded-[32px]"
              style={{
                background: "#050607",
                boxShadow:
                  "0 40px 90px -30px rgba(0,0,0,0.9), 0 0 0 1px rgba(235,215,255,0.04), 0 -4px 50px -12px rgba(235,215,255,0.2)",
              }}
            >
              {/* Beam-impact highlight on the top edge of the card — this is
                  what creates the Huly "laser lands on the surface" effect. */}
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px]"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(235,215,255,0.25) 12%, rgba(255,255,255,0.92) 50%, rgba(235,215,255,0.25) 88%, transparent 100%)",
                  boxShadow: "0 0 22px rgba(235,215,255,0.55)",
                }}
              />
              <div
                className="pointer-events-none absolute left-1/2 top-0 h-[280px] w-[560px] -translate-x-1/2 -translate-y-1/3"
                style={{
                  background:
                    "radial-gradient(ellipse 55% 60% at 50% 50%, rgba(235,215,255,0.28) 0%, rgba(235,215,255,0.07) 40%, transparent 75%)",
                }}
              />
              {/* Subtle border, fades with depth */}
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

              <div className="relative flex flex-col gap-6 p-5 sm:flex-row sm:gap-7 sm:p-7">
                {/* Cover */}
                <div className="shrink-0">
                  <div
                    className="relative aspect-square w-full overflow-hidden rounded-[22px] sm:w-[240px] sm:rounded-[26px]"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <Image
                      src="/covers/pack-1.jpg"
                      alt="Dark Melodies Vol.3"
                      fill
                      sizes="(max-width: 640px) 100vw, 240px"
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Right column: title + meta + actions + track list */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-[22px] font-semibold tracking-tight text-white sm:text-[26px]">
                        Dark Melodies Vol.3
                      </h3>
                      <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-white/45">
                        <span className="text-white/60">Kodaa</span>
                        <span className="text-white/25">·</span>
                        <span>12 {fr ? "tracks" : "tracks"}</span>
                        <span className="text-white/25">·</span>
                        <span>36:24</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      aria-label="Play pack"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] text-white transition-colors hover:bg-white/[0.07]"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                  </div>

                  {/* Download pack button — uppercase, outlined, like the app */}
                  <button
                    type="button"
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-white transition-colors sm:w-auto"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3.5 w-3.5 fill-none stroke-current stroke-[1.7]"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 3v10m0 0 4-4m-4 4-4-4M5 18h14" />
                    </svg>
                    <span>{fr ? "Télécharger le pack" : "Download pack"}</span>
                  </button>

                  {/* Track list — compact rows matching the app's share page */}
                  <div className="mt-5 space-y-0.5">
                    {tracks.map((t, i) => (
                      <div
                        key={t.title}
                        className={`flex items-center gap-3 rounded-[18px] px-2.5 py-2 ${
                          i === 0 ? "bg-white/[0.04]" : ""
                        }`}
                      >
                        <div className="flex w-6 shrink-0 items-center justify-center text-[11px] tabular-nums text-white/30">
                          {i === 0 ? (
                            <span className="flex items-end gap-[2px]">
                              <span className="h-3 w-[2px] rounded-full bg-white/80" />
                              <span className="h-2 w-[2px] rounded-full bg-white/60" />
                              <span className="h-3 w-[2px] rounded-full bg-white/80" />
                            </span>
                          ) : (
                            i + 1
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] text-white/85">
                            {t.title}
                          </p>
                          <p className="mt-0.5 truncate text-[10.5px] text-white/40">
                            {t.meta}
                          </p>
                        </div>
                        <span className="tabular-nums text-[11px] text-white/35">
                          {t.length}
                        </span>
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4 shrink-0 fill-none stroke-white/40 stroke-[1.7]"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 3v10m0 0 4-4m-4 4-4-4M5 18h14" />
                        </svg>
                      </div>
                    ))}
                  </div>
                </div>
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
