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
    <div className="landing-root min-h-screen bg-black font-sans text-[#f0f0f0]">
      <main className="relative z-10 mx-auto flex min-h-screen max-w-[720px] flex-col items-center justify-center px-5 text-center">
        <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-white/30">404</p>
        <h1
          className="mt-4 text-3xl font-medium tracking-tight sm:text-[2.8rem]"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.45) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {heading}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-white/40">
          {message}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={homeHref}
            className="inline-flex items-center rounded-xl bg-white px-6 py-2.5 text-[14px] font-semibold text-[#0e0e0e] transition-colors duration-200 hover:bg-white/90"
          >
            {backHome}
          </Link>
          <Link
            href="/help"
            className="inline-flex items-center rounded-2xl bg-white/[0.06] px-6 py-2.5 text-[14px] font-medium text-white transition-colors duration-200 hover:bg-white/[0.1]"
          >
            {helpCenter}
          </Link>
        </div>
      </main>
    </div>
  );
}
