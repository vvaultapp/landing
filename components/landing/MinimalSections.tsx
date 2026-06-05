import type { Locale } from "@/components/landing/content";
import { LoopingVideo } from "@/components/landing/LoopingVideo";

/* ─────────────────────────────────────────────────────────────
   Minimal landing sections.
   Every visual is a labelled PLACEHOLDER (transparent + low-opacity
   outline) — drop a screenshot/video in later; the label says
   desktop vs iPhone. Features are a compact visual BENTO (1 big +
   row of 2 + row of 3), prioritised from real usage data, with a
   one-line "and more" for breadth.
   Design rules: no full caps, no kickers/subheadlines, small + very
   spaced headlines, one short line of copy per card.
   ───────────────────────────────────────────────────────────── */

const CONTAINER =
  "mx-auto w-full max-w-[clamp(1320px,92vw,2400px)] px-5 sm:px-8 lg:px-10";

const HEADING =
  "font-display text-[1.25rem] font-medium leading-[1.3] tracking-tight text-white sm:text-[1.55rem] lg:text-[1.8rem]";

/* Shared fit classes for the visual inside a card — reused by the auto-loop
   <video> clips AND the static <img> screenshots so they frame identically,
   with the same 14px rounded corners. */
const FIT_CENTERED =
  "left-1/2 top-1/2 max-h-[86%] max-w-[88%] -translate-x-1/2 -translate-y-1/2 rounded-[14px] object-contain";
/* portrait/phone shots: big, bottom-anchored, bleeding a touch off the bottom */
const FIT_TALL =
  "bottom-0 left-1/2 h-[98%] w-auto -translate-x-1/2 translate-y-[4%] rounded-[14px] object-contain object-bottom";

/* Image/video slot — transparent (page-black) with a low-opacity
   outline. `className` sets aspect ratio + width. */
function Placeholder({
  label,
  src,
  poster,
  image,
  className = "",
  fit,
}: {
  label: string;
  /** Video base path (no extension). When set, an auto-loop video
      fills the card instead of the grey placeholder. */
  src?: string;
  poster?: string;
  /** Static screenshot path (webp). When set, a still image fills the card
      instead of a video — far lighter, and lazy-loaded below the fold. */
  image?: string;
  className?: string;
  /** Per-card fit override (size + vertical position). Defaults to centered. */
  fit?: string;
}) {
  return (
    <div
      data-image-placeholder
      className={`relative flex items-center justify-center overflow-hidden rounded-[24px] bg-white/[0.12] ${className}`}
    >
      {image ? (
        <img
          src={image}
          alt={label}
          loading="lazy"
          decoding="async"
          draggable={false}
          className={`absolute pointer-events-none select-none ${fit || FIT_CENTERED}`}
        />
      ) : src ? (
        <LoopingVideo
          src={src}
          poster={poster}
          fitOverride={fit}
          className="absolute"
          tallClassName={FIT_TALL}
          centeredClassName={FIT_CENTERED}
        />
      ) : (
        <span className="px-4 text-center text-[11px] font-medium tracking-wide text-white/30">
          {label}
        </span>
      )}
    </div>
  );
}

/* One feature card: visual on top, small clean headline + one line. */
function FeatureCard({
  label,
  title,
  copy,
  aspect = "aspect-[4/3]",
  src,
  poster,
  image,
  fit,
}: {
  label: string;
  title: string;
  copy: string;
  aspect?: string;
  src?: string;
  poster?: string;
  image?: string;
  fit?: string;
}) {
  return (
    <div>
      <Placeholder label={label} src={src} poster={poster} image={image} fit={fit} className={`${aspect} w-full`} />
      <h3 className="mt-5 text-[15px] font-medium text-white">{title}</h3>
      <p className="mt-1.5 max-w-[320px] text-[13px] leading-relaxed text-white/40">
        {copy}
      </p>
    </div>
  );
}

/* 2. Big product shot — no words, just the product. */
export function ProductShotSection({ locale = "en" }: { locale?: Locale }) {
  void locale;
  return (
    <section className="py-[75px] sm:py-[107px] lg:py-[139px]">
      <div className={CONTAINER}>
        <Placeholder
          label="Product screenshot or video · desktop webapp"
          className="mx-auto aspect-[16/10] w-full max-w-[1080px]"
        />
      </div>
    </section>
  );
}

/* 3. The problem — text only, second line muted. */
export function ProblemStatementSection({ locale = "en" }: { locale?: Locale }) {
  const fr = locale === "fr";
  return (
    <section className="py-[75px] sm:py-[107px] lg:py-[139px]">
      <div className="mx-auto max-w-[820px] px-5 text-center">
        <h2 className={HEADING}>
          {fr ? "Ta musique vit dans six apps." : "Your music lives in six apps."}
          <br />
          <span className="text-white/35">
            {fr ? "Tu perds de l'argent entre les deux." : "You're losing money in the gaps."}
          </span>
        </h2>
      </div>
    </section>
  );
}

/* 4. Features — 12 cards under 3 headlines (4 each, 2×2), with big
   spacing between headlines. Ordered as a learning flow so a cold
   visitor "gets it" top to bottom: bring it in → send & track →
   grow into a business. Half iPhone, half desktop (every feature is
   on both). Full-grey 10/11 cards. */
