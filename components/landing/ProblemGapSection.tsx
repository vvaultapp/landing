"use client";

import type {
  LandingNewContent,
  LandingNewProblemPair,
} from "@/components/landing/contentNew";
import { Reveal } from "@/components/landing/Reveal";

function PainIcon({ name }: { name: string }) {
  const common = {
    viewBox: "0 0 24 24" as const,
    fill: "none" as const,
    stroke: "rgba(255,255,255,0.5)",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-6 w-6 sm:h-7 sm:w-7",
  };
  if (name === "mail")
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" />
        <path d="M16.5 4.5l3 3M16.5 7.5l3-3" stroke="rgba(248,113,113,0.7)" strokeWidth={1.8} />
      </svg>
    );
  if (name === "folder")
    return (
      <svg {...common}>
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
        <path d="M9 13l3 3M12 13l-3 3" stroke="rgba(248,113,113,0.7)" strokeWidth={1.6} />
      </svg>
    );
  if (name === "wallet")
    return (
      <svg {...common}>
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M3 10h18" />
        <path d="M14 14.5l3.5-3.5M14 11l3.5 3.5" stroke="rgba(248,113,113,0.7)" strokeWidth={1.6} />
      </svg>
    );
  return null;
}

function ProblemCard({
  pair,
  index,
}: {
  pair: LandingNewProblemPair;
  index: number;
}) {
  return (
    <div
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5 sm:p-7"
      style={{
        background:
          "linear-gradient(180deg, rgba(14,10,11,0.96) 0%, rgba(6,4,5,1) 100%)",
        border: "1px solid rgba(248,113,113,0.10)",
        boxShadow:
          "0 14px 32px -12px rgba(0,0,0,0.6), inset 0 1px 0 0 rgba(255,255,255,0.03)",
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

      {/* Index + icon row */}
      <div className="relative flex items-center justify-between">
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
        <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.18em] text-white/30">
          0{index + 1}
        </span>
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
    <section className="relative pt-24 pb-12 sm:pt-32 sm:pb-16">
      <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <Reveal>
          <div className="text-center">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em]"
              style={{
                background: "rgba(248,113,113,0.06)",
                border: "1px solid rgba(248,113,113,0.18)",
                color: "rgba(248,113,113,0.85)",
              }}
            >
              <span
                className="h-1 w-1 rounded-full"
                style={{ background: "rgba(248,113,113,0.85)" }}
              />
              {c.eyebrow}
            </span>
            <h2 className="font-display mx-auto mt-5 max-w-[820px] text-[1.75rem] font-medium leading-[1.15] tracking-tight text-white sm:text-[2.6rem] lg:text-[2.95rem]">
              {c.title}
            </h2>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:mt-16 sm:gap-6 lg:grid-cols-3">
          {c.pairs.map((pair, i) => (
            <Reveal key={pair.beforeIcon} delayMs={i * 110}>
              <ProblemCard pair={pair} index={i} />
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
