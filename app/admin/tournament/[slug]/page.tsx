import { isAuthed } from "../auth";
import { LoginForm } from "../LoginForm";
import { ManageView } from "./ManageView";
import { loadTournamentState } from "@/lib/tournament/loadState";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminTournamentDetail({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ err?: string }>;
}) {
  const sp = await searchParams;
  const authed = await isAuthed();
  if (!authed) return <LoginForm error={sp.err === "1"} />;

  const { slug } = await params;
  const state = await loadTournamentState(slug);
  if (!state) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] px-6 py-20 text-center text-[#101112]/65">
        <p>
          Tournament <code>/{slug}</code> not found.
        </p>
        <p className="mt-2 text-[13px]">
          <a href="/admin/tournament" className="underline">
            ← back to admin
          </a>
        </p>
      </div>
    );
  }
  return <ManageView state={state} />;
}
