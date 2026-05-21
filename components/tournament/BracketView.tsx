"use client";

import { useMemo } from "react";
import type { TournamentState, Match } from "@/lib/tournament/types";
import { roundLabel } from "@/lib/tournament/types";
import type { Locale } from "@/lib/useLocale";

const COL_W = 220;
const ROW_H = 60;
const GAP = 14;

export function BracketView({
  state,
  locale,
}: {
  state: TournamentState;
  locale: Locale;
}) {
  const rounds = useMemo(() => {
    const map = new Map<number, Match[]>();
    for (const m of state.matches) {
      const arr = map.get(m.round_number) ?? [];
      arr.push(m);
      map.set(m.round_number, arr);
    }
    return Array.from(map.entries())
      .map(([n, list]) => ({ round: n, matches: list.sort((a, b) => a.slot - b.slot) }))
      .sort((a, b) => a.round - b.round);
  }, [state.matches]);

  if (rounds.length === 0) {
    return (
      <p className="text-[13px] text-white/45">
        Bracket will appear once round 1 is seeded.
      </p>
    );
  }

  const totalCols = rounds.length;
  const firstColMatches = rounds[0]?.matches.length ?? 0;
  const height = firstColMatches * (ROW_H + GAP) + 40;

  return (
    <svg
      width={totalCols * COL_W + 20}
      height={height}
      className="block min-w-full"
      role="img"
      aria-label="Tournament bracket"
    >
      {rounds.map((r, colIdx) => {
        const matchesInCol = r.matches.length;
        const spacing = (firstColMatches / matchesInCol) * (ROW_H + GAP);
        const offsetY = (spacing - (ROW_H + GAP)) / 2 + 20;
        return (
          <g key={r.round}>
            <text
              x={colIdx * COL_W + 10}
              y={12}
              fill="rgba(255,255,255,0.45)"
              fontSize={10}
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              style={{ letterSpacing: "0.01em" }}
            >
              {roundLabel(r.round, locale)}
            </text>
            {r.matches.map((m, i) => {
              const x = colIdx * COL_W + 10;
              const y = offsetY + i * spacing;
              const a = state.participants.find((p) => p.id === m.participant_a);
              const b = state.participants.find((p) => p.id === m.participant_b);
              const winnerIsA = m.winner_id && m.winner_id === m.participant_a;
              const winnerIsB = m.winner_id && m.winner_id === m.participant_b;
              return (
                <g key={m.id} transform={`translate(${x}, ${y})`}>
                  <rect
                    width={COL_W - 30}
                    height={ROW_H}
                    rx={10}
                    fill="rgba(255,255,255,0.025)"
                    stroke={
                      m.status === "active"
                        ? "rgba(56,189,248,0.6)"
                        : "rgba(255,255,255,0.08)"
                    }
                  />
                  <text
                    x={10}
                    y={22}
                    fontSize={11}
                    fontFamily="system-ui, -apple-system, sans-serif"
                    fill={winnerIsA ? "rgb(186,230,253)" : "rgba(255,255,255,0.75)"}
                  >
                    {truncate(a?.vvault_username || a?.track_title || "—", 22)}
                  </text>
                  <text
                    x={COL_W - 40}
                    y={22}
                    textAnchor="end"
                    fontSize={10}
                    fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                    fill="rgba(255,255,255,0.45)"
                  >
                    {m.votes_a}
                  </text>
                  <line
                    x1={6}
                    x2={COL_W - 36}
                    y1={ROW_H / 2}
                    y2={ROW_H / 2}
                    stroke="rgba(255,255,255,0.05)"
                  />
                  <text
                    x={10}
                    y={ROW_H - 14}
                    fontSize={11}
                    fontFamily="system-ui, -apple-system, sans-serif"
                    fill={winnerIsB ? "rgb(245,208,254)" : "rgba(255,255,255,0.75)"}
                  >
                    {truncate(b?.vvault_username || b?.track_title || "—", 22)}
                  </text>
                  <text
                    x={COL_W - 40}
                    y={ROW_H - 14}
                    textAnchor="end"
                    fontSize={10}
                    fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                    fill="rgba(255,255,255,0.45)"
                  >
                    {m.votes_b}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n - 1) + "…";
}
