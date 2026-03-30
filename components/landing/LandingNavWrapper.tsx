"use client";

import { LandingNav } from "@/components/landing/LandingNav";
import { getLandingContent } from "@/components/landing/content";

export function LandingNavWrapper() {
  const content = getLandingContent("en");
  return <LandingNav locale="en" content={content} showPrimaryLinks={true} />;
}
