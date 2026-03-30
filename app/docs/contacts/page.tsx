export default function ContactsDocPage() {
  return (
    <>
      <p className="text-[12px] tracking-wider text-[#999]">
        Features
      </p>
      <h1 className="mt-4 text-[1.75rem] font-semibold text-[#111] mb-1">
        Contacts
      </h1>
      <p className="text-[15px] text-[#999] mb-8">
        CRM and contact management for music producers.
      </p>

      {/* Managing contacts */}
      <h2 id="managing" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Managing contacts
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Contacts can be added to vvault in three ways:
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li><strong className="text-[#444]">Manual creation</strong> &mdash; Add contacts one by one with their email, name, and profile picture.</li>
        <li><strong className="text-[#444]">Import</strong> &mdash; Bulk import contacts from a file.</li>
        <li><strong className="text-[#444]">Automatic</strong> &mdash; Contacts are created automatically when you send campaigns to new recipients.</li>
      </ul>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Each contact record stores their email address, display name, profile picture, and full engagement history with your content.
      </p>

      {/* Groups and tags */}
      <h2 id="groups" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Groups and tags
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Organize your contacts into groups for targeted campaigns. You can create custom groups (e.g., &ldquo;A&amp;Rs&rdquo;, &ldquo;Rappers&rdquo;, &ldquo;Sync Supervisors&rdquo;) and add tags to contacts for filtering and segmentation.
      </p>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        When creating a campaign, you can select an entire group as recipients rather than adding contacts individually.
      </p>

      {/* Engagement scoring */}
      <h2 id="scoring" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Engagement scoring
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Each contact receives an automatic engagement score from 0 to 100, calculated using a weighted formula based on their interactions:
      </p>
      <div className="mt-4 overflow-hidden rounded-xl border border-[#e5e5e5] mb-4">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#f5f5f5]">
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555]">Action</th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555]">Weight</th>
            </tr>
          </thead>
          <tbody className="text-[#666]">
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Opens</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center">1x</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Clicks</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center">3x</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Plays</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center">2x</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Downloads</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center">4x</td>
            </tr>
            <tr>
              <td className="px-3 py-2">Favorites</td>
              <td className="px-3 py-2 text-center">2x</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Based on their score, contacts are assigned to one of four engagement tiers:
      </p>
      <div className="mt-4 overflow-hidden rounded-xl border border-[#e5e5e5] mb-4">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#f5f5f5]">
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555]">Tier</th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555]">Score range</th>
            </tr>
          </thead>
          <tbody className="text-[#666]">
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">
                <span className="inline-block h-2 w-2 rounded-full bg-red-400/80 mr-2" />
                Hot
              </td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">&ge; 70</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">
                <span className="inline-block h-2 w-2 rounded-full bg-orange-400/80 mr-2" />
                Warm
              </td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">&ge; 35</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">
                <span className="inline-block h-2 w-2 rounded-full bg-blue-400/80 mr-2" />
                Cold
              </td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">20 &ndash; 34</td>
            </tr>
            <tr>
              <td className="px-3 py-2">
                <span className="inline-block h-2 w-2 rounded-full bg-[#ccc] mr-2" />
                Unengaged
              </td>
              <td className="px-3 py-2">&lt; 20</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="rounded-xl border-l-2 border-blue-400 bg-blue-50 p-4 text-[13px] text-[#666] mb-4">
        <strong className="text-[#444]">Tip:</strong> Focus your follow-up campaigns on &ldquo;Hot&rdquo; and &ldquo;Warm&rdquo; contacts for the highest conversion rates. Use the scoring data to prioritize who to reach out to first.
      </div>

      {/* Contact timeline */}
      <h2 id="timeline" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Contact timeline
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Every contact has a detailed activity timeline that logs every interaction with timestamps. The timeline includes:
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>Email opens (with verified/unverified status)</li>
        <li>Link clicks</li>
        <li>Track plays (with duration)</li>
        <li>File downloads</li>
        <li>Saves and favorites</li>
      </ul>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Use the timeline to understand exactly how each contact engages with your music over time, and tailor your outreach accordingly.
      </p>
    </>
  );
}
