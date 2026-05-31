# Landing feature clips

The landing's 12 feature cards each look for a video here. They already
point at these filenames, so a card swaps from grey placeholder → video
the instant the files exist.

## Easiest path (recommended)
1. Record/export your 12 clips (short, 4–8s, looping). Audio doesn't matter.
2. Drop the raw `.mp4`s in any folder, named after the features below.
3. Run, from the project root (no ffmpeg install needed — it's bundled):
   ```
   node scripts/encode-landing-videos.mjs ~/your-clips-folder
   ```
   That writes optimized `<name>.webm`, `<name>.mp4`, and `<name>.webp`
   (poster) right here, sized + compressed for fast loading.

## The 12 names (case/space-insensitive)
```
upload        library      inbox        certificate
share         campaigns    analytics    contacts
sales         studio       linkinbio    profile
```

## How to render the clips
- **Aspect ratio: 10:11** (e.g. 1000×1100, or larger — the encoder downsizes
  to 880px wide, which is retina-crisp for the ~440px cards).
- **Bake the card-grey background in: `#0D0D0D`** (rgb 13,13,13). The page is
  pure black and the cards are `white/5%` over it, which equals `#0D0D0D`.
  Render the whole 10:11 frame on that grey — no transparency needed.
- **Leave the corners square.** The rounded corners (24px) are clipped in CSS,
  so the video itself should be a plain rectangle.
- Short loop (4–8s). Audio is dropped automatically.

## Notes
- Cards 1–4 = "One workspace for every track" (upload, library, inbox, certificate)
- Cards 5–8 = "Send it. Track all of it." (share, campaigns, analytics, contacts)
- Cards 9–12 = "Turn listens into a business." (sales, studio, linkinbio, profile)
- 6 are framed as iPhone, 6 as desktop — but record whichever view reads best;
  the frame is the same 10/11 for all.
- Each video only loads + plays when it scrolls into view (and pauses when it
  leaves), so all 12 stay light and the page scrolls smoothly.
