import { NextResponse, type NextRequest } from "next/server";
import { getServiceSupabase, isMissingTableError } from "@/lib/tournament/serverClient";
import { parseTrackUrl } from "@/lib/tournament/parseTrackUrl";
import { fetchTrackMetadata } from "@/lib/tournament/fetchTrackMetadata";

export const runtime = "nodejs";

const SUPABASE_AUTH_COOKIE_PREFIX = "sb-";
const SUPABASE_AUTH_TOKEN_SUFFIX = "-auth-token";

function pickSupabaseAccessToken(req: NextRequest): string | null {
  // 1. Authorization header — primary path when the browser SDK stores
  //    the session in localStorage (the default for @supabase/supabase-js).
  const auth = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (auth) {
    const match = /^Bearer\s+(.+)$/i.exec(auth.trim());
    if (match && match[1].length > 0) return match[1];
  }

  // 2. Supabase auth cookies (set by @supabase/ssr or our own cookie shim).
  for (const cookie of req.cookies.getAll()) {
    if (
      cookie.name.startsWith(SUPABASE_AUTH_COOKIE_PREFIX) &&
      cookie.name.endsWith(SUPABASE_AUTH_TOKEN_SUFFIX)
    ) {
      try {
        const raw = cookie.value.startsWith("base64-")
          ? Buffer.from(cookie.value.slice(7), "base64").toString("utf8")
          : cookie.value;
        const parsed = JSON.parse(raw);
        const token = parsed?.access_token ?? parsed?.[0];
        if (typeof token === "string" && token.length > 0) return token;
      } catch {
        // ignore malformed cookies and try the next one
      }
    }
  }
  return null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const body = await req.json().catch(() => ({}));
  const trackUrlInput: string = body?.track_url ?? "";

  const parsed = parseTrackUrl(trackUrlInput);
  if (!parsed) {
    return NextResponse.json(
      { error: "Paste a vvault.app/<username>/track/<slug> link." },
      { status: 400 },
    );
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Server not configured." }, { status: 500 });
  }

  const accessToken = pickSupabaseAccessToken(req);
  if (!accessToken) {
    return NextResponse.json(
      { error: "Connect your VVault account first." },
      { status: 401 },
    );
  }

  const userRes = await supabase.auth.getUser(accessToken);
  if (userRes.error || !userRes.data.user) {
    return NextResponse.json({ error: "Invalid session." }, { status: 401 });
  }
  const user = userRes.data.user;

  // Find tournament + active submission phase.
  const tournamentRes = await supabase
    .from("tournaments")
    .select("id, max_participants, status")
    .eq("slug", slug)
    .maybeSingle();
  if (tournamentRes.error || !tournamentRes.data) {
    return NextResponse.json({ error: "Tournament not found." }, { status: 404 });
  }
  const tournament = tournamentRes.data as {
    id: string;
    max_participants: number;
    status: string;
  };

  const phaseRes = await supabase
    .from("tournament_phases")
    .select("id, status, kind")
    .eq("tournament_id", tournament.id)
    .eq("kind", "submission")
    .eq("status", "active")
    .maybeSingle();
  if (phaseRes.error && !isMissingTableError(phaseRes.error, phaseRes.status)) {
    console.error("[submit] phase lookup", phaseRes.error.message);
  }
  if (!phaseRes.data) {
    return NextResponse.json(
      { error: "Submissions aren't open right now." },
      { status: 409 },
    );
  }

  // Check capacity.
  const countRes = await supabase
    .from("tournament_participants")
    .select("id", { count: "exact", head: true })
    .eq("tournament_id", tournament.id);
  const total = countRes.count ?? 0;
  if (total >= tournament.max_participants) {
    return NextResponse.json({ error: "Tournament is full." }, { status: 409 });
  }

  // Fetch metadata (best-effort).
  const meta = await fetchTrackMetadata(parsed);

  /* Find an existing submission so we can swap the track in-place
     instead of failing the unique constraint on (tournament_id, user_id).
     The submission-phase rules say "you can swap while submissions are
     open", so this is the supported path for edits. */
  const existingRes = await supabase
    .from("tournament_participants")
    .select("id")
    .eq("tournament_id", tournament.id)
    .eq("user_id", user.id)
    .maybeSingle();

  const payload = {
    tournament_id: tournament.id,
    user_id: user.id,
    vvault_username: parsed.username,
    track_url: parsed.url,
    // Stored as "<username>/<slug>" so the (tournament_id, track_slug)
    // uniqueness can't collide across owners.
    track_slug: parsed.key,
    track_title: meta.title,
    track_artwork_url: meta.artwork,
  };

  if (existingRes.data) {
    const updateRes = await supabase
      .from("tournament_participants")
      .update(payload)
      .eq("id", (existingRes.data as { id: string }).id)
      .select("*")
      .maybeSingle();
    if (updateRes.error) {
      if (updateRes.error.code === "23505") {
        return NextResponse.json(
          { error: "That track is already in the tournament." },
          { status: 409 },
        );
      }
      console.error("[submit] update failed:", updateRes.error.message);
      return NextResponse.json({ error: "Could not update." }, { status: 500 });
    }
    return NextResponse.json({ participant: updateRes.data });
  }

  const insertRes = await supabase
    .from("tournament_participants")
    .insert(payload)
    .select("*")
    .maybeSingle();

  if (insertRes.error) {
    if (insertRes.error.code === "23505") {
      return NextResponse.json(
        { error: "That track is already in the tournament." },
        { status: 409 },
      );
    }
    if (isMissingTableError(insertRes.error)) {
      return NextResponse.json(
        { error: "Tournament tables aren't deployed yet." },
        { status: 503 },
      );
    }
    console.error("[submit] insert failed:", insertRes.error.message);
    return NextResponse.json({ error: "Could not submit." }, { status: 500 });
  }

  return NextResponse.json({ participant: insertRes.data });
}
