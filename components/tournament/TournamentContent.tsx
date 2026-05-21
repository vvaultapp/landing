"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TournamentState } from "@/lib/tournament/types";
import type { Locale } from "@/lib/useLocale";
import { getTournamentCopy } from "./copy";
import { PhaseHeader } from "./PhaseHeader";
import { SubmissionPhase } from "./SubmissionPhase";
import { QualificationPhase } from "./QualificationPhase";
import { RoundPhase } from "./RoundPhase";
import { ChampionReveal } from "./ChampionReveal";
import { ComingSoon } from "./ComingSoon";

type Props = {
  initialState: TournamentState | null;
  locale?: Locale;
  /* When set, /api/tournament/[slug] is polled. Otherwise /api/tournament/current. */
  slug?: string;
};

const POLL_INTERVAL_MS = 5_000;

export function TournamentContent({ initialState, locale = "en", slug }: Props) {
  const [state, setState] = useState<TournamentState | null>(initialState);
  const [votedIds, setVotedIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = window.localStorage.getItem(votedStorageKey(initialState?.tournament.slug));
      if (!raw) return new Set();
      const arr = JSON.parse(raw);
      return new Set(Array.isArray(arr) ? arr : []);
    } catch {
      return new Set();
    }
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const refresh = useCallback(async () => {
    const target = slug ?? state?.tournament.slug;
    const url = slug
      ? `/api/tournament/${slug}`
      : target
        ? `/api/tournament/${target}`
        : `/api/tournament/current`;
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json();
      const next = (json?.state ?? null) as TournamentState | null;
      if (next) setState(next);
    } catch {
      // network blips are fine; the next tick will retry.
    }
  }, [slug, state?.tournament.slug]);

  useEffect(() => {
    const id = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  // Persist votedIds locally for instant UI feedback across reloads.
  useEffect(() => {
    if (typeof window === "undefined" || !state) return;
    try {
      window.localStorage.setItem(
        votedStorageKey(state.tournament.slug),
        JSON.stringify(Array.from(votedIds)),
      );
    } catch {}
  }, [votedIds, state]);

  const copy = getTournamentCopy(locale);

  if (!state) {
    return (
      <div className="landing-root min-h-screen bg-black text-white">
        <ComingSoon copy={copy} />
      </div>
    );
  }

  const { tournament, currentPhase } = state;

  const onQualVoted = (participantId: string, newVotes: number | null) => {
    setVotedIds((prev) => {
      const next = new Set(prev);
      next.add(`qual:${participantId}`);
      return next;
    });
    if (newVotes != null) {
      setState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          participants: prev.participants.map((p) =>
            p.id === participantId ? { ...p, votes: newVotes } : p,
          ),
        };
      });
    }
  };

  const onMatchVoted = (
    matchId: string,
    votesA: number | null,
    votesB: number | null,
    _participantId: string,
  ) => {
    setVotedIds((prev) => {
      const next = new Set(prev);
      next.add(`match:${matchId}`);
      return next;
    });
    setState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        matches: prev.matches.map((m) =>
          m.id === matchId
            ? {
                ...m,
                votes_a: votesA ?? m.votes_a,
                votes_b: votesB ?? m.votes_b,
              }
            : m,
        ),
      };
    });
  };

  const qualVotedIds = new Set<string>();
  const matchVotedIds = new Set<string>();
  for (const v of votedIds) {
    if (v.startsWith("qual:")) qualVotedIds.add(v.slice(5));
    else if (v.startsWith("match:")) matchVotedIds.add(v.slice(6));
  }

  return (
    <div className="landing-root min-h-screen bg-black text-white">
      <PhaseHeader
        title={tournament.title}
        phase={currentPhase}
        copy={copy}
        locale={locale}
      />

      {tournament.status === "complete" ? (
        <ChampionReveal state={state} copy={copy} locale={locale} />
      ) : currentPhase?.kind === "submission" ? (
        <SubmissionPhase state={state} copy={copy} />
      ) : currentPhase?.kind === "qualification" ? (
        <QualificationPhase
          state={state}
          copy={copy}
          votedIds={qualVotedIds}
          onVoted={onQualVoted}
        />
      ) : currentPhase?.kind === "round" ? (
        <RoundPhase
          state={state}
          copy={copy}
          locale={locale}
          votedIds={matchVotedIds}
          onVoted={onMatchVoted}
        />
      ) : (
        <ComingSoon copy={copy} />
      )}
    </div>
  );
}

function votedStorageKey(slug: string | undefined): string {
  return `vv-tournament-voted:${slug ?? "default"}`;
}
