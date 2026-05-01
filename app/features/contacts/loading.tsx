import { FeaturePageSkeleton } from "@/components/landing/FeaturePageSkeleton";

/* Matches the amber (#f59e0b) emblem accent used on the real
   /features/contacts page (which also covers the Inbox flow). */
export default function Loading() {
  return <FeaturePageSkeleton accent="rgba(245, 158, 11, 0.18)" />;
}
