import "server-only";
import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";

/* Server-side hero stats — the user count AND the first few profile pictures,
   fetched on the server and (crucially) the avatars downloaded + inlined as
   base64 data URIs. Passed into the hero as props so the "Used by N" number
   and the 5 avatar circles are part of the server-rendered HTML: they paint
   instantly with the page, never flash grey, and the number is always there.

   This replaces the old behaviour where the client fetched the count + avatar
   URLs AFTER the load event (deferred), which is what made them slow/grey.

   The whole thing is wrapped in unstable_cache (10-min revalidate) so the
   Supabase query + the avatar downloads happen at most once per window for the
   entire deployment — not on every request — keeping TTFB fast. A module-level
   `lastGood` snapshot guarantees we never serve an empty (grey) payload once
   we've seen a good one, even if a later refresh hits a Supabase blip. */

export type HeroStats = {
  usersTotal: number;
  /** First (up to) 5 avatars, inlined as base64 data URIs — render instantly,
      never grey. Fewer than 5 only if downloads fail; the hero cycles whatever
      it gets to fill all 5 circles. */
  avatarDataUris: string[];
  /** A larger set of (tiny-render) avatar URLs handed to the client so the
      circles can keep rotating through fresh faces after first paint. */
  avatarUrls: string[];
};

const EMPTY: HeroStats = { usersTotal: 0, avatarDataUris: [], avatarUrls: [] };

const VISIBLE_AVATARS = 5;
// Try this many of the oldest profiles-with-pictures; keep the first 5 that
// actually download. Generous headroom so broken/private pictures can't leave
// us short of 5.
const DOWNLOAD_CANDIDATES = 12;
// Extra URLs (beyond the inlined ones) handed to the client for rotation.
const ROTATION_POOL = 24;
// Only the once-per-10-min cache-miss request pays this; a comfortable margin
// over observed cold transform times (~80-530ms) so we reliably get all 5.
const PER_IMAGE_TIMEOUT_MS = 2000;
// Skip anything suspiciously large for an inline avatar (keeps the HTML lean).
// A 64px webp is 2-6KB; 16KB is generous headroom while guaranteeing the five
// inlined avatars can never balloon the page HTML.
const MAX_INLINE_BYTES = 16_000;

/* Rewrite Supabase-storage / Google / Gravatar avatar URLs to a tiny 64px
   render so each inlined avatar is only a few KB. Mirrors the client's
   toFastAvatarUrl so the inlined set and the rotation set match. */
function toFastAvatarUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname;
    if (parsed.searchParams.has("token")) return rawUrl;
    if (path.includes("/storage/v1/object/public/")) {
      parsed.pathname = path.replace(
        "/storage/v1/object/public/",
        "/storage/v1/render/image/public/",
      );
      parsed.searchParams.set("width", "64");
      parsed.searchParams.set("height", "64");
      parsed.searchParams.set("quality", "70");
      parsed.searchParams.set("resize", "cover");
      return parsed.toString();
    }
    if (host.includes("googleusercontent.com")) {
      parsed.searchParams.set("sz", "64");
      return parsed.toString();
    }
    if (host.includes("gravatar.com")) {
      parsed.searchParams.set("s", "64");
      return parsed.toString();
    }
  } catch {
    return rawUrl;
  }
  return rawUrl;
}

async function toDataUri(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(PER_IMAGE_TIMEOUT_MS),
      headers: { accept: "image/*" },
    });
    if (!res.ok) return null;
    const type = (res.headers.get("content-type") || "").toLowerCase();
    if (!type.startsWith("image/")) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength === 0 || buf.byteLength > MAX_INLINE_BYTES) return null;
    return `data:${type};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

function toPositiveInteger(value: unknown): number {
  const next = Number(value);
  if (!Number.isFinite(next) || next < 0) return 0;
  return Math.floor(next);
}

async function loadHeroStats(): Promise<HeroStats> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return EMPTY;

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // Count + a deterministic, ordered slice of profiles-with-pictures, in
  // parallel. Ordering by id keeps the set stable so the cache (and the
  // inlined avatars) don't churn between refreshes.
  const [countRes, avatarRes] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("picture")
      .not("picture", "is", null)
      .neq("picture", "")
      .order("id", { ascending: true })
      .limit(80),
  ]);

  const usersTotal = toPositiveInteger(countRes.count);

  const rawUrls = Array.from(
    new Set(
      ((avatarRes.data ?? []) as Array<{ picture?: string | null }>)
        .map((row) => (typeof row.picture === "string" ? row.picture.trim() : ""))
        .filter((value) => value.length > 0),
    ),
  );
  const fastUrls = rawUrls.map(toFastAvatarUrl);

  // Download the first N candidates concurrently; keep the first 5 that decode,
  // in order, so the inlined set is deterministic and never grey.
  const candidates = fastUrls.slice(0, DOWNLOAD_CANDIDATES);
  const settled = await Promise.all(candidates.map((u) => toDataUri(u)));
  const avatarDataUris = settled.filter((x): x is string => Boolean(x)).slice(0, VISIBLE_AVATARS);

  const result: HeroStats = {
    usersTotal,
    avatarDataUris,
    avatarUrls: fastUrls.slice(0, ROTATION_POOL),
  };

  // Total failure (Supabase blip): throw so unstable_cache does NOT memoise an
  // empty payload for the whole window — the next request retries instead.
  if (usersTotal === 0 && avatarDataUris.length === 0) {
    throw new Error("hero stats unavailable");
  }
  return result;
}

/* Long revalidate (1h): the cold render blocks on the avatar downloads, so we
   want to pay that as rarely as possible. The displayed count never goes stale
   in practice because the client re-polls /api/landing-stats every 60s and
   updates it live — the server value only needs to be a good first-paint seed. */
const cachedLoadHeroStats = unstable_cache(loadHeroStats, ["landing-hero-stats-v2"], {
  revalidate: 3600,
});

// Last good snapshot — so a transient failure can never downgrade the hero to
// the grey/zero state once we've successfully loaded real data on this instance.
let lastGood: HeroStats | null = null;

export async function getHeroStats(): Promise<HeroStats> {
  try {
    // Hard ceiling on how long a render may wait for stats. With ISR this
    // only ever runs at revalidate time, but a hung Supabase call should
    // still never stall HTML generation — serve the last-good snapshot.
    const data = await Promise.race([
      cachedLoadHeroStats(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("hero stats timeout")), 2500),
      ),
    ]);
    if (data.usersTotal > 0 || data.avatarDataUris.length > 0) {
      lastGood = data;
      return data;
    }
  } catch {
    /* fall through to the last good snapshot (or empty on a truly cold start) */
  }
  return lastGood ?? EMPTY;
}
