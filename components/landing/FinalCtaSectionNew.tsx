"use client";

import { useEffect, useRef, useState } from "react";
import type { LandingNewContent } from "@/components/landing/contentNew";
import { LandingCtaLink } from "@/components/landing/LandingCtaLink";

type FinalCtaSectionNewProps = {
  content: LandingNewContent;
};

/* Same 3D-reveal mechanism as the legacy FinalCtaSection: each
   clause of the title rotates forward (rotateX -28deg → 0deg) when
   the section enters the viewport. Difference: a single CTA
   instead of two, and a small sub-copy reassurance below. */
export function FinalCtaSectionNew({ content }: FinalCtaSectionNewProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [played, setPlayed] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setPlayed(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "-8% 0px -8% 0px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const c = content.finalCta;
  const clauses = (() => {
    const match = c.title.match(/^([^.!?]+[.!?])\s*(.+)$/);
    if (match) return [match[1], match[2]];
    return [c.title];
  })();

  return (
    <section
      ref={sectionRef}
      id="final-cta"
      className="relative overflow-hidden pt-44 pb-44 sm:pt-64 sm:pb-56"
    >
      <div className="relative z-10 mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <div className="text-center">
          <div
            className="mx-auto max-w-[520px] sm:max-w-[640px] lg:max-w-[740px]"
            style={{ perspective: "1100px", perspectiveOrigin: "50% 80%" }}
          >
            <h2
              className="font-display relative text-[2.4rem] font-semibold leading-[1.05] tracking-tight sm:text-[3.5rem] lg:text-[4.2rem]"
              style={{ transformStyle: "preserve-3d" }}
            >
              {clauses.map((clause, i) => (
                <span
                  key={i}
                  className={played ? "final-cta-clause" : undefined}
                  style={{
                    display: "block",
                    backgroundImage:
                      "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(220,220,232,0.82) 50%, rgba(180,180,200,0.62) 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    animationDelay: `${i * 0.28}s`,
                    opacity: played ? undefined : 0,
                    transformOrigin: "center bottom",
                    willChange: played ? "transform, opacity, filter" : "auto",
                  }}
                >
                  {clause}
                </span>
              ))}
            </h2>
          </div>

          <p
            className={`mx-auto mt-6 max-w-[480px] text-[14px] leading-relaxed text-white/45 sm:mt-8 sm:text-[15.5px] ${
              played ? "final-cta-actions" : ""
            }`}
            style={{
              opacity: played ? undefined : 0,
              animationDelay: `${clauses.length * 0.28 + 0.05}s`,
            }}
          >
            {c.sub}
          </p>

          <div
            className={`mt-8 flex flex-wrap items-center justify-center gap-3 sm:mt-10 ${
              played ? "final-cta-actions" : ""
            }`}
            style={{
              opacity: played ? undefined : 0,
              animationDelay: `${clauses.length * 0.28 + 0.15}s`,
            }}
          >
            <LandingCtaLink
              loggedInHref={c.ctaHref}
              loggedOutHref={c.ctaHref}
              track={{
                buttonId: "finalCtaNew.continue_google",
                surface: "landing.new.final_cta",
              }}
              className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-[15px] font-semibold text-[#0e0e0e] transition-[filter,box-shadow] duration-200 ease-out hover:brightness-[0.96] hover:shadow-[0_6px_28px_0_rgba(255,255,255,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45"
              style={{
                background: "linear-gradient(to bottom, #ffffff 0%, #d4d4d4 100%)",
                boxShadow:
                  "0 4px 24px 0 rgba(255,255,255,0.10), 0 1px 4px 0 rgba(255,255,255,0.06)",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-[18px] w-[18px]"
                fill="none"
                style={{ transform: "none", transition: "none" }}
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {c.ctaLabel}
              <svg
                viewBox="0 0 20 20"
                className="h-4 w-4 fill-none stroke-current stroke-[1.8]"
              >
                <path d="M7 4l6 6-6 6" />
              </svg>
            </LandingCtaLink>
          </div>
        </div>
      </div>
    </section>
  );
}
