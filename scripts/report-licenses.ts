// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Dependency and asset license report — implements docs/LICENSING_POLICY.md §8–§9.
 *
 *   Dependencies: reads `pnpm licenses list --json` for the whole workspace, classifies every package by
 *                 SPDX id against licenses.policy.json (allowed / review / forbidden / unknown), and applies
 *                 the reviewed[] decisions recorded there.
 *   Assets:       every tracked media/font/icon file (by extension) must have a rights record in
 *                 asset-rights.json with the fields required by LICENSING_POLICY.md §8.
 *
 * Usage: node scripts/report-licenses.ts [--strict] [--out=<dir>]
 *   --strict  exit 1 on forbidden/unknown/unreviewed dependencies or assets without rights metadata.
 *   --out     directory for dependency-licenses.json / licenses-report.md (default: reports/licenses, gitignored).
 *
 * The report is review input for maintainers and release review; it never auto-approves a dependency.
 */

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, posix } from "node:path";

import { repoRoot, trackedBlobs } from "./lib/git.ts";
import { globToRegExp } from "./lib/glob.ts";
import { Report, parseArgs } from "./lib/report.ts";

interface LicensePolicy {
  version: number;
  allowed: string[];
  review: string[];
  forbidden: string[];
  reviewed: Array<{ name: string; version?: string; license: string; decision: "accepted" | "rejected"; reason: string; reviewedBy: string; date: string }>;
  assetExtensions: string[];
}

interface AssetRecord {
  assetId: string;
  pattern: string;
  creator: string;
  license: string;
  commercialUseAllowed: boolean;
  redistributionAllowed: boolean;
  attributionRequired: boolean;
  attributionText?: string;
  sourceUrl?: string;
  reviewStatus?: string;
  /** Date (YYYY-MM-DD) the maintainer confirmed the record; informational. */
  confirmedAt?: string;
  notes?: string;
  /** Forward-coverage record: no warning when it matches no tracked file yet. */
  allowUnmatched?: boolean;
}

interface PnpmLicenseEntry {
  name: string;
  versions: string[];
  paths?: string[];
  license: string;
  author?: string;
  homepage?: string;
  description?: string;
}

type Classification = "allowed" | "review" | "forbidden" | "unknown" | "accepted" | "rejected";

interface DependencyRow {
  name: string;
  version: string;
  license: string;
  classification: Classification;
  note: string;
  homepage: string;
}

function loadJson<T>(root: string, file: string): T {
  const full = join(root, file);
  if (!existsSync(full)) throw new Error(`${file} not found at repository root`);
  return JSON.parse(readFileSync(full, "utf8")) as T;
}

