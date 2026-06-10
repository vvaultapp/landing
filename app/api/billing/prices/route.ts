// app/api/billing/prices/route.ts
//
// Public pricing for the marketing site. STATIC + CDN-cached: the response
// carries the price table for BOTH currencies under `byCurrency`, and the
// client picks EUR/USD locally from the browser timezone (the same rule the
// old geo-aware version applied server-side — see lib/billingPricesClient.ts).
// This keeps the route off the lambda path entirely: it renders at build
// time and revalidates hourly at the edge.
import { NextResponse } from "next/server";
import type { BillingCurrency } from "@/lib/billing/checkoutCurrency";

export const dynamic = "force-static";
export const revalidate = 3600;

// Live multi-currency Stripe amounts (unit_amount, in cents) as of June 2026.
// Mirrors price_…GTgSV (Pro mo), …Groea (Pro yr), …c9ZIQ (Ultra mo),
// …5RCIW (Ultra yr) with their EUR + USD currency_options.
const AMOUNTS: Record<
  "proMonthly" | "proAnnual" | "ultraMonthly" | "ultraAnnual",
  Record<BillingCurrency, number>
> = {
  proMonthly: { eur: 1199, usd: 1399 },
  proAnnual: { eur: 11900, usd: 13899 },
  ultraMonthly: { eur: 2799, usd: 3199 },
  ultraAnnual: { eur: 27900, usd: 32499 },
};

const PRICE_IDS = {
  proMonthly: "price_1Tdd9QQu8hhNTRY76diGTgSV",
  proAnnual: "price_1TddHuQu8hhNTRY7LUfGroea",
  ultraMonthly: "price_1TciVTQu8hhNTRY7hRoc9ZIQ",
  ultraAnnual: "price_1TddH7Qu8hhNTRY71ks5RCIW",
};

// First-month Pro promo: €1 in EUR, $1 in USD. The Stripe coupon (gFry2yb5)
// carries currency_options for BOTH eur (10.99 off) and usd (12.99 off), so a
// single coupon yields €1 / $1 respectively. Monthly only ("first month").
const PRO_MONTHLY_INTRO_PRICE_CENTS = 100;
const CURRENCY_SYMBOL: Record<string, string> = { eur: "€", usd: "$" };

function payloadFor(currency: BillingCurrency) {
  const view = (key: keyof typeof AMOUNTS, interval: "month" | "year") => ({
    id: PRICE_IDS[key],
    unit_amount: AMOUNTS[key][currency],
    currency,
    interval,
  });

  const proMonthly = view("proMonthly", "month");

  // Active for any supported currency (eur/usd) — the coupon discounts both.
  const introActive = proMonthly.unit_amount > PRO_MONTHLY_INTRO_PRICE_CENTS;
  const compareAt = proMonthly.unit_amount;
  const sym = CURRENCY_SYMBOL[currency] ?? "€";
  const introDisclaimer = introActive
    ? `First month ${sym}1, then ${sym}${(compareAt / 100).toFixed(2)}/mo. Cancel anytime.`
    : "";

  return {
    proMonthly,
    proAnnual: view("proAnnual", "year"),
    ultraMonthly: view("ultraMonthly", "month"),
    ultraAnnual: view("ultraAnnual", "year"),
    offers: {
      proMonthlyIntro: {
        key: "pro_monthly_intro_1",
        active: introActive,
        plan: "pro",
        interval: "month",
        currency,
        introUnitAmount: PRO_MONTHLY_INTRO_PRICE_CENTS,
        compareAtUnitAmount: introActive ? compareAt : null,
        ctaLabel: currency === "usd" ? "Upgrade for $1" : "Upgrade for 1€",
        disclaimer: introDisclaimer,
      },
    },
  };
}

export async function GET() {
  return NextResponse.json({
    byCurrency: {
      eur: payloadFor("eur"),
      usd: payloadFor("usd"),
    },
  });
}
