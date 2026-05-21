import { NextResponse } from "next/server";
import { loadTournamentState } from "@/lib/tournament/loadState";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const state = await loadTournamentState(slug);
  if (!state) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json(
    { state },
    {
      headers: { "Cache-Control": "public, s-maxage=5, stale-while-revalidate=30" },
    },
  );
}
