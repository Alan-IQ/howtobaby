// SPDX-License-Identifier: AGPL-3.0-only
// Minimal Git helpers shared by repository-baseline scripts. No third-party dependencies.

import { execFileSync, spawnSync } from "node:child_process";

export interface TrackedBlob {
  path: string;
  oid: string;
  mode: string;
  size: number;
}

export function git(args: string[], opts: { cwd?: string; allowFailure?: boolean } = {}): string {
  const result = spawnSync("git", args, {
    cwd: opts.cwd ?? process.cwd(),
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
  });
  if (result.status !== 0 && !opts.allowFailure) {
    throw new Error(`git ${args.join(" ")} failed: ${result.stderr.trim()}`);
  }
  return result.stdout;
}

export function gitOk(args: string[], cwd?: string): boolean {
  const result = spawnSync("git", args, { cwd: cwd ?? process.cwd(), encoding: "utf8" });
  return result.status === 0;
}

export function repoRoot(): string {
  return git(["rev-parse", "--show-toplevel"]).trim();
}

/** Blob sizes for a list of object ids via one `git cat-file --batch-check` call. */
export function blobSizes(oids: string[], cwd: string): Map<string, number> {
  const sizes = new Map<string, number>();
  if (oids.length === 0) return sizes;
  const out = execFileSync("git", ["cat-file", "--batch-check=%(objectname) %(objecttype) %(objectsize)"], {
    cwd,
    input: `${oids.join("\n")}\n`,
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
  });
  for (const line of out.split("\n")) {
    if (!line) continue;
    const [oid, type, size] = line.split(" ");
    if (oid && type === "blob" && size) sizes.set(oid, Number(size));
  }
  return sizes;
}

/** Files tracked in the index (staged state), with blob sizes. */
export function trackedBlobs(cwd: string): TrackedBlob[] {
  const out = git(["ls-files", "--stage", "-z"], { cwd });
  const entries: Array<Omit<TrackedBlob, "size">> = [];
  for (const record of out.split("\0")) {
    if (!record) continue;
    // "<mode> <oid> <stage>\t<path>"
    const tab = record.indexOf("\t");
    const [mode, oid] = record.slice(0, tab).split(" ");
    const path = record.slice(tab + 1);
    if (mode && oid && path) entries.push({ path, oid, mode });
  }
  const sizes = blobSizes(entries.map((e) => e.oid), cwd);
  return entries.map((e) => ({ ...e, size: sizes.get(e.oid) ?? 0 }));
}

function checkIgnore(paths: string[], cwd: string): { status: number | null; stdout: string; stderr: string } {
  const result = spawnSync("git", ["check-ignore", "--no-index", "-z", "--stdin"], {
    cwd,
    input: `${paths.join("\0")}\0`,
    encoding: "utf8",
  });
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

/**
 * Paths that Git would ignore, out of the given candidate list.
 *
 * Git refuses a pathspec that passes through a symbolic link in the working tree ("is beyond a symbolic
 * link") — which is exactly what an installed pnpm workspace looks like (apps/web/node_modules/next is a
 * symlink). Such a probe is re-evaluated at the nearest ancestor that Git accepts: if that ancestor is
 * ignored, the probe path is ignored too.
 */
export function ignoredPaths(candidates: string[], cwd: string): Set<string> {
  const batch = checkIgnore(candidates, cwd);
  // exit 1 == none ignored; 128 == error
  if (batch.status === 0 || batch.status === 1) return new Set(batch.stdout.split("\0").filter(Boolean));
  if (!/beyond a symbolic link/.test(batch.stderr)) throw new Error(`git check-ignore failed: ${batch.stderr.trim()}`);

  const ignored = new Set<string>();
  for (const candidate of candidates) {
    let probe = candidate;
    for (;;) {
      const single = checkIgnore([probe], cwd);
      if (single.status === 0) {
        ignored.add(candidate);
        break;
      }
      if (single.status === 1) break;
      if (!/beyond a symbolic link/.test(single.stderr)) throw new Error(`git check-ignore failed for ${candidate}: ${single.stderr.trim()}`);
      const parent = probe.includes("/") ? probe.slice(0, probe.lastIndexOf("/")) : "";
      if (!parent) break;
      probe = parent;
    }
  }
  return ignored;
}

export function countObjects(cwd: string): Record<string, string> {
  const out = git(["count-objects", "-v"], { cwd });
  const metrics: Record<string, string> = {};
  for (const line of out.split("\n")) {
    const idx = line.indexOf(":");
    if (idx > 0) metrics[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return metrics;
}

/** Largest blobs across all reachable history (reporting only). */
export function largestHistoricalBlobs(cwd: string, limit: number): Array<{ oid: string; path: string; size: number }> {
  const out = git(["rev-list", "--objects", "--all"], { cwd, allowFailure: true });
  const pathByOid = new Map<string, string>();
  for (const line of out.split("\n")) {
    if (!line) continue;
    const sp = line.indexOf(" ");
    if (sp < 0) continue;
    pathByOid.set(line.slice(0, sp), line.slice(sp + 1));
  }
  const sizes = blobSizes([...pathByOid.keys()], cwd);
  return [...sizes.entries()]
    .map(([oid, size]) => ({ oid, size, path: pathByOid.get(oid) ?? "" }))
    .sort((a, b) => b.size - a.size)
    .slice(0, limit);
}

/** Files added/modified between base and the current index. */
export function changedPathsSince(base: string, cwd: string): string[] {
  const out = git(["diff", "--cached", "--name-only", "--diff-filter=AM", "-z", base], { cwd, allowFailure: true });
  return out.split("\0").filter(Boolean);
}
