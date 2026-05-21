import { NextResponse } from "next/server";
import { loadFeaturedSlug, loadTournamentState } from "@/lib/tournament/loadState";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const slug = await loadFeaturedSlug();
  if (!slug) {
    return NextResponse.json({ state: null }, { headers: noCache() });
  }
  const state = await loadTournamentState(slug);
  return NextResponse.json({ state }, { headers: noCache() });
}

function noCache(): HeadersInit {
  return { "Cache-Control": "public, s-maxage=5, stale-while-revalidate=30" };
}
