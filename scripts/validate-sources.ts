// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Source-registry validation gate (docs/EVIDENCE_PROVENANCE.md §2/§16, Phase 2 gate).
 *
 * Fails when a source record is malformed, duplicated, uses invalid enums/dates/URLs, or has a
 * broken supersession chain (superseded without successor, unresolved/self successor, dates in
 * the future).
 *
 * Usage: node scripts/validate-sources.ts
 */

import { loadValidatedKnowledge, reportCategories } from "./lib/knowledge.ts";

process.exitCode = reportCategories("Source registry validation", loadValidatedKnowledge(), ["source"]);
