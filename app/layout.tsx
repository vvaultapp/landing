import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { cookies } from "next/headers";
import { ScrollToTop } from "@/components/ScrollToTop";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  /* 4 weights cover the whole site (400 body, 500 medium, 600 semibold,
     700 bold). Dropped 800 — it was used in exactly one place and has
     been rolled to 700, saving an extra font file on every page load. */
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "vvault | Send, Sell & Track Your Beats",
  description:
    "The beat selling platform for producers. Upload beats, send to labels & artists, track opens and plays, run campaigns, and sell with instant checkout.",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("vvault_locale")?.value;
  const lang = localeCookie === "fr" ? "fr" : "en";

  return (
    <html lang={lang} className={`h-full ${geist.variable}`}>
      <head>
        {/* Preconnect hints shave ~100-300ms off first-byte for the
            third-party assets used on landing pages. DNS resolution +
            TLS handshake start during the initial HTML parse instead
            of waiting until the first fetch. */}
        <link rel="preconnect" href="https://img.youtube.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://i.ytimg.com" />
        <link rel="preconnect" href="https://va.vercel-scripts.com" crossOrigin="anonymous" />
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
                  price: "7.49",
                  priceCurrency: "EUR",
                  priceSpecification: {
                    "@type": "UnitPriceSpecification",
                    billingDuration: "P1M",
                  },
                  name: "Pro",
                },
                {
                  "@type": "Offer",
                  price: "20.75",
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
      <body className="min-h-full bg-black text-[#f0f0f0] font-sans">
        <ScrollToTop />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
