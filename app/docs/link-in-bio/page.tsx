export default function LinkInBioDocPage() {
  return (
    <>
      <p className="text-[12px] tracking-wider text-[#999]">
        Features
      </p>
      <h1 className="mt-4 text-[1.75rem] font-semibold text-[#111] mb-1">
        Link in Bio
      </h1>
      <p className="text-[15px] text-[#999] mb-8">
        One smart link for all your content.
      </p>

      {/* Overview */}
      <h2 id="overview" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Overview
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        The Link in Bio feature gives you a single destination page that aggregates all your public content in one place. Instead of managing multiple links across your social media profiles, share one vvault URL that leads visitors to everything you offer.
      </p>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Use it as your primary link on Instagram, TikTok, YouTube, and anywhere else you want to direct fans and potential buyers to your music.
      </p>
      <div className="rounded-xl border-l-2 border-blue-400 bg-blue-50 p-4 text-[13px] text-[#666] mb-4">
        <strong className="text-[#444]">Tip:</strong> Your Link in Bio page is available on all plans, including Free. Set it up in your profile settings.
      </div>

      {/* What's included */}
      <h2 id="included" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        What&apos;s included
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Your Link in Bio page automatically displays:
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li><strong className="text-[#444]">All public tracks</strong> &mdash; Every track you have set to public visibility.</li>
        <li><strong className="text-[#444]">Packs</strong> &mdash; Your public packs with artwork and track listings.</li>
        <li><strong className="text-[#444]">Sound kits</strong> &mdash; Downloadable or purchasable sound kits.</li>
      </ul>

      <h3 className="text-[15px] font-medium text-[#333] mt-6 mb-2">
        Engagement tracking
      </h3>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Every visit and click on your Link in Bio page is tracked. You can see:
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>Total page views</li>
        <li>Click-through rates on individual items</li>
        <li>Download activity</li>
      </ul>

      <h3 className="text-[15px] font-medium text-[#333] mt-6 mb-2">
        Direct actions
      </h3>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Visitors to your Link in Bio page can:
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>Download tracks and packs directly</li>
        <li>Share content to their own social platforms</li>
        <li>Purchase licenses through the marketplace checkout</li>
      </ul>
    </>
  );
}
