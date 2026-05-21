/* Single fetch that returns the full state of a tournament for a
   given slug. Used by the public /tournament page (SSR + revalidate)
   and by /api/tournament/[slug]. */

import type {
  Match,
  Participant,
  ParticipantWithVotes,
  Tournament,
  TournamentPhase,
  TournamentState,
} from "./types";
import { getServiceSupabase, isMissingTableError } from "./serverClient";

const EMPTY_FALLBACK: TournamentState | null = null;

export async function loadTournamentState(
  slug: string,
): Promise<TournamentState | null> {
  const supabase = getServiceSupabase();
  if (!supabase) return EMPTY_FALLBACK;

  const tournamentRes = await supabase
    .from("tournaments")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (tournamentRes.error) {
    if (isMissingTableError(tournamentRes.error, tournamentRes.status)) {
      return EMPTY_FALLBACK;
    }
    console.error("[tournament] loadState:", tournamentRes.error.message);
    return EMPTY_FALLBACK;
  }
  const tournament = tournamentRes.data as Tournament | null;
  if (!tournament) return EMPTY_FALLBACK;

  const [phasesRes, participantsRes, matchesRes, qualVotesRes] = await Promise.all([
    supabase
      .from("tournament_phases")
      .select("*")
      .eq("tournament_id", tournament.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("tournament_participants")
      .select("*")
      .eq("tournament_id", tournament.id)
      .order("submitted_at", { ascending: true }),
    supabase
      .from("tournament_matches")
      .select("*")
      .eq("tournament_id", tournament.id)
      .order("round_number", { ascending: true })
      .order("slot", { ascending: true }),
    supabase
      .from("tournament_qualification_counts")
      .select("participant_id, votes"),
  ]);

  const phases = (phasesRes.data ?? []) as TournamentPhase[];
  const participants = (participantsRes.data ?? []) as Participant[];
  const matches = (matchesRes.data ?? []) as Match[];

  const voteMap = new Map<string, number>();
  for (const row of (qualVotesRes.data ?? []) as Array<{
    participant_id: string;
    votes: number;
  }>) {
    voteMap.set(row.participant_id, Number(row.votes) || 0);
  }

  /* Hydrate avatar + display name from profiles. There's no FK from
     tournament_participants.user_id to profiles.id, so we fan-out the
     lookup ourselves. Missing rows just stay null. */
  const profileMap = new Map<string, { picture: string | null; name: string | null }>();
  const userIds = Array.from(new Set(participants.map((p) => p.user_id).filter(Boolean)));
  if (userIds.length > 0) {
    const profilesRes = await supabase
      .from("profiles")
      .select("id, picture, name")
      .in("id", userIds);
    for (const row of (profilesRes.data ?? []) as Array<{
      id: string;
      picture: string | null;
      name: string | null;
    }>) {
      profileMap.set(row.id, { picture: row.picture, name: row.name });
    }
  }

  const participantsWithVotes: ParticipantWithVotes[] = participants.map((p) => {
    const prof = profileMap.get(p.user_id);
    return {
      ...p,
      votes: voteMap.get(p.id) ?? 0,
      profile_picture: prof?.picture ?? null,
      profile_name: prof?.name ?? null,
    };
  });

  const currentPhase =
    phases.find((p) => p.status === "active") ??
    phases.find((p) => p.status === "pending") ??
    null;

  return {
    tournament,
    phases,
    currentPhase,
    participantsCount: participants.length,
    participants: participantsWithVotes,
    matches,
  };
}

export async function loadFeaturedSlug(): Promise<string | null> {
  const supabase = getServiceSupabase();
  if (!supabase) return null;
  const res = await supabase
    .from("tournaments")
    .select("slug")
    .eq("is_featured", true)
    .maybeSingle();
  if (res.error || !res.data) return null;
  return (res.data as { slug: string }).slug;
}
