"use client";

import { useMemo, useState } from "react";
import { TrackEmbedCard } from "./TrackEmbedCard";
import { VoteButton } from "./VoteButton";
import { BracketView } from "./BracketView";
import { BracketShowcase } from "./BracketShowcase";
import type { Match, ParticipantWithVotes, TournamentState } from "@/lib/tournament/types";
import type { TournamentCopy } from "./copy";
import type { Locale } from "@/lib/useLocale";

type Props = {
  state: TournamentState;
  copy: TournamentCopy;
  locale: Locale;
  votedIds: Set<string>;
  onVoted: (
    matchId: string,
    votesA: number | null,
    votesB: number | null,
    participantId: string,
  ) => void;
};

export function RoundPhase({ state, copy, locale, votedIds, onVoted }: Props) {
  const phase = state.currentPhase;
  const round = phase?.round_number ?? 1;
  const matches = useMemo<Match[]>(
    () => state.matches.filter((m) => m.round_number === round),
    [state.matches, round],
  );

  const [focusedIndex, setFocusedIndex] = useState(0);
  const focused = matches[focusedIndex];
  const a =
    focused?.participant_a
      ? state.participants.find((p) => p.id === focused.participant_a) ?? null
      : null;
  const b =
    focused?.participant_b
      ? state.participants.find((p) => p.id === focused.participant_b) ?? null
      : null;

  const topRanked = useMemo<ParticipantWithVotes[]>(() => {
    return state.participants
      .slice()
      .sort(
        (a, b) => b.votes - a.votes || a.submitted_at.localeCompare(b.submitted_at),
      )
      .slice(0, 16);
  }, [state.participants]);

  return (
    <section className="mx-auto w-full max-w-[1200px] px-5 pt-[96px] pb-20 sm:px-8 sm:pt-[88px]">
      <BracketShowcase ranked={topRanked} />

      {matches.length === 0 ? (
        <p className="mt-12 rounded-[22px] border border-dashed border-white/10 px-6 py-12 text-center text-[14px] text-white/45">
          No matches in this round yet.
        </p>
      ) : (
        <>
          <div className="mt-10 flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setFocusedIndex((i) => (i - 1 + matches.length) % matches.length)
              }
              disabled={matches.length < 2}
              aria-label="Previous match"
              className="grid h-9 w-9 place-items-center rounded-full border border-white/[0.1] bg-white/[0.025] text-white/85 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-30"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                <path d="m15 6-6 6 6 6V6z" />
              </svg>
            </button>
            <span className="text-[13px] tabular-nums text-white/65">
              Match {focusedIndex + 1} / {matches.length}
            </span>
            <button
              type="button"
              onClick={() => setFocusedIndex((i) => (i + 1) % matches.length)}
              disabled={matches.length < 2}
              aria-label="Next match"
              className="grid h-9 w-9 place-items-center rounded-full border border-white/[0.1] bg-white/[0.025] text-white/85 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-30"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                <path d="m9 6 6 6-6 6V6z" />
              </svg>
            </button>
          </div>

          {focused && a && b ? (
            <MatchPanel
              slug={state.tournament.slug}
              matchId={focused.id}
              a={a}
              b={b}
              votesA={focused.votes_a}
              votesB={focused.votes_b}
              voted={votedIds.has(focused.id)}
              voteCta={copy.round.voteCta}
              votedCta={copy.round.votedCta}
              onVoted={onVoted}
            />
          ) : null}
        </>
      )}

      <details className="group mt-12 overflow-hidden rounded-[22px] border border-white/[0.07] bg-white/[0.02] sm:rounded-[26px]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-[14px] font-medium text-white sm:px-6 sm:py-5">
          <span>{copy.round.bracketCta}</span>
          <span className="text-white/45 transition-transform duration-300 group-open:rotate-180">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </span>
        </summary>
        <div className="overflow-x-auto border-t border-white/[0.06] px-5 py-5 sm:px-6 sm:py-6">
          <BracketView state={state} locale={locale} />
        </div>
      </details>
    </section>
  );
}

