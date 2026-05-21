/* Server-side fetch of public OG metadata for a vvault.app track
   share page. Returns { title, artwork, username, embedUrl } as
   best-effort — never throws; returns nulls on miss. */

import type { ParsedTrack } from "./parseTrackUrl";

type TrackMetadata = {
  title: string | null;
  artwork: string | null;
  username: string | null;
  embedUrl: string | null;
};

const META_REGEX =
  /<meta\s+(?:property|name)=["']([^"']+)["']\s+content=["']([^"']+)["']/gi;

function pickMetaContent(html: string, names: string[]): string | null {
  const wanted = new Set(names.map((n) => n.toLowerCase()));
  META_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = META_REGEX.exec(html)) !== null) {
    const key = match[1].toLowerCase();
    if (wanted.has(key)) return match[2];
  }
  return null;
}

export async function fetchTrackMetadata(track: ParsedTrack): Promise<TrackMetadata> {
  const empty: TrackMetadata = {
    title: null,
    artwork: null,
    username: track.username,
    embedUrl: null,
  };
  try {
    const res = await fetch(track.url, {
      headers: { "User-Agent": "vvault-tournament-bot/1.0 (+https://get.vvault.app)" },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return empty;
    const html = await res.text();
    const title =
      pickMetaContent(html, ["og:title", "twitter:title"]) ??
      pickMetaContent(html, ["title"]);
    const artwork =
      pickMetaContent(html, ["og:image", "twitter:image", "twitter:image:src"]);
    const embedUrl = pickMetaContent(html, ["twitter:player", "og:video", "og:audio"]);
    return {
      title: title ? decodeEntities(title) : null,
      artwork: artwork ? artwork.trim() : null,
      username: track.username,
      embedUrl: embedUrl ? embedUrl.trim() : null,
    };
  } catch {
    return empty;
  }
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}
