"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import type {
  TournamentState,
  TournamentPhase,
  Match,
} from "@/lib/tournament/types";

type PhaseMeta = {
  kind: "submission" | "qualification" | "round";
  round_number: number | null;
  label: string;
  waitingLabel: string;
  activeLabel: string;
  completeLabel: string;
  /* If set, the admin can't pick auto_advance — it's forced to this value. */
  lockAutoAdvance?: boolean;
};

/* Signups is special: waiting → open (timer) → closed. The timer
   closes it automatically, but the next phase only opens when the
   admin clicks "Advance" — so we lock auto_advance to false.
   Voting phases default to auto_advance ON (manageable per phase). */
const PHASE_ORDER: PhaseMeta[] = [
  {
    kind: "submission",
    round_number: null,
    label: "Signups",
    waitingLabel: "Waiting",
    activeLabel: "Open",
    completeLabel: "Closed",
    lockAutoAdvance: false,
  },
  {
    kind: "qualification",
    round_number: null,
    label: "Qualifications",
    waitingLabel: "Waiting",
    activeLabel: "Voting",
    completeLabel: "Complete",
  },
  {
    kind: "round",
    round_number: 1,
    label: "Round of 16",
    waitingLabel: "Waiting",
    activeLabel: "Voting",
    completeLabel: "Complete",
  },
  {
    kind: "round",
    round_number: 2,
    label: "Quarterfinals",
    waitingLabel: "Waiting",
    activeLabel: "Voting",
    completeLabel: "Complete",
  },
  {
    kind: "round",
    round_number: 3,
    label: "Semifinals",
    waitingLabel: "Waiting",
    activeLabel: "Voting",
    completeLabel: "Complete",
  },
  {
    kind: "round",
    round_number: 4,
    label: "Final",
    waitingLabel: "Waiting",
    activeLabel: "Voting",
    completeLabel: "Complete",
  },
];

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return json;
}

function phaseKey(p: { kind: string; round_number: number | null }) {
  return `${p.kind}:${p.round_number ?? "_"}`;
}

type SubStatus = "waiting" | "active" | "complete";

function subStatusOf(p: TournamentPhase): SubStatus {
  if (p.status === "active") return "active";
  if (p.status === "complete") return "complete";
  return "waiting";
}

