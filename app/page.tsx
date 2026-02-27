import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "Integrity | Revenue Operating System",
};

export default function Homepage() {
  return <LandingPage />;
}
