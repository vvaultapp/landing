"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Reveal } from "@/components/landing/Reveal";
import { getLandingContent } from "@/components/landing/content";
import { LandingCtaLink } from "@/components/landing/LandingCtaLink";

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
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
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

/* Comparison table data */
const comparisonSections = [
  {
    title: "Core Features",
    rows: [
      { label: "Storage", free: "100 MB", pro: "Unlimited", ultra: "Unlimited" },
      { label: "Share links (track, pack, folder)", free: true, pro: true, ultra: true },
      { label: "Contact list", free: true, pro: true, ultra: true },
      { label: "Collab packs and tracks", free: true, pro: true, ultra: true },
      { label: "Receive splits from Pro sales", free: true, pro: true, ultra: true },
      { label: "Link in Bio page", free: true, pro: true, ultra: true },
      { label: "Certificate of deposit", free: true, pro: true, ultra: true },
    ],
  },
  {
    title: "Campaigns & Outreach",
    rows: [
      { label: "Create campaigns", free: "1/day", pro: "Unlimited", ultra: "Unlimited" },
      { label: "Schedule sends", free: false, pro: true, ultra: true },
      { label: "Gmail integration", free: false, pro: true, ultra: true },
      { label: "Custom email subject & body", free: false, pro: true, ultra: true },
      { label: "Per-recipient best time scheduling", free: false, pro: false, ultra: true },
      { label: "Series automations", free: false, pro: false, ultra: true },
    ],
  },
  {
    title: "Analytics & Tracking",
    rows: [
      { label: "Opens tracking", free: false, pro: true, ultra: true },
      { label: "Clicks tracking", free: false, pro: true, ultra: true },
      { label: "Play duration tracking", free: false, pro: true, ultra: true },
      { label: "Downloads & saves", free: false, pro: true, ultra: true },
      { label: "Sales tracking", free: false, pro: true, ultra: true },
      { label: "Best time to send analysis", free: false, pro: true, ultra: true },
      { label: "Engagement funnels", free: false, pro: true, ultra: true },
    ],
  },
  {
    title: "CRM & Pipeline",
    rows: [
      { label: "Contact timeline", free: false, pro: true, ultra: true },
      { label: "Contact groups & tags", free: false, pro: true, ultra: true },
      { label: "Lead scoring", free: false, pro: true, ultra: true },
      { label: "Opportunities & request board", free: false, pro: true, ultra: true },
    ],
  },
  {
    title: "Sales & Marketplace",
    rows: [
      { label: "Stripe checkout", free: false, pro: true, ultra: true },
      { label: "License types (basic, premium, stems, exclusive)", free: false, pro: true, ultra: true },
      { label: "Marketplace listing", free: false, pro: true, ultra: true },
      { label: "Marketplace commission", free: "\u2013", pro: "5%", ultra: "0%" },
    ],
  },
  {
    title: "Branding & Customization",
    rows: [
      { label: "Public profile", free: true, pro: true, ultra: true },
      { label: "Theme customization", free: false, pro: true, ultra: true },
      { label: "Placement credits", free: true, pro: true, ultra: true },
      { label: "Social links (IG, YT, TT)", free: true, pro: true, ultra: true },
      { label: "Browse section highlight", free: false, pro: false, ultra: true },
    ],
  },
];

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return (
      <span className="text-[13px] text-white/60">{value}</span>
    );
  }
  if (value) {
    return (
      <svg
        viewBox="0 0 20 20"
        className="mx-auto h-4 w-4 fill-none stroke-emerald-400/70 stroke-[2]"
      >
        <path d="M5 10.5l3.5 3.5L15 7" />
      </svg>
    );
  }
  return (
    <span className="text-[13px] text-white/20">&ndash;</span>
  );
}

