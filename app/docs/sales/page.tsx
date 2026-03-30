export default function SalesDocPage() {
  return (
    <>
      <p className="text-[12px] tracking-wider text-[#999]">
        Features
      </p>
      <h1 className="mt-4 text-[1.75rem] font-semibold text-[#111] mb-1">
        Sales &amp; Marketplace
      </h1>
      <p className="text-[15px] text-[#999] mb-8">
        Sell your beats and packs with Stripe-powered checkout.
      </p>

      {/* License types */}
      <h2 id="licenses" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        License types
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        vvault supports six license types, each with configurable rights and deliverable formats:
      </p>
      <div className="mt-4 overflow-hidden rounded-xl border border-[#e5e5e5] mb-4">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#f5f5f5]">
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555]">License</th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555]">Formats</th>
            </tr>
          </thead>
          <tbody className="text-[#666]">
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2 font-medium text-[#444]">Basic</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">MP3</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2 font-medium text-[#444]">Premium</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">MP3 + WAV</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2 font-medium text-[#444]">Stems</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">MP3 + WAV + STEMS</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2 font-medium text-[#444]">Exclusive</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">All formats, full rights transfer</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2 font-medium text-[#444]">Unlimited</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">All formats, unlimited usage</td>
            </tr>
            <tr>
              <td className="px-3 py-2 font-medium text-[#444]">Sound Kit</td>
              <td className="px-3 py-2">ZIP archive</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Each license type has configurable rights that you can toggle on or off:
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>Commercial use</li>
        <li>Streaming</li>
        <li>Music videos</li>
        <li>Live performances</li>
        <li>Radio broadcasting</li>
        <li>Sync licensing</li>
        <li>Content ID registration</li>
      </ul>

      {/* Pricing */}
      <h2 id="pricing" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Pricing
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Set custom prices for each license tier on every track or pack. The minimum price is &euro;2.99. vvault supports multi-currency pricing:
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>EUR (&euro;)</li>
        <li>USD ($)</li>
        <li>GBP (&pound;)</li>
      </ul>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Prices are displayed in the buyer&apos;s preferred currency at checkout.
      </p>

      {/* Commission */}
      <h2 id="commission" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Commission
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        vvault charges a platform commission on each sale, which varies by plan:
      </p>
      <div className="mt-4 overflow-hidden rounded-xl border border-[#e5e5e5] mb-4">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#f5f5f5]">
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555]">Fee type</th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555]">Pro</th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555]">Ultra</th>
            </tr>
          </thead>
          <tbody className="text-[#666]">
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Platform commission</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center">5%</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center">0%</td>
            </tr>
            <tr>
              <td className="px-3 py-2">Stripe processing (approx.)</td>
              <td className="px-3 py-2 text-center" colSpan={2}>
                ~3% + fixed fee (&euro;0.25 / $0.30 / &pound;0.20)
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="rounded-xl border-l-2 border-blue-400 bg-blue-50 p-4 text-[13px] text-[#666] mb-4">
        <strong className="text-[#444]">Note:</strong> Stripe processing fees are charged by Stripe, not vvault, and apply to all transactions regardless of plan.
      </div>

      {/* Payouts */}
      <h2 id="payouts" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Payouts
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Payouts are handled automatically through Stripe. After each sale, earnings are held for 7 days before being released to your connected Stripe account.
      </p>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        For tracks with multiple contributors, vvault supports co-author split payouts. Revenue is automatically divided according to the split percentages you configure, and each co-author receives their share directly.
      </p>

      {/* Checkout flow */}
      <h2 id="checkout" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Checkout flow
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Buyers go through a Stripe-powered checkout that supports:
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>Credit and debit cards</li>
        <li>Apple Pay</li>
        <li>Google Pay</li>
      </ul>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        After a successful purchase, the buyer receives a secure download token that grants access to the purchased files. Download tokens are single-use and expire to prevent unauthorized redistribution.
      </p>
    </>
  );
}
