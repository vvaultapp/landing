import { NextResponse, type NextRequest } from "next/server";
import { ensureAdmin } from "../_guard";
import { getServiceSupabase } from "@/lib/tournament/serverClient";

export const runtime = "nodejs";

/* Idempotently seeds the 6 phases a tournament needs:
   1× submission (Signups), 1× qualification, 4× round (R16 → Final).
   The qualification phase is skipped when has_qualification = false. */
export async function POST(req: NextRequest) {
  if (!(await ensureAdmin(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const tournament_id: string | undefined = body?.tournament_id;
  if (!tournament_id) {
    return NextResponse.json({ error: "tournament_id required" }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) return NextResponse.json({ error: "no_supabase" }, { status: 500 });

  const tourn = await supabase
    .from("tournaments")
    .select("id, has_qualification")
    .eq("id", tournament_id)
    .maybeSingle();
  if (tourn.error || !tourn.data) {
    return NextResponse.json({ error: "tournament not found" }, { status: 404 });
  }
  const hasQual = tourn.data.has_qualification !== false;

  const existing = await supabase
    .from("tournament_phases")
    .select("id, kind, round_number")
    .eq("tournament_id", tournament_id);
  if (existing.error) {
    return NextResponse.json({ error: existing.error.message }, { status: 500 });
  }
  const have = new Set<string>(
    (existing.data ?? []).map((p) => `${p.kind}:${p.round_number ?? "_"}`),
  );

  const wanted: { kind: string; round_number: number | null }[] = [
    { kind: "submission", round_number: null },
    ...(hasQual ? [{ kind: "qualification", round_number: null }] : []),
    { kind: "round", round_number: 1 },
    { kind: "round", round_number: 2 },
    { kind: "round", round_number: 3 },
    { kind: "round", round_number: 4 },
  ];

  const toInsert = wanted
    .filter((w) => !have.has(`${w.kind}:${w.round_number ?? "_"}`))
    .map((w) => ({
      tournament_id,
      kind: w.kind,
      round_number: w.round_number,
      status: "pending" as const,
    }));

  if (toInsert.length > 0) {
    const ins = await supabase.from("tournament_phases").insert(toInsert);
    if (ins.error) {
      return NextResponse.json({ error: ins.error.message }, { status: 500 });
    }
  }

  await supabase
    .from("tournaments")
    .update({ status: "live" })
    .eq("id", tournament_id)
    .eq("status", "draft");

  return NextResponse.json({ inserted: toInsert.length });
}
