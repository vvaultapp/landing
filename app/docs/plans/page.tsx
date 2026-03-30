export default function PlansDocPage() {
  return (
    <>
      <p className="text-[12px] tracking-wider text-[#999]">
        Account
      </p>
      <h1 className="mt-4 text-[1.75rem] font-semibold text-[#111] mb-1">
        Plans &amp; Pricing
      </h1>
      <p className="text-[15px] text-[#999] mb-8">
        Choose the plan that fits your workflow.
      </p>

      {/* Free */}
      <h2 id="free" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Free
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        The Free plan lets you get started with vvault at no cost. It includes:
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>100 MB storage</li>
        <li>1 campaign per day (maximum 5 recipients)</li>
        <li>Share links for tracks, packs, and folders</li>
        <li>Contact list</li>
        <li>Collab packs and tracks</li>
        <li>Receive splits from Pro sales</li>
        <li>Link in Bio page</li>
        <li>Certificate of deposit</li>
        <li>Public profile with social links and placement credits</li>
        <li>vvault email sending (standard template)</li>
      </ul>

      {/* Pro */}
      <h2 id="pro" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Pro
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        <strong className="text-[#444]">&euro;8.99/month</strong> (or &euro;7.49/month billed annually). Everything in Free, plus:
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>Unlimited storage</li>
        <li>Unlimited campaigns with unlimited recipients</li>
        <li>Schedule sends and follow-ups</li>
        <li>Gmail integration &mdash; send from your own email address</li>
        <li>Custom email subject and body</li>
        <li>Full analytics: opens, clicks, play duration, downloads, saves, and sales tracking</li>
        <li>Best time to send analysis</li>
        <li>Engagement funnels</li>
        <li>CRM with contact timeline, groups, tags, and lead scoring</li>
        <li>Opportunities and request board</li>
        <li>Stripe checkout and marketplace listing</li>
        <li>License types: Basic, Premium, Stems, Exclusive</li>
        <li>Marketplace commission: 5% per sale</li>
        <li>Theme customization for public profile</li>
      </ul>

      {/* Ultra */}
      <h2 id="ultra" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Ultra
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        <strong className="text-[#444]">&euro;24.99/month</strong> (or &euro;20.75/month billed annually). Everything in Pro, plus:
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>Studio &mdash; automated video posting to social platforms</li>
        <li>Per-recipient best time scheduling</li>
        <li>Series automations</li>
        <li>0% marketplace commission (only Stripe processing fees apply)</li>
        <li>Browse section highlight for enhanced profile visibility</li>
        <li>Disable email safety limits</li>
      </ul>

      {/* Comparison table */}
      <h2 id="comparison" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Comparison table
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Full feature comparison across all three plans:
      </p>

      {/* Core Features */}
      <h3 className="text-[15px] font-medium text-[#333] mt-6 mb-2">
        Core Features
      </h3>
      <div className="mt-4 overflow-hidden rounded-xl border border-[#e5e5e5] mb-4">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#f5f5f5]">
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555] w-[40%]"></th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555] w-[20%]">Free</th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555] w-[20%]">Pro</th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555] w-[20%]">Ultra</th>
            </tr>
          </thead>
          <tbody className="text-[#666]">
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Storage</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center">100 MB</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center">Unlimited</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center">Unlimited</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Share links</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Contact list</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Collab packs and tracks</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Link in Bio page</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
            </tr>
            <tr>
              <td className="px-3 py-2">Certificate of deposit</td>
              <td className="px-3 py-2 text-center text-emerald-600">Yes</td>
              <td className="px-3 py-2 text-center text-emerald-600">Yes</td>
              <td className="px-3 py-2 text-center text-emerald-600">Yes</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Campaigns & Outreach */}
      <h3 className="text-[15px] font-medium text-[#333] mt-6 mb-2">
        Campaigns &amp; Outreach
      </h3>
      <div className="mt-4 overflow-hidden rounded-xl border border-[#e5e5e5] mb-4">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#f5f5f5]">
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555] w-[40%]"></th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555] w-[20%]">Free</th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555] w-[20%]">Pro</th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555] w-[20%]">Ultra</th>
            </tr>
          </thead>
          <tbody className="text-[#666]">
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Create campaigns</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center">1/day</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center">Unlimited</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center">Unlimited</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Schedule sends</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Gmail integration</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Custom email subject &amp; body</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Per-recipient best time scheduling</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
            </tr>
            <tr>
              <td className="px-3 py-2">Series automations</td>
              <td className="px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="px-3 py-2 text-center text-emerald-600">Yes</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Analytics & Tracking */}
      <h3 className="text-[15px] font-medium text-[#333] mt-6 mb-2">
        Analytics &amp; Tracking
      </h3>
      <div className="mt-4 overflow-hidden rounded-xl border border-[#e5e5e5] mb-4">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#f5f5f5]">
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555] w-[40%]"></th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555] w-[20%]">Free</th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555] w-[20%]">Pro</th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555] w-[20%]">Ultra</th>
            </tr>
          </thead>
          <tbody className="text-[#666]">
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Opens tracking</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Clicks tracking</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Play duration tracking</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Downloads &amp; saves</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Sales tracking</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Best time to send analysis</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
            </tr>
            <tr>
              <td className="px-3 py-2">Engagement funnels</td>
              <td className="px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="px-3 py-2 text-center text-emerald-600">Yes</td>
              <td className="px-3 py-2 text-center text-emerald-600">Yes</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* CRM & Pipeline */}
      <h3 className="text-[15px] font-medium text-[#333] mt-6 mb-2">
        CRM &amp; Pipeline
      </h3>
      <div className="mt-4 overflow-hidden rounded-xl border border-[#e5e5e5] mb-4">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#f5f5f5]">
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555] w-[40%]"></th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555] w-[20%]">Free</th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555] w-[20%]">Pro</th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555] w-[20%]">Ultra</th>
            </tr>
          </thead>
          <tbody className="text-[#666]">
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Contact timeline</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Contact groups &amp; tags</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Lead scoring</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
            </tr>
            <tr>
              <td className="px-3 py-2">Opportunities &amp; request board</td>
              <td className="px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="px-3 py-2 text-center text-emerald-600">Yes</td>
              <td className="px-3 py-2 text-center text-emerald-600">Yes</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Sales & Marketplace */}
      <h3 className="text-[15px] font-medium text-[#333] mt-6 mb-2">
        Sales &amp; Marketplace
      </h3>
      <div className="mt-4 overflow-hidden rounded-xl border border-[#e5e5e5] mb-4">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#f5f5f5]">
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555] w-[40%]"></th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555] w-[20%]">Free</th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555] w-[20%]">Pro</th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555] w-[20%]">Ultra</th>
            </tr>
          </thead>
          <tbody className="text-[#666]">
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Stripe checkout</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">License types</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Marketplace listing</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
            </tr>
            <tr>
              <td className="px-3 py-2">Marketplace commission</td>
              <td className="px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="px-3 py-2 text-center">5%</td>
              <td className="px-3 py-2 text-center">0%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Branding & Customization */}
      <h3 className="text-[15px] font-medium text-[#333] mt-6 mb-2">
        Branding &amp; Customization
      </h3>
      <div className="mt-4 overflow-hidden rounded-xl border border-[#e5e5e5] mb-4">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#f5f5f5]">
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555] w-[40%]"></th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555] w-[20%]">Free</th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555] w-[20%]">Pro</th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555] w-[20%]">Ultra</th>
            </tr>
          </thead>
          <tbody className="text-[#666]">
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Public profile</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Theme customization</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Placement credits</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Social links (IG, YT, TT)</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
            </tr>
            <tr>
              <td className="px-3 py-2">Browse section highlight</td>
              <td className="px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="px-3 py-2 text-center text-emerald-600">Yes</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
