import React from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export type DocSection = {
  id: string;
  title: string;
  content: React.ReactNode;
};

export type DocPageProps = {
  title: string;
  subtitle?: string;
  sections: DocSection[];
};

/* ------------------------------------------------------------------ */
/*  Utility sub-components for use inside section content              */
/* ------------------------------------------------------------------ */

/** Inline code */
export function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[13px] text-white/70">
      {children}
    </code>
  );
}

/** Callout / tip box */
export function Callout({
  children,
  variant = "info",
}: {
  children: React.ReactNode;
  variant?: "info" | "tip" | "warning";
}) {
  const borderColor =
    variant === "warning"
      ? "border-amber-500/40"
      : variant === "tip"
        ? "border-emerald-500/40"
        : "border-blue-500/40";
  const iconColor =
    variant === "warning"
      ? "text-amber-400"
      : variant === "tip"
        ? "text-emerald-400"
        : "text-blue-400";
  const label =
    variant === "warning" ? "Warning" : variant === "tip" ? "Tip" : "Note";

  return (
    <div
      className={`my-5 rounded-xl border-l-[3px] bg-white/[0.02] px-5 py-4 ${borderColor}`}
    >
      <p className={`mb-1.5 text-[12px] font-semibold uppercase tracking-wider ${iconColor}`}>
        {label}
      </p>
      <div className="text-[14px] leading-relaxed text-white/55">{children}</div>
    </div>
  );
}

/** Styled table wrapper */
export function DocTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="my-5 overflow-x-auto">
      <table className="w-full border-collapse text-[13.5px]">
        <thead>
          <tr className="border-b border-white/[0.08] bg-white/[0.03]">
            {headers.map((h) => (
              <th
                key={h}
                className="px-3 py-2.5 text-left text-[12px] font-semibold uppercase tracking-wider text-white/50"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-white/[0.05]">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2.5 text-white/55">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  DocPage                                                           */
/* ------------------------------------------------------------------ */

export function DocPage({ title, subtitle, sections }: DocPageProps) {
  return (
    <article>
      {/* Page heading */}
      <h1 className="text-2xl font-semibold text-white">{title}</h1>
      {subtitle && (
        <p className="mt-2.5 text-[15px] leading-relaxed text-white/45">{subtitle}</p>
      )}

      {/* Sections */}
      {sections.map((section, idx) => (
        <section key={section.id} className={idx === 0 ? "mt-8" : ""}>
          <h2
            id={section.id}
            className={`scroll-mt-20 text-lg font-semibold text-white/90 ${
              idx === 0 ? "mt-8" : "mt-10"
            } mb-3 border-t border-white/[0.06] pt-8`}
          >
            {section.title}
          </h2>
          <div className="doc-prose space-y-4">{section.content}</div>
        </section>
      ))}

      {/* Bottom spacing so scroll-margin works for last heading */}
      <div className="h-40" />
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  Convenience paragraph & list components for doc content            */
/* ------------------------------------------------------------------ */

export function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[14px] leading-relaxed text-white/55">{children}</p>
  );
}

export function UL({ children }: { children: React.ReactNode }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5 text-[14px] leading-relaxed text-white/55 marker:text-white/20">
      {children}
    </ul>
  );
}

export function OL({ children }: { children: React.ReactNode }) {
  return (
    <ol className="list-decimal space-y-1.5 pl-5 text-[14px] leading-relaxed text-white/55 marker:text-white/30">
      {children}
    </ol>
  );
}

export function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-6 mb-2 text-[15px] font-medium text-white/80">
      {children}
    </h3>
  );
}
