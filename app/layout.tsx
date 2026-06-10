import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AppStoreBanner } from "@/components/landing/AppStoreBanner";
import { ClickTracker } from "@/components/ClickTracker";
import PinnedQuickMenuClient from "@/components/landing/PinnedQuickMenuClient";
import { LocaleProvider } from "@/components/LocaleProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  /* No weight array — Geist is a variable font, so this ships ONE woff2
     covering 100-900 (incl. the 900 used by the STUDIO wordmark) instead
     of five separately-preloaded static files. */
  display: "swap",
  variable: "--font-geist",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://get.vvault.app"),
  title: "vvault | Send, Sell & Track Your Beats",
  description:
    "The beat selling platform for producers. Upload beats, send to labels & artists, track opens and plays, run campaigns, and sell with instant checkout.",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "vvault",
    title: "vvault | Send, Sell & Track Your Beats",
    description:
      "The beat selling platform for producers. Upload beats, send to labels & artists, track opens and plays, run campaigns, and sell with instant checkout.",
    url: "https://get.vvault.app",
    images: [
      {
        url: "/vvault-iOS-Default-1024x1024@1x.png",
        width: 1024,
        height: 1024,
        alt: "vvault",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "vvault | Send, Sell & Track Your Beats",
    description:
      "The beat selling platform for producers. Upload beats, send to labels & artists, track opens and plays, run campaigns, and sell with instant checkout.",
    images: ["/vvault-iOS-Default-1024x1024@1x.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /* lang is hardcoded — reading the locale cookie / accept-language here
     (the old behaviour) forced EVERY page into per-request dynamic
     rendering, so nothing was ever CDN-cached. The proxy already routes
     French visitors to /fr at the edge, so non-/fr routes are always EN;
     /fr corrects documentElement.lang via a tiny inline script in its own
     layout. */
  return (
    <html lang="en" suppressHydrationWarning className={`h-full ${geist.variable}`}>
      <head>
        {/* Set the theme class before first paint so there's no flash of the
            wrong theme — device-based (prefers-color-scheme) unless the visitor
            has explicitly chosen one. Default markup is dark; this adds
            `light` when appropriate. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var m=localStorage.getItem('vvault-theme');var d=m==='dark'?true:m==='light'?false:matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('light',!d);}catch(e){}})();",
          }}
        />
        {/* Preconnect hints — avatar hosts only. Each preconnect costs a
            DNS+TLS handshake competing with the critical path, so we only
            warm origins actually fetched soon after load: YouTube thumbs
            live inside the lazy nav dropdown (dns-prefetch is enough), and
            Vercel Analytics loads same-origin in production. */}
        <link rel="dns-prefetch" href="https://i.ytimg.com" />
        {/* Warm the DNS+TLS to the avatar hosts so the (deferred, post-load)
            profile pictures resolve fast — shortens the loading tail. */}
        {process.env.NEXT_PUBLIC_SUPABASE_URL ? (
          <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} crossOrigin="anonymous" />
        ) : null}
        <link rel="preconnect" href="https://lh3.googleusercontent.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "vvault",
              url: "https://get.vvault.app",
              applicationCategory: "MusicApplication",
              operatingSystem: "Web, iOS",
              description:
                "vvault is the professional workspace for music producers, artists, managers and labels to organize, send, and track music with opens, plays, downloads, saves and purchase tracking.",
              offers: [
                {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "EUR",
                  name: "Free",
                },
                {
                  "@type": "Offer",
                  price: "11.99",
                  priceCurrency: "EUR",
                  priceSpecification: {
                    "@type": "UnitPriceSpecification",
                    billingDuration: "P1M",
                  },
                  name: "Pro",
                },
                {
                  "@type": "Offer",
                  price: "27.99",
                  priceCurrency: "EUR",
                  priceSpecification: {
                    "@type": "UnitPriceSpecification",
                    billingDuration: "P1M",
                  },
                  name: "Ultra",
                },
              ],
              creator: {
                "@type": "Organization",
                name: "vvault",
                url: "https://get.vvault.app",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full bg-[rgb(var(--bg))] text-[rgb(var(--fg))] font-sans">
        <AppStoreBanner />
        <ScrollToTop />
        {/* Document-wide click tracker. Fires `trackButtonClick` for any
            click that bubbles up from an element with a `data-track-id`
            attribute. See components/ClickTracker.tsx. */}
        <ClickTracker />
        {/* Global language provider — statically seeded EN (so pages stay
            CDN-cacheable); reconciles from localStorage/cookie on mount.
            French visitors are routed to /fr at the edge by the proxy, so
            the EN seed is path-correct for every non-/fr route. */}
        <ThemeProvider>
        <LocaleProvider initialLocale="en">
          {children}
          {/* Pinned bottom-right App Store + quick-nav menu — shown on every
              landing page except /docs and /admin (self-excludes via path). */}
          <PinnedQuickMenuClient />
        </LocaleProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
