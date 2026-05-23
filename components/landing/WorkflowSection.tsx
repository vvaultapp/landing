"use client";

import { useEffect, useRef } from "react";
import type { LandingNewContent } from "@/components/landing/contentNew";
import { LandingCtaLink } from "@/components/landing/LandingCtaLink";
import { Reveal } from "@/components/landing/Reveal";
import {
  StreamlineIcon,
  type StreamlineIconName,
} from "@/components/landing/StreamlineIcon";

/* Single Vercel-blue accent for every step. The connector and the
   step badges all use the same #006ffe so the timeline reads as
   one continuous blue thread instead of a rainbow. */
const VERCEL_BLUE = "#006ffe";
const STEP_ACCENTS = [VERCEL_BLUE, VERCEL_BLUE, VERCEL_BLUE, VERCEL_BLUE];

/* 4-step workflow icons. Mapped 1→Upload, 2→Send (plane), 3→Track
   (presentation graph), 4→Convert (users group). */
const STEP_ICON: Record<number, StreamlineIconName> = {
  1: "upload",
  2: "plane",
  3: "presentation-graph",
  4: "users-group",
};

/* StepIcon defers its colour to CSS via `currentColor` so the
   parent emblem can swap between "reached" (accent) and idle
   (grey) via a data-attribute selector without re-rendering. */
function StepIcon({ idx }: { idx: number }) {
  const which = STEP_ICON[idx];
  if (!which) return null;
  return (
    <StreamlineIcon
      name={which}
      color="currentColor"
      strokeWidth={14}
      className="h-7 w-7 sm:h-8 sm:w-8"
    />
  );
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
  /* Progress is intentionally NOT React state. Re-rendering every
     scroll frame triggers a full diff/commit pass and causes the
     bar to lag behind the actual scroll position. Instead we write
     the value directly to a CSS variable on the section element and
     toggle a `data-reached` attribute on each step. The DOM diff
     stays at exactly zero — every visual change is pure CSS. */
  const stepCount = c.steps.length;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const apply = (progress: number) => {
      const el = sectionRef.current;
      if (!el) return;
      el.style.setProperty("--workflow-progress", String(progress));
      const reachedNodes = el.querySelectorAll<HTMLElement>("[data-step-index]");
      reachedNodes.forEach((node) => {
        const idx = Number(node.dataset.stepIndex);
        const fraction = (idx + 0.5) / stepCount;
        const reached = progress >= fraction || progress >= 0.97;
        node.dataset.reached = reached ? "1" : "0";
      });
    };

    const compute = () => {
      const el = sectionRef.current;
      if (!el) return;
      const wideMq = window.matchMedia("(min-width: 1024px)");
      const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;

      if (motionMq.matches) {
        apply(1);
        return;
      }

      if (wideMq.matches) {
        /* Desktop: section is sticky-pinned for 5x viewport. Progress
           ramps as the user scrolls through that travel distance. */
        const travel = Math.max(1, rect.height - vh);
        const scrolled = Math.min(travel, Math.max(0, -rect.top));
        apply(scrolled / travel);
        return;
      }

      /* Mobile: section flows naturally. Progress is driven by how
         far the section has moved through the viewport. 0 when the
         section's top is near the bottom of the viewport, 1 once
         the section's bottom is roughly at the top quarter — this
         gives the vertical bar enough room to fill out before the
         user reaches the CTA. */
      const startTop = vh * 0.7;
      const endTop = vh * 0.25 - rect.height;
      const range = startTop - endTop;
      const scrolled = startTop - rect.top;
      apply(Math.max(0, Math.min(1, scrolled / range)));
    };

    /* Scroll handler. We call compute() synchronously — the work is
       a handful of reads + a few CSS-var writes and runs in <0.1ms,
       so there's no measurable benefit to rAF throttling for this
       shape of update, and avoiding rAF dodges a stale-closure bug
       we hit when React Strict Mode mounted → cleaned-up → re-mounted
       the effect and canceled the queued frame before it fired. */
    const onScroll = () => {
      compute();
    };

    // Immediate compute so the bar lands at the right value on mount.
    compute();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [stepCount]);

  return (
    <section ref={sectionRef} className="workflow-shell">
      <div className="workflow-pin">
        <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
          <Reveal>
            <div className="text-center">
              <h3 className="mx-auto max-w-[760px] text-[1.55rem] font-medium leading-tight tracking-tight text-white sm:text-3xl lg:text-[2.2rem]">
                {c.titleLine1}
                <br />
                <span className="text-white/40">{c.titleLine2}</span>
              </h3>
              <p className="mx-auto mt-4 max-w-[560px] text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
                {c.subtitle}
              </p>
            </div>
          </Reveal>

          {/* Timeline */}
          <div className="relative mt-12 sm:mt-16">
            {/* Desktop horizontal connector — drives off CSS var
                `--workflow-progress` (0 → 1), set imperatively by
                the scroll handler so React never re-renders this
                tree. transform: scaleX is GPU-composited, no layout
                reflow, and tracks the scroll position 1-for-1. */}
            <div className="pointer-events-none absolute left-[10%] right-[10%] top-7 hidden h-[2px] lg:block">
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
              <div
                className="workflow-bar absolute inset-y-0 left-0 right-0 origin-left rounded-full"
                style={{
                  background: "#006ffe",
                  boxShadow:
                    "0 0 14px rgba(0,111,254,0.45), 0 0 36px rgba(0,111,254,0.2)",
                }}
              />
            </div>

            {/* Mobile vertical connector — same CSS-var-driven
                progress, but as scaleY behind the centred column of
                step emblems. Hidden on lg+ where the horizontal
                connector takes over. */}
            <div
              className="pointer-events-none absolute left-1/2 top-7 w-[2px] -translate-x-1/2 lg:hidden"
              style={{ height: "calc(100% - 8rem)" }}
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
              <div
                className="workflow-bar-vertical absolute inset-x-0 top-0 bottom-0 origin-top rounded-full"
                style={{
                  background: "#006ffe",
                  boxShadow:
                    "0 0 12px rgba(0,111,254,0.45), 0 0 28px rgba(0,111,254,0.18)",
                }}
              />
            </div>

            <div className="grid gap-10 sm:gap-12 lg:grid-cols-4 lg:gap-6">
              {c.steps.map((step, i) => {
                const accent = STEP_ACCENTS[i % STEP_ACCENTS.length];

                return (
                  <div
                    key={step.idx}
                    data-step-index={i}
                    data-reached="0"
                    className="workflow-step flex flex-col items-center text-center"
                    style={
                      {
                        "--accent": accent,
                      } as React.CSSProperties
                    }
                  >
                    <div className="relative">
                      <div className="workflow-step-emblem flex h-14 w-14 items-center justify-center rounded-2xl">
                        <StepIcon idx={step.idx} />
                      </div>
                      {/* Step number badge — solid in both states, no
                          outline, so it never reads as a faded disc
                          with a double edge. */}
                      <span className="workflow-step-num absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold tabular-nums">
                        {step.idx}
                      </span>
                    </div>

                    <h3 className="workflow-step-title mt-5 text-[16px] font-semibold text-white sm:text-[17px]">
                      {step.name}
                    </h3>
                    <p className="workflow-step-copy mt-2 max-w-[280px] text-[13px] leading-relaxed text-white/55 sm:text-[13.5px]">
                      {step.copy}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 flex justify-center sm:mt-16">
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
