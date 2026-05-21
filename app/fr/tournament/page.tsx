import type { Metadata } from "next";
import { TournamentContent } from "@/components/tournament/TournamentContent";
import { loadFeaturedSlug, loadTournamentState } from "@/lib/tournament/loadState";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "VVault Tournament",
  description:
    "1 000 producteurs. Un seul gagnant. Soumets ton meilleur morceau et laisse la communauté élire le champion.",
};

export default async function TournamentPageFr() {
  const slug = await loadFeaturedSlug();
  const state = slug ? await loadTournamentState(slug) : null;
  return <TournamentContent initialState={state} locale="fr" />;
}
