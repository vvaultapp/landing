import { FeaturePageSkeleton } from "@/components/landing/FeaturePageSkeleton";

/* Matches the violet (#8b5cf6) emblem accent used on the real
   /features/campaigns page so the skeleton-to-content swap is a
   crossfade, not a color change. */
export default function Loading() {
  return <FeaturePageSkeleton accent="rgba(139, 92, 246, 0.18)" />;
}
