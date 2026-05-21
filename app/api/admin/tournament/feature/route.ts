import { NextResponse, type NextRequest } from "next/server";
import { ensureAdmin } from "../_guard";
import { getServiceSupabase } from "@/lib/tournament/serverClient";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!(await ensureAdmin(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const id: string | undefined = body?.id;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const supabase = getServiceSupabase();
  if (!supabase) return NextResponse.json({ error: "no_supabase" }, { status: 500 });

  // Atomically swap featured: clear the current one, set the new one.
  await supabase.from("tournaments").update({ is_featured: false }).eq("is_featured", true);
  const res = await supabase
    .from("tournaments")
    .update({ is_featured: true })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (res.error) {
    console.error("[admin/feature]", res.error.message);
    return NextResponse.json({ error: res.error.message }, { status: 500 });
  }
  return NextResponse.json({ tournament: res.data });
}
