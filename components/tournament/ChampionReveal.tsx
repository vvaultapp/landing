"use client";

import { useMemo } from "react";
import { TrackEmbedCard } from "./TrackEmbedCard";
import { BracketView } from "./BracketView";
import { BracketShowcase } from "./BracketShowcase";
import type { ParticipantWithVotes, TournamentState } from "@/lib/tournament/types";
import type { Locale } from "@/lib/useLocale";
import type { TournamentCopy } from "./copy";

export function ChampionReveal({
  state,
  copy,
  locale,
}: {
  state: TournamentState;
  copy: TournamentCopy;
  locale: Locale;
}) {
  const champion = useMemo(() => {
    const finalMatch = state.matches
      .filter((m) => m.winner_id)
      .sort((a, b) => b.round_number - a.round_number)[0];
    if (!finalMatch) return null;
    return state.participants.find((p) => p.id === finalMatch.winner_id) ?? null;
  }, [state]);

  const topRanked = useMemo<ParticipantWithVotes[]>(() => {
    return state.participants
      .slice()
      .sort(
        (a, b) => b.votes - a.votes || a.submitted_at.localeCompare(b.submitted_at),
      )
      .slice(0, 16);
  }, [state.participants]);

  if (!champion) return null;

  return (
    <section className="relative mx-auto w-full max-w-[1200px] px-5 pt-[96px] pb-24 sm:px-8 sm:pt-[88px]">
      <BracketShowcase ranked={topRanked} />

      <div className="mx-auto mt-10 max-w-[680px]">
        <TrackEmbedCard participant={{ ...champion, votes: 0 }} emphasis="a" />

        <div className="mt-8 text-center">
          <a
            href={copy.champion.ctaHref}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-semibold text-black transition hover:bg-white/90"
          >
            {copy.champion.cta}
            <span aria-hidden>→</span>
          </a>
        </div>

        <details className="group mt-12 overflow-hidden rounded-[22px] border border-white/[0.07] bg-white/[0.02] sm:rounded-[26px]">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-[14px] font-medium text-white sm:px-6 sm:py-5">
            <span>Full bracket</span>
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
      </div>
    </section>
  );
}
