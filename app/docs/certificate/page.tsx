export default function CertificateDocPage() {
  return (
    <>
      <p className="text-[12px] tracking-wider text-[#999]">
        Features
      </p>
      <h1 className="mt-4 text-[1.75rem] font-semibold text-[#111] mb-1">
        Certificate
      </h1>
      <p className="text-[15px] text-[#999] mb-8">
        Protect ownership of your music.
      </p>

      {/* How it works */}
      <h2 id="how-it-works" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        How it works
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        vvault generates proof-of-ownership certificates for your uploaded tracks. When you upload a track, vvault records the upload timestamp, file hash, and your account details to create a verifiable certificate of deposit.
      </p>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        This certificate serves as evidence that you possessed the file at a specific point in time, which can help establish priority in ownership disputes.
      </p>
      <div className="rounded-xl border-l-2 border-blue-400 bg-blue-50 p-4 text-[13px] text-[#666] mb-4">
        <strong className="text-[#444]">Note:</strong> Certificate of deposit is available on all plans, including Free. Every track you upload automatically gets a certificate.
      </div>

      {/* Protection */}
      <h2 id="protection" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Protection
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Beyond ownership certificates, vvault provides several layers of content protection:
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li><strong className="text-[#444]">Token-based access control</strong> &mdash; Every download link uses a unique secure token to verify authorized access.</li>
        <li><strong className="text-[#444]">Single-use download URLs</strong> &mdash; Download tokens expire after use, preventing link sharing and unauthorized redistribution.</li>
        <li><strong className="text-[#444]">Email tracking</strong> &mdash; Track who accessed your content and when, making it possible to detect unauthorized distribution back to its source.</li>
      </ul>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        These protections work together to give you control over who accesses your music and create an audit trail for every download.
      </p>
    </>
  );
}
