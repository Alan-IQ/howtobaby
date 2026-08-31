// SPDX-License-Identifier: AGPL-3.0-only
/**
 * EN/VI translation parity gate (docs/GUIDANCE_CONTENT_CONTRACT.md §10, Phase 2 gate).
 *
 * English is canonical; this gate fails when a used key has no EN text, an EN key has no VI
 * counterpart (or vice versa), or when semantic-critical content diverges: quantities/age numbers,
 * negation/prohibition wording, or the approximation qualifier required by `source-approximate`
 * claims (khoảng/…). Unused EN keys surface as warnings.
 *
 * Usage: node scripts/validate-translations.ts
 */

import { loadValidatedKnowledge, reportCategories } from "./lib/knowledge.ts";

process.exitCode = reportCategories("EN/VI translation parity validation", loadValidatedKnowledge(), ["translation"]);
