"use client";

import { useEffect } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { LandingCtaLink } from "@/components/landing/LandingCtaLink";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { getLandingContent } from "@/components/landing/content";
import { trackLandingView } from "@/lib/analytics/client";

type PillIcon = "send" | "stats" | "fire" | "free" | "card" | "time" | "exit" | "lock" | "bolt" | "pack";
type Pill = { icon: PillIcon; label: string };

const marqueeRowOne: Pill[] = [
  { icon: "send", label: "Pro sending" },
  { icon: "stats", label: "Live stats" },
  { icon: "free", label: "100% free" },
  { icon: "card", label: "No card" },
  { icon: "pack", label: "Fast packs" },
  { icon: "fire", label: "More placements" },
];

const marqueeRowTwo: Pill[] = [
  { icon: "time", label: "30-sec setup" },
  { icon: "lock", label: "Secure links" },
  { icon: "bolt", label: "Faster follow-ups" },
  { icon: "exit", label: "Cancel anytime" },
  { icon: "stats", label: "Opens + plays" },
];

function PillIconGlyph({ icon }: { icon: PillIcon }) {
  if (icon === "send") {
    return <path d="M3 9.5L17 3l-4.8 14-2.4-4.3L3 9.5z" />;
  }
  if (icon === "stats") {
    return <path d="M3 15h14M6 12V8m4 4V5m4 7V9" />;
  }
  if (icon === "fire") {
    return <path d="M10 3c1.8 1.8 3.4 3.6 3.4 6.2A3.4 3.4 0 0 1 10 12.6 3.4 3.4 0 0 1 6.6 9.2c0-1.8.8-3.2 2.3-4.8.3 1.1.8 1.8 1.7 2.5" />;
  }
  if (icon === "free") {
    return <path d="M4 10h12M4 6h12M4 14h8" />;
  }
  if (icon === "card") {
    return <path d="M3 6h14v8H3zM3 9h14" />;
  }
  if (icon === "time") {
    return <path d="M10 5v5l3 2M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14z" />;
  }
  if (icon === "exit") {
    return <path d="M4 4h7v12H4zM11 10h6m-2-2 2 2-2 2" />;
  }
  if (icon === "lock") {
    return <path d="M5 9h10v7H5zM7 9V7a3 3 0 1 1 6 0v2" />;
  }
  if (icon === "bolt") {
    return <path d="M11 3 5 11h4l-1 6 7-9h-4l0-5z" />;
  }
  return <path d="M3 6h14M3 10h14M3 14h8" />;
}

export function EnSignupPage() {
  const content = getLandingContent("en");

  useEffect(() => {
    document.documentElement.lang = "en";
    void trackLandingView("get");
  }, []);

  return (
    <div className="landing-root min-h-screen bg-[#0e0e0e] font-sans text-[#f0f0f0]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:text-[#0e0e0e]"
      >
        {content.skipToContentLabel}
      </a>
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-[70px] w-full max-w-[1320px] items-center px-5 sm:px-8 lg:px-10">
          <Link
            href="/"
            className="rounded-xl text-[13px] font-semibold uppercase tracking-[0.18em] text-white"
            aria-label={content.ui.homepageAriaLabel}
          >
            vvault
          </Link>
        </div>
      </header>

      <main id="main-content" className="pb-12 pt-12 sm:pb-16 sm:pt-16">
        <section className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
          <div className="max-w-[980px]">
            <h1 className="font-display text-[2.3rem] leading-[1.02] tracking-tight text-white sm:text-[3.2rem] lg:text-[3.8rem]">
              Create your free account.
            </h1>
            <p className="mt-5 max-w-[70ch] text-base leading-7 text-white/82 sm:text-lg sm:leading-8">
              Send your beats, see who is really listening, and turn every send into a concrete opportunity.
            </p>

            <div className="mt-5 flex items-center gap-2">
              <span className="text-sm tracking-[0.08em] text-[#f2b84a]">★★★★★</span>
              <span className="text-xs font-medium text-white/86 sm:text-sm">Used by 600+ beatmakers daily</span>
            </div>

            <div className="mt-7 space-y-3">
              <div className="signup-marquee-row">
                <div className="signup-marquee-track" style={{ "--signup-marquee-duration": "72s" } as CSSProperties}>
                  {[...marqueeRowOne, ...marqueeRowOne].map((item, index) => (
                    <span
                      key={`row-1-${index}`}
                      className={`signup-pill ${index >= marqueeRowOne.length ? "signup-pill-dup" : ""}`}
                    >
                      <svg viewBox="0 0 20 20" className="signup-pill-icon" aria-hidden="true">
                        <PillIconGlyph icon={item.icon} />
                      </svg>
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="signup-marquee-row">
                <div className="signup-marquee-track" style={{ "--signup-marquee-duration": "58s" } as CSSProperties}>
                  {[...marqueeRowTwo, ...marqueeRowTwo].map((item, index) => (
                    <span
                      key={`row-2-${index}`}
                      className={`signup-pill ${index >= marqueeRowTwo.length ? "signup-pill-dup" : ""}`}
                    >
                      <svg viewBox="0 0 20 20" className="signup-pill-icon" aria-hidden="true">
                        <PillIconGlyph icon={item.icon} />
                      </svg>
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-7 flex flex-col items-center gap-3 text-center lg:hidden">
              <LandingCtaLink
                loggedInHref="https://vvault.app/signup"
                loggedOutHref="https://vvault.app/signup"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:text-base"
              >
                Create my vvault
              </LandingCtaLink>
              <LandingCtaLink
                loggedInHref="https://vvault.app/login"
                loggedOutHref="https://vvault.app/login"
                className="text-[11px] text-white/42 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white/72 sm:text-xs"
              >
                Already have an account? Log in
              </LandingCtaLink>
            </div>
          </div>

          <div className="mt-8 hidden lg:flex lg:flex-col lg:items-center lg:gap-3 lg:text-center">
            <LandingCtaLink
              loggedInHref="https://vvault.app/signup"
              loggedOutHref="https://vvault.app/signup"
              className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:text-base"
            >
              Create my vvault
            </LandingCtaLink>
            <LandingCtaLink
              loggedInHref="https://vvault.app/login"
              loggedOutHref="https://vvault.app/login"
              className="text-[11px] text-white/42 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white/72 sm:text-xs"
            >
              Already have an account? Log in
            </LandingCtaLink>
          </div>

          <div className="mt-12 -ml-[18px] w-[calc(100%+36px)] sm:-ml-[32px] sm:w-[calc(100%+64px)] lg:-ml-[72px] lg:w-[calc(100%+144px)]">
            <Image
              src="/app show-off.png"
              alt="vvault app preview"
              width={1800}
              height={950}
              priority
              className="block h-auto w-full max-w-none"
            />
          </div>
        </section>
      </main>

      <LandingFooter locale="en" content={content} showColumns={false} inlineLegalWithBrand />
    </div>
  );
}
