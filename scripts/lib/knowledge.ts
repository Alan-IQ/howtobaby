// SPDX-License-Identifier: AGPL-3.0-only
// Shared entry for knowledge validation/build scripts: load + validate the canonical graph once,
// then let each script report its own issue categories through the standard Report format.

import { join } from "node:path";

import { loadCanonicalKnowledge, validateKnowledge, type CanonicalKnowledge } from "../../packages/knowledge/src/index.ts";
import type { IssueCategory, ValidationIssue } from "../../packages/knowledge/src/schemas/issues.ts";
import { repoRoot } from "./git.ts";
import { Report } from "./report.ts";

export const GENERATED_DIR = "packages/knowledge/generated";

export function loadValidatedKnowledge(): CanonicalKnowledge {
  const knowledge = loadCanonicalKnowledge(join(repoRoot(), "packages/knowledge/src"));
  validateKnowledge(knowledge);
  return knowledge;
}

/** Render the issues of the given categories into a Report; returns the process exit code. */
export function reportCategories(title: string, knowledge: CanonicalKnowledge, categories: IssueCategory[]): number {
  const report = new Report(title);
  report.section("Canonical graph");
  report.info(
    "graph",
    `${knowledge.sources.length} source(s), ${knowledge.claims.length} claim(s), ${knowledge.guidance.length} guidance block(s), ` +
      `${Object.keys(knowledge.translations.en).length} EN key(s), ${Object.keys(knowledge.translations.vi).length} VI key(s), ` +
      `${knowledge.tools.length} tool record(s), ${knowledge.coverage.cells.length} coverage cell(s)`,
  );
  report.section(`Findings (${categories.join(", ")})`);
  const relevant: ValidationIssue[] = knowledge.issues.byCategory(...categories);
  for (const issue of relevant) {
    const message = issue.subject ? `\`${issue.subject}\` — ${issue.message}` : issue.message;
    if (issue.severity === "error") report.error(`${issue.category}/${issue.rule}`, message, issue.file);
    else report.warn(`${issue.category}/${issue.rule}`, message, issue.file);
  }
  if (relevant.length === 0) report.info("findings", "no findings");
  return report.finish();
}
