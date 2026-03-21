"use client";

import { useState } from "react";
import type { LandingContent } from "@/components/landing/content";
import { LandingCtaLink } from "@/components/landing/LandingCtaLink";
import { Reveal } from "@/components/landing/Reveal";

function ComparisonCard({
  eyebrow,
  title,
  bullets,
  cost,
  ctaLabel,
  symbol,
}: {
  eyebrow: string;
  title: string;
  bullets: string[];
  cost: string;
  ctaLabel: string;
  symbol: "check" | "cross";
}) {
  const marker = symbol === "check" ? "✓" : "✕";

  return (
    <article className="landing-panel h-full rounded-[18px] border border-white/10 bg-transparent p-6 sm:p-7 flex flex-col">
      <div>
        <p className="text-sm uppercase tracking-[0.15em] text-white/70">{eyebrow}</p>
        <h3 className="mt-2 text-2xl font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm text-white/55">&nbsp;</p>
        <p className="mt-4 text-4xl font-semibold text-white">{cost}</p>
      </div>
      <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-2.5 text-sm text-white/76">
            <span className="mt-[2px] inline-flex w-4 shrink-0 text-white/72">{marker}</span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-6">
        <LandingCtaLink
          loggedInHref="https://vvault.app/signup"
          loggedOutHref="https://vvault.app/signup"
          className="inline-flex w-full items-center justify-between rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
        >
          {ctaLabel} →
        </LandingCtaLink>
      </div>
    </article>
  );
}

type PricingSectionProps = {
  content: LandingContent;
};

export function PricingSection({ content }: PricingSectionProps) {
  const [annual, setAnnual] = useState(true);
  const { human, ai } = content.pricingComparison;
  const plan = content.singlePlan;
  const proPrice = annual ? "€7.49/mo" : "€8.99/mo";
  const ultraPrice = annual ? "€20.75/mo" : "€24.99/mo";
  const cadenceNote = annual ? content.pricingUi.billedYearly : content.pricingUi.billedMonthly;

  return (
    <section id="pricing" className="pt-20 sm:pt-28">
      <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-3xl text-white sm:text-5xl">{content.pricingUi.title}</h2>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-3 py-2">
              <span className={`text-xs ${annual ? "text-white/45" : "text-white"}`}>{content.pricingUi.monthly}</span>
              <button
                type="button"
                aria-label={content.pricingUi.toggleBillingAriaLabel}
                onClick={() => setAnnual((value) => !value)}
                className={`relative h-7 w-12 rounded-full transition-colors duration-200 ${annual ? "bg-emerald-500/80" : "bg-white/5"}`}
              >
                <span
                  className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white transition-all duration-200 ${annual ? "left-6" : "left-1"}`}
                />
              </button>
              <span className={`text-xs ${annual ? "text-white" : "text-white/45"}`}>{content.pricingUi.annually}</span>
            </div>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-3 lg:items-stretch">
          <Reveal className="h-full">
            <ComparisonCard
              eyebrow={human.costNote}
              title={human.title}
              bullets={human.bullets}
              cost={human.cost}
              ctaLabel={content.pricingUi.startFree}
              symbol={human.symbol}
            />
          </Reveal>

          <Reveal className="relative h-full overflow-hidden rounded-[18px] bg-[#dcdcdc] p-6 sm:p-7 flex flex-col">
            <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(226,171,56,0.42)_0%,rgba(226,171,56,0)_72%)] blur-2xl" />
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.15em] text-[#0e0e0e]">{content.pricingUi.mostPopular}</p>
                <h3 className="mt-2 text-2xl font-semibold text-[#0e0e0e]">{plan.name}</h3>
                <p className="mt-1 text-sm text-[#0e0e0e]/70">
                  {content.pricingUi.annuallyPerMonth} {cadenceNote}
                </p>
              </div>
              <p className="text-4xl font-semibold text-[#0e0e0e]">{proPrice}</p>
            </div>

            <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {plan.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2.5 text-sm text-[#0e0e0e]">
                  <span className="mt-[2px] inline-flex w-4 shrink-0 text-[#0e0e0e]">✓</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-6">
              <LandingCtaLink
                loggedInHref="https://vvault.app/billing"
                loggedOutHref="https://vvault.app/billing"
                className="inline-flex w-full items-center justify-between rounded-2xl bg-[#0e0e0e] px-5 py-2.5 text-sm font-semibold text-[#dcdcdc] transition-colors duration-200 hover:bg-[#0e0e0e]/94 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e0e0e]/30"
              >
                {plan.cta} →
              </LandingCtaLink>
            </div>
          </Reveal>

          <Reveal className="relative h-full overflow-hidden rounded-[18px] border border-white/10 bg-transparent p-6 sm:p-7 flex flex-col">
            <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(137,92,255,0.38)_0%,rgba(137,92,255,0)_72%)] blur-2xl" />
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.15em] text-white/70">{content.pricingUi.bestValue}</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">{ai.title}</h3>
                <p className="mt-1 text-sm text-white/55">
                  {content.pricingUi.annuallyPerMonth} {cadenceNote}
                </p>
              </div>
              <p className="text-4xl font-semibold text-white">{ultraPrice}</p>
            </div>

            <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {ai.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2.5 text-sm text-white/76">
                  <span className="mt-[2px] inline-flex w-4 shrink-0 text-white">✓</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-6">
              <LandingCtaLink
                loggedInHref="https://vvault.app/billing"
                loggedOutHref="https://vvault.app/billing"
                className="inline-flex w-full items-center justify-between rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
              >
                {content.pricingUi.upgradeUltra} →
              </LandingCtaLink>
            </div>
          </Reveal>
        </div>

        <Reveal className="mt-14 rounded-[20px] border border-white/10 bg-transparent p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-white/88">{content.pricingUi.faqTitle}</h3>
          <div className="mt-2 divide-y divide-white/10">
            {content.faq.map((item) => (
              <details key={item.question} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm text-white/84 marker:content-none [&::-webkit-details-marker]:hidden">
                  <span>{item.question}</span>
                  <span className="inline-flex h-5 w-5 items-center justify-center text-white/55 transition-transform duration-200 group-open:rotate-180" aria-hidden="true">
                    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
                      <path d="M5 8l5 5 5-5" />
                    </svg>
                  </span>
                </summary>
                <div className="faq-answer">
                  <p className="pt-2 text-sm leading-7 text-white/58">{item.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
