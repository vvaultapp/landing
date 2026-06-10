/* The root layout hardcodes <html lang="en"> so pages can render statically
   (reading the locale cookie there forced per-request rendering site-wide).
   French routes correct the document language before first paint with a
   synchronous inline script — SEO crawlers also read the visible French
   content + hreflang alternates, so the static "en" attribute in the raw
   HTML has no practical impact. */
export default function FrLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: "document.documentElement.lang='fr';",
        }}
      />
      {children}
    </>
  );
}
