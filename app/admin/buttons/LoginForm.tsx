import { login } from "./auth";

export function LoginForm({ error }: { error?: boolean }) {
  return (
    <div className="min-h-screen bg-[#f7f7f7] text-[#101112]">
      <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col justify-center px-6 py-16">
        <div className="text-center">
          <span className="text-[13px] font-semibold uppercase tracking-[0.18em]">
            VVAULT
          </span>
          <h1 className="mt-6 text-[26px] font-semibold leading-tight">
            Restricted
          </h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-[#101112]/55">
            This dashboard is internal. Enter the password to continue.
          </p>
        </div>

        <form action={login} className="mt-8 flex flex-col gap-3">
          <input
            type="password"
            name="password"
            required
            autoFocus
            autoComplete="off"
            placeholder="Password"
            className="h-12 w-full rounded-2xl border border-[#101112]/[0.1] bg-white px-4 text-[15px] outline-none focus:border-[#101112]/30"
          />
          {error ? (
            <p className="text-[12.5px] text-[#c8443c]">
              Wrong password. Try again.
            </p>
          ) : null}
          <button
            type="submit"
            className="h-12 w-full rounded-2xl bg-black text-[14px] font-semibold text-white transition-colors hover:bg-[#101112]/90"
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
}
