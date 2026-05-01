import { FeaturePageSkeleton } from "@/components/landing/FeaturePageSkeleton";

/* Matches the rose (#f43f5e) emblem accent used on the real
   /features/opportunities page (the inbox-style request board). */
export default function Loading() {
  return <FeaturePageSkeleton accent="rgba(244, 63, 94, 0.18)" />;
}