function MatchPanel({
  slug,
  matchId,
  a,
  b,
  votesA,
  votesB,
  voted,
  voteCta,
  votedCta,
  onVoted,
}: {
  slug: string;
  matchId: string;
  a: ParticipantWithVotes;
  b: ParticipantWithVotes;
  votesA: number;
  votesB: number;
  voted: boolean;
  voteCta: string;
  votedCta: string;
  onVoted: (
    matchId: string,
    votesA: number | null,
    votesB: number | null,
    participantId: string,
  ) => void;
}) {
  const total = votesA + votesB;
  const pctA = total > 0 ? Math.round((votesA / total) * 100) : 50;
  const pctB = 100 - pctA;
  return (
    <div className="relative mt-6">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 sm:block"
      >
        <div className="grid h-12 w-12 place-items-center rounded-full border border-white/[0.15] bg-black text-[11px] font-bold uppercase tracking-[0.16em] text-white/85 shadow-[0_10px_28px_-8px_rgba(0,0,0,0.7)]">
          VS
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
        <MatchSide
          side="a"
          participant={{ ...a, votes: votesA }}
          pct={pctA}
          totalVotes={total}
          voteCta={voteCta}
          votedCta={votedCta}
          voted={voted}
          slug={slug}
          matchId={matchId}
          onVoted={(r) =>
            onVoted(matchId, r.votesA ?? null, r.votesB ?? null, a.id)
          }
        />
        <MatchSide
          side="b"
          participant={{ ...b, votes: votesB }}
          pct={pctB}
          totalVotes={total}
          voteCta={voteCta}
          votedCta={votedCta}
          voted={voted}
          slug={slug}
          matchId={matchId}
          onVoted={(r) =>
            onVoted(matchId, r.votesA ?? null, r.votesB ?? null, b.id)
          }
        />
      </div>
    </div>
  );
}

function MatchSide({
  side,
  participant,
  pct,
  totalVotes,
  voteCta,
  votedCta,
  voted,
  slug,
  matchId,
  onVoted,
}: {
  side: "a" | "b";
  participant: ParticipantWithVotes;
  pct: number;
  totalVotes: number;
  voteCta: string;
  votedCta: string;
  voted: boolean;
  slug: string;
  matchId: string;
  onVoted: (r: {
    matchId?: string;
    participantId: string;
    votesA?: number | null;
    votesB?: number | null;
  }) => void;
}) {
  return (
    <TrackEmbedCard
      participant={participant}
      showVotes={false}
      emphasis={side}
      actionSlot={
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[12px] text-white/65">
            <span className="tabular-nums">
              {participant.votes} {participant.votes === 1 ? "vote" : "votes"}
            </span>
            <span className="font-semibold tabular-nums text-white/85">
              {totalVotes > 0 ? `${pct}%` : "—"}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className={`h-full rounded-full ${
                side === "a"
                  ? "bg-gradient-to-r from-sky-400 to-cyan-300"
                  : "bg-gradient-to-r from-fuchsia-400 to-pink-300"
              }`}
              style={{ width: totalVotes > 0 ? `${pct}%` : "0%" }}
            />
          </div>
          <VoteButton
            slug={slug}
            participantId={participant.id}
            matchId={matchId}
            voted={voted}
            label={voteCta}
            votedLabel={votedCta}
            onVoted={onVoted}
            className={`mt-1 w-full rounded-full px-4 py-2.5 text-[13px] font-semibold transition ${
              voted
                ? "bg-white/[0.06] text-white/65"
                : side === "a"
                  ? "bg-sky-400 text-black hover:bg-sky-300"
                  : "bg-fuchsia-400 text-black hover:bg-fuchsia-300"
            }`}
          />
        </div>
      }
    />
  );
}
