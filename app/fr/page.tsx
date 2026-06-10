import type { Metadata } from "next";

/* ISR: serve cached static HTML from the CDN, refresh every 10 min
   (hero user-count + avatars re-resolve at revalidate time). */
export const revalidate = 600;
import { LandingPageNew } from "@/components/landing/LandingPageNew";

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
  return <LandingPageNew locale="fr" />;
}
