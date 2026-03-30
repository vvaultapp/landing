export default function OpportunitiesDocPage() {
  return (
    <>
      <p className="text-[12px] tracking-wider text-[#999]">
        Features
      </p>
      <h1 className="mt-4 text-[1.75rem] font-semibold text-[#111] mb-1">
        Opportunities
      </h1>
      <p className="text-[15px] text-[#999] mb-8">
        Browse artist requests and submit your music.
      </p>

      {/* How it works */}
      <h2 id="how-it-works" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        How it works
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        The Opportunities board connects producers with artists looking for specific sounds. Artists post requests describing what they need, and producers browse and submit their music directly.
      </p>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        This creates a direct pipeline between creators &mdash; artists find the sounds they need, and producers get their music in front of active buyers and collaborators.
      </p>

      {/* Categories */}
      <h2 id="categories" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Categories
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Opportunities are organized into four categories:
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li><strong className="text-[#444]">Beats</strong> &mdash; Instrumental beats and productions.</li>
        <li><strong className="text-[#444]">Loops</strong> &mdash; Melodic or rhythmic loops for sampling.</li>
        <li><strong className="text-[#444]">Acapellas</strong> &mdash; Vocal recordings for producers to work with.</li>
        <li><strong className="text-[#444]">Mix &amp; Master</strong> &mdash; Mixing and mastering service requests.</li>
      </ul>

      {/* Submissions */}
      <h2 id="submissions" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Submissions
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Submit your music directly to any open opportunity. Each opportunity has configurable limits:
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li><strong className="text-[#444]">Total submission limit</strong> &mdash; The maximum number of submissions the opportunity will accept overall.</li>
        <li><strong className="text-[#444]">Per-user submission limit</strong> &mdash; How many tracks a single producer can submit to one opportunity.</li>
      </ul>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Opportunity owners can attach up to 3 reference tracks to give producers a clear idea of the sound they are looking for.
      </p>
      <div className="rounded-xl border-l-2 border-blue-400 bg-blue-50 p-4 text-[13px] text-[#666] mb-4">
        <strong className="text-[#444]">Tip:</strong> Listen to the reference tracks carefully before submitting. Opportunities with fewer submissions often have higher acceptance rates.
      </div>

      {/* Paid submissions */}
      <h2 id="paid" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Paid submissions
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Opportunity owners can optionally require a fee per submission. When a paid opportunity is created, the owner sets a custom price that producers must pay to submit their music.
      </p>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Paid submissions are processed through Stripe, and the pricing is clearly displayed before a producer submits. This model is commonly used for high-profile placements or curated selections where the opportunity owner commits to reviewing every submission.
      </p>
    </>
  );
}
