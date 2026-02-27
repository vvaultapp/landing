#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const iconsDir = path.join(repoRoot, "src", "assets", "streamline-icons");
const outFile = path.join(repoRoot, "src", "components", "ui", "streamline-icon-raw.generated.ts");

const toKebabCase = (value) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

const normalizeStreamlineBasename = (basename) => {
  // Strip vendor suffixes added by Streamline downloads.
  const withoutVendorSuffix = basename
    .replace(/--streamline-sharp$/i, "")
    .replace(/--streamline-[a-z-]+$/i, "");

  return toKebabCase(withoutVendorSuffix);
};

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
};

const readSvgMap = () => {
  if (!fs.existsSync(iconsDir)) return {};
  const entries = fs.readdirSync(iconsDir, { withFileTypes: true });
  const map = {};

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!entry.name.toLowerCase().endsWith(".svg")) continue;

    const fullPath = path.join(iconsDir, entry.name);
    const basename = entry.name.replace(/\.svg$/i, "");
    const key = normalizeStreamlineBasename(basename);
    const raw = fs.readFileSync(fullPath, "utf8").trim();
    map[key] = raw;
  }

  return Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b)));
};

const map = readSvgMap();

const output = `/*
 * AUTO-GENERATED FILE.
 * Source of truth: \`src/assets/streamline-icons/*.svg\`
 * Regenerate with: \`npm run icons:streamline:build\`
 */

export const streamlineIconRawByKey: Record<string, string> = ${JSON.stringify(map, null, 2)};
`;

ensureDir(path.dirname(outFile));
fs.writeFileSync(outFile, output, "utf8");
console.log(
  `[streamline] Generated ${path.relative(repoRoot, outFile)} with ${Object.keys(map).length} icon(s).`,
);
