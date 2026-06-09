import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { cookies, headers } from "next/headers";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AppStoreBanner } from "@/components/landing/AppStoreBanner";
import { ClickTracker } from "@/components/ClickTracker";
import PinnedQuickMenuClient from "@/components/landing/PinnedQuickMenuClient";
import { LocaleProvider } from "@/components/LocaleProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  /* 400 body, 500 medium, 600 semibold, 700 bold, 900 black. 900 is
     used only by the /features/studio hero "STUDIO" wordmark — it's
     loaded once site-wide and preloaded by next/font, so the studio
     hero doesn't need to wait for a font fetch on first paint. */
  weight: ["400", "500", "600", "700", "900"],
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("vvault_locale")?.value;
  let lang: "en" | "fr";
  if (localeCookie === "fr" || localeCookie === "en") {
    lang = localeCookie;
  } else {
    // No cookie yet (first visit / deep link) — seed from the device's primary
    // language, the same rule the proxy uses, so the first paint already
    // matches and there's no flash of the wrong language.
    const accept = (await headers()).get("accept-language") || "";
    const primary = accept.split(",")[0]?.trim().split(";")[0]?.trim().toLowerCase();
    lang = primary?.startsWith("fr") ? "fr" : "en";
  }

  return (
    <html lang={lang} suppressHydrationWarning className={`h-full ${geist.variable}`}>
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
        {/* Preconnect hints shave ~100-300ms off first-byte for the
            third-party assets used on landing pages. DNS resolution +
            TLS handshake start during the initial HTML parse instead
            of waiting until the first fetch. */}
        <link rel="preconnect" href="https://img.youtube.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://i.ytimg.com" />
        <link rel="preconnect" href="https://va.vercel-scripts.com" crossOrigin="anonymous" />
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
        <ClickTracker locale={lang} />
        {/* Global language provider — seeds the site language from the cookie
            on the server so every page renders the right language on first
            paint (no flash), and keeps cookie + localStorage in sync. */}
        <ThemeProvider>
        <LocaleProvider initialLocale={lang}>
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