export function FeatureSection({ locale = "en" }: { locale?: Locale }) {
  const fr = locale === "fr";
  const groups: {
    h1: string;
    h2: string;
    cards: { label: string; title: string; copy: string; src?: string; poster?: string; image?: string; fit?: string }[];
  }[] = [
    {
      h1: fr ? "L'outil tout-en-un" : "The all-in-one tool",
      h2: fr ? "pour les pros de la musique." : "for music professionals.",
      cards: [
        { label: "Upload · iPhone", title: fr ? "Dépose tout dedans" : "Drop it all in", copy: fr ? "Beats, loops, stems et ZIPs, triés à l'arrivée et chiffrés pour que rien ne fuite avant l'heure." : "Beats, loops, stems and ZIPs, sorted on arrival and encrypted so nothing leaks before you're ready.", src: "/landing/features/upload", poster: "/landing/features/upload.webp", fit: FIT_TALL },
        { label: "Library · desktop", title: fr ? "Des packs, prêts à partager" : "Packs, ready to share", copy: fr ? "Regroupe tes tracks en packs, partagés via des liens privés que seules les personnes choisies ouvrent." : "Bundle tracks into packs, shared through private links only the people you choose can open.", image: "/landing/features/folder.webp" },
        { label: "Inbox · iPhone", title: fr ? "Une inbox pour les beats reçus" : "An inbox for incoming beats", copy: fr ? "Tout ce qu'on t'envoie arrive dans un feed privé que toi seul peux voir." : "Everything sent your way lands in one private feed only you can see.", image: "/landing/features/inbox.webp" },
        { label: "Certificate · desktop", title: fr ? "La preuve que c'est toi le premier" : "Proof you made it first", copy: fr ? "Chaque upload est horodaté avec un certificat de propriété, pour que ton travail soit incontestablement le tien." : "Every upload is timestamped with a certificate of ownership, so your work is provably yours.", image: "/landing/features/certificate.webp" },
      ],
    },
    {
      h1: fr ? "Envoie. Track tout." : "Send it. Track all of it.",
      h2: fr ? "vvault te dit ce qui marche." : "vvault tells you what's working.",
      cards: [
        { label: "Wavematch · desktop", title: fr ? "Trouve qui a utilisé tes beats" : "Find who used your beats", copy: fr ? "On scanne Spotify, YouTube et Apple Music pour qu'aucun beat volé ou non crédité ne passe." : "We scan Spotify, YouTube and Apple Music so stolen or uncredited beats never slip by.", src: "/landing/features/wavematch", poster: "/landing/features/wavematch.webp" },
        { label: "Campaigns · desktop", title: fr ? "Touche toute ta liste" : "Reach your whole list", copy: fr ? "Envoie à toute ta liste, directement depuis ton Gmail." : "Send beats to your whole list, straight from your own Gmail.", image: "/landing/features/campaigns.webp" },
        { label: "Analytics · iPhone", title: fr ? "Chaque ouverture, écoute, download" : "Every open, play and download", copy: fr ? "Regarde l'activité arriver en live dès qu'ils lancent la lecture." : "Watch the activity roll in the second they hit play.", image: "/landing/features/analytics.webp", fit: FIT_TALL },
        { label: "Contacts · desktop", title: fr ? "Un CRM pour ton son" : "A CRM for your sound", copy: fr ? "Chaque contact scoré auto selon qui ouvre, écoute et achète." : "Every contact auto-scored by who opens, plays and buys.", image: "/landing/features/crm.webp" },
      ],
    },
    {
      h1: fr ? "Transforme ton catalogue en business." : "Turn your catalog into a business.",
      h2: fr ? "Vends, poste, grandis." : "Sell, post and grow.",
      cards: [
        { label: "Sales · desktop", title: fr ? "Vends direct à tes fans" : "Sell straight to fans", copy: fr ? "Ton checkout, tes prix, sur une page Stripe sécurisée. Garde 95 à 100%." : "Your checkout, your prices, on a secure Stripe page. Keep 95 to 100%.", image: "/landing/features/sell.webp", fit: FIT_TALL },
        { label: "Studio · iPhone", title: fr ? "Poste partout en autopilote" : "Post everywhere on autopilot", copy: fr ? "Reels, Shorts et TikToks générés depuis un seul track." : "Auto-cut Reels, Shorts and TikToks from a single track.", image: "/landing/features/studio.webp", fit: FIT_TALL },
        { label: "Unlimited storage · iPhone", title: fr ? "Stockage illimité" : "Unlimited storage", copy: fr ? "Tous les beats et stems que tu feras, chiffrés et sauvegardés, à l'abri pour toujours." : "Every beat and stem you'll ever make, encrypted and backed up, safe forever.", src: "/landing/features/unlimitedstorage", poster: "/landing/features/unlimitedstorage.webp" },
        { label: "Profile · iPhone", title: fr ? "Un profil qui te fait booker" : "A profile that books you", copy: fr ? "Montre ton meilleur au monde, pendant que ton travail inédit reste privé." : "Show the world your best while your unreleased work stays private.", image: "/landing/features/profile.webp", fit: FIT_TALL },
      ],
    },
  ];

  return (
    <section className="py-[75px] sm:py-[107px] lg:py-[139px]">
      <div className={CONTAINER}>
        <div className="mx-auto flex max-w-[920px] flex-col gap-[150px] sm:gap-[214px] lg:gap-[278px]">
          {groups.map((g, i) => (
            // Nudge only the FIRST group ("The all-in-one tool…") down a bit on
            // mobile; reset at sm+ so tablet/desktop spacing is unchanged.
            <div key={g.h1} className={i === 0 ? "mt-16 sm:mt-0" : undefined}>
              <h2 className={`mx-auto max-w-[640px] text-center ${HEADING}`}>
                {g.h1}
                <br />
                <span className="text-white/35">{g.h2}</span>
              </h2>
              <div className="mt-[150px] grid grid-cols-1 gap-x-8 gap-y-12 sm:mt-[214px] sm:grid-cols-2 lg:mt-[278px]">
                {g.cards.map((c) => (
                  <FeatureCard key={c.label} {...c} aspect="aspect-[1/1]" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
