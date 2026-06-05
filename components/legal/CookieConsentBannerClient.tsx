"use client";

import dynamic from "next/dynamic";

/* The cookie consent banner is a ~420-line client overlay that isn't part of
   the first paint. Loading it with ssr:false keeps it out of the homepage's
   first-load JS bundle — it streams in on the client right after hydration,
   so the loading bar finishes on the page content, not the consent UI. */
const CookieConsentBanner = dynamic(
  () => import("@/components/legal/CookieConsentBanner"),
  { ssr: false },
);

export default function CookieConsentBannerClient() {
  return <CookieConsentBanner />;
}
