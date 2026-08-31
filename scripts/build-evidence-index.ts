// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Builds the generated reverse evidence indexes (docs/EVIDENCE_PROVENANCE.md §17):
 * claim-evidence-index.json, source-claim-index.json, route-evidence-index.json,
 * tool-evidence-index.json and source-public-index.json under packages/knowledge/generated/.
 *
 * These indexes feed SourceChip/EvidenceDrawer/page References, print citations, the /sources
 * trust page and Evidence Watch impact analysis from ONE canonical provenance graph — no surface
 * maintains a second citation list. Like the knowledge index, the build refuses an invalid graph.
 *
 * Usage: node scripts/build-evidence-index.ts [--out=DIR]
 */

import { join } from "node:path";

import { compileKnowledge, writeGeneratedArtifacts } from "../packages/knowledge/src/index.ts";
import { repoRoot } from "./lib/git.ts";
import { GENERATED_DIR, loadValidatedKnowledge, reportCategories } from "./lib/knowledge.ts";
import { Report, parseArgs } from "./lib/report.ts";

function main(): number {
  const { values } = parseArgs(process.argv.slice(2));
  const outDir = values.get("out") ?? join(repoRoot(), GENERATED_DIR);

  const knowledge = loadValidatedKnowledge();
  if (knowledge.issues.errors.length > 0) {
    return reportCategories("Evidence index build (refused: canonical graph is invalid)", knowledge, [
      "schema", "source", "provenance", "translation", "coverage", "tool",
    ]);
  }

  const report = new Report("Evidence index build");
  const compiled = compileKnowledge(knowledge);
  const written = writeGeneratedArtifacts(compiled, outDir, "evidence");
  report.section("Derived evidence indexes (rebuildable; never canonical)");
  for (const name of written) report.info("artifact", `wrote ${name}`, `${GENERATED_DIR}/${name}`);
  report.info(
    "graph",
    `${compiled.claimEvidence.length} claim(s), ${compiled.sourceClaims.length} source-claim mapping(s), ` +
      `${compiled.routeEvidence.length} route(s), ${compiled.toolEvidence.length} tool(s)`,
  );
  return report.finish();
}

process.exitCode = main();
