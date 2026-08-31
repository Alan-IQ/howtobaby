// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Deterministic-rebuild gate (docs/IMPLEMENTATION_ROADMAP.md Phase 2,
 * docs/REPOSITORY_STRUCTURE.md §6): deleting `knowledge.sqlite` + the generated evidence indexes
 * and rebuilding from canonical Git/YAML must produce equivalent results.
 *
 * Proven the strong way: two independent from-scratch builds into temporary directories must be
 * byte-identical for every deterministic artifact (SQLite database included). Volatile
 * build-info.json is excluded by design. Also proves the canonical-vs-derived invariant direction
 * that matters: the projection is a pure function of authored YAML, so no knowledge can exist
 * only in SQLite/generated output.
 *
 * Usage: node scripts/check-knowledge-determinism.ts
 */

import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { DETERMINISTIC_ARTIFACTS, compileKnowledge, writeGeneratedArtifacts } from "../packages/knowledge/src/index.ts";
import { loadValidatedKnowledge, reportCategories } from "./lib/knowledge.ts";
import { Report } from "./lib/report.ts";

function hashFile(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function main(): number {
  const report = new Report("Deterministic knowledge rebuild");

  const dirA = mkdtempSync(join(tmpdir(), "htb-knowledge-a-"));
  const dirB = mkdtempSync(join(tmpdir(), "htb-knowledge-b-"));
  try {
    // Two independent load → validate → compile → write passes, as if generated/ had been deleted.
    for (const dir of [dirA, dirB]) {
      const knowledge = loadValidatedKnowledge();
      if (knowledge.issues.errors.length > 0) {
        return reportCategories("Deterministic rebuild (refused: canonical graph is invalid)", knowledge, [
          "schema", "source", "provenance", "translation", "coverage", "tool",
        ]);
      }
      writeGeneratedArtifacts(compileKnowledge(knowledge), dir, "all");
    }

    report.section("Byte-for-byte artifact comparison");
    const rows: string[][] = [];
    let mismatches = 0;
    for (const name of DETERMINISTIC_ARTIFACTS) {
      const hashA = hashFile(join(dirA, name));
      const hashB = hashFile(join(dirB, name));
      const equal = hashA === hashB;
      if (!equal) {
        mismatches += 1;
        report.error("determinism", `rebuild produced different bytes (${hashA.slice(0, 12)}… vs ${hashB.slice(0, 12)}…)`, name);
      }
      rows.push([name, equal ? "identical" : "DIFFERENT", hashA.slice(0, 16)]);
    }
    report.table(["artifact", "result", "sha256 (first build)"], rows);
    if (mismatches === 0) report.info("determinism", `${DETERMINISTIC_ARTIFACTS.length} artifacts rebuild byte-identically from canonical YAML`);
  } finally {
    rmSync(dirA, { recursive: true, force: true });
    rmSync(dirB, { recursive: true, force: true });
  }
  return report.finish();
}

process.exitCode = main();
