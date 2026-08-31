// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Theme boundary check — enforces the vendor-independence and semantic-token rules of docs/THEME_SYSTEM.md
 * (§2 core invariant, §5 semantic tokens, §7 adapter limits) and the Phase 1 gate in docs/IMPLEMENTATION_ROADMAP.md:
 *
 *   1. product/domain code carries no raw palette values (hex, rgb(), hsl(), oklch()...) — only semantic
 *      tokens resolved through the css-vars adapter (`var(--htb-*)`); raw values live in theme packs only;
 *   2. product/domain code never imports vendor theme source (vendor-themes/**, vendor adapters) or a theme
 *      pack by path — only the `@howtobaby/themes` entry (contract + registry);
 *   3. packages/themes imports no domain/UI/framework code (no React, Next, core, knowledge, ui, app),
 *      and its relative imports keep explicit .ts extensions so the package stays runnable on plain Node
 *      (scripts/generate-theme-reference-css.ts depends on it) — do not apply an IDE's
 *      "import can be shortened" quick-fix inside packages/themes;
 *   4. packages/ui stays framework-neutral (no `next/*` imports; the app injects router-aware links).
 *
 * Usage: node scripts/check-theme-boundary.ts
 * Exit code 1 on any violation. Plain Node >= 22.18 + Git; no dependencies.
 */

import { readFileSync } from "node:fs";
import { posix } from "node:path";

import { git, repoRoot } from "./lib/git.ts";
import { Report } from "./lib/report.ts";

/** Directories whose files are product/domain/presentation code and must be theme-neutral. */
const PRODUCT_DIRS = ["apps/web/src", "packages/ui/src", "packages/core/src", "packages/tool-platform/src", "tools"];
/** Theme definitions may hold raw values. */
const THEME_DIR = "packages/themes/src";
const SOURCE_EXT = /\.(?:ts|tsx|mts|cts|js|mjs|cjs|jsx|css|scss)$/;

const RAW_COLOR = /(?:^|[^\w&-])#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/i;
const IMPORT_SPECIFIER = /(?:\bfrom\s*|\bimport\s*\(?\s*|\brequire\s*\(\s*|@import\s+(?:url\()?\s*)["']([^"']+)["']/g;

const VENDOR_IMPORT = /(?:^|\/)vendor-themes(?:\/|$)|\/adapters\/vendor-|^@howtobaby\/themes\/|(?:^|\/)packages\/themes\/src\//;
const THEME_FORBIDDEN_IMPORT = /^(?:react|react-dom|next)(?:\/|$)|^@howtobaby\/(?:core|knowledge|ui|web|tool-platform|i18n|validation)(?:\/|$)/;
const UI_FORBIDDEN_IMPORT = /^next(?:\/|$)/;

function listFiles(root: string): string[] {
  // Tracked + untracked-but-not-ignored, so a local run sees the same set CI will after commit.
  const out = git(["ls-files", "-z", "--cached", "--others", "--exclude-standard"], { cwd: root });
  return [...new Set(out.split("\0").filter(Boolean))].filter((p) => SOURCE_EXT.test(p));
}

function under(path: string, dir: string): boolean {
  return path === dir || path.startsWith(`${dir}/`);
}

function stripComments(source: string, css: boolean): string {
  // Comments may legitimately mention colours ("#fff is forbidden"); only code counts.
  const noBlock = source.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
  return css ? noBlock : noBlock.replace(/(^|[^:"'`])\/\/[^\n]*/g, (m, lead: string) => lead + " ".repeat(m.length - lead.length));
}

function checkRawPalette(report: Report, root: string, files: string[]): number {
  report.section("Raw palette values outside theme definitions (docs/THEME_SYSTEM.md §5)");
  let violations = 0;
  let scanned = 0;
  for (const file of files) {
    if (!PRODUCT_DIRS.some((d) => under(file, d))) continue;
    scanned += 1;
    const text = stripComments(readFileSync(posix.join(root, file), "utf8"), file.endsWith(".css") || file.endsWith(".scss"));
    text.split("\n").forEach((line, index) => {
      const match = RAW_COLOR.exec(line);
      if (match) {
        violations += 1;
        report.error("raw-palette", `line ${index + 1}: raw colour value \`${match[0].trim()}\` — use a semantic token (var(--htb-…)) or move the value into a theme pack`, file);
      }
    });
  }
  if (violations === 0) report.info("raw-palette", `${scanned} product/domain source files contain no raw palette values`);
  return violations;
}

function imports(text: string): Array<{ specifier: string; line: number }> {
  const found: Array<{ specifier: string; line: number }> = [];
  for (const match of text.matchAll(IMPORT_SPECIFIER)) {
    const line = text.slice(0, match.index).split("\n").length;
    found.push({ specifier: match[1]!, line });
  }
  return found;
}

function resolveRelative(file: string, specifier: string): string {
  return posix.normalize(posix.join(posix.dirname(file), specifier));
}

function checkImports(report: Report, root: string, files: string[]): number {
  report.section("Import boundaries (docs/THEME_SYSTEM.md §2, §7; docs/REPOSITORY_STRUCTURE.md §4)");
  let violations = 0;
  let scanned = 0;
  for (const file of files) {
    const inProduct = PRODUCT_DIRS.some((d) => under(file, d));
    const inThemes = under(file, THEME_DIR);
    if (!inProduct && !inThemes) continue;
    scanned += 1;
    const text = stripComments(readFileSync(posix.join(root, file), "utf8"), file.endsWith(".css"));
    for (const { specifier, line } of imports(text)) {
      const isRelative = specifier.startsWith(".");
      const resolved = isRelative ? resolveRelative(file, specifier) : specifier;

      if (inProduct) {
        if (VENDOR_IMPORT.test(resolved) || (isRelative && under(resolved, THEME_DIR))) {
          violations += 1;
          report.error("vendor-import", `line ${line}: \`${specifier}\` reaches vendor/theme-pack source; product code may import only the @howtobaby/themes entry`, file);
        }
        if (under(file, "packages/ui/src") && UI_FORBIDDEN_IMPORT.test(specifier)) {
          violations += 1;
          report.error("ui-framework-import", `line ${line}: \`${specifier}\` — packages/ui must stay framework-neutral; the app injects router links`, file);
        }
      }

      if (inThemes) {
        if (isRelative && !/\.(?:ts|css)$/.test(specifier)) {
          violations += 1;
          report.error(
            "theme-node-import",
            `line ${line}: \`${specifier}\` — relative imports in packages/themes must keep an explicit .ts extension (plain-Node runnable; do not apply the IDE "shorten import" quick-fix here)`,
            file,
          );
        }
        if (THEME_FORBIDDEN_IMPORT.test(specifier)) {
          violations += 1;
          report.error("theme-domain-import", `line ${line}: \`${specifier}\` — packages/themes must not import React/Next or domain/UI packages`, file);
        }
        if (isRelative && !under(resolved, THEME_DIR)) {
          violations += 1;
          report.error("theme-domain-import", `line ${line}: \`${specifier}\` resolves outside packages/themes/src`, file);
        }
        const isVendorAdapter = under(file, `${THEME_DIR}/adapters`) && /\/adapters\/vendor-[^/]+\//.test(file);
        if (/(?:^|\/)vendor-themes(?:\/|$)/.test(resolved) && !isVendorAdapter) {
          violations += 1;
          report.error("vendor-import", `line ${line}: only adapters/vendor-* may import vendor-themes/**`, file);
        }
      }
    }
  }
  if (violations === 0) report.info("imports", `${scanned} files respect the theme/vendor import boundaries`);
  return violations;
}

function main(): number {
  const root = repoRoot();
  const report = new Report("Theme boundary");
  const files = listFiles(root);
  checkRawPalette(report, root, files);
  checkImports(report, root, files);
  return report.finish();
}

process.exitCode = main();
