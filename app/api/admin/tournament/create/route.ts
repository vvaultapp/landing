import { NextResponse, type NextRequest } from "next/server";
import { ensureAdmin } from "../_guard";
import { getServiceSupabase, isMissingTableError } from "@/lib/tournament/serverClient";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!(await ensureAdmin(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const slug = String(body.slug || "").trim().toLowerCase();
  const title = String(body.title || "").trim();
  const has_qualification = body.has_qualification !== false;
  const max_participants = Math.max(2, Number(body.max_participants) || 1000);

  if (!slug || !title) {
    return NextResponse.json({ error: "slug and title are required" }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) return NextResponse.json({ error: "no_supabase" }, { status: 500 });

  // If no tournaments exist yet, make this one featured automatically.
  const existing = await supabase.from("tournaments").select("id", { count: "exact", head: true });
  const isFirst = !existing.error && (existing.count ?? 0) === 0;

  const insert = await supabase
    .from("tournaments")
    .insert({
      slug,
      title,
      has_qualification,
      max_participants,
      status: "draft",
      is_featured: isFirst,
    })
    .select("*")
    .maybeSingle();

  if (insert.error) {
    if (isMissingTableError(insert.error)) {
      return NextResponse.json(
        { error: "Tournament tables not deployed. Apply supabase/tournament.sql first." },
        { status: 503 },
      );
    }
    if (insert.error.code === "23505") {
      return NextResponse.json({ error: "slug already exists" }, { status: 409 });
    }
    console.error("[admin/create]", insert.error.message);
    return NextResponse.json({ error: insert.error.message }, { status: 500 });
  }

  return NextResponse.json({ tournament: insert.data });
}
