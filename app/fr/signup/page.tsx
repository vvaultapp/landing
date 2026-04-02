import type { Metadata } from "next";
import { FrSignupPage } from "@/components/landing/FrSignupPage";

export const metadata: Metadata = {
  title: "VVAULT | Créer un compte gratuit",
  description:
    "Crée ton compte vvault gratuit pour envoyer ta musique avec un lien pro et suivre qui écoute vraiment.",
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
