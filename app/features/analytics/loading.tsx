import { FeaturePageSkeleton } from "@/components/landing/FeaturePageSkeleton";

/* Streamed in by Next.js while /features/analytics's JS bundle is
   downloading and parsing. The accent matches the page's blue hero
   emblem so the swap from skeleton to real content reads as a fade
   rather than a color change. */
export default function Loading() {
  return <FeaturePageSkeleton accent="rgba(59, 130, 246, 0.18)" />;
}
