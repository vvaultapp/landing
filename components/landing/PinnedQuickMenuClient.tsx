"use client";

import dynamic from "next/dynamic";

/* The pinned bottom-right App Store + quick-nav menu is a client overlay that
   isn't needed for first paint. Loading it with ssr:false keeps it out of the
   first-load JS bundle — it mounts on the client just after hydration. It still
   self-excludes on /docs and /admin via the pathname check inside it. */
const PinnedQuickMenu = dynamic(
  () => import("@/components/landing/PinnedQuickMenu").then((m) => m.PinnedQuickMenu),
  { ssr: false },
);

export default function PinnedQuickMenuClient() {
  return <PinnedQuickMenu />;
}
