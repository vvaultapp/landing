import { notFound } from "next/navigation";
import { TournamentContent } from "@/components/tournament/TournamentContent";
import { loadTournamentState } from "@/lib/tournament/loadState";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TournamentSlugPageFr({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const state = await loadTournamentState(slug);
  if (!state) notFound();
  return <TournamentContent initialState={state} locale="fr" slug={slug} />;
}
