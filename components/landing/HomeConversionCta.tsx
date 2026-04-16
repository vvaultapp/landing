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
/*  Activity feed mock — single product moment, single accent color    */
/* ------------------------------------------------------------------ */

type Event = {
  who: string;
  initials: string;
  action: string;
  target: string;
  ago: string;
  iconPath: string;
};

function getEvents(fr: boolean): Event[] {
  return [
    {
      who: "Sonya Wolf",
      initials: "SW",
      action: fr ? "a écouté" : "played",
      target: "Dark Melodies Vol.3",
      ago: fr ? "il y a 2 min" : "2m ago",
      iconPath: "M8 5v14l11-7-11-7z",
    },
    {
      who: "Kenny Osinski",
      initials: "KO",
      action: fr ? "a téléchargé" : "downloaded",
      target: "Trap Soul Pack",
      ago: fr ? "il y a 5 min" : "5m ago",
      iconPath: "M12 4v12m0 0l-4-4m4 4l4-4M5 20h14",
    },
    {
      who: "Elizabeth Reynolds",
      initials: "ER",
      action: fr ? "a ouvert" : "opened",
      target: fr ? "Mélodie pour Drake" : "Melody for Drake",
      ago: fr ? "il y a 12 min" : "12m ago",
      iconPath: "M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z M12 9a3 3 0 100 6 3 3 0 000-6z",
    },
    {
      who: "Alexey Zinovyev",
      initials: "AZ",
      action: fr ? "a acheté" : "bought",
      target: fr ? "Licence WAV — €49" : "WAV License — €49",
      ago: fr ? "il y a 24 min" : "24m ago",
      iconPath: "M3 7h18l-2 12H5L3 7z M9 7V5a3 3 0 016 0v2",
    },
    {
      who: "Billy Christiansen",
      initials: "BC",
      action: fr ? "a sauvegardé" : "saved",
      target: fr ? "Sombre Beat Pack" : "Late Night Pack",
      ago: fr ? "il y a 37 min" : "37m ago",
      iconPath: "M5 3v18l7-5 7 5V3z",
    },
  ];
}

