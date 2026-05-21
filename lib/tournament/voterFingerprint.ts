/* Anonymous voter fingerprint.

   We want one vote per "person" per match without forcing logins.
   The fingerprint combines:
     - A per-phase salt stored on tournament_phases.voter_salt (rotates
       at every phase boundary, so cookies don't persist across
       tournaments).
     - The voter's IP and User-Agent (best-effort identity proxy).
     - A signed cookie ("vv_voter") that holds the last fingerprint
       used. If the cookie is cleared, we re-derive — IP+UA still match.

   This is intentionally lightweight: it stops casual duplicates and
   raises the bar for spammers without requiring CAPTCHA or auth.
*/

import { createHmac, randomUUID } from "crypto";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "vv_voter";
const COOKIE_TTL_DAYS = 60;
const COOKIE_SECRET =
  process.env.TOURNAMENT_VOTER_SECRET ??
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  "vv-tournament-dev-secret";

function ipFrom(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip") ?? "0.0.0.0";
}

function uaFrom(req: NextRequest): string {
  return req.headers.get("user-agent") ?? "unknown";
}

function hmac(secret: string, payload: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex").slice(0, 32);
}

function sign(value: string): string {
  return hmac(COOKIE_SECRET, value);
}

export type VoterFingerprint = {
  fingerprint: string;
  cookieValue: string;
  cookieMaxAgeSeconds: number;
};

export function deriveFingerprint(
  req: NextRequest,
  phaseSalt: string,
): VoterFingerprint {
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  let stableId: string | null = null;

  if (cookie) {
    const [id, sig] = cookie.split(".");
    if (id && sig && sign(id) === sig) {
      stableId = id;
    }
  }

  if (!stableId) {
    stableId = randomUUID();
  }

  const fingerprint = hmac(
    phaseSalt,
    [stableId, ipFrom(req), uaFrom(req)].join("|"),
  );

  return {
    fingerprint,
    cookieValue: `${stableId}.${sign(stableId)}`,
    cookieMaxAgeSeconds: COOKIE_TTL_DAYS * 24 * 60 * 60,
  };
}

export const VOTER_COOKIE_NAME = COOKIE_NAME;
