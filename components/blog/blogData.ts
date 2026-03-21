export type BlogArticle = {
  slug: string;
  title: string;
  titleTag: string;
  description: string;
  publishedDate: string;
  readingTime: string;
  category: "guide" | "comparison";
};

export const articles: BlogArticle[] = [
  {
    slug: "how-to-send-beats-to-artists",
    title: "How to Send Beats to Artists Professionally in 2026",
    titleTag: "How to Send Beats to Artists Professionally in 2026 — vvault",
    description:
      "The complete guide to sending beats to artists, rappers, and labels. Learn how to build beat packs, write outreach emails, track who listened, and follow up at the right time.",
    publishedDate: "2026-03-15",
    readingTime: "12 min",
    category: "guide",
  },
  {
    slug: "vvault-vs-google-drive-for-producers",
    title: "vvault vs Google Drive for Music Producers",
    titleTag: "vvault vs Google Drive for Music Producers — Which One Should You Use?",
    description:
      "Google Drive stores files. vvault helps you organize, send, track, and follow up on your music. Here is a detailed comparison for producers who want more than storage.",
    publishedDate: "2026-03-12",
    readingTime: "7 min",
    category: "comparison",
  },
  {
    slug: "vvault-vs-beatstars",
    title: "vvault vs BeatStars: Selling Beats vs Sending Beats Professionally",
    titleTag: "vvault vs BeatStars — Selling Beats vs Sending Beats Professionally",
    description:
      "BeatStars is a beat marketplace. vvault is a professional sending and tracking workspace. Here is when to use each — and why most serious producers need both.",
    publishedDate: "2026-03-10",
    readingTime: "6 min",
    category: "comparison",
  },
  {
    slug: "vvault-vs-dropbox-for-producers",
    title: "vvault vs Dropbox for Music Producers",
    titleTag: "vvault vs Dropbox for Music Producers — Storage vs Tracked Sending",
    description:
      "Dropbox stores files and shares links. vvault organizes your music, sends it professionally, and shows you who actually listened. Full comparison for producers.",
    publishedDate: "2026-03-08",
    readingTime: "5 min",
    category: "comparison",
  },
  {
    slug: "how-to-track-who-listened-to-your-beats",
    title: "How to Track Who Listened to Your Beats After Sending",
    titleTag: "How to Track Who Listened to Your Beats After Sending — vvault",
    description:
      "Stop sending beats blindly. Learn how to track opens, plays, downloads and follow up based on real engagement data using tracked music sending.",
    publishedDate: "2026-03-06",
    readingTime: "6 min",
    category: "guide",
  },
  {
    slug: "how-to-follow-up-after-sending-beats",
    title: "How to Follow Up After Sending Beats Without Being Annoying",
    titleTag: "How to Follow Up After Sending Beats — Without Being Annoying",
    description:
      "Following up is where placements happen. Learn when to follow up, what to say, and how to use engagement data to time your follow-ups perfectly.",
    publishedDate: "2026-03-04",
    readingTime: "6 min",
    category: "guide",
  },
  {
    slug: "how-to-organize-your-beat-catalog",
    title: "How to Organize Your Beat Catalog Like a Pro",
    titleTag: "How to Organize Your Beat Catalog Like a Pro — vvault",
    description:
      "A messy catalog makes you slower and less professional. Learn how to organize beats into folders, packs, and series so your music is always ready to send.",
    publishedDate: "2026-03-02",
    readingTime: "5 min",
    category: "guide",
  },
  {
    slug: "best-tools-for-sending-beats",
    title: "Best Tools for Sending Beats to Artists in 2026",
    titleTag: "Best Tools for Sending Beats to Artists in 2026 — Compared",
    description:
      "A ranked comparison of the best tools producers use to send beats in 2026, from Google Drive and Dropbox to vvault, BeatStars, email, and more.",
    publishedDate: "2026-03-01",
    readingTime: "8 min",
    category: "comparison",
  },
  {
    slug: "what-is-tracked-music-sending",
    title: "What Is Tracked Music Sending and Why Producers Need It",
    titleTag: "What Is Tracked Music Sending and Why Producers Need It",
    description:
      "Tracked music sending replaces blind file sharing with engagement data. Learn what it means, how it works, and why it changes how producers follow up and land placements.",
    publishedDate: "2026-02-28",
    readingTime: "5 min",
    category: "guide",
  },
  {
    slug: "how-to-get-more-placements-as-a-producer",
    title: "How to Get More Placements as a Producer in 2026",
    titleTag: "How to Get More Placements as a Producer in 2026",
    description:
      "Placements come from process, not luck. Learn the full system for landing more placements: catalog preparation, targeted outreach, tracked sending, and smart follow-up.",
    publishedDate: "2026-02-25",
    readingTime: "9 min",
    category: "guide",
  },
];

export function getArticle(slug: string): BlogArticle | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getRelatedArticles(slugs: string[]): BlogArticle[] {
  return slugs.map((s) => articles.find((a) => a.slug === s)).filter(Boolean) as BlogArticle[];
}
