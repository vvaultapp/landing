import type { MetadataRoute } from "next";

const SITE_URL = "https://get.vvault.app";

// Routes that exist in both EN and FR (have alternates)
const BILINGUAL_ROUTES: ReadonlyArray<string> = ["/", "/signup"];

// EN-only routes (no FR equivalent yet)
const EN_ONLY_ROUTES: ReadonlyArray<string> = [
  "/about",
  "/help",
  "/pricing",
  "/contact",
  "/testimonials",
  "/certificate",
  "/privacy",
  "/terms",
  "/compare",
  // Download
  "/download",
  "/download/macos",
  "/download/windows",
  // Audience landing pages
  "/for/producers",
  "/for/artists",
  "/for/managers-and-labels",
  // Features
  "/features",
  "/features/library",
  "/features/contacts",
  "/features/campaigns",
  "/features/analytics",
  "/features/sales",
  "/features/profile",
  "/features/link-in-bio",
  "/features/studio",
  "/features/opportunities",
  // Docs
  "/docs",
  "/docs/introduction",
  "/docs/quickstart",
  "/docs/library",
  "/docs/contacts",
  "/docs/campaigns",
  "/docs/analytics",
  "/docs/sales",
  "/docs/profile",
  "/docs/share-links",
  "/docs/access-links",
  "/docs/audio-player",
  "/docs/embed-player",
  "/docs/link-in-bio",
  "/docs/studio",
  "/docs/wavematch",
  "/docs/writing-sessions",
  "/docs/teams",
  "/docs/opportunities",
  "/docs/desktop-app",
  "/docs/certificate",
  "/docs/plans",
  // Blog
  "/blog",
  "/blog/how-to-send-beats-to-artists",
  "/blog/vvault-vs-google-drive-for-producers",
  "/blog/vvault-vs-beatstars",
  "/blog/vvault-vs-dropbox-for-producers",
  "/blog/how-to-track-who-listened-to-your-beats",
  "/blog/how-to-follow-up-after-sending-beats",
  "/blog/how-to-organize-your-beat-catalog",
  "/blog/best-tools-for-sending-beats",
  "/blog/what-is-tracked-music-sending",
  "/blog/how-to-get-more-placements-as-a-producer",
];

const HIGH_PRIORITY = new Set<string>(["/", "/signup", "/pricing", "/download"]);
const MEDIUM_PRIORITY = new Set<string>([
  "/features",
  "/about",
  "/help",
  "/testimonials",
  "/compare",
  "/blog",
  "/docs",
]);

function priorityFor(route: string): number {
  if (HIGH_PRIORITY.has(route)) return 1.0;
  if (MEDIUM_PRIORITY.has(route)) return 0.8;
  if (route.startsWith("/blog/")) return 0.7;
  if (route.startsWith("/features/")) return 0.7;
  if (route.startsWith("/docs/")) return 0.6;
  if (route.startsWith("/for/")) return 0.7;
  if (route.startsWith("/download/")) return 0.7;
  return 0.5;
}

function changeFrequencyFor(
  route: string,
): "weekly" | "monthly" | "yearly" {
  if (route === "/privacy" || route === "/terms") return "yearly";
  if (route.startsWith("/blog/") || route.startsWith("/docs/")) return "monthly";
  return "weekly";
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const bilingualEntries: MetadataRoute.Sitemap = BILINGUAL_ROUTES.map(
    (route) => {
      const enUrl = `${SITE_URL}${route === "/" ? "" : route}`;
      const frUrl = `${SITE_URL}/fr${route === "/" ? "" : route}`;
      return {
        url: enUrl,
        lastModified,
        changeFrequency: changeFrequencyFor(route),
        priority: priorityFor(route),
        alternates: {
          languages: {
            en: enUrl,
            fr: frUrl,
          },
        },
      };
    },
  );

  // Also list FR routes as their own entries (so search engines crawl them directly)
  const frEntries: MetadataRoute.Sitemap = BILINGUAL_ROUTES.map((route) => {
    const enUrl = `${SITE_URL}${route === "/" ? "" : route}`;
    const frUrl = `${SITE_URL}/fr${route === "/" ? "" : route}`;
    return {
      url: frUrl,
      lastModified,
      changeFrequency: changeFrequencyFor(route),
      priority: priorityFor(route),
      alternates: {
        languages: {
          en: enUrl,
          fr: frUrl,
        },
      },
    };
  });

  const enOnlyEntries: MetadataRoute.Sitemap = EN_ONLY_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified,
    changeFrequency: changeFrequencyFor(route),
    priority: priorityFor(route),
  }));

  return [...bilingualEntries, ...frEntries, ...enOnlyEntries];
}
