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
/*  Value prop: vvault replaces "send a file and hope" with "send a    */
/*  link and know." The beam lands on a small activity feed — concrete */
/*  proof that each link is live and surfacing who actually listens.   */
/*  Solid white type (no fading gradient) keeps the headline readable   */
/*  inside the glow. No uppercase anywhere.                             */
/* ------------------------------------------------------------------ */

type Activity = {
  initials: string;
  name: string;
  action: string;
  timeAgo: string;
  accent: "open" | "play" | "save";
};

export function HomeConversionCta({ locale = "en" }: HomeConversionCtaProps) {
  const fr = locale === "fr";

  const headline = fr ? "Sache qui écoute vraiment." : "See who actually listens.";
  const sub = fr
    ? "Un seul lien remplace WeTransfer. On te dit qui l'a ouvert, combien de temps ils ont écouté, et qui a sauvegardé le track — en temps réel."
    : "One link replaces WeTransfer. We tell you who opened it, how long they listened, and who saved the track — in real time.";

  const primary = fr ? "Commencer gratuitement" : "Start free";
  const trust = fr
    ? "Plan gratuit pour toujours · Aucune carte requise"
    : "Free forever plan · No credit card required";

  const linkHost = "vvault.app";
  const linkArtist = "kodaa";
  const linkSlug = fr ? "le-drop" : "the-drop";

  const activity: Activity[] = fr
    ? [
        {
          initials: "MC",
          name: "Maya Chen",
          action: "a écouté « Drift » pendant 2:14",
          timeAgo: "il y a 3 min",
          accent: "play",
        },
        {
          initials: "JR",
          name: "Jordan Reeves",
          action: "a sauvegardé le pack",
          timeAgo: "il y a 12 min",
          accent: "save",
        },
        {
          initials: "AK",
          name: "Alex Kim",
          action: "a ouvert le lien",
          timeAgo: "il y a 24 min",
          accent: "open",
        },
      ]
    : [
        {
          initials: "MC",
          name: "Maya Chen",
          action: "listened to \u201cDrift\u201d for 2:14",
          timeAgo: "3m ago",
          accent: "play",
        },
        {
          initials: "JR",
          name: "Jordan Reeves",
          action: "saved the pack",
          timeAgo: "12m ago",
          accent: "save",
        },
        {
          initials: "AK",
          name: "Alex Kim",
          action: "opened the link",
          timeAgo: "24m ago",
          accent: "open",
        },
      ];

  const accentColor = {
    open: "#a8c7ff",
    play: "#a8ff8a",
    save: "#ebd7ff",
  };

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
        {/* Headline — solid white with a subtle dark glow behind it so
            the type reads clearly even though the beam is at full brightness
            directly behind it. No fading gradient this time. */}
        <Reveal>
          <div className="pt-[180px] text-center sm:pt-[240px]">
            <h2
              className="mx-auto max-w-[880px] text-[2.4rem] font-medium leading-[1.02] tracking-[-0.02em] text-white sm:text-[4rem] lg:text-[4.8rem]"
              style={{
                textShadow:
                  "0 2px 30px rgba(0,0,0,0.55), 0 0 80px rgba(235,215,255,0.18)",
              }}
            >
              {headline}
            </h2>
            <p className="mx-auto mt-5 max-w-[560px] text-[14px] leading-relaxed text-white/75 sm:mt-6 sm:text-[15.5px]">
              {sub}
            </p>
          </div>
        </Reveal>

        {/* Activity card — the beam lands on its top edge and spills over.
            This isn't just a URL box anymore: it's proof of the product.
            One link at the top, three real activity rows underneath. */}
        <Reveal>
          <div className="relative mt-14 sm:mt-20">
            <div
              className="relative mx-auto max-w-[620px] overflow-hidden rounded-[22px] sm:rounded-[26px]"
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

              {/* Link row — compact, one line, sentence case */}
              <div className="relative flex items-center gap-3 border-b border-white/[0.05] px-5 py-4 sm:px-6 sm:py-5">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1 ring-white/10"
                  style={{ background: "rgba(235,215,255,0.06)" }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-[14px] w-[14px] fill-none stroke-[#ebd7ff] stroke-[1.7]"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10.5 13.5a4.5 4.5 0 0 0 6.36.5l3-3a4.5 4.5 0 0 0-6.36-6.36l-1.5 1.5M13.5 10.5a4.5 4.5 0 0 0-6.36-.5l-3 3a4.5 4.5 0 0 0 6.36 6.36l1.5-1.5" />
                  </svg>
                </div>
                <p className="min-w-0 flex-1 truncate font-mono text-[13.5px] leading-tight text-white sm:text-[15px]">
                  <span className="text-white/45">{linkHost}/</span>
                  <span className="text-white/70">{linkArtist}/</span>
                  <span className="text-[#ebd7ff]">{linkSlug}</span>
                </p>
                <span className="relative hidden items-center gap-1.5 text-[12px] font-medium text-white/60 sm:inline-flex">
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
                  {fr ? "En direct" : "Live"}
                </span>
              </div>

              {/* Activity feed — three rows showing concrete engagement.
                  This is the actual value the user gets: knowing who
                  opened, played, and saved. */}
              <ul className="relative flex flex-col">
                {activity.map((item, idx) => (
                  <li
                    key={item.name}
                    className={`relative flex items-center gap-3 px-5 py-3.5 sm:gap-4 sm:px-6 sm:py-4 ${
                      idx !== activity.length - 1
                        ? "border-b border-white/[0.04]"
                        : ""
                    }`}
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white/85 ring-1 ring-white/10 sm:h-10 sm:w-10 sm:text-[12px]"
                      style={{ background: "rgba(255,255,255,0.04)" }}
                    >
                      {item.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] leading-tight text-white sm:text-[14.5px]">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-white/55"> {item.action}</span>
                      </p>
                      <p className="mt-1 flex items-center gap-2 text-[11.5px] leading-none text-white/40 sm:text-[12px]">
                        <span
                          className="inline-block h-1 w-1 rounded-full"
                          style={{ background: accentColor[item.accent] }}
                        />
                        {item.timeAgo}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tiny caption under the card — sentence case, no caps */}
            <p className="mx-auto mt-5 max-w-[480px] text-center text-[12.5px] leading-relaxed text-white/45 sm:text-[13px]">
              {fr
                ? "Chaque lien remonte qui ouvre, combien de temps ils écoutent, et qui sauvegarde — automatiquement."
                : "Every link surfaces who opens, how long they listen, and who saves — automatically."}
            </p>
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
            <p className="mt-3 text-[12px] text-white/45 sm:text-[13px]">
              {trust}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
