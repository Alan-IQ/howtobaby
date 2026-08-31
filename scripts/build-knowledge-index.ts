// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Builds the derived knowledge read model (docs/SYSTEM_ARCHITECTURE.md §5):
 * packages/knowledge/generated/knowledge.sqlite + content/source/evidence manifests +
 * content-version.json (+ volatile build-info.json).
 *
 * The output directory is gitignored — derived and disposable. The build refuses to project an
 * invalid canonical graph: any validation ERROR (schema/source/provenance/translation/coverage/
 * tool) fails the build before a byte is written, so a broken index can never replace a good one.
 *
 * Usage: node scripts/build-knowledge-index.ts [--out=DIR]
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
    return reportCategories("Knowledge index build (refused: canonical graph is invalid)", knowledge, [
      "schema", "source", "provenance", "translation", "coverage", "tool",
    ]);
  }

  const report = new Report("Knowledge index build");
  const compiled = compileKnowledge(knowledge);
  const written = writeGeneratedArtifacts(compiled, outDir, "knowledge");
  report.section("Derived artifacts (rebuildable; never canonical)");
  for (const name of written) report.info("artifact", `wrote ${name}`, `${GENERATED_DIR}/${name}`);
  report.info("content-version", `contentVersion ${compiled.contentVersion.contentVersion}, sourceRegistry ${compiled.contentVersion.sourceRegistryVersion}`);
  return report.finish();
}

process.exitCode = main();
