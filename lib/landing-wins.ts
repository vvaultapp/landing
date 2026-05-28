/* "Wins" — real screenshots of producers using vvault: famous artists
   pulling up beats, Stripe sales succeeding, live tracking feeds, and
   stacks of activity notifications. Used by the landing's WinsSection
   (the 12 featured ones) and the /reviews page (the full wall).

   Files live in /public/wins and are pre-resized to <=800px wide.
   They're rendered through next/image, which serves AVIF/WebP at the
   exact displayed size with lazy-loading + a 1-year cache, so the
   browser only ever downloads a few KB per visible card. The `w`/`h`
   are the intrinsic pixel dimensions (needed by next/image to reserve
   layout space and avoid CLS, especially in the masonry). */

export type Win = {
  src: string;
  /* Short alt/caption describing the win, for a11y + context. */
  alt: string;
  /* Intrinsic dimensions of the (resized) source file. */
  w: number;
  h: number;
  featured?: boolean;
};

export const WINS: Win[] = [
  // ── Featured 12 (landing), most impressive first. The €1,000+
  //    total-sales screenshots and the biggest artists lead, so the
  //    top of the grid (and the top of the reviews wall, which reuses
  //    this order) hits hardest. ──
  { src: "/wins/1504500539109413026_image.png", alt: "Total sales of €1,046 on vvault", w: 484, h: 229, featured: true },
  { src: "/wins/1490411076385247254_IMG_3214.png", alt: "Trippie Redd and YBN Nahmir downloading beats from vvault", w: 765, h: 1658, featured: true },
  { src: "/wins/1507043906452455434_IMG_5550.png", alt: "Total sales of €1,014 on vvault", w: 410, h: 312, featured: true },
  { src: "/wins/1498374346442408026_IMG_3293.png", alt: "Ninho opening, playing and downloading tracks on vvault", w: 800, h: 745, featured: true },
  { src: "/wins/1502929874531258479_Screenshot_2026-05-10_at_09.05.30.png", alt: "Six successful €75 Stripe payments in a row", w: 644, h: 434, featured: true },
  { src: "/wins/1503400053799260291_IMG_1765.png", alt: "vvault sales feed: 3,553 plays and 20 sound kit sales", w: 800, h: 1734, featured: true },
  { src: "/wins/1487087268219846757_Screenshot_2026-03-27_at_14.53.45.png", alt: "Zola playing, clicking and opening a pack in the vvault feed", w: 800, h: 455, featured: true },
  { src: "/wins/1492885922772025414_IMG_8889.png", alt: "slimka downloading and playing a vvault track", w: 800, h: 255, featured: true },
  { src: "/wins/1462587258044678396_IMG_4240.png", alt: "Successful €40 Stripe payment on vvault", w: 800, h: 1734, featured: true },
  { src: "/wins/1496587722108698895_IMG_2432.png", alt: "A stack of live vvault activity notifications on a lock screen", w: 800, h: 1731, featured: true },
  { src: "/wins/1462919258077008053_IMG_4257.png", alt: "vvault Stripe balance and recent payouts", w: 800, h: 1734, featured: true },
  { src: "/wins/1498421630005805116_Capture_decran_2026-04-27_223029.png", alt: "ICYTWAT downloading beats from vvault", w: 687, h: 207, featured: true },

  // ── The rest (reviews wall), notable ones first. ──────────────
  { src: "/wins/1494052015213645904_IMG_3470.jpg", alt: "Notifications: 105 downloads, 2 sales", w: 800, h: 1066 },
  { src: "/wins/1497511811224702976_IMG_6849.png", alt: "Lock screen full of vvault play notifications", w: 800, h: 1732 },
  { src: "/wins/1498378993206951967_IMG_5315.png", alt: "Stack of vvault activity notifications", w: 800, h: 1731 },
  { src: "/wins/1478658620504801453_image.png", alt: "Recent revenue chart on vvault", w: 800, h: 646 },
  { src: "/wins/1493195477095813140_IMG_1298.png", alt: "vvault campaign analytics, 377 emails sent", w: 800, h: 1731 },
  { src: "/wins/1493216725670297680_IMG_9890.png", alt: "Campaign analytics: 53 clicks, 168 plays", w: 800, h: 1108 },
  { src: "/wins/1495496712922337420_IMG_1735.png", alt: "Green Montana activity timeline on vvault", w: 800, h: 1739 },
  { src: "/wins/1501611609792057507_IMG_1056.png", alt: "Activity feed full of plays and downloads", w: 785, h: 1699 },
  { src: "/wins/1491430775227154642_6D42592E-9EB8-4438-A80A-94B353A72D17.jpg", alt: "vvault activity feed full of downloads", w: 800, h: 850 },
  { src: "/wins/1493320035953938604_IMG_3438.png", alt: "Producer testimonial DM about vvault", w: 800, h: 412 },
  { src: "/wins/1467582908733591746_IMG_2197.png", alt: "Artist crediting vvault in their story", w: 800, h: 1734 },
  { src: "/wins/1457648047575011431_IMG_2093.png", alt: "Artist recording on a vvault beat", w: 709, h: 510 },
  { src: "/wins/1502422110650372260_IMG_5486.jpg", alt: "Artist sending a finished record back over WhatsApp", w: 800, h: 779 },
  { src: "/wins/1498808434068557914_IMG_5352.png", alt: "Live clicks, opens and plays on a campaign", w: 800, h: 917 },
  { src: "/wins/1503070387754242058_Capture_decran_2026-05-10_a_18.24.39.png", alt: "vvault desktop notifications panel", w: 800, h: 519 },
  { src: "/wins/1493785621905543285_image.png", alt: "Activity feed of opens, clicks and downloads", w: 800, h: 242 },
  { src: "/wins/1493390697070460949_image.png", alt: "Pack opened and clicked on vvault", w: 549, h: 172 },
  { src: "/wins/1502057590912450590_image.png", alt: "Latest verified activity on vvault", w: 477, h: 220 },
];

export const FEATURED_WINS = WINS.filter((w) => w.featured);
