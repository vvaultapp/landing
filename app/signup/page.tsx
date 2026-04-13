import type { Metadata } from "next";
import { EnSignupPage } from "@/components/landing/EnSignupPage";

export const metadata: Metadata = {
  title: "Sign Up Free — Start Selling Beats | vvault",
  description:
    "Create your free vvault account. Upload beats, send to labels & artists with a pro link, track who listens, and start selling online in minutes.",
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
