import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const DOWNLOAD_URL =
  "https://github.com/vvaultapp/landing/releases/download/v0.1.0/vvault-0.1.0.dmg";

export async function GET(req: NextRequest) {
  // Fire-and-forget: log the download event
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const ua = req.headers.get("user-agent") ?? undefined;
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
    // Hash IP for privacy
    const encoder = new TextEncoder();
    const data = encoder.encode(ip);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const ipHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Fire-and-forget: do not block the redirect on the insert
    void Promise.resolve(
      supabase.from("download_events").insert({
        platform: "macos",
        user_agent: ua,
        ip_hash: ipHash,
      }),
    ).catch(() => {});
  } catch {
    // Never block the download
  }

  return NextResponse.redirect(DOWNLOAD_URL, 301);
}