export default function PricingPage() {
  const content = getLandingContent("en");
  const [annual, setAnnual] = useState(true);
  const proPrice = annual ? "\u20ac7.49" : "\u20ac8.99";
  const ultraPrice = annual ? "\u20ac20.75" : "\u20ac24.99";

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "vvault | Pricing";
  }, []);

  const plans = [
    {
      name: "Free",
      price: "\u20ac0",
      period: "",
      bullets: content.pricingComparison.human.bullets,
      cta: content.pricingUi.startFree,
      href: "https://vvault.app/signup",
      featured: false,
    },
    {
      name: "Pro",
      eyebrow: content.pricingUi.mostPopular,
      price: proPrice,
      period: "/mo",
      bullets: content.singlePlan.bullets,
      cta: content.singlePlan.cta,
      href: "https://vvault.app/billing",
      featured: true,
    },
    {
      name: "Ultra",
      price: ultraPrice,
      period: "/mo",
      bullets: content.pricingComparison.ai.bullets,
      cta: content.pricingUi.upgradeUltra,
      href: "https://vvault.app/billing",
      featured: false,
    },
  ];

  return (
    <div className="landing-root min-h-screen bg-black font-sans text-[#f0f0f0]">
      <LandingNav locale="en" content={content} showPrimaryLinks={true} />

      <main className="relative z-10 pb-32 pt-40 sm:pt-48">
        <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-10">
          {/* Header */}
          <Reveal>
            <div className="text-center">
              <h1
                className="font-display text-4xl font-semibold sm:text-5xl lg:text-6xl"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.45) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Pricing
              </h1>
              <p className="mt-3 text-[15px] text-white/45 sm:text-base">
                Start for free and scale as you grow.
              </p>

              {/* Toggle */}
              <div className="mt-8 flex items-center justify-center gap-3">
                <span
                  className={`text-sm ${annual ? "text-white/40" : "text-white"}`}
                >
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
                <span
                  className={`text-sm ${annual ? "text-white" : "text-white/40"}`}
                >
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
                  <div
                    className="pointer-events-none absolute inset-0 rounded-[inherit]"
                    style={{
                      border: p.featured
                        ? "1px solid rgba(255,255,255,0.12)"
                        : "1px solid rgba(255,255,255,0.06)",
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
                      background: p.featured
                        ? "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 15%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.06) 85%, transparent 100%)"
                        : "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 15%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.04) 85%, transparent 100%)",
                    }}
                  />
                  {p.featured && (
                    <div
                      className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[120px] w-[400px]"
                      style={{
                        background:
                          "radial-gradient(ellipse at center, rgba(255,255,255,0.04) 0%, transparent 70%)",
                      }}
                    />
                  )}

                  <h3 className="flex h-8 items-baseline gap-2 text-2xl font-semibold text-white">
                    {p.name}
                    {p.eyebrow && (
                      <span className="text-[11px] font-medium text-white/40">
                        {p.eyebrow}
                      </span>
                    )}
                  </h3>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-[2.5rem] font-semibold leading-none text-white">
                      {p.price}
                    </span>
                    {p.period && (
                      <span className="text-base text-white/40">{p.period}</span>
                    )}
                  </div>
                  <div
                    className="mt-5 h-px w-full"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  />

                  <ul className="mt-6 flex flex-col gap-3">
                    {p.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-start gap-2.5 text-[13px] leading-relaxed text-white/65"
                      >
                        <svg
                          viewBox="0 0 20 20"
                          className="mt-[2px] h-4 w-4 shrink-0 fill-none stroke-emerald-400/70 stroke-[2]"
                        >
                          <path d="M5 10.5l3.5 3.5L15 7" />
                        </svg>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>

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
                      {p.cta} <span className="ml-1.5">&rarr;</span>
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

          {/* Comparison tables */}
          <div className="mt-28 sm:mt-36">
            <Reveal>
              <h2 className="text-center text-2xl font-semibold text-white sm:text-3xl">
                Compare plans
              </h2>
              <p className="mt-3 text-center text-[15px] text-white/40">
                See exactly what&apos;s included in each plan.
              </p>
            </Reveal>

            {comparisonSections.map((section) => (
              <Reveal key={section.title} className="mt-14">
                <h3 className="mb-4 text-lg font-semibold text-white/80">
                  {section.title}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[580px]">
                    <thead>
                      <tr>
                        <th className="w-[40%] pb-3 text-left text-[12px] font-medium uppercase tracking-wider text-white/25" />
                        <th className="w-[20%] pb-3 text-center text-[12px] font-medium uppercase tracking-wider text-white/25">
                          Free
                        </th>
                        <th className="w-[20%] pb-3 text-center text-[12px] font-medium uppercase tracking-wider text-white/25">
                          Pro
                        </th>
                        <th className="w-[20%] pb-3 text-center text-[12px] font-medium uppercase tracking-wider text-white/25">
                          Ultra
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.rows.map((row) => (
                        <tr
                          key={row.label}
                          className="border-t border-white/[0.04]"
                        >
                          <td className="py-3 text-[13px] text-white/60">
                            {row.label}
                          </td>
                          <td className="py-3 text-center">
                            <CellValue value={row.free} />
                          </td>
                          <td className="py-3 text-center">
                            <CellValue value={row.pro} />
                          </td>
                          <td className="py-3 text-center">
                            <CellValue value={row.ultra} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Reveal>
            ))}
          </div>

          {/* FAQ */}
          <div className="mt-28 sm:mt-36">
            <Reveal>
              <h2 className="text-center text-2xl font-semibold text-white sm:text-3xl">
                {content.pricingUi.faqTitle}
              </h2>
            </Reveal>
            <div className="mx-auto mt-10 flex max-w-[800px] flex-col gap-3">
              {content.faq.map((item) => (
                <Reveal key={item.question}>
                  <FaqItem question={item.question} answer={item.answer} />
                </Reveal>
              ))}
            </div>
          </div>

          {/* Final CTA */}
          <Reveal className="mt-28 sm:mt-36">
            <div className="text-center">
              <h2 className="text-2xl font-medium text-white sm:text-3xl">
                Ready to start?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
                Sign up for free and start sending your music professionally today.
              </p>
              <div className="mt-6 flex justify-center">
                <a
                  href="https://vvault.app/signup"
                  className="inline-flex items-center rounded-2xl bg-white px-6 py-2.5 text-[14px] font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90"
                >
                  Start for free
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </main>

      <LandingFooter locale="en" content={content} showColumns={false} inlineLegalWithBrand />
    </div>
  );
}
