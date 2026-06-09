"use client";

import { useState, useRef, useCallback } from "react";
import type { LandingContent } from "@/components/landing/content";
import { LandingCtaLink } from "@/components/landing/LandingCtaLink";
import { Reveal } from "@/components/landing/Reveal";
import { formatPrice } from "@/lib/formatPrice";

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
        background: "rgb(var(--surface))",
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
        <span className="text-[14px] font-medium text-[rgb(var(--fg)_/_0.84)] sm:text-[15px]">{question}</span>
        <span
          className="inline-flex h-5 w-5 shrink-0 items-center justify-center text-[rgb(var(--fg)_/_0.4)] transition-transform duration-300 ease-out"
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
          <p className="text-[13px] leading-7 text-[rgb(var(--fg)_/_0.5)] sm:text-[14px]">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export function PricingSection({ content, locale = "en" }: PricingSectionProps) {
  const [annual, setAnnual] = useState(false);
  const { human, ai } = content.pricingComparison;
  const plan = content.singlePlan;
  const proPrice = formatPrice(annual ? "9.92" : "11.99", locale);
  const ultraPrice = formatPrice(annual ? "23.25" : "27.99", locale);
  const promoPrice = formatPrice("1", locale);
  const strikePrice = formatPrice("11.99", locale);
  const fr = locale === "fr";
  const everythingInFreeLabel = fr ? "Tout ce qui est dans Free, plus :" : "Everything in Free, plus:";
  const everythingInProLabel = fr ? "Tout ce qui est dans Pro, plus :" : "Everything in Pro, plus:";

  const plans = [
    {
      id: "free",
      name: human.title,
      eyebrow: "",
      price: formatPrice("0", locale),
      period: "",
      includedHeading: undefined as string | undefined,
      bullets: human.bullets,
      cta: content.pricingUi.startFree,
      href: "https://vvault.app/signup",
      loggedOutHref: "https://vvault.app/signup",
      featured: false,
    },
    {
      id: "pro",
      name: plan.name,
      eyebrow: content.pricingUi.mostPopular,
      /* Same promo as the pricing page: lead with €1 for the first
         month, surface the regular per-month price as a small note. */
      price: promoPrice,
      strikePrice,
      period: fr ? "le premier mois" : "first month",
      priceNote: fr ? `puis ${proPrice} par mois` : `then ${proPrice} per month`,
      includedHeading: everythingInFreeLabel,
      bullets: plan.bullets,
      cta: plan.cta,
      href: "https://vvault.app/billing",
      loggedOutHref: "https://vvault.app/signup?plan=pro",
      featured: true,
    },
    {
      id: "ultra",
      name: ai.title,
      eyebrow: "",
      price: ultraPrice,
      period: locale === "fr" ? "/mois" : "/mo",
      includedHeading: everythingInProLabel,
      bullets: ai.bullets,
      cta: content.pricingUi.upgradeUltra,
      href: "https://vvault.app/billing",
      loggedOutHref: "https://vvault.app/signup?plan=ultra",
      featured: false,
    },
  ];

  return (
    <section id="pricing" className="pt-36 sm:pt-52">
      <div className="mx-auto w-full max-w-[clamp(1320px,92vw,2400px)] px-5 sm:px-8 lg:px-10">
        {/* Header */}
        <Reveal>
          <div className="text-center">
            <h2 className="font-display text-3xl text-[rgb(var(--fg))] sm:text-5xl">
              {content.pricingUi.title}
            </h2>
            <p className="mt-3 text-[15px] text-[rgb(var(--fg)_/_0.45)] sm:text-base">
              {content.pricingUi.subtitle}
            </p>

            {/* Toggle */}
            <div className="relative mt-8 flex flex-col items-center gap-2">
              <div className="flex items-center justify-center gap-3">
                <span className={`text-sm ${annual ? "text-[rgb(var(--fg)_/_0.4)]" : "text-[rgb(var(--fg))]"}`}>
                  {content.pricingUi.monthly}
                </span>
                <button
                  type="button"
                  aria-label={content.pricingUi.toggleBillingAriaLabel}
                  onClick={() => setAnnual((v) => !v)}
                  className={`relative h-7 w-12 rounded-full transition-colors duration-200 ${
                    annual ? "bg-emerald-500/80" : "bg-[rgb(var(--ov)_/_0.1)]"
                  }`}
                >
                  <span
                    className={`absolute inset-y-0 my-auto h-5 w-5 rounded-full bg-[rgb(var(--inv))] transition-[left] duration-200 ${
                      annual ? "left-6" : "left-1"
                    }`}
                  />
                </button>
                <span className={`text-sm ${annual ? "text-[rgb(var(--fg))]" : "text-[rgb(var(--fg)_/_0.4)]"}`}>
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
              <div className="relative flex h-full flex-col">
              <div
                className="relative flex h-full flex-col overflow-hidden rounded-2xl p-6 sm:p-8"
                style={{
                  // Pro (featured) = subtle low-opacity fill; Free/Ultra = clean
                  // outline cards (transparent fill + the visible border below).
                  background: p.featured ? "rgb(var(--card))" : "transparent",
                }}
              >
                {/* Border overlay — no bottom, sides fade out */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-[inherit]"
                  style={{ border: "1px solid rgb(var(--ov) / 0.14)" }}
                />
                {/* glows removed — clean, flat cards in both themes */}

                {/* Plan name + (Pro only) blue "Most popular" pill
                    inline with the name. */}
                <div className="flex h-8 items-center gap-2">
                  <h3 className="text-2xl font-semibold text-[rgb(var(--fg))]">
                    {p.name}
                  </h3>
                  {p.eyebrow && (
                    <span className="inline-flex items-center rounded-full bg-[rgb(var(--ov)_/_0.06)] px-2.5 py-[3px] text-[10.5px] font-semibold tracking-[0.02em] text-[rgb(var(--fg))]">
                      {p.eyebrow}
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="mt-4 flex items-baseline gap-1.5">
                  {p.strikePrice && (
                    <span className="text-2xl font-medium leading-none text-[rgb(var(--fg)_/_0.35)] line-through">
                      {p.strikePrice}
                    </span>
                  )}
                  <span className="text-[2.5rem] font-semibold leading-none text-[rgb(var(--fg))]">
                    {p.price}
                  </span>
                  {p.period && (
                    <span className="text-base text-[rgb(var(--fg)_/_0.4)]">{p.period}</span>
                  )}
                </div>
                {/* Optional "then €X/mo" subtext for promo prices. */}
                {p.priceNote && (
                  <p className="mt-1.5 text-[12px] font-medium leading-snug text-[rgb(var(--fg)_/_0.4)]">
                    {p.priceNote}
                  </p>
                )}
                {/* Divider */}
                <div className="mt-5 h-px w-full" style={{ background: "rgb(var(--ov) / 0.1)" }} />

                {/* Features — checks (included) */}
                {p.includedHeading && (
                  <p className="mt-6 text-[12px] font-semibold uppercase tracking-wider text-[rgb(var(--fg)_/_0.4)]">
                    {p.includedHeading}
                  </p>
                )}
                <ul className={`flex flex-col gap-3 ${p.includedHeading ? "mt-3" : "mt-6"}`}>
                  {p.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-start gap-2.5 text-[14.5px] leading-snug text-[rgb(var(--fg)_/_0.8)]"
                    >
                      <svg viewBox="0 0 20 20" className="mt-[3px] h-[18px] w-[18px] shrink-0 fill-none stroke-[rgb(var(--fg))] stroke-[2.2]">
                        <path d="M5 10.5l3.5 3.5L15 7" />
                      </svg>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA. Untracked here on purpose — the dashboard
                    tracks the canonical pricing-page CTAs (/pricing
                    cards + compare-plans), not the home-page block. */}
                <div className="mt-auto pt-10">
                  <LandingCtaLink
                    loggedInHref={p.href}
                    loggedOutHref={p.loggedOutHref || p.href}
                    className={`inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-opacity duration-200 focus-visible:outline-none focus-visible:ring-2 ${
                      p.featured
                        ? "bg-[rgb(var(--inv))] text-[rgb(var(--inv-fg))] hover:opacity-90 focus-visible:ring-[rgb(var(--ov)_/_0.35)]"
                        : "border border-[rgb(var(--ov)_/_0.18)] text-[rgb(var(--fg))] hover:bg-[rgb(var(--ov)_/_0.06)] focus-visible:ring-[rgb(var(--ov)_/_0.2)]"
                    }`}
                  >
                    {p.cta} <span className="ml-1.5">→</span>
                  </LandingCtaLink>
                  <p className="mt-2.5 text-center text-[11px] text-[rgb(var(--fg)_/_0.25)]">
                    {p.period
                      ? (locale === "fr" ? "Annule quand tu veux" : "Cancel anytime")
                      : (locale === "fr" ? "Aucune carte requise" : "No credit card required")}
                  </p>
                </div>
              </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-28 sm:mt-36">
          <Reveal>
            <h3 className="text-center text-2xl font-semibold text-[rgb(var(--fg))] sm:text-3xl">
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
