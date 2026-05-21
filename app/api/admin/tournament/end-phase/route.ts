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
  if (!phase_id) {
    return NextResponse.json({ error: "phase_id required" }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) return NextResponse.json({ error: "no_supabase" }, { status: 500 });

  // Calls the plpgsql function that closes the phase and opens the next one
  // (defined in supabase/tournament_cron.sql). One code path for manual and auto.
  const { error } = await supabase.rpc("tournament_close_phase", {
    p_phase_id: phase_id,
  });
  if (error) {
    console.error("[admin/end-phase]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
