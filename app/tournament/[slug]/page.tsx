import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TournamentContent } from "@/components/tournament/TournamentContent";
import { loadTournamentState } from "@/lib/tournament/loadState";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const state = await loadTournamentState(slug);
  const title = state ? `${state.tournament.title} — VVault Tournament` : "VVault Tournament";
  return { title };
}

export default async function TournamentSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const state = await loadTournamentState(slug);
  if (!state) {
    notFound();
  }
  return <TournamentContent initialState={state} locale="en" slug={slug} />;
}
