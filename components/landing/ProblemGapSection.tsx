"use client";

import type {
  LandingNewContent,
  LandingNewProblemPair,
} from "@/components/landing/contentNew";
import { Reveal } from "@/components/landing/Reveal";
import {
  StreamlineIcon,
  type StreamlineIconName,
} from "@/components/landing/StreamlineIcon";

/* Each "before" pain has a streamline-solar icon. Tinted red so the
   emblem still reads as "this is the broken state" without
   reaching for a separate lucide icon. */
const PAIN_ICON: Record<string, StreamlineIconName> = {
  mail: "letter",
  folder: "music-library",
  wallet: "money-bag",
};

function PainIcon({ name }: { name: string }) {
  const which = PAIN_ICON[name];
  if (!which) return null;
  return (
    <StreamlineIcon
      name={which}
      color="rgba(248,113,113,0.85)"
      strokeWidth={14}
      className="h-7 w-7 sm:h-8 sm:w-8"
    />
  );
}

function ProblemCard({
  pair,
}: {
  pair: LandingNewProblemPair;
}) {
  return (
    <div
      className="group relative flex h-full cursor-default flex-col overflow-hidden rounded-2xl p-6 transition-transform duration-300 ease-out hover:-translate-y-0.5 sm:p-7"
      style={{
        background:
          "linear-gradient(180deg, rgba(14,10,11,0.96) 0%, rgba(6,4,5,1) 100%)",
        border: "1px solid rgba(248,113,113,0.10)",
        boxShadow:
          "0 14px 32px -12px rgba(0,0,0,0.6), inset 0 1px 0 0 rgba(255,255,255,0.03)",
        /* Promote to its own compositing layer so the hover translate
           is done by the GPU and the text inside is not re-rasterised
           at subpixel offsets each frame (the source of the flicker). */
        transform: "translateZ(0)",
        willChange: "transform",
        backfaceVisibility: "hidden",
      }}
    >
      {/* Subtle red wash at the bottom — signals "this is a pain" */}
      <div
        className="pointer-events-none absolute -bottom-16 left-1/2 h-32 w-[80%] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(248,113,113,0.16) 0%, transparent 72%)",
          filter: "blur(20px)",
        }}
      />
      {/* Top accent line, red-tinted */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(248,113,113,0.32) 50%, transparent 100%)",
        }}
      />

      {/* Icon row — no index number any more */}
      <div className="relative flex items-center">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl sm:h-12 sm:w-12"
          style={{
            background:
              "linear-gradient(160deg, rgba(30,18,20,0.7) 0%, rgba(8,4,5,1) 100%)",
            border: "1px solid rgba(248,113,113,0.18)",
            boxShadow:
              "inset 0 1px 0 0 rgba(255,255,255,0.05), 0 6px 16px -4px rgba(248,113,113,0.18)",
          }}
        >
          <PainIcon name={pair.beforeIcon} />
        </div>
      </div>

      <h3 className="relative mt-6 text-[18px] font-semibold leading-tight text-white sm:text-[19px]">
        {pair.beforeTitle}
      </h3>
      <p className="relative mt-2 text-[13.5px] leading-relaxed text-white/45 sm:text-[14px]">
        {pair.beforeDesc}
      </p>
    </div>
  );
}

type ProblemGapSectionProps = {
  content: LandingNewContent;
};

export function ProblemGapSection({ content }: ProblemGapSectionProps) {
  const c = content.problemGap;
  return (
    <section className="relative pt-48 pb-12 sm:pt-40 sm:pb-16 lg:pt-[18rem]">
      <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <Reveal>
          <div className="text-center">
            <h3 className="mx-auto max-w-[820px] text-[1.55rem] font-medium leading-tight tracking-tight text-white sm:text-3xl lg:text-[2.2rem]">
              {c.titleLine1}
              <br />
              <span className="text-white/40">{c.titleLine2}</span>
            </h3>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:mt-16 sm:gap-6 lg:grid-cols-3">
          {c.pairs.map((pair, i) => (
            <Reveal key={pair.beforeIcon} delayMs={i * 110}>
              <ProblemCard pair={pair} />
            </Reveal>
          ))}
        </div>

        <Reveal delayMs={420}>
          <p className="mx-auto mt-14 flex max-w-[640px] flex-col items-center gap-2 text-center text-[14.5px] leading-relaxed text-white/55 sm:mt-16 sm:text-[16px]">
            {c.closingLine}
            <span
              aria-hidden="true"
              className="mt-1 inline-flex h-6 w-6 animate-bounce items-center justify-center text-white/30"
            >
              <svg
                viewBox="0 0 20 20"
                className="h-4 w-4 fill-none stroke-current stroke-[1.6]"
              >
                <path d="M5 8l5 5 5-5" />
              </svg>
            </span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
