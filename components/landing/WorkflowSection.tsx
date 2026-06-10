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

      /* Mobile: anchor the bar's fill to the actual step icons. We
         take the centres of the first and last steps and define:
           progress = 0 when the first icon's centre is at 80% vh
           progress = 1 when the last icon's centre is at 35% vh
         so the line tracks tightly to the column of icons rather
         than the whole section. Feels snappy and stays in sync. */
      const steps = el.querySelectorAll<HTMLElement>("[data-step-index]");
      if (steps.length < 2) {
        apply(1);
        return;
      }
      const firstRect = steps[0].getBoundingClientRect();
      const lastRect = steps[steps.length - 1].getBoundingClientRect();
      const firstCenter = firstRect.top + firstRect.height / 2;
      const lastCenter = lastRect.top + lastRect.height / 2;
      const startY = vh * 0.85;
      const endY = vh * 0.55;
      const iconSpan = lastCenter - firstCenter;
      const total = iconSpan + (startY - endY);
      const done = startY - firstCenter;
      apply(Math.max(0, Math.min(1, done / Math.max(1, total))));
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
        <div className="mx-auto w-full max-w-[clamp(1320px,92vw,2400px)] px-5 sm:px-8 lg:px-10">
          <Reveal>
            <div className="text-center">
              <h3 className="mx-auto max-w-[760px] text-[1.55rem] font-medium leading-tight tracking-tight text-[rgb(var(--fg))] sm:text-3xl lg:text-[2.2rem]">
                {c.titleLine1}
                <br />
                <span className="text-[rgb(var(--fg)_/_0.4)]">{c.titleLine2}</span>
              </h3>
              <p className="mx-auto mt-4 max-w-[560px] text-[14px] leading-relaxed text-[rgb(var(--fg)_/_0.4)] sm:text-[15px]">
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

            {/* Mobile vertical connector — sits on the LEFT, aligned
                with the column of step emblems (which are also
                left-aligned on mobile). Behind the text in z-order
                so the copy on the right always reads cleanly. */}
            <div
              className="pointer-events-none absolute left-7 top-7 z-0 w-[2px] -translate-x-1/2 lg:hidden"
              style={{ height: "calc(100% - 7rem)" }}
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

            <div className="grid gap-14 sm:gap-12 lg:grid-cols-4 lg:gap-6">
              {c.steps.map((step, i) => {
                const accent = STEP_ACCENTS[i % STEP_ACCENTS.length];

                return (
                  <div
                    key={step.idx}
                    data-step-index={i}
                    data-reached="0"
                    className="workflow-step relative z-10 flex flex-row items-start gap-4 text-left lg:flex-col lg:items-center lg:gap-0 lg:text-center"
                    style={
                      {
                        "--accent": accent,
                      } as React.CSSProperties
                    }
                  >
                    <div className="relative shrink-0">
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

                    <div className="min-w-0 flex-1 lg:contents">
                      <h3 className="workflow-step-title text-[16px] font-semibold text-[rgb(var(--fg))] lg:mt-5 sm:text-[17px]">
                        {step.name}
                      </h3>
                      <p className="workflow-step-copy mt-1 max-w-[280px] text-[13px] leading-relaxed text-[rgb(var(--fg)_/_0.55)] lg:mt-2 sm:text-[13.5px]">
                        {step.copy}
                      </p>
                    </div>
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
                className="inline-flex items-center gap-2 rounded-[8px] px-5 py-2.5 text-[14px] font-semibold text-[rgb(var(--inv-fg))] hover:brightness-[0.96] hover:shadow-[0_6px_28px_0_rgba(255,255,255,0.14)]"
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
