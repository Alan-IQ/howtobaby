// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Provenance validation gate (docs/EVIDENCE_PROVENANCE.md §4/§16, Phase 2 gate).
 *
 * Fails when a claim references an unknown source ID, an `official-guidance` claim lacks approved
 * `primary`/`direct-support` backing (or every direct support is superseded/retired), an
 * evidence-synthesis/practical-interpretation claim records no source basis, or a tool references
 * a missing claim / ships with unapproved claims. Conflicting sources without a visible
 * uncertainty note surface as warnings.
 *
 * Usage: node scripts/validate-provenance.ts
 */

import { loadValidatedKnowledge, reportCategories } from "./lib/knowledge.ts";

process.exitCode = reportCategories("Claim provenance validation", loadValidatedKnowledge(), ["provenance", "tool"]);
