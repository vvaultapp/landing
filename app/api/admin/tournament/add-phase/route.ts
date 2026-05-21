import { NextResponse, type NextRequest } from "next/server";
import { ensureAdmin } from "../_guard";
import { getServiceSupabase } from "@/lib/tournament/serverClient";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!(await ensureAdmin(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const tournament_id: string | undefined = body?.tournament_id;
  const kind: string = body?.kind || "submission";

  if (!tournament_id) {
    return NextResponse.json({ error: "tournament_id required" }, { status: 400 });
  }
  if (!["submission", "qualification", "round"].includes(kind)) {
    return NextResponse.json({ error: "invalid kind" }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) return NextResponse.json({ error: "no_supabase" }, { status: 500 });

  const res = await supabase
    .from("tournament_phases")
    .insert({ tournament_id, kind, status: "pending" })
    .select("*")
    .maybeSingle();
  if (res.error) {
    console.error("[admin/add-phase]", res.error.message);
    return NextResponse.json({ error: res.error.message }, { status: 500 });
  }

  // First phase added → flip tournament to "live".
  await supabase
    .from("tournaments")
    .update({ status: "live" })
    .eq("id", tournament_id)
    .eq("status", "draft");

  return NextResponse.json({ phase: res.data });
}
