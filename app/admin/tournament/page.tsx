import { isAuthed } from "./auth";
import { LoginForm } from "./LoginForm";
import { Dashboard } from "./Dashboard";
import { getServiceSupabase, isMissingTableError } from "@/lib/tournament/serverClient";
import type { Tournament } from "@/lib/tournament/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function fetchTournaments(): Promise<Tournament[]> {
  const supabase = getServiceSupabase();
  if (!supabase) return [];
  const res = await supabase
    .from("tournaments")
    .select("*")
    .order("created_at", { ascending: false });
  if (res.error) {
    if (!isMissingTableError(res.error, res.status)) {
      console.error("[admin/tournament] fetch failed:", res.error.message);
    }
    return [];
  }
  return (res.data ?? []) as Tournament[];
}

export default async function AdminTournamentPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string }>;
}) {
  const params = await searchParams;
  const authed = await isAuthed();
  if (!authed) return <LoginForm error={params.err === "1"} />;

  const tournaments = await fetchTournaments();
  return <Dashboard tournaments={tournaments} />;
}
