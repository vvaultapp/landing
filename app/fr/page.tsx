import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "vvault | Envoie, Vends et Suis tes Prods",
  description:
    "La plateforme pour beatmakers et producteurs. Envoie tes beats aux labels et artistes, suis les écoutes, lance des campagnes et vends en ligne.",
  alternates: {
    canonical: "https://get.vvault.app/fr",
    languages: {
      en: "/",
      fr: "/fr",
    },
  },
};

export default function HomepageFr() {
  return <LandingPage locale="fr" />;
}
