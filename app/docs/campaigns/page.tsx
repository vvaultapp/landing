export default function CampaignsDocPage() {
  return (
    <>
      <p className="text-[12px] tracking-wider text-[#999]">
        Features
      </p>
      <h1 className="mt-4 text-[1.75rem] font-semibold text-[#111] mb-1">
        Campaigns
      </h1>
      <p className="text-[15px] text-[#999] mb-8">
        Send your music via email, Instagram, or messages.
      </p>

      {/* Channels */}
      <h2 id="channels" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Channels
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        vvault supports three campaign channels for reaching your contacts:
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li><strong className="text-[#444]">Email</strong> &mdash; The primary channel. Send via vvault&apos;s built-in email system, or connect your own Gmail account on Pro and Ultra plans.</li>
        <li><strong className="text-[#444]">Instagram DMs</strong> &mdash; Send campaigns directly to Instagram inboxes.</li>
        <li><strong className="text-[#444]">Messages (SMS)</strong> &mdash; Reach contacts via text message.</li>
      </ul>

      {/* Creating a campaign */}
      <h2 id="creating" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Creating a campaign
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        To create a campaign:
      </p>
      <ol className="text-[14px] text-[#666] mb-4 list-decimal pl-5 space-y-1">
        <li>Select your campaign channel (Email, Instagram, or Messages).</li>
        <li>Compose your message with a subject line and body.</li>
        <li>Attach packs or individual tracks. Each pack attachment generates a secure download link for recipients.</li>
        <li>Add recipients manually, from your contact list, or by group.</li>
        <li>Send immediately or schedule for later (Pro and Ultra only).</li>
      </ol>
      <div className="rounded-xl border-l-2 border-blue-400 bg-blue-50 p-4 text-[13px] text-[#666] mb-4">
        <strong className="text-[#444]">Tip:</strong> On Pro and Ultra plans, you can customize the email subject and body. Free plan users send with a standard vvault template.
      </div>

      {/* Sending limits */}
      <h2 id="limits" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Sending limits
      </h2>
      <div className="mt-4 overflow-hidden rounded-xl border border-[#e5e5e5] mb-4">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#f5f5f5]">
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555]"></th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555]">Free</th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555]">Pro</th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-center font-medium text-[#555]">Ultra</th>
            </tr>
          </thead>
          <tbody className="text-[#666]">
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Daily campaigns</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center">1</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center">Unlimited</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center">Unlimited</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Recipients per campaign</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center">5</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center">Unlimited</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center">Unlimited</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Gmail sending</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Scheduling</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2 text-center text-emerald-600">Yes</td>
            </tr>
            <tr>
              <td className="px-3 py-2">Follow-ups</td>
              <td className="px-3 py-2 text-center text-[#ccc]">&ndash;</td>
              <td className="px-3 py-2 text-center text-emerald-600">Yes</td>
              <td className="px-3 py-2 text-center text-emerald-600">Yes</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Gmail integration */}
      <h2 id="gmail" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Gmail integration
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Available on Pro and Ultra plans. Connect your Gmail account so that campaign emails are sent directly from your own email address. This means:
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li>Emails appear in the recipient&apos;s inbox as coming from you, not vvault.</li>
        <li>Replies go directly to your Gmail inbox.</li>
        <li>Better deliverability since emails come from your established domain.</li>
      </ul>
      <div className="rounded-xl border-l-2 border-blue-400 bg-blue-50 p-4 text-[13px] text-[#666] mb-4">
        <strong className="text-[#444]">Note:</strong> Gmail integration uses OAuth and never stores your Gmail password. You can disconnect at any time from your account settings.
      </div>

      {/* Scheduling */}
      <h2 id="scheduling" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Scheduling
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Pro and Ultra users can schedule campaigns for specific dates and times. Instead of sending immediately, pick the exact moment you want your campaign to go out.
      </p>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        vvault also offers per-recipient &ldquo;best time to send&rdquo; analysis, which uses engagement data to suggest the optimal send time for each individual contact based on when they are most likely to open and interact with your emails.
      </p>
    </>
  );
}
