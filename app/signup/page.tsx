import type { Metadata } from "next";
import { EnSignupPage } from "@/components/landing/EnSignupPage";

export const metadata: Metadata = {
  title: "vvault | Create a free account",
  description:
    "Create your free vvault account to send beats with a pro link and track who is really listening.",
  alternates: {
    languages: {
      en: "/signup",
      fr: "/fr/signup",
    },
  },
};

export default function SignupPageEn() {
  return <EnSignupPage />;
}
