import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 3600; // cache for 1 hour

const TRUSTPILOT_URL = "https://www.trustpilot.com/review/vvault.app";
const FALLBACK_SCORE = "4.4";

export async function GET() {
  try {
    const res = await fetch(TRUSTPILOT_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ score: FALLBACK_SCORE }, { headers: cacheHeaders() });
    }

    const html = await res.text();

    // Try to extract from JSON-LD structured data first
    const jsonLdMatch = html.match(/"ratingValue"\s*:\s*"?([\d.]+)"?/);
    if (jsonLdMatch?.[1]) {
      return NextResponse.json({ score: jsonLdMatch[1] }, { headers: cacheHeaders() });
    }

    // Fallback: look for the TrustScore value in the page
    const scoreMatch = html.match(/TrustScore\s*<[^>]*>\s*([\d.]+)/i) ??
      html.match(/data-rating="([\d.]+)"/);
    if (scoreMatch?.[1]) {
      return NextResponse.json({ score: scoreMatch[1] }, { headers: cacheHeaders() });
    }

    return NextResponse.json({ score: FALLBACK_SCORE }, { headers: cacheHeaders() });
  } catch (err) {
    console.error("[trustpilot-score] fetch failed:", err);
    return NextResponse.json({ score: FALLBACK_SCORE }, { headers: cacheHeaders() });
  }
}

function cacheHeaders() {
  return {
    "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
  };
}
