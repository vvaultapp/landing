/* Accepts the VVault track-share URL format and returns the parsed
   parts. Returns null for anything else.

   Accepted (with or without www., http://, https://, or query/hash):
     https://vvault.app/<username>/track/<slug>
     https://www.vvault.app/<username>/track/<slug>
     vvault.app/<username>/track/<slug>
     /<username>/track/<slug>
*/

const VVAULT_HOSTS = new Set(["vvault.app", "www.vvault.app", "get.vvault.app"]);
const PATH_RE = /^\/([^/]+)\/track\/([^/?#]+)/i;

export type ParsedTrack = {
  username: string;
  slug: string;
  url: string;
  /* `username/slug` — stable per-track identifier used as track_slug
     in the DB (unique constraint per tournament). */
  key: string;
};

export function parseTrackUrl(input: string): ParsedTrack | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Bare path like "/used2that/track/abc"
  if (trimmed.startsWith("/")) {
    const m = trimmed.match(PATH_RE);
    if (!m) return null;
    return build(m[1], m[2]);
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }

  const host = parsed.hostname.toLowerCase();
  if (!VVAULT_HOSTS.has(host)) return null;

  const m = parsed.pathname.match(PATH_RE);
  if (!m) return null;
  return build(m[1], m[2]);
}

function build(username: string, slug: string): ParsedTrack {
  return {
    username,
    slug,
    url: `https://vvault.app/${username}/track/${slug}`,
    key: `${username}/${slug}`,
  };
}
