"use client";

import { useMemo, useState } from "react";
import { TrackEmbedCard } from "./TrackEmbedCard";
import { VoteButton } from "./VoteButton";
import { BracketShowcase } from "./BracketShowcase";
import type { TournamentState, ParticipantWithVotes } from "@/lib/tournament/types";
import type { TournamentCopy } from "./copy";

type Props = {
  state: TournamentState;
  copy: TournamentCopy;
  votedIds: Set<string>;
  onVoted: (participantId: string, newVotes: number | null) => void;
};

type SortKey = "new" | "popular" | "random";

export function QualificationPhase({ state, copy, votedIds, onVoted }: Props) {
  const [sort, setSort] = useState<SortKey>("popular");
  const [shuffleSeed] = useState(() => Math.random());

  const sorted = useMemo<ParticipantWithVotes[]>(() => {
    const list = state.participants.slice();
    if (sort === "popular") {
      list.sort(
        (a, b) => b.votes - a.votes || a.submitted_at.localeCompare(b.submitted_at),
      );
    } else if (sort === "new") {
      list.sort((a, b) => b.submitted_at.localeCompare(a.submitted_at));
    } else {
      list.sort(
        (a, b) => stableHash(a.id, shuffleSeed) - stableHash(b.id, shuffleSeed),
      );
    }
    return list;
  }, [state.participants, sort, shuffleSeed]);

  const topRanked = useMemo<ParticipantWithVotes[]>(() => {
    return state.participants
      .slice()
      .sort(
        (a, b) => b.votes - a.votes || a.submitted_at.localeCompare(b.submitted_at),
      )
      .slice(0, 16);
  }, [state.participants]);

  return (
    <section className="mx-auto w-full max-w-[1200px] px-5 pt-[96px] pb-24 sm:px-8 sm:pt-[88px]">
      <BracketShowcase ranked={topRanked} />

      <div className="mt-10 flex flex-wrap items-center gap-2">
        <SortChip current={sort} value="popular" set={setSort} label={copy.qualification.sortPopular} />
        <SortChip current={sort} value="new" set={setSort} label={copy.qualification.sortNew} />
        <SortChip current={sort} value="random" set={setSort} label={copy.qualification.sortRandom} />
      </div>

      {sorted.length === 0 ? (
        <p className="mt-12 rounded-[22px] border border-dashed border-white/10 px-6 py-12 text-center text-[14px] text-white/45">
          No submissions yet.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {sorted.map((p, idx) => {
            const isTop16 = idx < 16 && sort === "popular";
            return (
              <div key={p.id} className="relative">
                {isTop16 ? (
                  <span className="absolute -top-2 left-3 z-10 inline-flex items-center gap-1 rounded-full border border-sky-400/30 bg-[#0b0c10] px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-sky-200">
                    #{idx + 1} qualifying
                  </span>
                ) : null}
                <TrackEmbedCard
                  participant={p}
                  showVotes
                  actionSlot={
                    <VoteButton
                      slug={state.tournament.slug}
                      participantId={p.id}
                      voted={votedIds.has(p.id)}
                      label={copy.qualification.voteCta}
                      votedLabel={copy.qualification.votedCta}
                      onVoted={(r) =>
                        onVoted(p.id, r.qualificationVotes ?? null)
                      }
                      className={`w-full rounded-full px-4 py-2 text-[12.5px] font-semibold transition ${
                        votedIds.has(p.id)
                          ? "bg-sky-400/10 text-sky-300"
                          : "bg-white text-black hover:bg-white/90"
                      }`}
                    />
                  }
                />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function SortChip({
  current,
  value,
  set,
  label,
}: {
  current: SortKey;
  value: SortKey;
  set: (s: SortKey) => void;
  label: string;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => set(value)}
      className={`rounded-full border px-4 py-1.5 text-[12.5px] font-medium transition ${
        active
          ? "border-white/30 bg-white text-black"
          : "border-white/[0.08] bg-white/[0.025] text-white/85 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function stableHash(id: string, seed: number): number {
  let h = Math.floor(seed * 1e6);
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return h;
}