function pnpmLicenses(root: string): Record<string, PnpmLicenseEntry[]> {
  // On Windows pnpm is a .cmd shim, which needs a shell; pass the command as one string there so Node does
  // not hit DEP0190 (args array combined with shell: true).
  const result =
    process.platform === "win32"
      ? spawnSync("pnpm licenses list --json", { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, shell: true })
      : spawnSync("pnpm", ["licenses", "list", "--json"], { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (result.status !== 0) {
    throw new Error(`pnpm licenses list failed (is the workspace installed? run \`pnpm install\`): ${result.stderr.trim() || result.stdout.trim()}`);
  }
  const text = result.stdout.trim();
  // pnpm prints a plain message when no dependencies are installed.
  if (!text.startsWith("{")) return {};
  return JSON.parse(text) as Record<string, PnpmLicenseEntry[]>;
}

function classify(policy: LicensePolicy, entry: PnpmLicenseEntry, version: string): { classification: Classification; note: string } {
  const license = entry.license?.trim() || "Unknown";
  const reviewed = policy.reviewed.find((r) => r.name === entry.name && (!r.version || r.version === version) && r.license === license);
  if (reviewed) return { classification: reviewed.decision, note: `${reviewed.reason} (${reviewed.reviewedBy}, ${reviewed.date})` };
  if (policy.forbidden.includes(license)) return { classification: "forbidden", note: "listed in licenses.policy.json forbidden[]" };
  if (policy.allowed.includes(license)) return { classification: "allowed", note: "" };
  if (policy.review.includes(license)) return { classification: "review", note: "license class requires maintainer review before release" };
  return { classification: "unknown", note: "SPDX id not in policy; verify upstream license and record a decision" };
}

function reportDependencies(report: Report, policy: LicensePolicy, root: string): DependencyRow[] {
  report.section("Dependencies (workspace, all importers, prod + dev)");
  const rows: DependencyRow[] = [];
  for (const entries of Object.values(pnpmLicenses(root))) {
    for (const entry of entries) {
      for (const version of entry.versions) {
        const { classification, note } = classify(policy, entry, version);
        rows.push({ name: entry.name, version, license: entry.license?.trim() || "Unknown", classification, note, homepage: entry.homepage ?? "" });
      }
    }
  }
  rows.sort((a, b) => a.name.localeCompare(b.name) || a.version.localeCompare(b.version));
  const counts = new Map<string, number>();
  for (const row of rows) counts.set(row.license, (counts.get(row.license) ?? 0) + 1);
  report.line(`${rows.length} package version(s) across ${counts.size} license id(s).`);
  report.line();
  report.table(["License", "Packages"], [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([l, c]) => [l, String(c)]));
  report.line();
  report.table(
    ["Package", "Version", "License", "Classification", "Note"],
    rows.map((r) => [r.name, r.version, r.license, r.classification, r.note]),
  );
  for (const row of rows) {
    const id = `${row.name}@${row.version}`;
    if (row.classification === "forbidden" || row.classification === "rejected") report.error("dependency-license", `${id} (${row.license}) is ${row.classification}: ${row.note}`);
    else if (row.classification === "unknown") report.error("dependency-license", `${id} has unrecognised license "${row.license}": ${row.note}`);
    else if (row.classification === "review") report.error("dependency-license", `${id} (${row.license}) needs a recorded review decision in licenses.policy.json reviewed[]`);
  }
  if (rows.every((r) => r.classification === "allowed" || r.classification === "accepted")) report.info("dependency-license", "all dependencies are allowed or explicitly accepted");
  return rows;
}

function reportAssets(report: Report, policy: LicensePolicy, assets: AssetRecord[], root: string): string[][] {
  report.section("Tracked media / font / icon assets");
  const exts = new Set(policy.assetExtensions.map((e) => e.toLowerCase()));
  const tracked = trackedBlobs(root).filter((b) => exts.has(posix.extname(b.path).slice(1).toLowerCase()));
  const required: Array<keyof AssetRecord> = ["assetId", "pattern", "creator", "license", "commercialUseAllowed", "redistributionAllowed", "attributionRequired"];
  for (const asset of assets) {
    for (const key of required) {
      if (asset[key] === undefined || asset[key] === "") report.error("asset-rights", `asset record "${asset.assetId ?? "?"}" lacks required field ${key}`, "asset-rights.json");
    }
    if (asset.attributionRequired && !asset.attributionText) report.error("asset-rights", `asset record "${asset.assetId}" requires attribution but has no attributionText`, "asset-rights.json");
  }
  const rows: string[][] = [];
  const used = new Set<string>();
  for (const blob of tracked) {
    const record = assets.find((a) => globToRegExp(a.pattern).test(blob.path));
    if (record) {
      used.add(record.assetId);
      rows.push([`\`${blob.path}\``, record.assetId, record.creator, record.license, record.reviewStatus ?? "—"]);
      if (record.reviewStatus && record.reviewStatus !== "confirmed") report.warn("asset-rights", `rights record "${record.assetId}" is ${record.reviewStatus}`, blob.path);
    } else {
      rows.push([`\`${blob.path}\``, "**missing**", "", "", ""]);
      report.error("asset-rights", "tracked asset has no rights record in asset-rights.json (docs/LICENSING_POLICY.md §8)", blob.path);
    }
  }
  for (const asset of assets) {
    if (!used.has(asset.assetId) && !asset.allowUnmatched) report.warn("asset-rights", `rights record "${asset.assetId}" matches no tracked file`, "asset-rights.json");
  }
  report.line(`${tracked.length} tracked asset file(s), ${assets.length} rights record(s).`);
  report.line();
  report.table(["Path", "Asset id", "Creator", "License", "Review"], rows);
  return rows;
}

function main(): number {
  const { flags, values } = parseArgs(process.argv.slice(2));
  const strict = flags.has("strict");
  const root = repoRoot();
  const policy = loadJson<LicensePolicy>(root, "licenses.policy.json");
  const assetsFile = loadJson<{ assets: AssetRecord[] }>(root, "asset-rights.json");
  const report = new Report(`License report${strict ? " (strict)" : ""}`);
  report.line("Software: AGPL-3.0-only · Knowledge/docs: CC-BY-NC-SA-4.0 · see LICENSE.md and docs/LICENSING_POLICY.md");

  const dependencies = reportDependencies(report, policy, root);
  reportAssets(report, policy, assetsFile.assets, root);

  const outDir = join(root, values.get("out") ?? "reports/licenses");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "dependency-licenses.json"), JSON.stringify({ generatedAt: new Date().toISOString(), policyVersion: policy.version, dependencies }, null, 2));
  const exit = report.finish();
  writeFileSync(join(outDir, "licenses-report.md"), report.toJSON().markdown);
  console.log(`Report written to ${posix.relative(root, outDir).replace(/\\/g, "/")}/`);
  return strict ? exit : 0;
}

process.exitCode = main();
