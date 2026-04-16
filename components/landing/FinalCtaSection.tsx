"use client";

import { useEffect, useRef, useState } from "react";
import type { LandingContent } from "@/components/landing/content";
import { LandingCtaLink } from "@/components/landing/LandingCtaLink";

type FinalCtaSectionProps = {
  content: LandingContent;
};

/* ----------------------------------------------------------------- */
/*  Final CTA — no backdrop effect. The title itself carries the     */
/*  moment: a slow, cinematic 3D reveal. Each clause of the headline */
/*  unfolds forward on the Y axis (rotateX -28deg → 0), rising and   */
/*  de-blurring as it lands. Staggered so the two halves feel like   */
/*  they're arriving in sequence rather than a single animation.     */
/*  Triggered via IntersectionObserver so it only plays when the     */
/*  section actually enters the viewport.                             */
/* ----------------------------------------------------------------- */

export function FinalCtaSection({ content }: FinalCtaSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [played, setPlayed] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    /* One-way latch: once the reveal fires we don't re-run it even
       if the user scrolls away and comes back. Cheap and avoids
       flashing the animation on every return visit. */
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

  /* Split the title on the first period/full-stop so each clause can
     animate independently. If there's no period we just get one
     clause and stagger is a no-op. */
  const rawTitle = content.finalCta.title;
  const clauses = (() => {
    const match = rawTitle.match(/^([^.!?]+[.!?])\s*(.+)$/);
    if (match) return [match[1], match[2]];
    return [rawTitle];
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
            className="mx-auto max-w-[480px] sm:max-w-[580px] lg:max-w-[660px]"
            style={{ perspective: "1100px", perspectiveOrigin: "50% 80%" }}
          >
            <h2
              className="font-display relative text-[2.6rem] font-semibold leading-[1.05] tracking-tight sm:text-[3.8rem] lg:text-[4.6rem]"
              style={{
                transformStyle: "preserve-3d",
              }}
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
          <div
            className={`mt-10 flex flex-wrap items-center justify-center gap-3 sm:mt-12 ${
              played ? "final-cta-actions" : ""
            }`}
            style={{
              opacity: played ? undefined : 0,
              animationDelay: `${clauses.length * 0.28 + 0.1}s`,
            }}
          >
            <LandingCtaLink
              loggedInHref={content.finalCta.primary.href}
              loggedOutHref={content.finalCta.primary.href}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
            >
              {content.finalCta.primary.label}
              <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
                <path d="M7 4l6 6-6 6" />
              </svg>
            </LandingCtaLink>
            <LandingCtaLink
              loggedInHref={content.finalCta.secondary.href}
              loggedOutHref={content.finalCta.secondary.href}
              className="inline-flex items-center gap-1.5 rounded-2xl px-5 py-2.5 text-sm font-medium text-white/58 transition-colors duration-200 hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
            >
              {content.finalCta.secondary.label}
              <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
                <path d="M7 4l6 6-6 6" />
              </svg>
            </LandingCtaLink>
          </div>
        </div>
      </div>
    </section>
  );
}
