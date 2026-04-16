"use client";

import { useState, useRef, useCallback } from "react";
import type { LandingContent } from "@/components/landing/content";
import { Reveal } from "@/components/landing/Reveal";

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  const toggle = useCallback(() => {
    if (!open && bodyRef.current) {
      setHeight(bodyRef.current.scrollHeight);
    }
    setOpen((v) => !v);
  }, [open]);

  return (
    <div
      className="relative overflow-hidden rounded-2xl transition-all duration-300 hover:brightness-125"
      style={{
        background:
          "linear-gradient(180deg, rgba(12,12,15,0.98) 0%, rgba(4,4,5,1) 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          border: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "none",
          maskImage:
            "linear-gradient(to bottom, black 0%, black 30%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 30%, transparent 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 15%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.04) 85%, transparent 100%)",
        }}
      />
      <button
        type="button"
        onClick={toggle}
        className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left sm:px-8"
      >
        <span className="text-[14px] font-medium text-white/84 sm:text-[15px]">
          {question}
        </span>
        <span
          className="inline-flex h-5 w-5 shrink-0 items-center justify-center text-white/40 transition-transform duration-300 ease-out"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 20 20"
            className="h-4 w-4 fill-none stroke-current stroke-[1.8]"
          >
            <path d="M5 8l5 5 5-5" />
          </svg>
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{ height: open ? height : 0, opacity: open ? 1 : 0 }}
      >
        <div ref={bodyRef} className="px-6 pb-5 sm:px-8">
          <p className="text-[13px] leading-7 text-white/50 sm:text-[14px]">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

type FaqSectionProps = {
  content: LandingContent;
};

export function FaqSection({ content }: FaqSectionProps) {
  return (
    <section id="faq" className="pt-28 sm:pt-40">
      <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <Reveal>
          <h2 className="text-center font-display text-3xl text-white sm:text-5xl">
            {content.pricingUi.faqTitle}
          </h2>
        </Reveal>
        <div className="mx-auto mt-10 flex max-w-[820px] flex-col gap-3">
          {content.faq.map((item) => (
            <Reveal key={item.question}>
              <FaqItem question={item.question} answer={item.answer} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
