import type { Metadata } from "next";
import { TournamentContent } from "@/components/tournament/TournamentContent";
import { loadFeaturedSlug, loadTournamentState } from "@/lib/tournament/loadState";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "VVault Tournament",
  description:
    "1,000 producers. One winner. Submit your best track and let the community pick the champion.",
  openGraph: {
    title: "VVault Tournament",
    description:
      "1,000 producers. One winner. Submit your best track and let the community pick the champion.",
  },
};

export default async function TournamentPage() {
  const slug = await loadFeaturedSlug();
  const state = slug ? await loadTournamentState(slug) : null;
  return <TournamentContent initialState={state} locale="en" />;
}
