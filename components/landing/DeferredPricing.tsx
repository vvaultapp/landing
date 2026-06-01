"use client";

import dynamic from "next/dynamic";
import type { Locale } from "@/components/landing/content";

/**
 * Client wrapper that defers the heavy embedded pricing page (plans toggle +
 * Trustpilot + Wins wall) out of the homepage's critical first load. Lives in
 * its own tiny client island so the rest of the page can stay a Server
 * Component. The min-height placeholder reserves layout space.
 */
const PricingPage = dynamic(() => import("@/app/pricing/Content"), {
  ssr: false,
  loading: () => <div className="min-h-[1200px]" aria-hidden="true" />,
});

export function DeferredPricing({ locale }: { locale: Locale }) {
  return <PricingPage locale={locale} embedded />;
}
