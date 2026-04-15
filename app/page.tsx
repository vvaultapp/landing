import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "vvault | Send, Sell & Track Your Beats",
  description:
    "The all-in-one beat selling platform for producers. Upload, send beats to labels & artists, track engagement, run email campaigns, and sell online.",
  alternates: {
    languages: {
      en: "/",
      fr: "/fr",
    },
  },
};

export default function Homepage() {
  return <LandingPage locale="en" />;
}
