import { NextResponse, type NextRequest } from "next/server";
import { getServiceSupabase, isMissingTableError } from "@/lib/tournament/serverClient";
import { deriveFingerprint, VOTER_COOKIE_NAME } from "@/lib/tournament/voterFingerprint";

export const runtime = "nodejs";

type RateLimitEntry = { count: number; resetAt: number };
const RATE_LIMIT: Map<string, RateLimitEntry> = (globalThis as typeof globalThis & {
  __vvTournamentRateLimit?: Map<string, RateLimitEntry>;
}).__vvTournamentRateLimit ??= new Map();

const RATE_WINDOW_MS = 10_000;
const RATE_MAX = 5;

function rateLimited(fp: string): boolean {
  const now = Date.now();
  const entry = RATE_LIMIT.get(fp);
  if (!entry || now > entry.resetAt) {
    RATE_LIMIT.set(fp, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  if (entry.count > RATE_MAX) return true;
  return false;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const body = await req.json().catch(() => ({}));
  const matchId: string | undefined = body?.match_id;
  const participantId: string | undefined = body?.participant_id;

  if (!participantId) {
    return NextResponse.json({ error: "Missing participant_id." }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Server not configured." }, { status: 500 });
  }

  // Resolve tournament + active phase.
  const tournamentRes = await supabase
    .from("tournaments")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (tournamentRes.error || !tournamentRes.data) {
    return NextResponse.json({ error: "Tournament not found." }, { status: 404 });
  }
  const tournamentId = (tournamentRes.data as { id: string }).id;

  const phaseRes = await supabase
    .from("tournament_phases")
    .select("id, voter_salt, kind")
    .eq("tournament_id", tournamentId)
    .eq("status", "active")
    .in("kind", ["qualification", "round"])
    .maybeSingle();
  if (phaseRes.error || !phaseRes.data) {
    return NextResponse.json(
      { error: "Voting isn't open right now." },
      { status: 409 },
    );
  }
  const phase = phaseRes.data as { id: string; voter_salt: string; kind: string };

  const { fingerprint, cookieValue, cookieMaxAgeSeconds } = deriveFingerprint(
    req,
    phase.voter_salt ?? phase.id,
  );

  if (rateLimited(fingerprint)) {
    return NextResponse.json({ error: "Slow down." }, { status: 429 });
  }

  const insertRes = await supabase.from("tournament_votes").insert({
    tournament_id: tournamentId,
    phase_id: phase.id,
    match_id: matchId ?? null,
    participant_id: participantId,
    voter_fingerprint: fingerprint,
  });

  if (insertRes.error) {
    if (insertRes.error.code === "23505") {
      return NextResponse.json(
        { error: "You've already voted." },
        { status: 409 },
      );
    }
    if (isMissingTableError(insertRes.error)) {
      return NextResponse.json(
        { error: "Tournament tables aren't deployed yet." },
        { status: 503 },
      );
    }
    console.error("[vote] insert:", insertRes.error.message);
    return NextResponse.json({ error: "Could not vote." }, { status: 500 });
  }

  // Return updated counts for optimistic-UI refresh.
  let votesA: number | null = null;
  let votesB: number | null = null;
  let qualVotes: number | null = null;
  if (matchId) {
    const mRes = await supabase
      .from("tournament_matches")
      .select("votes_a, votes_b")
      .eq("id", matchId)
      .maybeSingle();
    if (mRes.data) {
      votesA = (mRes.data as { votes_a: number }).votes_a;
      votesB = (mRes.data as { votes_b: number }).votes_b;
    }
  } else {
    const qRes = await supabase
      .from("tournament_qualification_counts")
      .select("votes")
      .eq("phase_id", phase.id)
      .eq("participant_id", participantId)
      .maybeSingle();
    if (qRes.data) qualVotes = (qRes.data as { votes: number }).votes;
  }

  const res = NextResponse.json({
    ok: true,
    votes_a: votesA,
    votes_b: votesB,
    qualification_votes: qualVotes,
  });
  res.cookies.set(VOTER_COOKIE_NAME, cookieValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: cookieMaxAgeSeconds,
    path: "/",
  });
  return res;
}
