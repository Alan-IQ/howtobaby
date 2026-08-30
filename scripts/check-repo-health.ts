// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Repository-health check — implements docs/REPOSITORY_HEALTH.md §6.
 *
 * Reports and gates:
 *   1. ignore probes      — paths that MUST be gitignored (generated SQLite, evidence cache, build output,
 *                           vendor themes, bulk media, secrets) are actually ignored;
 *   2. deny patterns      — tracked files matching generated/cache/database/media/secret patterns;
 *   3. large blobs        — tracked blobs above warn/block thresholds (allowlist via repo-health.config.json);
 *   4. media fixtures     — tracked media/font/binary files above the fixture budget;
 *   5. changed blobs      — largest added/modified files versus a base ref (PR mode);
 *   6. size metrics       — git count-objects, tracked-tree size, knowledge-tree size, largest directories,
 *                           largest historical blobs, optional git-sizer output.
 *
 * Usage:
 *   node scripts/check-repo-health.ts [--base=<ref>] [--json=<file>] [--no-history]
 *
 * Runs with Node >= 22.18 (native type stripping) and Git; no third-party dependencies.
 * Exit code 1 on any hard-policy violation. Warnings never fail the check.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, posix } from "node:path";
import { spawnSync } from "node:child_process";

import {
  changedPathsSince,
  countObjects,
  gitOk,
  ignoredPaths,
  largestHistoricalBlobs,
  repoRoot,
  trackedBlobs,
  type TrackedBlob,
} from "./lib/git.ts";
import { globToRegExp, matchesAny } from "./lib/glob.ts";
import { MiB, Report, formatBytes, parseArgs } from "./lib/report.ts";

interface HealthException {
  pattern: string;
  kinds: string[];
  maxBytes?: number;
  reason: string;
  owner: string;
  added: string;
}

interface HealthConfig {
  version: number;
  thresholds: {
    blobWarnBytes: number;
    blobBlockBytes: number;
    mediaFixtureMaxBytes: number;
    knowledgeTreeTargetBytes: number;
    authoredTreeWarnBytes: number;
    objectDatabaseReviewBytes: number;
    largeDirectoryWarnBytes: number;
  };
  mustBeIgnored: string[];
  denyPatterns: Record<string, string[]>;
  structuralPlaceholders: string[];
  mediaExtensions: string[];
  authoredDirectories: Record<string, string>;
  exceptions: HealthException[];
}

const CONFIG_FILE = "repo-health.config.json";

function loadConfig(root: string): HealthConfig {
  const file = join(root, CONFIG_FILE);
  if (!existsSync(file)) throw new Error(`${CONFIG_FILE} not found at repository root`);
  const config = JSON.parse(readFileSync(file, "utf8")) as HealthConfig;
  for (const ex of config.exceptions) {
    if (!ex.pattern || !ex.reason || !ex.owner || !ex.added || !Array.isArray(ex.kinds) || ex.kinds.length === 0) {
      throw new Error(`Invalid exception in ${CONFIG_FILE}: every entry needs pattern, kinds[], reason, owner, added`);
    }
  }
  return config;
}

/** Find an exception covering `path` for `kind`, honouring the optional size cap. */
function findException(config: HealthConfig, path: string, kind: string, size: number): HealthException | undefined {
  return config.exceptions.find(
    (ex) =>
      ex.kinds.includes(kind) &&
      globToRegExp(ex.pattern).test(path) &&
      (ex.maxBytes === undefined || size <= ex.maxBytes),
  );
}

function isPlaceholder(config: HealthConfig, path: string): boolean {
  return config.structuralPlaceholders.includes(basename(path));
}

function checkIgnoreProbes(report: Report, config: HealthConfig, root: string): void {
  report.section("1. Ignore probes (paths that must never enter Git)");
  const ignored = ignoredPaths(config.mustBeIgnored, root);
  const rows: string[][] = [];
  for (const probe of config.mustBeIgnored) {
    const ok = ignored.has(probe);
    rows.push([`\`${probe}\``, ok ? "ignored" : "**NOT ignored**"]);
    if (!ok) report.error("ignore-probe", `would not be ignored by .gitignore; generated/cache/vendor/secret material could be committed accidentally`, probe);
  }
  report.table(["Probe path", "Status"], rows);
  if (report.errors.length === 0) report.info("ignore-probe", `${config.mustBeIgnored.length} probe paths are ignored`);
}

function checkDenyPatterns(report: Report, config: HealthConfig, tracked: TrackedBlob[]): void {
  report.section("2. Tracked files matching deny patterns");
  const rows: string[][] = [];
  for (const blob of tracked) {
    for (const [kind, patterns] of Object.entries(config.denyPatterns)) {
      const matched = matchesAny(blob.path, patterns);
      if (!matched) continue;
      if (isPlaceholder(config, blob.path) && blob.size < 64 * 1024) {
        rows.push([`\`${blob.path}\``, kind, "placeholder (allowed)"]);
        continue;
      }
      const exception = findException(config, blob.path, `deny-pattern:${kind}`, blob.size);
      if (exception) {
        rows.push([`\`${blob.path}\``, kind, `allowlisted — ${exception.reason}`]);
        report.info("deny-pattern", `allowlisted (${kind}): ${exception.reason}`, blob.path);
      } else {
        rows.push([`\`${blob.path}\``, kind, "**violation**"]);
        report.error("deny-pattern", `tracked file matches deny pattern \`${matched}\` (${kind}); remove it from Git or add a reviewed exception`, blob.path);
      }
    }
  }
  report.table(["Path", "Kind", "Status"], rows);
}

