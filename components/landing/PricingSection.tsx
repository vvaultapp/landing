"use client";

import { useState } from "react";
import { landingContent } from "@/components/landing/content";
import { LandingCtaLink } from "@/components/landing/LandingCtaLink";
import { Reveal } from "@/components/landing/Reveal";

function ComparisonCard({
  title,
  bullets,
  cost,
  costNote,
  symbol,
}: {
  title: string;
  bullets: string[];
  cost: string;
  costNote: string;
  symbol: "check" | "cross";
}) {
  const marker = symbol === "check" ? "✓" : "✕";

  return (
    <article className="landing-panel rounded-[18px] border border-white/10 bg-transparent p-5 sm:p-6">
      <p className="text-[13px] uppercase tracking-[0.2em] text-white/50">{title}</p>
      <ul className="mt-5 space-y-2.5">
        {bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-2.5 text-sm text-white/66">
            <span className="mt-[2px] inline-flex w-4 shrink-0 text-white/72">{marker}</span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 border-t border-white/10 pt-5">
        <p className="text-4xl font-semibold text-white">{cost}</p>
        <p className="mt-1 text-sm text-white/46">{costNote}</p>
      </div>
    </article>
  );
}

function FullBleedDivider() {
  return (
    <div className="relative left-1/2 my-40 w-screen -translate-x-1/2 border-t border-white/10" />
  );
}

export function PricingSection() {
  const [annual, setAnnual] = useState(true);
  const { human, ai } = landingContent.pricingComparison;
  const plan = landingContent.singlePlan;
  const proPrice = annual ? "€7.49/mo" : "€8.99/mo";
  const ultraPrice = annual ? "€20.75/mo" : "€24.99/mo";
  const cadenceNote = annual ? "billed yearly" : "billed monthly";

  return (
    <section id="pricing" className="pt-0">
      <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-3xl text-white sm:text-5xl">Simple plans that scale with your catalog.</h2>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-3 py-2">
              <span className={`text-xs ${annual ? "text-white/45" : "text-white"}`}>Monthly</span>
              <button
                type="button"
                aria-label="Toggle annual billing"
                onClick={() => setAnnual((value) => !value)}
                className={`relative h-7 w-12 rounded-full border ${annual ? "bg-white/15 border-white/30" : "bg-white/5 border-white/20"}`}
              >
                <span
                  className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white transition-all duration-200 ${annual ? "left-6" : "left-1"}`}
                />
              </button>
              <span className={`text-xs ${annual ? "text-white" : "text-white/45"}`}>Annually</span>
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-10">
          <ComparisonCard
            title={human.title}
            bullets={human.bullets}
            cost={human.cost}
            costNote={human.costNote}
            symbol={human.symbol}
          />
        </Reveal>

        <Reveal className="mt-8 rounded-[18px] bg-[#dcdcdc] p-6 sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.15em] text-[#0e0e0e]">One Plan</p>
              <h3 className="mt-2 text-2xl font-semibold text-[#0e0e0e]">{plan.name}</h3>
              <p className="mt-1 text-sm text-[#0e0e0e]/70">Annually /month {cadenceNote}</p>
            </div>
            <p className="text-4xl font-semibold text-[#0e0e0e]">{proPrice}</p>
          </div>

          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {plan.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2.5 text-sm text-[#0e0e0e]">
                <span className="mt-[2px] inline-flex w-4 shrink-0 text-[#0e0e0e]">✓</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>

          <LandingCtaLink
            loggedInHref="https://vvault.app/billing"
            loggedOutHref="https://vvault.app/billing"
            className="mt-6 inline-flex items-center rounded-none bg-[#0e0e0e] px-5 py-2.5 text-sm font-semibold text-[#dcdcdc] transition-[border-radius,background-color] duration-200 hover:rounded-md hover:bg-[#0e0e0e]/94 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e0e0e]/30"
          >
            {plan.cta} →
          </LandingCtaLink>
        </Reveal>

        <Reveal className="mt-6 rounded-[18px] border border-white/10 bg-transparent p-6 sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.15em] text-white/70">Ultra Plan</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">{ai.title}</h3>
              <p className="mt-1 text-sm text-white/55">Annually /month {cadenceNote}</p>
            </div>
            <p className="text-4xl font-semibold text-white">{ultraPrice}</p>
          </div>

          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {ai.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2.5 text-sm text-white/76">
                <span className="mt-[2px] inline-flex w-4 shrink-0 text-white">✓</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>

          <LandingCtaLink
            loggedInHref="https://vvault.app/billing"
            loggedOutHref="https://vvault.app/billing"
            className="mt-6 inline-flex items-center rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
          >
            Upgrade to Ultra →
          </LandingCtaLink>
        </Reveal>

        <FullBleedDivider />

        <Reveal className="rounded-[20px] border border-white/10 bg-transparent p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-white/88">FAQs</h3>
          <div className="mt-2 divide-y divide-white/10">
            {landingContent.faq.map((item) => (
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
