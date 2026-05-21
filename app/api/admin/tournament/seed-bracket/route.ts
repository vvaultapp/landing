/* Admin: manually seed a bracket when qualification is skipped.
   Body: { tournament_id, participant_ids } — ordered by intended seed (top to bottom).
   Creates round-1 matches using bracketSeeding.ts and a pending round phase. */

import { NextResponse, type NextRequest } from "next/server";
import { ensureAdmin } from "../_guard";
import { getServiceSupabase } from "@/lib/tournament/serverClient";
import { seedBracket } from "@/lib/tournament/bracketSeeding";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!(await ensureAdmin(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const tournament_id: string | undefined = body?.tournament_id;
  const participant_ids: unknown = body?.participant_ids;
  if (!tournament_id || !Array.isArray(participant_ids) || participant_ids.length < 2) {
    return NextResponse.json(
      { error: "tournament_id and participant_ids[] (>= 2) required" },
      { status: 400 },
    );
  }
  const ids = (participant_ids as unknown[]).filter(
    (id): id is string => typeof id === "string",
  );
  const matches = seedBracket(ids);
  if (matches.length === 0) {
    return NextResponse.json({ error: "no matches generated" }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) return NextResponse.json({ error: "no_supabase" }, { status: 500 });

  // Mark these participants qualified.
  await supabase
    .from("tournament_participants")
    .update({ qualified: true })
    .in("id", ids);

  const inserts = matches.map((m) => ({
    tournament_id,
    round_number: 1,
    slot: m.slot,
    participant_a: m.participantA,
    participant_b: m.participantB,
    status: "pending",
  }));
  const matchRes = await supabase.from("tournament_matches").insert(inserts);
  if (matchRes.error) {
    console.error("[admin/seed-bracket]", matchRes.error.message);
    return NextResponse.json({ error: matchRes.error.message }, { status: 500 });
  }

  const phaseRes = await supabase
    .from("tournament_phases")
    .insert({ tournament_id, kind: "round", round_number: 1, status: "pending" })
    .select("*")
    .maybeSingle();
  if (phaseRes.error) {
    console.error("[admin/seed-bracket] phase", phaseRes.error.message);
    return NextResponse.json({ error: phaseRes.error.message }, { status: 500 });
  }

  return NextResponse.json({ matches: inserts.length, phase: phaseRes.data });
}
