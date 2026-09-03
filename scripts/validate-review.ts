// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Review-state honesty gate (docs/GUIDANCE_CONTENT_CONTRACT.md §14, CLAUDE.md §5).
 *
 * `reviewStatus`/`reviewedAt` say what was reviewed and when; `reviewedBy`/`verifiedBy` say who.
 * This gate fails when the two disagree — when an `ai-assisted` pass occupies a state that asserts
 * a qualified human actually reviewed the claim (`clinically-reviewed`, `release-approved`), when
 * urgent/emergency wording rests on an AI review, or when a clinician-asserting claim stands on a
 * source no maintainer has verified. AI may assist retrieval, drafting and translation; it may
 * never sign off in a clinician's place.
 *
 * Usage: node scripts/validate-review.ts
 */

import { loadValidatedKnowledge, reportCategories } from "./lib/knowledge.ts";

process.exitCode = reportCategories("Review-state honesty validation", loadValidatedKnowledge(), ["review"]);
