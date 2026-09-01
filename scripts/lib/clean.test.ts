// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Cleanup safety proofs (node:test — runs without third-party packages): the cleanup removes only
 * disposable/generated paths, keeps .gitkeep placeholders, never enters canonical or protected
 * roots, refuses non-disposable paths, and a dry run deletes nothing.
 */

import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";

import { PROTECTED_ROOTS, assertDisposable, cleanTargets, runClean, workspaceDirs } from "./clean.ts";

const CANONICAL: readonly string[] = [
  "docs/EVIDENCE_PROVENANCE.md",
  "packages/knowledge/src/sources/registry.yaml",
  "packages/knowledge/src/claims/feeding/solids.yaml",
  "packages/knowledge/generated/.gitkeep",
  "packages/ui/src/styles.css",
  "apps/web/src/app/page.tsx",
  "evidence/cache/.gitkeep",
  "evidence/cache/cdc-snapshot.fetched.html",
  "tests/e2e/.gitkeep",
  ".git/HEAD",
  "package.json",
  "pnpm-lock.yaml",
];

const DISPOSABLE: readonly string[] = [
  "node_modules/.pnpm/lock.yaml",
  "apps/web/node_modules/next/package.json",
  "packages/knowledge/node_modules/.bin/vitest",
  "tools/lullaby-player/node_modules/x.js",
  "apps/web/.next/BUILD_ID",
  "apps/web/out/index.html",
  "apps/web/next-env.d.ts",
  "apps/web/tsconfig.tsbuildinfo",
  "packages/knowledge/generated/knowledge.sqlite",
  "packages/knowledge/generated/source-public-index.json",
  "packages/knowledge/generated/manifests/feeding.json",
  "packages/ui/src/theme-tokens.generated.css",
  "packages/ui/coverage/lcov.info",
  "reports/repo-health.json",
  ".turbo/cache.bin",
  ".eslintcache",
];

function fakeRepo(): string {
  const root = mkdtempSync(join(tmpdir(), "htb-clean-"));
  writeFileSync(join(root, "pnpm-workspace.yaml"), 'packages:\n  - "apps/*"\n  - "packages/*"\n  - "tools/*"\n\nminimumReleaseAge: 1440\n');
  for (const file of [...CANONICAL, ...DISPOSABLE]) {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(join(root, file), `fixture ${file}\n`);
  }
  return root;
}

test("workspace directories come from pnpm-workspace.yaml globs", () => {
  const root = fakeRepo();
  try {
    assert.deepEqual(workspaceDirs(root), ["apps/web", "packages/knowledge", "packages/ui", "tools/lullaby-player"]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("clean:local removes every disposable artifact and nothing canonical", () => {
  const root = fakeRepo();
  try {
    const result = runClean(root, "local");
    assert.equal(result.dryRun, false);
    for (const file of DISPOSABLE) assert.equal(existsSync(join(root, file)), false, `should be removed: ${file}`);
    for (const file of CANONICAL) {
      assert.equal(existsSync(join(root, file)), true, `must survive: ${file}`);
      assert.equal(readFileSync(join(root, file), "utf8"), `fixture ${file}\n`);
    }
    // Placeholder directories survive (only their disposable contents go).
    assert.equal(existsSync(join(root, "packages/knowledge/generated")), true);
    assert.equal(existsSync(join(root, "evidence/cache")), true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("clean:modules touches only node_modules; clean:build never touches node_modules", () => {
  const root = fakeRepo();
  try {
    const modules = runClean(root, "modules");
    assert.ok(modules.removed.every((path) => path.endsWith("node_modules")), modules.removed.join(","));
    assert.equal(existsSync(join(root, "apps/web/.next")), true);
    assert.equal(existsSync(join(root, "packages/knowledge/generated/knowledge.sqlite")), true);
    const build = runClean(root, "build");
    assert.ok(build.removed.every((path) => !path.includes("node_modules")), build.removed.join(","));
    assert.equal(existsSync(join(root, "apps/web/.next")), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("dry run lists targets but deletes nothing", () => {
  const root = fakeRepo();
  try {
    const result = runClean(root, "local", { dryRun: true });
    assert.equal(result.dryRun, true);
    assert.ok(result.removed.includes("node_modules"));
    assert.ok(result.removed.includes("packages/knowledge/generated/knowledge.sqlite"));
    for (const file of [...CANONICAL, ...DISPOSABLE]) assert.equal(existsSync(join(root, file)), true, `dry run must keep: ${file}`);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("every planned target passes the disposable guard and stays outside protected roots", () => {
  const root = fakeRepo();
  try {
    for (const target of cleanTargets(root, "local")) {
      assert.doesNotThrow(() => assertDisposable(root, target.path), target.path);
      for (const protectedRoot of PROTECTED_ROOTS) assert.ok(!target.path.startsWith(`${protectedRoot}/`), target.path);
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("the guard refuses canonical, protected, escaping and unknown paths", () => {
  const root = fakeRepo();
  try {
    for (const bad of [
      "packages/knowledge/src/sources/registry.yaml",
      "packages/knowledge/src",
      "docs",
      "docs/GUI_DESIGN.md",
      "evidence/cache",
      ".git",
      "packages/knowledge/generated/.gitkeep",
      "apps/web/src",
      "package.json",
      "../outside/node_modules",
      join(root, "node_modules"),
    ]) {
      assert.throws(() => assertDisposable(root, bad), bad);
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
