import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "vvault | La bonne façon d'envoyer ta musique",
  alternates: {
    languages: {
      en: "/",
      fr: "/fr",
    },
  },
};

export default function HomepageFr() {
  return <LandingPage locale="fr" />;
}
