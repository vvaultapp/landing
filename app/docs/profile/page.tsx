export default function ProfileDocPage() {
  return (
    <>
      <p className="text-[12px] tracking-wider text-[#999]">
        Features
      </p>
      <h1 className="mt-4 text-[1.75rem] font-semibold text-[#111] mb-1">
        Profile
      </h1>
      <p className="text-[15px] text-[#999] mb-8">
        Your public page with custom branding.
      </p>

      {/* Public page */}
      <h2 id="public-page" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Public page
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Every vvault user gets a public profile page at{" "}
        <code className="bg-[#f0f0f0] px-1.5 py-0.5 rounded text-[13px] text-emerald-600 font-mono">
          vvault.app/@yourhandle
        </code>
        . Your profile serves as a landing page for your music and brand.
      </p>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Your public page displays:
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>Profile picture and banner image</li>
        <li>Bio and display name</li>
        <li>Public tracks</li>
        <li>Packs</li>
        <li>Sound kits</li>
        <li>Series</li>
      </ul>

      {/* Placements */}
      <h2 id="placements" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Placements
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Showcase your placement credits directly on your profile. Placements can be added from the following platforms:
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>Spotify</li>
        <li>YouTube</li>
        <li>SoundCloud</li>
        <li>Apple Music</li>
      </ul>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        You can also add manual entries for placements on other platforms or in media that isn&apos;t linked to a streaming service. Placements appear prominently on your profile to build credibility with potential buyers and collaborators.
      </p>

      {/* Social links */}
      <h2 id="social" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Social links
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Add your social media links to your profile so visitors can find you across platforms:
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>Instagram</li>
        <li>YouTube</li>
        <li>TikTok</li>
      </ul>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Social links are displayed as icons on your public profile page.
      </p>

      {/* Theme customization */}
      <h2 id="themes" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Theme customization
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Available on Pro and Ultra plans. Customize the look and feel of your public profile with theme options:
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li><strong className="text-[#444]">Custom background images</strong> &mdash; Upload a background image for your profile page.</li>
        <li><strong className="text-[#444]">Theme presets</strong> &mdash; Choose from multiple pre-built theme styles.</li>
        <li><strong className="text-[#444]">CSS color variables</strong> &mdash; Fine-tune individual colors for background, foreground, accent, card, and border elements.</li>
      </ul>
      <div className="rounded-xl border-l-2 border-blue-400 bg-blue-50 p-4 text-[13px] text-[#666] mb-4">
        <strong className="text-[#444]">Note:</strong> Browse section highlight is an Ultra-exclusive feature that gives your profile enhanced visibility in the vvault browse directory.
      </div>
    </>
  );
}