function checkBlobSizes(report: Report, config: HealthConfig, tracked: TrackedBlob[]): void {
  report.section("3. Large tracked blobs");
  const { blobWarnBytes, blobBlockBytes } = config.thresholds;
  const largest = [...tracked].sort((a, b) => b.size - a.size).slice(0, 15);
  report.table(
    ["Path", "Size"],
    largest.map((b) => [`\`${b.path}\``, formatBytes(b.size)]),
  );
  for (const blob of tracked) {
    if (blob.size >= blobBlockBytes) {
      const exception = findException(config, blob.path, "large-blob", blob.size);
      if (exception) report.warn("large-blob", `${formatBytes(blob.size)} exceeds block threshold but is allowlisted: ${exception.reason}`, blob.path);
      else report.error("large-blob", `${formatBytes(blob.size)} exceeds the ${formatBytes(blobBlockBytes)} block threshold; move to object storage/CDN or add a reviewed exception`, blob.path);
    } else if (blob.size >= blobWarnBytes) {
      report.warn("large-blob", `${formatBytes(blob.size)} exceeds the ${formatBytes(blobWarnBytes)} warning threshold`, blob.path);
    }
  }
  report.info("large-blob", `warn ≥ ${formatBytes(blobWarnBytes)}, block ≥ ${formatBytes(blobBlockBytes)}`);
}

function checkMediaFixtures(report: Report, config: HealthConfig, tracked: TrackedBlob[]): void {
  report.section("4. Tracked media / binary fixtures");
  const exts = new Set(config.mediaExtensions.map((e) => e.toLowerCase()));
  const media = tracked.filter((b) => exts.has(posix.extname(b.path).slice(1).toLowerCase()));
  const total = media.reduce((sum, b) => sum + b.size, 0);
  report.line(`${media.length} media/binary file(s) tracked, ${formatBytes(total)} total (fixture budget per file: ${formatBytes(config.thresholds.mediaFixtureMaxBytes)}).`);
  report.line();
  report.table(
    ["Path", "Size"],
    [...media].sort((a, b) => b.size - a.size).slice(0, 20).map((b) => [`\`${b.path}\``, formatBytes(b.size)]),
  );
  for (const blob of media) {
    if (blob.size > config.thresholds.mediaFixtureMaxBytes) {
      const exception = findException(config, blob.path, "media-fixture", blob.size);
      if (exception) report.info("media-fixture", `oversized fixture allowlisted: ${exception.reason}`, blob.path);
      else report.error("media-fixture", `${formatBytes(blob.size)} exceeds the media fixture budget; bulk media belongs in object storage/CDN (docs/REPOSITORY_HEALTH.md §8)`, blob.path);
    }
  }
}

function checkChangedBlobs(report: Report, base: string | undefined, root: string, tracked: TrackedBlob[]): void {
  report.section("5. Largest added/modified files versus base");
  if (!base) {
    report.line("_No base ref supplied (`--base=<ref>` or `GITHUB_BASE_REF`); skipped._");
    return;
  }
  if (!gitOk(["rev-parse", "--verify", `${base}^{commit}`], root)) {
    report.warn("changed-blobs", `base ref \`${base}\` is not available locally; fetch it (e.g. \`git fetch origin main\`) to compare`);
    return;
  }
  const changed = new Set(changedPathsSince(base, root));
  const rows = tracked
    .filter((b) => changed.has(b.path))
    .sort((a, b) => b.size - a.size)
    .slice(0, 15)
    .map((b) => [`\`${b.path}\``, formatBytes(b.size)]);
  report.line(`Base: \`${base}\` — ${changed.size} added/modified file(s).`);
  report.line();
  report.table(["Path", "Size"], rows);
}

