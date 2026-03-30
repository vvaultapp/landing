export default function AnalyticsDocPage() {
  return (
    <>
      <p className="text-[12px] tracking-wider text-[#999]">
        Features
      </p>
      <h1 className="mt-4 text-[1.75rem] font-semibold text-[#111] mb-1">
        Analytics
      </h1>
      <p className="text-[15px] text-[#999] mb-8">
        Track every interaction with your music.
      </p>

      {/* KPI metrics */}
      <h2 id="kpis" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        KPI metrics
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        vvault tracks seven key performance indicators across all your campaigns and shared content:
      </p>
      <div className="mt-4 overflow-hidden rounded-xl border border-[#e5e5e5] mb-4">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#f5f5f5]">
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555]">Metric</th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555]">Description</th>
            </tr>
          </thead>
          <tbody className="text-[#666]">
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2 font-medium text-[#444]">Opens</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Email opens, tracked as verified (pixel-confirmed) and unverified</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2 font-medium text-[#444]">Clicks</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Link clicks within your campaign emails</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2 font-medium text-[#444]">Plays</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Track listens with play duration tracking</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2 font-medium text-[#444]">Downloads</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">File downloads from your shared packs and tracks</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2 font-medium text-[#444]">Saves / Favorites</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">When a recipient saves or favorites your content</td>
            </tr>
            <tr>
              <td className="px-3 py-2 font-medium text-[#444]">Purchases</td>
              <td className="px-3 py-2">Completed sales through the marketplace</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="rounded-xl border-l-2 border-blue-400 bg-blue-50 p-4 text-[13px] text-[#666] mb-4">
        <strong className="text-[#444]">Note:</strong> Full analytics (plays, downloads, saves, purchases) require a Pro or Ultra plan. Free plan users have access to basic open and click tracking only.
      </div>

      {/* Dashboard */}
      <h2 id="dashboard" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Dashboard
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        The analytics dashboard gives you a comprehensive view of how your content is performing. It includes:
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li><strong className="text-[#444]">KPI summary cards</strong> &mdash; At-a-glance numbers for each tracked metric.</li>
        <li><strong className="text-[#444]">Activity timeline chart</strong> &mdash; Visualize engagement trends over time.</li>
        <li><strong className="text-[#444]">Latest activity panel</strong> &mdash; A real-time feed of recent interactions (opens, plays, downloads).</li>
        <li><strong className="text-[#444]">Heatmap visualization</strong> &mdash; See engagement patterns by day and time.</li>
        <li><strong className="text-[#444]">Best time to send analysis</strong> &mdash; Suggested optimal send times based on your audience behavior (Pro and Ultra).</li>
        <li><strong className="text-[#444]">Advanced insight cards</strong> &mdash; Deeper breakdowns of engagement patterns (Pro and Ultra).</li>
        <li><strong className="text-[#444]">Engagement funnel</strong> &mdash; Visual funnel from sent to downloaded.</li>
      </ul>

      {/* Engagement funnel */}
      <h2 id="funnel" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Engagement funnel
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        The engagement funnel visualizes the journey recipients take with your content, stage by stage:
      </p>
      <div className="flex flex-col items-center gap-2 mb-4">
        {["Sent", "Opened", "Clicked", "Played", "Downloaded"].map((stage, i) => (
          <div key={stage} className="flex items-center gap-2">
            <span
              className="inline-block rounded-lg px-4 py-2 text-[13px] font-medium text-[#444]"
              style={{
                background: `rgba(255,255,255,${0.06 - i * 0.008})`,
                border: "1px solid rgba(255,255,255,0.06)",
                width: `${220 - i * 25}px`,
                textAlign: "center",
              }}
            >
              {stage}
            </span>
          </div>
        ))}
      </div>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Use the funnel to identify where recipients drop off. For example, if many people open but few click, your email content may need a clearer call to action. If many click but few play, your landing page layout may need improvement.
      </p>

      {/* Best time to send */}
      <h2 id="best-time" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Best time to send
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Available on Pro and Ultra plans. The &ldquo;best time to send&rdquo; feature analyzes each contact&apos;s historical engagement data &mdash; when they typically open emails, click links, and listen to tracks &mdash; to suggest the optimal send time on a per-contact basis.
      </p>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        This integrates directly with campaign scheduling: when composing a campaign, you can choose to send at each recipient&apos;s optimal time rather than a single fixed time for all recipients.
      </p>
    </>
  );
}
