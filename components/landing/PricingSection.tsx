"use client";

import { useState, useRef, useCallback } from "react";
import type { LandingContent } from "@/components/landing/content";
import { LandingCtaLink } from "@/components/landing/LandingCtaLink";
import { Reveal } from "@/components/landing/Reveal";

type PricingSectionProps = {
  content: LandingContent;
  locale?: "en" | "fr";
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

export function PricingSection({ content, locale = "en" }: PricingSectionProps) {
  const [annual, setAnnual] = useState(true);
  const { human, ai } = content.pricingComparison;
  const plan = content.singlePlan;
  const proPrice = annual ? "€7.49" : "€8.99";
  const ultraPrice = annual ? "€20.75" : "€24.99";
  const fr = locale === "fr";
  const everythingInFreeLabel = fr ? "Tout ce qui est dans Free, plus :" : "Everything in Free, plus:";
  const everythingInProLabel = fr ? "Tout ce qui est dans Pro, plus :" : "Everything in Pro, plus:";
  const notIncludedLabel = fr ? "Pas inclus :" : "Not included:";

  const plans = [
    {
      name: human.title,
      eyebrow: "",
      price: "€0",
      period: "",
      includedHeading: undefined as string | undefined,
      bullets: human.bullets,
      notIncluded: human.notIncluded ?? [],
      notIncludedHeading: notIncludedLabel,
      cta: content.pricingUi.startFree,
      href: "https://vvault.app/signup",
      loggedOutHref: "https://vvault.app/signup",
      featured: false,
    },
    {
      name: plan.name,
      eyebrow: content.pricingUi.mostPopular,
      price: proPrice,
      period: locale === "fr" ? "/mois" : "/mo",
      includedHeading: everythingInFreeLabel,
      bullets: plan.bullets,
      notIncluded: plan.notIncluded ?? [],
      notIncludedHeading: notIncludedLabel,
      cta: plan.cta,
      href: "https://vvault.app/billing",
      loggedOutHref: "https://vvault.app/signup?plan=pro",
      featured: true,
    },
    {
      name: ai.title,
      eyebrow: "",
      price: ultraPrice,
      period: locale === "fr" ? "/mois" : "/mo",
      includedHeading: everythingInProLabel,
      bullets: ai.bullets,
      notIncluded: [] as string[],
      notIncludedHeading: notIncludedLabel,
      cta: content.pricingUi.upgradeUltra,
      href: "https://vvault.app/billing",
      loggedOutHref: "https://vvault.app/signup?plan=ultra",
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
            <div className="relative mt-8 flex flex-col items-center gap-2">
              <div className="flex items-center justify-center gap-3">
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
              {annual && (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400 whitespace-nowrap">
                  {locale === "fr" ? "17% d'économies" : "17% Savings"}
                </span>
              )}
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
                    ? "linear-gradient(180deg, rgba(22,22,28,1) 0%, rgba(10,10,13,1) 100%)"
                    : p.name === ai.title
                      ? "linear-gradient(180deg, rgba(18,14,28,0.98) 0%, rgba(6,4,12,1) 100%)"
                      : "linear-gradient(180deg, rgba(12,12,15,0.98) 0%, rgba(4,4,5,1) 100%)",
                }}
              >
                {/* Border overlay — no bottom, sides fade out */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-[inherit]"
                  style={{
                    border: p.featured
                      ? "1px solid rgba(255,255,255,0.18)"
                      : p.name === ai.title
                        ? "1px solid rgba(168,130,255,0.12)"
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
                      ? "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 15%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.1) 85%, transparent 100%)"
                      : p.name === ai.title
                        ? "linear-gradient(90deg, transparent 0%, rgba(168,130,255,0.08) 15%, rgba(168,130,255,0.25) 50%, rgba(168,130,255,0.08) 85%, transparent 100%)"
                        : "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 15%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.04) 85%, transparent 100%)",
                  }}
                />
                {/* Pro glow — bright white */}
                {p.featured && (
                  <div
                    className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[200px] w-[500px]"
                    style={{
                      background: "radial-gradient(ellipse at center, rgba(255,255,255,0.09) 0%, transparent 70%)",
                    }}
                  />
                )}
                {/* Ultra glow — purple accent */}
                {p.name === ai.title && (
                  <div
                    className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[160px] w-[420px]"
                    style={{
                      background: "radial-gradient(ellipse at center, rgba(168,130,255,0.07) 0%, transparent 70%)",
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

                {/* Features — checks (included) */}
                {p.includedHeading && (
                  <p className="mt-6 text-[12px] font-semibold uppercase tracking-wider text-white/40">
                    {p.includedHeading}
                  </p>
                )}
                <ul className={`flex flex-col gap-3 ${p.includedHeading ? "mt-3" : "mt-6"}`}>
                  {p.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-start gap-2.5 text-[14.5px] leading-snug text-white/80"
                    >
                      <svg viewBox="0 0 20 20" className="mt-[3px] h-[18px] w-[18px] shrink-0 fill-none stroke-emerald-400/80 stroke-[2.2]">
                        <path d="M5 10.5l3.5 3.5L15 7" />
                      </svg>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                {/* Features — crosses (not included on this tier) */}
                {p.notIncluded.length > 0 && (
                  <>
                    <div
                      className="mt-6 h-px w-full"
                      style={{ background: "rgba(255,255,255,0.04)" }}
                    />
                    <p className="mt-5 text-[12px] font-semibold uppercase tracking-wider text-white/35">
                      {p.notIncludedHeading}
                    </p>
                    <ul className="mt-3 flex flex-col gap-3">
                      {p.notIncluded.map((bullet) => (
                        <li
                          key={bullet}
                          className="flex items-start gap-2.5 text-[14.5px] leading-snug text-white/35"
                        >
                          <svg
                            viewBox="0 0 20 20"
                            className="mt-[3px] h-[18px] w-[18px] shrink-0 fill-none stroke-white/30 stroke-[2.2]"
                          >
                            <path d="M6 6l8 8M14 6l-8 8" />
                          </svg>
                          <span className="line-through decoration-white/20">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {/* CTA */}
                <div className="mt-auto pt-10">
                  <LandingCtaLink
                    loggedInHref={p.href}
                    loggedOutHref={p.loggedOutHref || p.href}
                    className={`inline-flex w-full items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 ${
                      p.featured
                        ? "bg-white text-[#0e0e0e] hover:bg-white/90 focus-visible:ring-white/35"
                        : "bg-white/[0.06] text-white hover:bg-white/[0.1] focus-visible:ring-white/20"
                    }`}
                  >
                    {p.cta} <span className="ml-1.5">→</span>
                  </LandingCtaLink>
                  <p className="mt-2.5 text-center text-[11px] text-white/25">
                    {p.period
                      ? (locale === "fr" ? "Annule quand tu veux" : "Cancel anytime")
                      : (locale === "fr" ? "Aucune carte requise" : "No credit card required")}
                  </p>
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
