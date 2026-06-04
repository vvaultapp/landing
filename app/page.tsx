import type { Metadata } from "next";
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
