// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Cross-platform local cleanup CLI (see scripts/lib/clean.ts and CONTRIBUTING.md "Cleaning up").
 *
 *   node scripts/clean.ts modules [--dry-run]   # root + workspace node_modules (pnpm clean:modules)
 *   node scripts/clean.ts build   [--dry-run]   # rebuildable build output/caches (pnpm clean:build)
 *   node scripts/clean.ts local   [--dry-run]   # both (pnpm clean:local)
 *
 * Only generated/disposable artifacts are removed; canonical YAML/Markdown/JSON, code, docs,
 * tests, .git and the Evidence Watch cache are never touched. Plain Node — runs without node_modules.
 */

import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import { CLEAN_SCOPES, runClean, type CleanScope } from "./lib/clean.ts";

function main(argv: string[]): number {
  const dryRun = argv.includes("--dry-run");
  const scopeArg = argv.find((arg) => !arg.startsWith("--"));
  if (scopeArg === undefined || !(CLEAN_SCOPES as readonly string[]).includes(scopeArg)) {
    console.error(`usage: node scripts/clean.ts <${CLEAN_SCOPES.join("|")}> [--dry-run]`);
    return 2;
  }
  const scope = scopeArg as CleanScope;
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const result = runClean(root, scope, { dryRun });
  const verb = dryRun ? "would remove" : "removed";
  for (const path of result.removed) console.log(`${verb}  ${path}`);
  console.log(`clean:${scope} — ${result.removed.length} ${verb}, ${result.missing.length} already absent${dryRun ? " (dry run, nothing deleted)" : ""}.`);
  if (scope !== "build") console.log("Reinstall with: pnpm install --frozen-lockfile");
  return 0;
}

process.exitCode = main(process.argv.slice(2));