function ActivityCard({ event, glow }: { event: Event; glow: boolean }) {
  return (
    <div
      className="relative flex items-center gap-3 rounded-xl px-3.5 py-3 sm:px-4 sm:py-3.5"
      style={{
        background: glow
          ? "linear-gradient(180deg, rgba(28,24,38,0.95) 0%, rgba(14,12,20,0.96) 100%)"
          : "linear-gradient(180deg, rgba(16,16,20,0.85) 0%, rgba(8,8,11,0.92) 100%)",
        border: glow
          ? "1px solid rgba(235,215,255,0.12)"
          : "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums text-white/85"
        style={{
          background:
            "linear-gradient(160deg, rgba(60,55,75,0.9) 0%, rgba(20,18,28,1) 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {event.initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] text-white/85 sm:text-[13.5px]">
          <span className="font-semibold text-white/95">{event.who}</span>{" "}
          <span className="text-white/50">{event.action}</span>{" "}
          <span className="font-medium text-white/85">{event.target}</span>
        </p>
        <p className="mt-0.5 text-[11px] text-white/30">{event.ago}</p>
      </div>
      <div
        className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white/55 sm:flex"
        style={{
          background: "rgba(235,215,255,0.06)",
          border: "1px solid rgba(235,215,255,0.10)",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5 fill-none stroke-current stroke-[1.7]"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={event.iconPath} />
        </svg>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section                                                            */
/* ------------------------------------------------------------------ */

export function HomeConversionCta({ locale = "en" }: HomeConversionCtaProps) {
  const fr = locale === "fr";
  const events = getEvents(fr);

  const headline = fr
    ? "Regarde ta musique vivre."
    : "Watch your music move.";
  const subhead = fr
    ? "Chaque écoute, ouverture, téléchargement et vente — en temps réel, au même endroit."
    : "Every play, open, download and sale — live, in one place.";

  const primary = fr ? "Commencer gratuitement" : "Start free";
  const trust = fr
    ? "Plan gratuit pour toujours · Aucune carte requise"
    : "Free forever plan · No credit card required";

  return (
    <section
      id="get-started"
      className="relative overflow-hidden pt-36 sm:pt-52"
    >
      {/* LaserFlow backdrop — anchored behind the centerpiece card */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[14%] -z-0 h-[1100px] sm:h-[1200px]"
      >
        <LaserFlow
          color="#ebd7ff"
          horizontalBeamOffset={0.0}
          verticalBeamOffset={0.05}
          horizontalSizing={0.55}
          verticalSizing={1.7}
          wispDensity={0.9}
          wispSpeed={14}
          wispIntensity={4.2}
          flowSpeed={0.4}
          flowStrength={0.22}
          fogIntensity={0.4}
          fogScale={0.28}
          fogFallSpeed={0.5}
          decay={1.25}
          falloffStart={1.05}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
        {/* Eyebrow + headline — same emblem-less centered pattern as CertificateTeaser */}
        <Reveal>
          <div className="text-center">
            <h2 className="mx-auto max-w-[820px] text-[1.85rem] font-medium leading-[1.06] tracking-tight text-white sm:text-[2.6rem] lg:text-[3.2rem]">
              {headline}{" "}
              <span className="text-white/40">{subhead}</span>
            </h2>
          </div>
        </Reveal>

        {/* Centerpiece — activity feed card, identical card pattern to CertificateTeaser */}
        <Reveal>
          <div className="mt-12 sm:mt-16">
            <div
              className="relative mx-auto max-w-[640px] overflow-hidden rounded-2xl sm:rounded-3xl"
              style={{
                background:
                  "linear-gradient(180deg, rgba(8,8,10,0.98) 0%, rgba(4,4,5,1) 100%)",
              }}
            >
              {/* Border overlay — fades out toward the bottom */}
              <div
                className="pointer-events-none absolute inset-0 rounded-[inherit]"
                style={{
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderBottom: "none",
                  maskImage:
                    "linear-gradient(to bottom, black 0%, black 35%, transparent 100%)",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, black 0%, black 35%, transparent 100%)",
                }}
              />
              {/* Top edge highlight line */}
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(235,215,255,0.10) 15%, rgba(235,215,255,0.30) 50%, rgba(235,215,255,0.10) 85%, transparent 100%)",
                }}
              />
              {/* Top center radial — picks up the laser color */}
              <div
                className="pointer-events-none absolute left-1/2 top-0 h-[160px] w-[520px] -translate-x-1/2 -translate-y-1/2"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(235,215,255,0.10) 0%, transparent 70%)",
                }}
              />

              <div className="relative px-5 py-7 sm:px-7 sm:py-8">
                {/* Card header — like the Huly inbox */}
                <div className="mb-5 flex items-center justify-between sm:mb-6">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="inline-block h-2 w-2 rounded-full bg-emerald-400"
                      style={{ boxShadow: "0 0 8px rgba(74,222,128,0.7)" }}
                    />
                    <h3 className="text-[14px] font-semibold text-white/90 sm:text-[15px]">
                      {fr ? "Activité en direct" : "Live activity"}
                    </h3>
                  </div>
                  <span className="text-[11px] font-medium text-white/35">
                    {fr ? "Aujourd'hui" : "Today"}
                  </span>
                </div>

                {/* Events */}
                <div className="space-y-2">
                  {events.map((e, i) => (
                    <ActivityCard key={e.who} event={e} glow={i === 0} />
                  ))}
                </div>
              </div>

              {/* Bottom soft fade */}
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[35%]"
                style={{
                  background:
                    "linear-gradient(to top, rgba(4,4,5,1) 0%, transparent 100%)",
                }}
              />
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
