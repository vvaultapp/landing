import type { Metadata } from "next";
import { LandingPageNew } from "@/components/landing/LandingPageNew";

export const metadata: Metadata = {
  title: "vvault | Le workspace musical pour producteurs (nouvelle landing)",
  description:
    "vvault remplace ton stack Gmail + Drive + Beatstars par un seul workspace. Envoie tes packs, tracke qui écoute, relance, vends — depuis un seul endroit.",
  robots: { index: false, follow: false },
};

export default function NewLandingPreviewFr() {
  return <LandingPageNew locale="fr" />;
}
