import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "VVAULT | The proper way to send your music",
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
