import { NextResponse } from "next/server";

/* Desktop apps are Coming soon for every visitor — this route returns
   404 for everyone. When the desktop build is ready, restore the
   Supabase log + 301 redirect to the .dmg release. */
export async function GET() {
  return new NextResponse("Coming soon", { status: 404 });
}
