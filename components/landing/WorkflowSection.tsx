"use client";

import { useEffect, useRef, useState } from "react";
import type { LandingNewContent } from "@/components/landing/contentNew";
import { LandingCtaLink } from "@/components/landing/LandingCtaLink";
import { Reveal } from "@/components/landing/Reveal";

const STEP_ACCENTS = ["#60a5fa", "#a78bfa", "#fbbf24", "#34d399"];

function StepIcon({ idx, accent }: { idx: number; accent: string }) {
  const common = {
    viewBox: "0 0 24 24" as const,
    fill: "none" as const,
    stroke: accent,
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-6 w-6 sm:h-7 sm:w-7",
  };
  if (idx === 1)
    return (
      <svg {...common}>
        <path d="M12 4v12" />
        <path d="M7 9l5-5 5 5" />
        <path d="M4 20h16" />
      </svg>
    );
  if (idx === 2)
    return (
      <svg {...common}>
        <path d="M22 2L11 13" />
        <path d="M22 2l-7 20-4-9-9-4 20-7z" />
      </svg>
    );
  if (idx === 3)
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  if (idx === 4)
    return (
      <svg {...common}>
        <path d="M4 17l5-5 4 4 7-9" />
        <path d="M14 7h6v6" />
      </svg>
    );
  return null;
}

type WorkflowSectionProps = {
  content: LandingNewContent;
};

/* Sticky scroll-driven reveal.
   Sticky behaviour is handled in pure CSS (see `.workflow-shell` +
   `.workflow-pin` in globals.css) so server and client render the
   same markup. JS only computes the scroll-progress fraction and
   pushes it into a piece of state that drives the connector width
   + each step's "reached" styling. On mobile/reduced-motion, the
   section flows normally and progress is forced to 1 (everything
   visible from the start). */
export function WorkflowSection({ content }: WorkflowSectionProps) {
  const c = content.workflow;
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let raf: number | null = null;

    const compute = () => {
      const el = sectionRef.current;
      if (!el) return;
      const wideMq = window.matchMedia("(min-width: 1024px)");
      const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
      const stickyActive = wideMq.matches && !motionMq.matches;
      if (!stickyActive) {
        /* Mobile / reduced-motion: timeline is statically laid out
           and not driven by scroll. Show everything as "reached". */
        setProgress(1);
        return;
      }
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      /* `travel` is the number of pixels the user can scroll while
         the sticky child stays pinned (section height - viewport). */
      const travel = Math.max(1, rect.height - vh);
      const scrolled = Math.min(travel, Math.max(0, -rect.top));
      setProgress(scrolled / travel);
    };

    const onScroll = () => {
      if (raf !== null) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        compute();
      });
    };

    /* Defer the initial compute() to the next frame so it runs as
       a rAF callback (keeps setProgress out of the synchronous
       effect body). */
    raf = requestAnimationFrame(() => {
      raf = null;
      compute();
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={sectionRef} className="workflow-shell">
      <div className="workflow-pin">
        <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
          <Reveal>
            <div className="text-center">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/45"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <span className="h-1 w-1 rounded-full bg-white/50" />
                {c.eyebrow}
              </span>
              <h2 className="font-display mx-auto mt-5 max-w-[760px] text-[1.75rem] font-medium leading-[1.15] tracking-tight text-white sm:text-[2.6rem] lg:text-[2.95rem]">
                {c.title}
              </h2>
              <p className="mx-auto mt-4 max-w-[560px] text-[14px] leading-relaxed text-white/45 sm:text-[15px]">
                {c.subtitle}
              </p>
            </div>
          </Reveal>

          {/* Timeline */}
          <div className="relative mt-12 sm:mt-16">
            {/* Desktop horizontal connector */}
            <div className="pointer-events-none absolute left-[10%] right-[10%] top-7 hidden h-[2px] lg:block">
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-200 ease-out"
                style={{
                  width: `${progress * 100}%`,
                  background:
                    "linear-gradient(90deg, #60a5fa, #a78bfa, #fbbf24, #34d399)",
                  boxShadow: "0 0 16px rgba(167,139,250,0.45)",
                }}
              />
            </div>

            <div className="grid gap-10 sm:gap-12 lg:grid-cols-4 lg:gap-6">
              {c.steps.map((step, i) => {
                const accent = STEP_ACCENTS[i % STEP_ACCENTS.length];
                const stepFraction = (i + 0.5) / c.steps.length;
                const reached = progress >= stepFraction || progress >= 0.97;

                return (
                  <div
                    key={step.idx}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="relative">
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-500"
                        style={{
                          background:
                            "linear-gradient(160deg, rgba(20,20,24,0.95) 0%, rgba(6,6,8,1) 100%)",
                          border: `1px solid ${reached ? accent + "55" : "rgba(255,255,255,0.08)"}`,
                          boxShadow: reached
                            ? `0 0 26px -2px ${accent}88, inset 0 1px 0 0 rgba(255,255,255,0.08)`
                            : "inset 0 1px 0 0 rgba(255,255,255,0.04), 0 8px 20px -8px rgba(0,0,0,0.7)",
                          transform: reached ? "scale(1.04)" : "scale(1)",
                        }}
                      >
                        <StepIcon
                          idx={step.idx}
                          accent={reached ? accent : "rgba(255,255,255,0.45)"}
                        />
                      </div>
                      <span
                        className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold tabular-nums transition-colors"
                        style={{
                          background: reached
                            ? accent
                            : "rgba(255,255,255,0.08)",
                          color: reached ? "#0a0a0a" : "rgba(255,255,255,0.55)",
                          border: "1px solid rgba(0,0,0,0.35)",
                        }}
                      >
                        {step.idx}
                      </span>
                    </div>

                    <h3
                      className="mt-5 text-[16px] font-semibold text-white transition-opacity duration-500 sm:text-[17px]"
                      style={{ opacity: reached ? 1 : 0.4 }}
                    >
                      {step.name}
                    </h3>
                    <p
                      className="mt-2 max-w-[280px] text-[13px] leading-relaxed text-white/45 transition-opacity duration-500 sm:text-[13.5px]"
                      style={{ opacity: reached ? 1 : 0.35 }}
                    >
                      {step.copy}
                    </p>
                  </div>
                );
              })}
            </div>

            <div
              className="mt-12 flex justify-center transition-opacity duration-500 sm:mt-16"
              style={{ opacity: progress >= 0.85 ? 1 : 0.35 }}
            >
              <LandingCtaLink
                loggedInHref="https://vvault.app/auth/google"
                loggedOutHref="https://vvault.app/auth/google"
                track={{
                  buttonId: "workflow.start_the_loop",
                  surface: "landing.new.workflow",
                }}
                className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-[14px] font-semibold text-[#0e0e0e] transition-[filter,box-shadow] duration-200 hover:brightness-[0.96] hover:shadow-[0_6px_28px_0_rgba(255,255,255,0.14)]"
                style={{
                  background:
                    "linear-gradient(to bottom, #ffffff 0%, #d4d4d4 100%)",
                  boxShadow:
                    "0 4px 24px 0 rgba(255,255,255,0.10), 0 1px 4px 0 rgba(255,255,255,0.06)",
                }}
              >
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
      </div>
    </section>
  );
}
