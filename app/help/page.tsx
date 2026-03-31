"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Reveal } from "@/components/landing/Reveal";
import { getLandingContent } from "@/components/landing/content";
import { useLocale } from "@/lib/useLocale";

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  const toggle = useCallback(() => {
    if (!open && bodyRef.current) setHeight(bodyRef.current.scrollHeight);
    setOpen((v) => !v);
  }, [open]);

  return (
    <div
      className="rounded-2xl"
      style={{
        border: "1px solid rgba(255,255,255,0.04)",
        background: "rgba(255,255,255,0.01)",
      }}
    >
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center justify-between px-6 py-5 text-left"
      >
        <span className="pr-4 text-[14px] font-medium text-white/70 sm:text-[15px]">
          {question}
        </span>
        <svg
          className="h-4 w-4 shrink-0 text-white/30 transition-transform duration-200"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M8 3v10M3 8h10" strokeLinecap="round" />
        </svg>
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? `${height}px` : "0px" }}
      >
        <div ref={bodyRef} className="px-6 pb-5">
          <p className="text-[13px] leading-relaxed text-white/35 sm:text-[14px]">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function HelpPage() {
  const [locale] = useLocale();
  const content = getLandingContent(locale);
  const fr = locale === "fr";
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = fr ? "vvault | Centre d'aide" : "vvault | Help Center";
  }, [fr]);

  const faqItems = content.faq;

  return (
    <div className="landing-root min-h-screen bg-black font-sans text-[#f0f0f0]">
      <LandingNav locale={locale} content={content} showPrimaryLinks={true} />
      <main className="relative z-10 mx-auto max-w-[720px] px-5 pb-32 pt-40 sm:px-8 sm:pt-48">
        {/* Header */}
        <Reveal>
          <h1
            className="text-center text-3xl font-medium leading-tight tracking-tight sm:text-[2.8rem]"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.45) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {fr ? "Centre d'aide" : "Help Center"}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-center text-[15px] leading-relaxed text-white/40 sm:text-[16px]">
            {fr ? "Trouve les réponses aux questions les plus courantes." : "Find answers to common questions."}
          </p>
        </Reveal>

        {/* FAQ */}
        <div className="mt-16 space-y-3">
          {faqItems.map((item, i) => (
            <Reveal key={i} delayMs={i * 40}>
              <FaqItem question={item.question} answer={item.answer} />
            </Reveal>
          ))}
        </div>

        {/* Still need help? */}
        <Reveal delayMs={200}>
          <div className="mt-20 text-center">
            <h2 className="text-xl font-medium text-white sm:text-2xl">{fr ? "Encore besoin d'aide ?" : "Still need help?"}</h2>
            <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
              {fr ? "Tu n'as pas trouvé ce que tu cherches ? Contacte-nous directement ou demande à la communauté." : "Can\u0027t find what you\u0027re looking for? Reach out directly or ask the community."}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://www.vvault.app/support"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-5 py-2.5 text-[13px] font-medium text-white/70 transition-colors hover:bg-white/[0.1] sm:text-[14px]"
              >
                Support
                <svg
                  className="h-3 w-3 text-white/30"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M3.5 1.5h7v7M10.5 1.5L1.5 10.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a
                href="https://discord.gg/QGGEZR5KhB"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-5 py-2.5 text-[13px] font-medium text-white/70 transition-colors hover:bg-white/[0.1] sm:text-[14px]"
              >
                Discord
                <svg
                  className="h-3 w-3 text-white/30"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M3.5 1.5h7v7M10.5 1.5L1.5 10.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>
        </Reveal>
      </main>
      <LandingFooter locale={locale} content={content} showColumns={false} inlineLegalWithBrand />
    </div>
  );
}
