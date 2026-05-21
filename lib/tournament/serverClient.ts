/* Server-side Supabase client (service role).
   Imported by API routes only. */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function getServiceSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export function isMissingTableError(
  error: { code?: string } | null | undefined,
  status?: number,
): boolean {
  // PGRST205 = schema-cache miss, 42P01 = table doesn't exist.
  return error?.code === "PGRST205" || error?.code === "42P01" || status === 404;
}
