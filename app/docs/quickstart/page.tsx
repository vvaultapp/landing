import Link from "next/link";

export default function QuickstartPage() {
  return (
    <>
      <p className="text-[12px] tracking-wider text-[#999]">
        Getting Started
      </p>
      <h1 className="mt-4 text-[1.75rem] font-semibold text-[#111] mb-1">
        Quickstart
      </h1>
      <p className="text-[15px] text-[#999] mb-8">
        Get up and running with vvault in under 5 minutes.
      </p>

      {/* Create your account */}
      <h2 id="create-account" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Create your account
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Head to{" "}
        <a href="https://vvault.app/signup" className="text-emerald-600 underline underline-offset-2">
          vvault.app
        </a>{" "}
        and sign up with your email or Google account. Once registered, set your display name, unique handle (this becomes your public URL), and upload a profile picture.
      </p>
      <div className="rounded-xl border-l-2 border-blue-400 bg-blue-50 p-4 text-[13px] text-[#666] mb-4">
        <strong className="text-[#444]">Tip:</strong> Your handle determines your public profile URL at{" "}
        <code className="bg-[#f0f0f0] px-1.5 py-0.5 rounded text-[13px] text-emerald-600 font-mono">
          vvault.app/@yourhandle
        </code>
        . Choose something memorable.
      </div>

      {/* Upload your first tracks */}
      <h2 id="upload-tracks" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Upload your first tracks
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Navigate to your Library and drag and drop audio files directly into the upload area, or use the file picker. vvault supports the following formats:
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>WAV</li>
        <li>MP3</li>
        <li>FLAC</li>
        <li>AIF / AIFF</li>
        <li>OGG</li>
        <li>M4A</li>
      </ul>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        You can also upload <strong className="text-[#444]">ZIP files</strong> &mdash; they auto-extract and import all audio files inside. Metadata like BPM and musical key is automatically parsed from filenames when detected.
      </p>

      {/* Create a pack */}
      <h2 id="create-pack" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Create a pack
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Organize your tracks into packs. Each pack can have custom artwork &mdash; upload a cover image in PNG, JPG, WEBP, or GIF format (max 20 MB).
      </p>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Set your pack visibility to control who can access it:
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li><strong className="text-[#444]">Private</strong> &mdash; Only you can see and access the pack.</li>
        <li><strong className="text-[#444]">Link-only</strong> &mdash; Anyone with the direct link can view the pack.</li>
        <li><strong className="text-[#444]">Public</strong> &mdash; Visible on your public profile and in search.</li>
      </ul>

      {/* Send your first campaign */}
      <h2 id="send-campaign" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Send your first campaign
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Go to the Campaigns section and create a new campaign. Compose your message, attach a pack or individual tracks, and add your recipients. vvault generates secure download links for each pack attachment.
      </p>
      <div className="rounded-xl border-l-2 border-blue-400 bg-blue-50 p-4 text-[13px] text-[#666] mb-4">
        <strong className="text-[#444]">Free plan limits:</strong> 1 campaign per day with a maximum of 5 recipients per campaign. Upgrade to Pro or Ultra for unlimited campaigns and recipients.
      </div>

      {/* Track engagement */}
      <h2 id="track-engagement" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Track engagement
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        After sending a campaign, visit your Analytics dashboard to monitor how recipients interact with your music. vvault tracks:
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li><strong className="text-[#444]">Opens</strong> &mdash; Who opened your email</li>
        <li><strong className="text-[#444]">Clicks</strong> &mdash; Who clicked through to your content</li>
        <li><strong className="text-[#444]">Plays</strong> &mdash; Who listened to your tracks</li>
        <li><strong className="text-[#444]">Downloads</strong> &mdash; Who downloaded your files</li>
        <li><strong className="text-[#444]">Saves</strong> &mdash; Who favorited or saved your tracks</li>
      </ul>

      {/* Next steps */}
      <h2 id="next-steps" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Next steps
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Now that you have the basics down, explore more of what vvault offers:
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>
          <Link href="/docs/library" className="text-emerald-600 underline underline-offset-2">
            Library
          </Link>{" "}
          &mdash; Advanced upload settings, folders, and metadata
        </li>
        <li>
          <Link href="/docs/campaigns" className="text-emerald-600 underline underline-offset-2">
            Campaigns
          </Link>{" "}
          &mdash; Gmail integration, scheduling, and follow-ups
        </li>
        <li>
          <Link href="/docs/analytics" className="text-emerald-600 underline underline-offset-2">
            Analytics
          </Link>{" "}
          &mdash; Engagement funnels, heatmaps, and best-time analysis
        </li>
        <li>
          <Link href="/docs/contacts" className="text-emerald-600 underline underline-offset-2">
            Contacts
          </Link>{" "}
          &mdash; CRM, lead scoring, and contact timeline
        </li>
        <li>
          <Link href="/docs/sales" className="text-emerald-600 underline underline-offset-2">
            Sales &amp; Marketplace
          </Link>{" "}
          &mdash; Sell your beats with Stripe checkout
        </li>
      </ul>
    </>
  );
}
