export default function LibraryDocPage() {
  return (
    <>
      <p className="text-[12px] tracking-wider text-[#999]">
        Features
      </p>
      <h1 className="mt-4 text-[1.75rem] font-semibold text-[#111] mb-1">
        Library
      </h1>
      <p className="text-[15px] text-[#999] mb-8">
        Upload, organize, and manage your music catalog.
      </p>

      {/* Uploading files */}
      <h2 id="uploading" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Uploading files
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Upload audio files via drag-and-drop or the file picker. vvault supports the following audio formats:
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
        ZIP files are also accepted and will be automatically extracted to import all audio files inside.
      </p>

      <h3 className="text-[15px] font-medium text-[#333] mt-6 mb-2">
        Auto settings
      </h3>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        vvault provides several automatic processing options that can be toggled in your upload settings:
      </p>
      <div className="mt-4 overflow-hidden rounded-xl border border-[#e5e5e5] mb-4">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#f5f5f5]">
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555]">Setting</th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555]">Description</th>
            </tr>
          </thead>
          <tbody className="text-[#666]">
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">
                <code className="bg-[#f0f0f0] px-1.5 py-0.5 rounded-md text-[13px] text-emerald-600 font-mono">auto_unpack_zip</code>
              </td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Automatically extract audio from uploaded ZIP files</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">
                <code className="bg-[#f0f0f0] px-1.5 py-0.5 rounded-md text-[13px] text-emerald-600 font-mono">auto_pack_from_import</code>
              </td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Automatically create a pack from a batch import</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">
                <code className="bg-[#f0f0f0] px-1.5 py-0.5 rounded-md text-[13px] text-emerald-600 font-mono">auto_parse_coauthors</code>
              </td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Parse @handles from filenames and add co-authors automatically</td>
            </tr>
            <tr>
              <td className="px-3 py-2">
                <code className="bg-[#f0f0f0] px-1.5 py-0.5 rounded-md text-[13px] text-emerald-600 font-mono">auto_convert_wav_to_mp3</code>
              </td>
              <td className="px-3 py-2">Generate an MP3 version alongside each WAV upload for faster streaming</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Storage limits */}
      <h2 id="storage" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Storage limits
      </h2>
      <div className="mt-4 overflow-hidden rounded-xl border border-[#e5e5e5] mb-4">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#f5f5f5]">
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555]">Plan</th>
              <th className="border-b border-[#e5e5e5] px-3 py-2 text-left font-medium text-[#555]">Storage</th>
            </tr>
          </thead>
          <tbody className="text-[#666]">
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Free</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">100 MB</td>
            </tr>
            <tr>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Pro</td>
              <td className="border-b border-[#e5e5e5] px-3 py-2">Unlimited</td>
            </tr>
            <tr>
              <td className="px-3 py-2">Ultra</td>
              <td className="px-3 py-2">Unlimited</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Packs */}
      <h2 id="packs" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Packs
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Packs let you group tracks into collections for sharing and selling. Each pack can have its own cover artwork.
      </p>

      <h3 className="text-[15px] font-medium text-[#333] mt-6 mb-2">
        Artwork
      </h3>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Upload artwork in PNG, JPG, WEBP, GIF, AVIF, or HEIC format. Maximum file size is 20 MB.
      </p>

      <h3 className="text-[15px] font-medium text-[#333] mt-6 mb-2">
        Visibility
      </h3>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Each pack has one of three visibility levels:
      </p>
      <ul className="text-[14px] text-[#666] mb-4 list-disc pl-5 space-y-1">
        <li><strong className="text-[#444]">Private</strong> &mdash; Only visible to you and invited collaborators.</li>
        <li><strong className="text-[#444]">Link-only</strong> &mdash; Accessible to anyone with the direct link, but not listed publicly.</li>
        <li><strong className="text-[#444]">Public</strong> &mdash; Visible on your profile, in search results, and on the marketplace.</li>
      </ul>

      {/* Metadata */}
      <h2 id="metadata" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Metadata
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        vvault automatically extracts metadata from your filenames to save you time.
      </p>

      <h3 className="text-[15px] font-medium text-[#333] mt-6 mb-2">
        BPM detection
      </h3>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        BPM values between 60 and 220 are automatically detected when included in the filename (e.g.,{" "}
        <code className="bg-[#f0f0f0] px-1.5 py-0.5 rounded-md text-[13px] text-emerald-600 font-mono">
          MyBeat_140bpm.wav
        </code>
        ).
      </p>

      <h3 className="text-[15px] font-medium text-[#333] mt-6 mb-2">
        Musical key
      </h3>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Musical key is parsed from filenames when present (e.g., Cmin, Amaj, F#m).
      </p>

      <h3 className="text-[15px] font-medium text-[#333] mt-6 mb-2">
        Co-author parsing
      </h3>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        When{" "}
        <code className="bg-[#f0f0f0] px-1.5 py-0.5 rounded-md text-[13px] text-emerald-600 font-mono">
          auto_parse_coauthors
        </code>{" "}
        is enabled, @handles found in filenames are automatically added as co-authors. A maximum of 3 co-authors can be added per track.
      </p>

      {/* Folders */}
      <h2 id="folders" className="text-lg font-semibold text-[#111] mt-12 mb-3">
        Folders
      </h2>
      <p className="text-[14px] leading-relaxed text-[#666] mb-4">
        Organize your library with a drag-and-drop folder structure. Move tracks and packs between folders freely.
      </p>
      <div className="rounded-xl border-l-2 border-blue-400 bg-blue-50 p-4 text-[13px] text-[#666] mb-4">
        <strong className="text-[#444]">Note:</strong> Recently deleted items are recoverable from the trash. You can restore tracks and packs that were accidentally removed.
      </div>
    </>
  );
}
