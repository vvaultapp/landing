"use client";

import { useTransition } from "react";

type Props = {
  slug: string;
  participantId: string;
  matchId?: string;
  voted: boolean;
  onVoted: (result: VoteResult) => void;
  label: string;
  votedLabel: string;
  className?: string;
};

export type VoteResult = {
  matchId?: string;
  participantId: string;
  votesA?: number | null;
  votesB?: number | null;
  qualificationVotes?: number | null;
};

export function VoteButton({
  slug,
  participantId,
  matchId,
  voted,
  onVoted,
  label,
  votedLabel,
  className,
}: Props) {
  const [pending, start] = useTransition();

  function submit() {
    start(async () => {
      try {
        const res = await fetch(`/api/tournament/${slug}/vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ participant_id: participantId, match_id: matchId }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          alert(json.error || "Could not vote.");
          return;
        }
        onVoted({
          matchId,
          participantId,
          votesA: json.votes_a,
          votesB: json.votes_b,
          qualificationVotes: json.qualification_votes,
        });
      } catch {
        alert("Network error.");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={submit}
      disabled={pending || voted}
      className={
        className ??
        `rounded-full px-4 py-2 text-[12.5px] font-semibold transition ${
          voted
            ? "bg-sky-400/10 text-sky-300"
            : "bg-white text-black hover:bg-white/90 disabled:opacity-50"
        }`
      }
    >
      {voted ? votedLabel : pending ? "…" : label}
    </button>
  );
}
