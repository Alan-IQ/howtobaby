// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Cross-platform local cleanup (docs/REPOSITORY_HEALTH.md §4, CONTRIBUTING.md "Cleaning up").
 *
 * Deletes ONLY generated/disposable artifacts that `pnpm install` / `pnpm build` recreate:
 * workspace `node_modules`, Next.js output, derived knowledge read models, the generated theme
 * reference CSS, tool caches and local reports. It never touches canonical YAML/Markdown/JSON,
 * source code, docs, tests, `.git`, or the Evidence Watch cache.
 *
 * Plain Node only (no third-party imports): this must still run after `node_modules` is gone.
 * Every candidate path is checked against an allowlist of disposable names AND a denylist of
 * canonical roots before anything is removed, so a future edit cannot silently widen the scope.
 */

import { existsSync, lstatSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";

export type CleanScope = "modules" | "build" | "local";

export const CLEAN_SCOPES: readonly CleanScope[] = ["modules", "build", "local"];

/** Root-anchored canonical/authored roots that a cleanup must never enter. */
export const PROTECTED_ROOTS: readonly string[] = [
  ".git",
  ".github",
  "docs",
  "evidence",
  "packages/knowledge/src",
  "tests",
  "LICENSES",
];

/** Disposable directory/file names a cleanup may remove wherever they sit at a workspace root. */
const DISPOSABLE_BASENAMES: ReadonlySet<string> = new Set([
  "node_modules",
  ".next",
  "out",
  "dist",
  "coverage",
  ".turbo",
  ".eslintcache",
  "next-env.d.ts",
  "reports",
  "theme-tokens.generated.css",
]);

/** Directories whose CONTENTS are disposable while the directory itself (and its .gitkeep) stays. */
const DISPOSABLE_CONTENT_DIRS: readonly string[] = ["packages/knowledge/generated"];

export interface CleanTarget {
  /** Repo-relative POSIX path. */
  path: string;
  scope: Exclude<CleanScope, "local">;
}

export interface CleanResult {
  removed: string[];
  missing: string[];
  dryRun: boolean;
}

function toPosix(path: string): string {
  return path.split(sep).join("/");
}

/** Workspace package directories from pnpm-workspace.yaml (`packages:` globs, one `*` level). */
export function workspaceDirs(root: string): string[] {
  const manifest = join(root, "pnpm-workspace.yaml");
  if (!existsSync(manifest)) return [];
  const dirs: string[] = [];
  let inPackages = false;
  for (const raw of readFileSync(manifest, "utf8").split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, "").trimEnd();
    if (/^packages:\s*$/.test(line)) {
      inPackages = true;
      continue;
    }
    if (!inPackages) continue;
    const item = /^\s+-\s+["']?([^"']+)["']?\s*$/.exec(line);
    if (!item) {
      if (line.trim() !== "") inPackages = false; // next top-level key
      continue;
    }
    const pattern = item[1]!;
    if (pattern.endsWith("/*")) {
      const parent = pattern.slice(0, -2);
      const parentAbs = join(root, parent);
      if (!existsSync(parentAbs)) continue;
      for (const entry of readdirSync(parentAbs, { withFileTypes: true })) {
        if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") dirs.push(`${parent}/${entry.name}`);
      }
    } else if (!pattern.includes("*")) {
      dirs.push(pattern);
    }
  }
  return dirs.sort();
}

/** Every candidate path for a scope (existing or not), repo-relative and sorted. */
export function cleanTargets(root: string, scope: CleanScope): CleanTarget[] {
  const scopes: Array<Exclude<CleanScope, "local">> = scope === "local" ? ["build", "modules"] : [scope];
  const roots = ["", ...workspaceDirs(root)];
  const targets: CleanTarget[] = [];
  const add = (path: string, s: Exclude<CleanScope, "local">) => targets.push({ path: toPosix(path), scope: s });

  if (scopes.includes("modules")) {
    for (const dir of roots) add(dir ? `${dir}/node_modules` : "node_modules", "modules");
  }

  if (scopes.includes("build")) {
    for (const dir of roots) {
      for (const name of [".next", "out", "dist", "coverage", ".turbo", ".eslintcache", "next-env.d.ts"]) {
        if (dir === "" && (name === ".next" || name === "out" || name === "dist" || name === "next-env.d.ts")) continue; // app-level only
        add(dir ? `${dir}/${name}` : name, "build");
      }
      const abs = dir ? join(root, dir) : root;
      if (existsSync(abs)) {
        for (const entry of readdirSync(abs, { withFileTypes: true })) {
          if (entry.isFile() && entry.name.endsWith(".tsbuildinfo")) add(dir ? `${dir}/${entry.name}` : entry.name, "build");
        }
      }
    }
    add("reports", "build");
    add("packages/ui/src/theme-tokens.generated.css", "build");
    for (const dir of DISPOSABLE_CONTENT_DIRS) {
      const abs = join(root, dir);
      if (!existsSync(abs)) continue;
      for (const entry of readdirSync(abs)) {
        if (entry !== ".gitkeep") add(`${dir}/${entry}`, "build");
      }
    }
  }

  const unique = new Map(targets.map((t) => [t.path, t]));
  return [...unique.values()].sort((a, b) => a.path.localeCompare(b.path));
}

/**
 * Guard: a path is removable only when it stays inside `root`, sits outside every protected
 * root, and is either a disposable basename, a `*.tsbuildinfo`, or a child of a disposable-content
 * directory. Throws (never deletes) on any violation.
 */
export function assertDisposable(root: string, relPath: string): void {
  if (isAbsolute(relPath) || relPath.split(/[\\/]/).includes("..")) throw new Error(`refusing non-relative cleanup path: ${relPath}`);
  const abs = resolve(root, relPath);
  const rel = toPosix(relative(resolve(root), abs));
  if (rel === "" || rel.startsWith("..")) throw new Error(`refusing cleanup path outside the repository: ${relPath}`);
  for (const protectedRoot of PROTECTED_ROOTS) {
    if (rel === protectedRoot || rel.startsWith(`${protectedRoot}/`)) throw new Error(`refusing to clean inside protected root "${protectedRoot}": ${relPath}`);
  }
  const name = basename(rel);
  const parent = toPosix(dirname(rel));
  const ok = DISPOSABLE_BASENAMES.has(name) || name.endsWith(".tsbuildinfo") || (DISPOSABLE_CONTENT_DIRS.includes(parent) && name !== ".gitkeep");
  if (!ok) throw new Error(`refusing to clean non-disposable path: ${relPath}`);
}

/** Remove every target for `scope` under `root` (or only list them with `dryRun`). */
export function runClean(root: string, scope: CleanScope, options: { dryRun?: boolean } = {}): CleanResult {
  const dryRun = options.dryRun === true;
  const result: CleanResult = { removed: [], missing: [], dryRun };
  for (const target of cleanTargets(root, scope)) {
    assertDisposable(root, target.path);
    const abs = join(root, target.path);
    let exists = false;
    try {
      lstatSync(abs);
      exists = true;
    } catch {
      exists = false;
    }
    if (!exists) {
      result.missing.push(target.path);
      continue;
    }
    if (!dryRun) rmSync(abs, { recursive: true, force: true, maxRetries: 3 });
    result.removed.push(target.path);
  }
  return result;
}
