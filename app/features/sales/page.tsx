"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Reveal } from "@/components/landing/Reveal";
import { getLandingContent } from "@/components/landing/content";
import { useLocale } from "@/lib/useLocale";

const Plasma = dynamic(() => import("@/components/landing/Plasma"), {
  ssr: false,
});

/* ------------------------------------------------------------------ */
/*  Emblem icon — dollar / payment                                     */
/* ------------------------------------------------------------------ */
function DollarIcon({ className = "", gradId }: { className?: string; gradId?: string }) {
  const strokeColor = gradId ? `url(#${gradId})` : "currentColor";
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="10" stroke={strokeColor} strokeWidth="1.5" />
      <path
        d="M15 9.5c0-1.38-1.34-2.5-3-2.5S9 8.12 9 9.5s1.34 2.5 3 2.5 3 1.12 3 2.5-1.34 2.5-3 2.5-3-1.12-3-2.5M12 5v2m0 10v2"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Emblem                                                             */
/* ------------------------------------------------------------------ */
function Emblem() {
  return (
    <div
      className="relative mx-auto flex h-[100px] w-[100px] items-center justify-center overflow-hidden rounded-[26px] sm:h-[120px] sm:w-[120px] sm:rounded-[30px]"
      style={{
        background:
          "linear-gradient(160deg, rgba(30,30,35,0.6) 0%, rgba(8,8,10,0.95) 35%, rgba(0,0,0,1) 100%)",
        boxShadow: [
          "inset 0 1px 0 0 rgba(255,255,255,0.07)",
          "inset 0 -1px 0 0 rgba(0,0,0,0.4)",
          "inset 1px 0 0 0 rgba(255,255,255,0.03)",
          "inset -1px 0 0 0 rgba(0,0,0,0.15)",
          "0 8px 32px -6px rgba(0,0,0,0.7)",
          "0 2px 8px 0 rgba(0,0,0,0.4)",
        ].join(", "),
        border: "0.5px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        }}
      />
      <div
        className="pointer-events-none absolute left-0 top-0 h-[60%] w-[70%]"
        style={{
          background:
            "radial-gradient(ellipse at 25% 20%, rgba(255,255,255,0.03) 0%, transparent 60%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-[15%] top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.1) 70%, transparent 100%)",
        }}
      />
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="chrome-sales-hero" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
            <stop offset="18%" stopColor="rgba(215,220,235,0.65)" />
            <stop offset="38%" stopColor="rgba(150,160,185,0.35)" />
            <stop offset="55%" stopColor="rgba(180,190,215,0.5)" />
            <stop offset="72%" stopColor="rgba(34,197,94,0.35)" />
            <stop offset="88%" stopColor="rgba(34,197,94,0.55)" />
            <stop offset="100%" stopColor="rgba(34,197,94,0.4)" />
          </linearGradient>
        </defs>
      </svg>
      <DollarIcon className="relative z-10 h-14 w-14 sm:h-16 sm:w-16" gradId="chrome-sales-hero" />
      <div
        className="pointer-events-none absolute bottom-[-18px] left-1/2 -translate-x-1/2 h-[70%] w-[110%]"
        style={{
          background: "radial-gradient(ellipse 100% 60% at 50% 80%, rgba(34,197,94,0.12) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-[18%] bottom-0 h-[0.5px]"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(34,197,94,0.25) 30%, rgba(34,197,94,0.4) 50%, rgba(34,197,94,0.25) 70%, transparent 100%)",
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  GlowCard                                                           */
/* ------------------------------------------------------------------ */
function GlowCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl sm:rounded-3xl ${className}`}
      style={{
        background:
          "linear-gradient(180deg, rgba(8,8,10,0.98) 0%, rgba(4,4,5,1) 100%)",
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
        className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[inherit]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 15%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0.04) 85%, transparent 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[120px] w-[400px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.04) 0%, transparent 70%)",
        }}
      />
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mock: Revenue Dashboard Card                                       */
/* ------------------------------------------------------------------ */
function MockRevenueDashboardCard() {
  const stats = [
    { label: "Total revenue", value: "\u20ac3,240", accent: true },
    { label: "Net after fees", value: "\u20ac2,971" },
    { label: "Platform fee (5%)", value: "\u20ac162" },
    { label: "Orders this month", value: "18" },
  ];

  return (
    <GlowCard>
      <div className="select-none cursor-default px-6 py-8 sm:px-10 sm:py-10">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-2xl"
            style={{
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.15)",
            }}
          >
            <DollarIcon className="h-5 w-5 text-emerald-400/80" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-white/85">Revenue dashboard</p>
            <p className="text-[11px] text-white/35">Real-time earnings &middot; Stripe connected</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {stats.map((s, i) => (
            <div
              key={i}
              className="rounded-2xl px-4 py-4"
              style={{ border: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.01)" }}
            >
              <p className="text-[10px] uppercase tracking-wider text-white/25">{s.label}</p>
              <p className={`mt-1 text-[20px] font-semibold tabular-nums ${s.accent ? "text-emerald-400/80" : "text-white/70"}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </GlowCard>
  );
}

/* ------------------------------------------------------------------ */
/*  Mock: License Types Card                                           */
/* ------------------------------------------------------------------ */
function MockLicenseTypesCard() {
  const licenses = [
    { name: "Basic", price: "\u20ac29.99", desc: "MP3 format" },
    { name: "Premium", price: "\u20ac49.99", desc: "MP3 + WAV formats" },
    { name: "Stems", price: "\u20ac79.99", desc: "MP3 + WAV + STEMS" },
    { name: "Exclusive", price: "\u20ac299.99", desc: "All formats, full rights" },
  ];

  return (
    <GlowCard>
      <div className="select-none cursor-default px-6 py-8 sm:px-10 sm:py-10">
        <p className="text-[11px] font-semibold text-white/25">License types</p>

        <div className="mt-5 space-y-2">
          {licenses.map((l, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-2xl px-4 py-3 transition-colors duration-200 hover:bg-white/[0.03]"
              style={{ border: "1px solid rgba(255,255,255,0.04)" }}
            >
              <div>
                <p className="text-[13px] font-medium text-white/75">{l.name}</p>
                <p className="text-[11px] text-white/30">{l.desc}</p>
              </div>
              <span className="ml-4 shrink-0 text-[15px] font-semibold tabular-nums text-emerald-400/70">
                {l.price}
              </span>
            </div>
          ))}
        </div>
      </div>
    </GlowCard>
  );
}

/* ------------------------------------------------------------------ */
/*  Mock: Revenue by License Chart Card                                */
/* ------------------------------------------------------------------ */
function MockRevenueByLicenseCard() {
  const bars = [
    { label: "Basic", amount: 870, max: 1400, color: "rgba(34,197,94,0.5)" },
    { label: "Premium", amount: 1400, max: 1400, color: "rgba(34,197,94,0.7)" },
    { label: "Stems", amount: 640, max: 1400, color: "rgba(34,197,94,0.4)" },
    { label: "Exclusive", amount: 330, max: 1400, color: "rgba(34,197,94,0.25)" },
  ];

  return (
    <GlowCard>
      <div className="select-none cursor-default px-6 py-8 sm:px-10 sm:py-10">
        <p className="text-[11px] font-semibold text-white/25">Revenue by license</p>

        <div className="mt-5 space-y-4">
          {bars.map((b, i) => (
            <div key={i}>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-white/50">{b.label}</span>
                <span className="text-[12px] font-semibold tabular-nums text-white/50">
                  {"\u20ac"}{b.amount.toLocaleString()}
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full rounded-full bg-white/[0.04]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(b.amount / b.max) * 100}%`,
                    background: b.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-white/[0.04] pt-4">
          <span className="text-[12px] text-white/35">Total revenue</span>
          <span className="text-[14px] font-semibold tabular-nums text-emerald-400/70">{"\u20ac"}3,240</span>
        </div>
      </div>
    </GlowCard>
  );
}

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */
export default function FeatureSalesPage() {
  const [locale] = useLocale();
  const content = getLandingContent(locale);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = locale === "fr"
      ? "vvault | Vends ta musique"
      : "vvault | Sell your music";
  }, [locale]);

  return (
    <div className="landing-root min-h-screen bg-black font-sans text-[#f0f0f0]">
      <LandingNav locale={locale} content={content} showPrimaryLinks={true} />

      {/* Plasma hero background — fixed, full-width, green accent */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-screen"
        style={{
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 30%, black 0%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 70% at 50% 30%, black 0%, transparent 70%)",
        }}
      >
        <div className="absolute inset-0 opacity-[0.55] max-lg:opacity-[0.15]">
          <Plasma
            color="#22c55e"
            speed={0.3}
            direction="forward"
            scale={1.2}
            opacity={0.6}
            mouseInteractive={false}
          />
        </div>
      </div>

      <main className="relative z-10 mx-auto max-w-[680px] px-5 pb-32 pt-40 sm:px-8 sm:pt-48">

        {/* Emblem + heading */}
        <Reveal>
          <Emblem />

          <h1
            className="mt-8 text-center text-3xl font-medium leading-tight tracking-tight sm:text-[2.8rem]"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.45) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {locale === "fr" ? "Vends ta musique" : "Sell your music"}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-center text-[15px] leading-relaxed text-white/40 sm:text-[16px]">
            {locale === "fr"
              ? "Marketplace sécurisée et paiement Stripe conforme PCI, pensés pour les producteurs."
              : "Secure marketplace and PCI-compliant Stripe checkout built for producers."}
          </p>

          <div className="mt-8 flex justify-center">
            <a
              href="https://vvault.app/signup"
              className="inline-flex items-center rounded-2xl bg-white px-6 py-2.5 text-[14px] font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90"
            >
              {locale === "fr" ? "Commencer" : "Get started"}
            </a>
          </div>
        </Reveal>

        {/* Section 1: Revenue Dashboard */}
        <Reveal className="mt-40 sm:mt-52">
          <h2 className="text-center text-xl font-medium text-white sm:text-2xl">
            {locale === "fr" ? "Tes revenus en un coup d'oeil" : "Your revenue at a glance"}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
            {locale === "fr"
              ? "Suis ton chiffre d'affaires total, tes gains nets après frais, et le volume de commandes mensuelles — le tout connecté directement à ton compte Stripe."
              : "Track total revenue, net earnings after fees, and monthly order volume — all connected directly to your Stripe account."}
          </p>
          <div className="mt-8 sm:mt-10">
            <MockRevenueDashboardCard />
          </div>
        </Reveal>

        {/* Section 2: License Types */}
        <Reveal className="mt-24 sm:mt-32">
          <h2 className="text-center text-xl font-medium text-white sm:text-2xl">
            {locale === "fr" ? "Des licences flexibles" : "Flexible license tiers"}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
            {locale === "fr"
              ? "Propose des licences Basic, Premium, Stems, Exclusive, Unlimited et Sound Kit avec des prix personnalisés. Les acheteurs choisissent leur tier au checkout et reçoivent les bons fichiers automatiquement."
              : "Offer Basic, Premium, Stems, Exclusive, Unlimited, and Sound Kit licenses with custom pricing. Buyers pick their tier at checkout and receive the correct files automatically."}
          </p>
          <div className="mt-8 sm:mt-10">
            <MockLicenseTypesCard />
          </div>
        </Reveal>

        {/* Section 3: Revenue by License */}
        <Reveal className="mt-24 sm:mt-32">
          <h2 className="text-center text-xl font-medium text-white sm:text-2xl">
            {locale === "fr" ? "Comprends tes revenus" : "Understand your revenue"}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
            {locale === "fr"
              ? "Vois quels types de licences génèrent le plus de revenus. Utilise le détail pour optimiser ta stratégie de prix et maximiser tes gains."
              : "See which license types drive the most income. Use the breakdown to optimize your pricing strategy and maximize earnings."}
          </p>
          <div className="mt-8 sm:mt-10">
            <MockRevenueByLicenseCard />
          </div>
        </Reveal>

        {/* Section 4: Why it matters */}
        <Reveal className="mt-24 sm:mt-32">
          <h2 className="text-center text-xl font-medium text-white sm:text-2xl">
            {locale === "fr" ? "Pourquoi c'est important" : "Why it matters"}
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              {
                title: locale === "fr" ? "Intégration Stripe" : "Stripe integration",
                desc: locale === "fr"
                  ? "Paiements propulsés par Stripe. Accepte les cartes, Apple Pay, Google Pay en toute conformité PCI. Versements après 7 jours."
                  : "Payments powered by Stripe. Accept cards, Apple Pay, Google Pay with full PCI compliance. Payouts after a 7-day hold.",
              },
              {
                title: locale === "fr" ? "Licences flexibles" : "License flexibility",
                desc: locale === "fr"
                  ? "Basic, Premium, Stems, Exclusive. Chaque tier livre les bons formats de fichiers automatiquement au checkout."
                  : "Basic, Premium, Stems, Exclusive. Each tier delivers the right file formats automatically at checkout.",
              },
              {
                title: locale === "fr" ? "5% Pro / 0% Ultra" : "5% Pro / 0% Ultra fees",
                desc: locale === "fr"
                  ? "Les vendeurs Pro paient 5% par vente. Ultra paie 0% de commission. Les deux ne paient que les frais Stripe."
                  : "Pro sellers pay 5% per sale. Ultra pays 0% platform commission. Both only pay Stripe processing fees.",
              },
              {
                title: locale === "fr" ? "Versements via Stripe" : "Stripe-powered payouts",
                desc: locale === "fr"
                  ? "Les gains sont versés via Stripe avec un délai de 7 jours. Support multi-devises pour EUR, USD et GBP."
                  : "Earnings are paid out via Stripe with a 7-day hold. Multi-currency support for EUR, USD, and GBP.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl px-5 py-5 transition-colors duration-200 hover:bg-white/[0.02]"
                style={{
                  border: "1px solid rgba(255,255,255,0.04)",
                  background: "rgba(255,255,255,0.01)",
                }}
              >
                <p className="text-[14px] font-semibold text-white/80">
                  {item.title}
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-white/35">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Final CTA */}
        <Reveal className="mt-28 sm:mt-36">
          <div className="text-center">
            <h2 className="text-2xl font-medium text-white sm:text-3xl">
              {locale === "fr" ? "Commence à vendre ta musique" : "Start selling your music"}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
              {locale === "fr"
                ? "Inscris-toi gratuitement et connecte ton compte Stripe en quelques minutes."
                : "Sign up for free and connect your Stripe account in minutes."}
            </p>
            <div className="mt-6 flex justify-center">
              <a
                href="https://vvault.app/signup"
                className="inline-flex items-center rounded-2xl bg-white px-6 py-2.5 text-[14px] font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90"
              >
                {locale === "fr" ? "Commencer gratuitement" : "Start for free"}
              </a>
            </div>
          </div>
        </Reveal>
      </main>

      <LandingFooter
        locale={locale}
        content={content}
        showColumns={false}
        inlineLegalWithBrand
      />
    </div>
  );
}
