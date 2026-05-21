import { NextResponse, type NextRequest } from "next/server";
import { ensureAdmin } from "../_guard";
import { getServiceSupabase } from "@/lib/tournament/serverClient";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!(await ensureAdmin(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const phase_id: string | undefined = body?.phase_id;
  const duration_seconds: number = Math.max(
    60,
    Math.min(60 * 60 * 24 * 30, Number(body?.duration_seconds) || 60 * 60 * 24),
  );
  const auto_advance: boolean = Boolean(body?.auto_advance);

  if (!phase_id) {
    return NextResponse.json({ error: "phase_id required" }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) return NextResponse.json({ error: "no_supabase" }, { status: 500 });

  const now = new Date();
  const ends = new Date(now.getTime() + duration_seconds * 1000);

  // Make sure no other phase in this tournament is also "active".
  const phaseLookup = await supabase
    .from("tournament_phases")
    .select("id, tournament_id, kind, round_number, status")
    .eq("id", phase_id)
    .maybeSingle();
  if (phaseLookup.error || !phaseLookup.data) {
    return NextResponse.json({ error: "phase not found" }, { status: 404 });
  }
  const phase = phaseLookup.data as { id: string; tournament_id: string; status: string };

  if (phase.status !== "pending") {
    return NextResponse.json({ error: `phase already ${phase.status}` }, { status: 409 });
  }

  // Activate any pending matches for round phases.
  await supabase
    .from("tournament_matches")
    .update({ status: "active" })
    .eq("tournament_id", phase.tournament_id)
    .eq("status", "pending");

  const res = await supabase
    .from("tournament_phases")
    .update({
      status: "active",
      starts_at: now.toISOString(),
      ends_at: ends.toISOString(),
      voting_duration_seconds: duration_seconds,
      auto_advance,
    })
    .eq("id", phase_id)
    .select("*")
    .maybeSingle();

  if (res.error) {
    console.error("[admin/start-phase]", res.error.message);
    return NextResponse.json({ error: res.error.message }, { status: 500 });
  }
  return NextResponse.json({ phase: res.data });
}
