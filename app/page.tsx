import type { Metadata } from "next";

/* ISR: serve cached static HTML from the CDN, refresh every 10 min
   (hero user-count + avatars re-resolve at revalidate time). */
export const revalidate = 600;
import { LandingPageNew } from "@/components/landing/LandingPageNew";

export const metadata: Metadata = {
  title: "vvault | Send, Sell & Track Your Beats",
  description:
    "The all-in-one beat selling platform for producers. Upload, send beats to labels & artists, track engagement, run email campaigns, and sell online.",
  alternates: {
    canonical: "https://get.vvault.app/",
    languages: {
      en: "/",
      fr: "/fr",
    },
  },
};

export default function Homepage() {
  return <LandingPageNew locale="en" />;
}
