import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "vvault | The proper way to send your music",
};

export default function Homepage() {
  return <LandingPage />;
}