function checkSizeMetrics(report: Report, config: HealthConfig, root: string, tracked: TrackedBlob[], includeHistory: boolean): void {
  report.section("6. Repository size metrics");
  const objects = countObjects(root);
  const looseKiB = Number(objects["size"] ?? 0);
  const packKiB = Number(objects["size-pack"] ?? 0);
  const objectDbBytes = (looseKiB + packKiB) * 1024;
  const trackedBytes = tracked.reduce((sum, b) => sum + b.size, 0);

  const rows: string[][] = [
    ["Git object database (loose + packs)", formatBytes(objectDbBytes), `review at ${formatBytes(config.thresholds.objectDatabaseReviewBytes)}`],
    ["Loose objects", `${objects["count"] ?? "?"} (${formatBytes(looseKiB * 1024)})`, ""],
    ["Packed objects", `${objects["in-pack"] ?? "?"} (${formatBytes(packKiB * 1024)})`, ""],
    ["Tracked files", `${tracked.length}`, ""],
    ["Tracked (authored) tree", formatBytes(trackedBytes), `warn near ${formatBytes(config.thresholds.authoredTreeWarnBytes)}`],
  ];
  for (const [label, dir] of Object.entries(config.authoredDirectories)) {
    const bytes = tracked.filter((b) => b.path.startsWith(`${dir}/`)).reduce((sum, b) => sum + b.size, 0);
    rows.push([`${label} tree (\`${dir}\`)`, formatBytes(bytes), `target < ${formatBytes(config.thresholds.knowledgeTreeTargetBytes)}`]);
    if (bytes >= config.thresholds.knowledgeTreeTargetBytes) report.warn("size-budget", `${label} tree is ${formatBytes(bytes)}; architecture review is due (docs/REPOSITORY_HEALTH.md §5)`);
  }
  report.table(["Metric", "Value", "Budget"], rows);

  if (objectDbBytes >= config.thresholds.objectDatabaseReviewBytes) report.warn("size-budget", `Git object database is ${formatBytes(objectDbBytes)}; review threshold reached`);
  if (trackedBytes >= config.thresholds.authoredTreeWarnBytes) report.warn("size-budget", `tracked tree is ${formatBytes(trackedBytes)}; approaching the authored-tree budget`);

  // Largest top-level/second-level directories by tracked size.
  const dirSizes = new Map<string, number>();
  for (const blob of tracked) {
    const parts = blob.path.split("/");
    const key = parts.length > 2 ? `${parts[0]}/${parts[1]}` : (parts.length === 2 ? parts[0]! : "(root)");
    dirSizes.set(key, (dirSizes.get(key) ?? 0) + blob.size);
  }
  const dirRows = [...dirSizes.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  report.line();
  report.line("Largest directories (tracked size):");
  report.line();
  report.table(["Directory", "Size"], dirRows.map(([d, s]) => [`\`${d}\``, formatBytes(s)]));
  for (const [dir, size] of dirRows) {
    if (size >= config.thresholds.largeDirectoryWarnBytes) report.warn("size-budget", `directory \`${dir}\` holds ${formatBytes(size)} of tracked content`);
  }

  if (includeHistory) {
    const history = largestHistoricalBlobs(root, 10);
    report.line();
    report.line("Largest blobs in reachable history (reporting only):");
    report.line();
    report.table(["Path", "Size", "Object"], history.map((h) => [`\`${h.path}\``, formatBytes(h.size), h.oid.slice(0, 12)]));
    for (const h of history) {
      if (h.size >= config.thresholds.blobBlockBytes) report.warn("history", `historical blob ${formatBytes(h.size)} exceeds the block threshold; consider history cleanup before the repository is widely cloned`, h.path);
    }
  }

  const sizer = spawnSync("git-sizer", ["--threshold=1"], { cwd: root, encoding: "utf8" });
  report.line();
  if (sizer.error || sizer.status === null) {
    report.line("_git-sizer not installed; deeper Git diagnostics skipped._");
  } else {
    report.line("git-sizer:");
    report.line();
    report.line("```text");
    report.line((sizer.stdout || sizer.stderr).trim());
    report.line("```");
  }
}

function main(): number {
  const { flags, values } = parseArgs(process.argv.slice(2));
  const root = repoRoot();
  const config = loadConfig(root);
  const report = new Report("Repository health");
  report.line(`Policy: \`${CONFIG_FILE}\` v${config.version} · ${config.exceptions.length} exception(s) · thresholds: warn ${config.thresholds.blobWarnBytes / MiB} MiB / block ${config.thresholds.blobBlockBytes / MiB} MiB`);

  const tracked = trackedBlobs(root);
  const baseFromEnv = process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}` : undefined;
  const base = values.get("base") ?? baseFromEnv;

  checkIgnoreProbes(report, config, root);
  checkDenyPatterns(report, config, tracked);
  checkBlobSizes(report, config, tracked);
  checkMediaFixtures(report, config, tracked);
  checkChangedBlobs(report, base, root, tracked);
  checkSizeMetrics(report, config, root, tracked, !flags.has("no-history"));

  report.section("Exceptions in force");
  report.table(
    ["Pattern", "Kinds", "Max size", "Owner", "Added", "Reason"],
    config.exceptions.map((ex) => [`\`${ex.pattern}\``, ex.kinds.join(", "), ex.maxBytes === undefined ? "—" : formatBytes(ex.maxBytes), ex.owner, ex.added, ex.reason]),
  );

  const exit = report.finish();
  const jsonOut = values.get("json");
  if (jsonOut) {
    mkdirSync(dirname(jsonOut), { recursive: true });
    writeFileSync(jsonOut, JSON.stringify({ ...report.toJSON(), generatedAt: new Date().toISOString() }, null, 2));
    console.log(`JSON report written to ${jsonOut}`);
  }
  return exit;
}

process.exitCode = main();
