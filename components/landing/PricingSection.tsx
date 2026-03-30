"use client";

import { useState, useRef, useCallback } from "react";
import type { LandingContent } from "@/components/landing/content";
import { LandingCtaLink } from "@/components/landing/LandingCtaLink";
import { Reveal } from "@/components/landing/Reveal";

type PricingSectionProps = {
  content: LandingContent;
};

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
        background: "linear-gradient(180deg, rgba(12,12,15,0.98) 0%, rgba(4,4,5,1) 100%)",
      }}
    >
      {/* Border overlay — no bottom, sides fade out */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          border: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "none",
          maskImage: "linear-gradient(to bottom, black 0%, black 30%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 30%, transparent 100%)",
        }}
      />
      {/* Top glow line */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 15%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.04) 85%, transparent 100%)",
        }}
      />
      <button
        type="button"
        onClick={toggle}
        className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left sm:px-8"
      >
        <span className="text-[14px] font-medium text-white/84 sm:text-[15px]">{question}</span>
        <span
          className="inline-flex h-5 w-5 shrink-0 items-center justify-center text-white/40 transition-transform duration-300 ease-out"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
            <path d="M5 8l5 5 5-5" />
          </svg>
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{ height: open ? height : 0, opacity: open ? 1 : 0 }}
      >
        <div ref={bodyRef} className="px-6 pb-5 sm:px-8">
          <p className="text-[13px] leading-7 text-white/50 sm:text-[14px]">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export function PricingSection({ content }: PricingSectionProps) {
  const [annual, setAnnual] = useState(true);
  const { human, ai } = content.pricingComparison;
  const plan = content.singlePlan;
  const proPrice = annual ? "€7.49" : "€8.99";
  const ultraPrice = annual ? "€20.75" : "€24.99";
  const plans = [
    {
      name: human.title,
      eyebrow: "",
      price: "€0",
      period: "",

      bullets: human.bullets,
      cta: content.pricingUi.startFree,
      href: "https://vvault.app/signup",
      featured: false,
    },
    {
      name: plan.name,
      eyebrow: content.pricingUi.mostPopular,
      price: proPrice,
      period: "/mo",

      bullets: plan.bullets,
      cta: plan.cta,
      href: "https://vvault.app/billing",
      featured: true,
    },
    {
      name: ai.title,
      eyebrow: "",
      price: ultraPrice,
      period: "/mo",

      bullets: ai.bullets,
      cta: content.pricingUi.upgradeUltra,
      href: "https://vvault.app/billing",
      featured: false,
    },
  ];

  return (
    <section id="pricing" className="pt-36 sm:pt-52">
      <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
        {/* Header */}
        <Reveal>
          <div className="text-center">
            <h2 className="font-display text-3xl text-white sm:text-5xl">
              {content.pricingUi.title}
            </h2>
            <p className="mt-3 text-[15px] text-white/45 sm:text-base">
              {content.pricingUi.subtitle}
            </p>

            {/* Toggle */}
            <div className="mt-8 flex items-center justify-center gap-3">
              <span className={`text-sm ${annual ? "text-white/40" : "text-white"}`}>
                {content.pricingUi.monthly}
              </span>
              <button
                type="button"
                aria-label={content.pricingUi.toggleBillingAriaLabel}
                onClick={() => setAnnual((v) => !v)}
                className={`relative h-7 w-12 rounded-full transition-colors duration-200 ${
                  annual ? "bg-emerald-500/80" : "bg-white/10"
                }`}
              >
                <span
                  className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white transition-all duration-200 ${
                    annual ? "left-6" : "left-1"
                  }`}
                />
              </button>
              <span className={`text-sm ${annual ? "text-white" : "text-white/40"}`}>
                {content.pricingUi.annually}
              </span>
            </div>
          </div>
        </Reveal>

        {/* Plan cards */}
        <div className="mt-12 grid gap-6 lg:grid-cols-3 lg:items-stretch">
          {plans.map((p) => (
            <Reveal key={p.name} className="h-full">
              <div
                className="relative flex h-full flex-col overflow-hidden rounded-2xl p-6 sm:p-8"
                style={{
                  background: p.featured
                    ? "linear-gradient(180deg, rgba(18,18,22,1) 0%, rgba(8,8,10,1) 100%)"
                    : "linear-gradient(180deg, rgba(12,12,15,0.98) 0%, rgba(4,4,5,1) 100%)",
                }}
              >
                {/* Border overlay — no bottom, sides fade out */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-[inherit]"
                  style={{
                    border: p.featured
                      ? "1px solid rgba(255,255,255,0.12)"
                      : "1px solid rgba(255,255,255,0.06)",
                    borderBottom: "none",
                    maskImage: "linear-gradient(to bottom, black 0%, black 30%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 30%, transparent 100%)",
                  }}
                />
                {/* Top glow line */}
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-px"
                  style={{
                    background: p.featured
                      ? "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 15%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.06) 85%, transparent 100%)"
                      : "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 15%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.04) 85%, transparent 100%)",
                  }}
                />
                {/* Top center glow orb for featured */}
                {p.featured && (
                  <div
                    className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[120px] w-[400px]"
                    style={{
                      background: "radial-gradient(ellipse at center, rgba(255,255,255,0.04) 0%, transparent 70%)",
                    }}
                  />
                )}

                {/* Plan name */}
                <h3 className="flex h-8 items-baseline gap-2 text-2xl font-semibold text-white">
                  {p.name}
                  {p.eyebrow && (
                    <span className="text-[11px] font-medium text-white/40">
                      {p.eyebrow}
                    </span>
                  )}
                </h3>

                {/* Price */}
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-[2.5rem] font-semibold leading-none text-white">
                    {p.price}
                  </span>
                  {p.period && (
                    <span className="text-base text-white/40">{p.period}</span>
                  )}
                </div>
                {/* Divider */}
                <div className="mt-5 h-px w-full" style={{ background: "rgba(255,255,255,0.06)" }} />

                {/* Features */}
                <ul className="mt-6 flex flex-col gap-3">
                  {p.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-white/65">
                      <svg viewBox="0 0 20 20" className="mt-[2px] h-4 w-4 shrink-0 fill-none stroke-emerald-400/70 stroke-[2]">
                        <path d="M5 10.5l3.5 3.5L15 7" />
                      </svg>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="mt-auto pt-8">
                  <LandingCtaLink
                    loggedInHref={p.href}
                    loggedOutHref={p.href}
                    className={`inline-flex w-full items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 ${
                      p.featured
                        ? "bg-white text-[#0e0e0e] hover:bg-white/90 focus-visible:ring-white/35"
                        : "bg-white/[0.06] text-white hover:bg-white/[0.1] focus-visible:ring-white/20"
                    }`}
                  >
                    {p.cta} <span className="ml-1.5">→</span>
                  </LandingCtaLink>
                  {p.period && (
                    <p className="mt-2.5 text-center text-[11px] text-white/25">
                      Cancel anytime
                    </p>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-28 sm:mt-36">
          <Reveal>
            <h3 className="text-center text-2xl font-semibold text-white sm:text-3xl">
              {content.pricingUi.faqTitle}
            </h3>
          </Reveal>
          <div className="mt-10 flex flex-col gap-3">
            {content.faq.map((item) => (
              <Reveal key={item.question}>
                <FaqItem question={item.question} answer={item.answer} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
