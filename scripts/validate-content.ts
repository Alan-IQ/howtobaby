// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Content-schema + coverage validation gate (docs/GUIDANCE_CONTENT_CONTRACT.md §9/§11, Phase 2 gate).
 *
 * Fails when a claim/guidance record is structurally invalid (IDs, enums, dates, unknown fields),
 * duplicates an ID or public slug, invents precision (`source-approximate`/`source-range` text
 * without the qualifier/range), uses urgent/emergency wording without a source-reviewed state, or
 * when a coverage-matrix cell resolves to a missing, unreviewed, untranslated or unrendered claim.
 *
 * Usage: node scripts/validate-content.ts
 */

import { loadValidatedKnowledge, reportCategories } from "./lib/knowledge.ts";

process.exitCode = reportCategories("Content schema and coverage validation", loadValidatedKnowledge(), ["schema", "coverage"]);
