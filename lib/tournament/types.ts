export type TournamentStatus = "draft" | "live" | "complete";
export type PhaseKind = "submission" | "qualification" | "round";
export type PhaseStatus = "pending" | "active" | "complete";
export type MatchStatus = "pending" | "active" | "complete";

export type Tournament = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: TournamentStatus;
  has_qualification: boolean;
  max_participants: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

export type TournamentPhase = {
  id: string;
  tournament_id: string;
  kind: PhaseKind;
  round_number: number | null;
  status: PhaseStatus;
  starts_at: string | null;
  ends_at: string | null;
  auto_advance: boolean;
  voting_duration_seconds: number | null;
};

export type Participant = {
  id: string;
  tournament_id: string;
  user_id: string;
  vvault_username: string | null;
  track_url: string;
  track_slug: string;
  track_title: string | null;
  track_artwork_url: string | null;
  submitted_at: string;
  qualified: boolean;
  eliminated_in_round: number | null;
};

export type Match = {
  id: string;
  tournament_id: string;
  round_number: number;
  slot: number;
  participant_a: string | null;
  participant_b: string | null;
  winner_id: string | null;
  votes_a: number;
  votes_b: number;
  status: MatchStatus;
};

export type ParticipantWithVotes = Participant & {
  votes: number;
  profile_picture: string | null;
  profile_name: string | null;
};

export type TournamentState = {
  tournament: Tournament;
  phases: TournamentPhase[];
  currentPhase: TournamentPhase | null;
  participantsCount: number;
  participants: ParticipantWithVotes[];
  matches: Match[];
};

export const TOTAL_ROUNDS_FROM_16 = 4;

export function roundLabel(roundNumber: number, locale: "en" | "fr" = "en"): string {
  const en = ["Round of 16", "Quarterfinals", "Semifinals", "Final"];
  const fr = ["Huitièmes", "Quarts", "Demi-finales", "Finale"];
  const labels = locale === "fr" ? fr : en;
  return labels[roundNumber - 1] ?? `Round ${roundNumber}`;
}

export function phaseLabel(
  phase: { kind: PhaseKind; round_number: number | null },
  locale: "en" | "fr" = "en",
): string {
  if (phase.kind === "submission") return locale === "fr" ? "Soumissions" : "Submissions";
  if (phase.kind === "qualification") return locale === "fr" ? "Qualifications" : "Qualification";
  return roundLabel(phase.round_number ?? 1, locale);
}
