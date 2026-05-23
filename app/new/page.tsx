import type { Metadata } from "next";
import { LandingPageNew } from "@/components/landing/LandingPageNew";

export const metadata: Metadata = {
  title: "vvault | The music workspace for producers (new landing)",
  description:
    "vvault replaces your Gmail + Drive + Beatstars stack with one workspace. Send packs, track who listens, follow up, and sell — all from one place.",
  /* No-index this preview route so it never competes with the
     production home. Safe for side-by-side review on localhost +
     vercel preview deploys. */
  robots: { index: false, follow: false },
};

export default function NewLandingPreview() {
  return <LandingPageNew locale="en" />;
}