function fmtRemaining(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function ManageView({ state }: { state: TournamentState }) {
  const { tournament, phases, currentPhase, matches } = state;
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ensured, setEnsured] = useState(false);

  useEffect(() => {
    if (ensured) return;
    const wantCount = tournament.has_qualification ? 6 : 5;
    if (phases.length >= wantCount) {
      setEnsured(true);
      return;
    }
    setEnsured(true);
    (async () => {
      try {
        await postJson("/api/admin/tournament/ensure-phases", {
          tournament_id: tournament.id,
        });
        window.location.reload();
      } catch (e) {
        setError((e as Error).message);
      }
    })();
  }, [ensured, phases.length, tournament.id, tournament.has_qualification]);

  const phasesByKey = useMemo(() => {
    const m = new Map<string, TournamentPhase>();
    for (const p of phases) m.set(phaseKey(p), p);
    return m;
  }, [phases]);

  const orderedPhases = useMemo(
    () =>
      PHASE_ORDER.filter(
        (p) => p.kind !== "qualification" || tournament.has_qualification,
      ),
    [tournament.has_qualification],
  );

  const defaultSelectedKey = useMemo(() => {
    if (currentPhase) return phaseKey(currentPhase);
    const firstNonComplete = orderedPhases.find((p) => {
      const phase = phasesByKey.get(phaseKey(p));
      return !phase || phase.status !== "complete";
    });
    if (firstNonComplete) return phaseKey(firstNonComplete);
    return phaseKey(orderedPhases[0]);
  }, [currentPhase, orderedPhases, phasesByKey]);

  const [selectedKey, setSelectedKey] = useState<string>(defaultSelectedKey);
  useEffect(() => {
    setSelectedKey(defaultSelectedKey);
  }, [defaultSelectedKey]);

  const selectedIndex = orderedPhases.findIndex(
    (p) => phaseKey(p) === selectedKey,
  );
  const selectedMeta = orderedPhases[selectedIndex] ?? orderedPhases[0];
  const selectedPhase = phasesByKey.get(phaseKey(selectedMeta)) ?? null;
  const selectedSub: SubStatus = selectedPhase
    ? subStatusOf(selectedPhase)
    : "waiting";

  const nextMeta = orderedPhases[selectedIndex + 1] ?? null;

  const [durationMin, setDurationMin] = useState(24 * 60);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [waitingTimer, setWaitingTimer] = useState(false);

  function call(url: string, body: unknown) {
    setError(null);
    start(async () => {
      try {
        await postJson(url, body);
        window.location.reload();
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  function startSelectedPhase() {
    if (!selectedPhase) return;
    const effectiveAutoAdvance =
      selectedMeta.lockAutoAdvance !== undefined
        ? selectedMeta.lockAutoAdvance
        : autoAdvance;
    call("/api/admin/tournament/start-phase", {
      phase_id: selectedPhase.id,
      duration_seconds: Math.max(60, durationMin * 60),
      auto_advance: effectiveAutoAdvance,
    });
  }

  function endSelectedPhase() {
    if (!selectedPhase) return;
    call("/api/admin/tournament/end-phase", { phase_id: selectedPhase.id });
  }

  /* For a closed Signups phase, "advance" runs end-phase again — which
     is a no-op on a complete phase via the SQL function — and then
     selects the next phase tab. Strictly we just switch tabs; the
     admin clicks Start on the next phase to actually open it. */
  function advanceToNext() {
    if (!nextMeta) return;
    setSelectedKey(phaseKey(nextMeta));
  }

  const currentRoundMatches = useMemo<Match[]>(() => {
    if (!currentPhase || currentPhase.kind !== "round") return [];
    return matches.filter((m) => m.round_number === currentPhase.round_number);
  }, [currentPhase, matches]);

  const canShowAutoAdvanceToggle = selectedMeta.lockAutoAdvance === undefined;

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-[#101112]">
      <header className="sticky top-0 z-50 border-b border-[#101112]/[0.06] bg-[#f7f7f7]/65 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex w-full max-w-[1100px] items-center justify-between px-6 py-4 sm:px-10">
          <a
            href="/admin/tournament"
            className="text-[13px] text-[#101112]/65 hover:text-[#101112]"
          >
            ← Admin
          </a>
          <span className="text-[13px] font-semibold uppercase tracking-[0.18em]">
            {tournament.title}
          </span>
          <a
            href={`/tournament/${tournament.slug}`}
            className="text-[13px] text-[#101112]/65 hover:text-[#101112]"
          >
            ↗ View
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1100px] px-6 pb-20 pt-10 sm:px-10">
        <h1 className="text-[26px] font-semibold leading-tight">Phase control</h1>
        <p className="mt-1.5 text-[13.5px] text-[#101112]/55">
          Pick which phase the tournament is on. Each phase moves
          waiting → active → complete.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {orderedPhases.map((meta) => {
            const p = phasesByKey.get(phaseKey(meta));
            const sub: SubStatus = p ? subStatusOf(p) : "waiting";
            const selected = selectedKey === phaseKey(meta);
            return (
              <button
                key={phaseKey(meta)}
                type="button"
                onClick={() => setSelectedKey(phaseKey(meta))}
                className={`group inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] font-medium transition ${
                  selected
                    ? "border-black bg-black text-white"
                    : "border-[#101112]/[0.1] bg-white text-[#101112]/75 hover:border-[#101112]/30 hover:text-[#101112]"
                }`}
              >
                <StatusDot sub={sub} on={selected} />
                {meta.label}
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-[1.4fr_1fr]">
          <section className="rounded-2xl border border-[#101112]/[0.06] bg-white p-6">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#101112]/55">
                  Selected phase
                </div>
                <h2 className="mt-1 text-[20px] font-semibold">
                  {selectedMeta.label}
                </h2>
              </div>
              <StatusBadge sub={selectedSub} meta={selectedMeta} />
            </div>

            {selectedPhase?.ends_at ? (
              <p className="mt-3 text-[12.5px] text-[#101112]/55">
                {selectedSub === "active" ? "Ends" : "Ended"}{" "}
                {new Date(selectedPhase.ends_at).toLocaleString()}
                {selectedSub === "active"
                  ? ` · ${fmtRemaining(new Date(selectedPhase.ends_at).getTime() - Date.now())} left`
                  : ""}
                {selectedPhase.auto_advance && selectedSub === "active"
                  ? " · auto-advance ON"
                  : ""}
              </p>
            ) : null}

            {selectedSub === "waiting" ? (
              <>
                <h3 className="mt-6 text-[12.5px] font-semibold uppercase tracking-[0.1em] text-[#101112]/55">
                  Start {selectedMeta.activeLabel.toLowerCase()}
                </h3>
                <div className="mt-3 space-y-3">
                  <label className="block">
                    <span className="block text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[#101112]/55">
                      Timer · duration (minutes)
                    </span>
                    <input
                      type="number"
                      min={1}
                      value={durationMin}
                      onChange={(e) =>
                        setDurationMin(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="mt-1.5 h-11 w-full rounded-xl border border-[#101112]/[0.1] bg-white px-3 text-[14px]"
                    />
                  </label>
                  {canShowAutoAdvanceToggle ? (
                    <label className="flex items-center gap-2 text-[13.5px]">
                      <input
                        type="checkbox"
                        checked={autoAdvance}
                        onChange={(e) => setAutoAdvance(e.target.checked)}
                      />
                      Auto-advance to next phase when this ends
                    </label>
                  ) : (
                    <p className="text-[12.5px] text-[#101112]/55">
                      <strong>Manual advance:</strong> when the timer ends, the
                      phase becomes <em>{selectedMeta.completeLabel.toLowerCase()}</em>.
                      Open the next phase manually from its tab.
                    </p>
                  )}
                  <label className="flex items-center gap-2 text-[13px] text-[#101112]/65">
                    <input
                      type="checkbox"
                      checked={waitingTimer}
                      onChange={(e) => setWaitingTimer(e.target.checked)}
                    />
                    Show "waiting" timer to public (not started yet)
                  </label>
                </div>
                <button
                  type="button"
                  onClick={startSelectedPhase}
                  disabled={pending}
                  className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-black px-5 text-[13.5px] font-semibold text-white hover:bg-[#101112]/90 disabled:opacity-50"
                >
                  Open {selectedMeta.activeLabel.toLowerCase()} →
                </button>
              </>
            ) : null}

            {selectedSub === "active" ? (
              <>
                <h3 className="mt-6 text-[12.5px] font-semibold uppercase tracking-[0.1em] text-[#101112]/55">
                  {selectedMeta.activeLabel} in progress
                </h3>
                <p className="mt-2 text-[13px] text-[#101112]/65">
                  {selectedPhase?.auto_advance
                    ? "Will auto-close and advance when the timer ends."
                    : `Will auto-close when the timer ends. Advance to the next phase manually.`}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={endSelectedPhase}
                    disabled={pending}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-black px-5 text-[13.5px] font-semibold text-white hover:bg-[#101112]/90 disabled:opacity-50"
                  >
                    Close {selectedMeta.activeLabel.toLowerCase()} now
                  </button>
                </div>
              </>
            ) : null}

            {selectedSub === "complete" ? (
              <>
                <h3 className="mt-6 text-[12.5px] font-semibold uppercase tracking-[0.1em] text-[#101112]/55">
                  {selectedMeta.completeLabel}
                </h3>
                {nextMeta ? (
                  <>
                    <p className="mt-2 text-[13px] text-[#101112]/65">
                      Next up:{" "}
                      <strong className="text-[#101112]">{nextMeta.label}</strong>.
                      Switch to that tab to open it.
                    </p>
                    <button
                      type="button"
                      onClick={advanceToNext}
                      className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-black px-5 text-[13.5px] font-semibold text-white hover:bg-[#101112]/90"
                    >
                      Advance to {nextMeta.label} →
                    </button>
                  </>
                ) : (
                  <p className="mt-2 rounded-xl border border-[#101112]/[0.06] bg-[#f7f7f7] px-4 py-3 text-[13px] text-[#101112]/65">
                    Tournament complete. No further phases.
                  </p>
                )}
              </>
            ) : null}

            {error ? (
              <p className="mt-4 rounded-xl bg-[#c8443c]/10 px-3 py-2 text-[12.5px] text-[#c8443c]">
                {error}
              </p>
            ) : null}
          </section>

          <section className="space-y-6">
            <div className="rounded-2xl border border-[#101112]/[0.06] bg-white p-5">
              <h3 className="text-[14px] font-semibold">Overview</h3>
              <ul className="mt-3 space-y-2">
                {orderedPhases.map((meta) => {
                  const p = phasesByKey.get(phaseKey(meta));
                  const sub: SubStatus = p ? subStatusOf(p) : "waiting";
                  return (
                    <li
                      key={phaseKey(meta)}
                      className="flex items-center justify-between gap-2 rounded-lg border border-[#101112]/[0.05] px-3 py-2"
                    >
                      <span className="flex items-center gap-2 text-[13px]">
                        <StatusDot sub={sub} on={false} />
                        {meta.label}
                      </span>
                      <span className="text-[11.5px] uppercase tracking-[0.1em] text-[#101112]/55">
                        {labelForSub(sub, meta)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="rounded-2xl border border-[#101112]/[0.06] bg-white p-5">
              <h3 className="text-[14px] font-semibold">Stats</h3>
              <ul className="mt-2 space-y-1 text-[13px] text-[#101112]/65">
                <li>{state.participantsCount} participants</li>
                <li>{matches.length} matches</li>
                <li>status: {tournament.status}</li>
              </ul>
            </div>
          </section>
        </div>

        {currentRoundMatches.length > 0 ? (
          <section className="mt-8 rounded-2xl border border-[#101112]/[0.06] bg-white p-5">
            <h2 className="text-[15px] font-semibold">Live tally</h2>
            <ol className="mt-4 space-y-2">
              {currentRoundMatches.map((m) => {
                const a = state.participants.find((p) => p.id === m.participant_a);
                const b = state.participants.find((p) => p.id === m.participant_b);
                const total = m.votes_a + m.votes_b;
                const aPct = total ? Math.round((m.votes_a / total) * 100) : 50;
                return (
                  <li
                    key={m.id}
                    className="rounded-xl border border-[#101112]/[0.06] p-3"
                  >
                    <div className="flex items-center justify-between gap-2 text-[13px]">
                      <span className="truncate">
                        {a?.vvault_username || a?.track_title || "—"}
                      </span>
                      <span className="tabular-nums text-[#101112]/55">
                        {m.votes_a} – {m.votes_b}
                      </span>
                      <span className="truncate text-right">
                        {b?.vvault_username || b?.track_title || "—"}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#101112]/[0.05]">
                      <div className="h-full bg-black" style={{ width: `${aPct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        ) : null}
      </main>
    </div>
  );
}

function StatusDot({ sub, on }: { sub: SubStatus; on: boolean }) {
  const color =
    sub === "active"
      ? "bg-emerald-500"
      : sub === "complete"
        ? "bg-[#101112]/35"
        : "bg-amber-400";
  return (
    <span
      className={`relative inline-flex h-1.5 w-1.5 rounded-full ${color} ${
        on ? "ring-2 ring-white/40" : ""
      }`}
    >
      {sub === "active" ? (
        <span className="absolute inset-0 -m-0.5 animate-ping rounded-full bg-emerald-400/60" />
      ) : null}
    </span>
  );
}

function StatusBadge({ sub, meta }: { sub: SubStatus; meta: PhaseMeta }) {
  const styles =
    sub === "active"
      ? "border-emerald-500/30 bg-emerald-50 text-emerald-700"
      : sub === "complete"
        ? "border-[#101112]/10 bg-[#101112]/[0.04] text-[#101112]/55"
        : "border-amber-400/30 bg-amber-50 text-amber-700";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${styles}`}
    >
      {labelForSub(sub, meta)}
    </span>
  );
}

function labelForSub(sub: SubStatus, meta: PhaseMeta): string {
  if (sub === "active") return meta.activeLabel;
  if (sub === "complete") return meta.completeLabel;
  return meta.waitingLabel;
}
