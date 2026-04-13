import type { Metadata } from "next";
import { FrSignupPage } from "@/components/landing/FrSignupPage";

export const metadata: Metadata = {
  title: "Inscription Gratuite — Vends tes Beats | vvault",
  description:
    "Crée ton compte vvault gratuit. Envoie tes prods aux labels et artistes, suis les écoutes en temps réel et commence à vendre en quelques minutes.",
  alternates: {
    languages: {
      en: "/",
      fr: "/fr/signup",
    },
  },
};

export default function SignupPageFr() {
  return <FrSignupPage />;
}
