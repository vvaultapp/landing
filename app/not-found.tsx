import Link from "next/link";
import { cookies } from "next/headers";

export default async function NotFound() {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("vvault_locale")?.value;
  const fr = localeCookie === "fr";

  const heading = fr ? "Page introuvable" : "Page not found";
  const message = fr
    ? "La page que tu cherches n'existe pas ou a peut-être été déplacée."
    : "The page you're looking for doesn't exist or may have been moved.";
  const backHome = fr ? "Retour à l'accueil" : "Back to home";
  const helpCenter = fr ? "Centre d'aide" : "Help center";
  const homeHref = fr ? "/fr" : "/";

  return (
    <div className="landing-root min-h-screen bg-[rgb(var(--bg))] font-sans text-[rgb(var(--fg))]">
      <main className="relative z-10 mx-auto flex min-h-screen max-w-[720px] flex-col items-center justify-center px-5 text-center">
        <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-[rgb(var(--fg)_/_0.3)]">404</p>
        <h1
          className="mt-4 text-3xl font-medium tracking-tight sm:text-[2.8rem]"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.45) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "rgb(var(--fg))",
            backgroundClip: "text",
          }}
        >
          {heading}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-[rgb(var(--fg)_/_0.4)]">
          {message}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={homeHref}
            className="inline-flex items-center rounded-xl bg-[rgb(var(--inv))] px-6 py-2.5 text-[14px] font-semibold text-[rgb(var(--inv-fg))] transition-colors duration-200 hover:bg-[rgb(var(--ov)_/_0.9)]"
          >
            {backHome}
          </Link>
          <Link
            href="/help"
            className="inline-flex items-center rounded-2xl bg-[rgb(var(--ov)_/_0.06)] px-6 py-2.5 text-[14px] font-medium text-[rgb(var(--fg))] transition-colors duration-200 hover:bg-[rgb(var(--ov)_/_0.1)]"
          >
            {helpCenter}
          </Link>
        </div>
      </main>
    </div>
  );
}
