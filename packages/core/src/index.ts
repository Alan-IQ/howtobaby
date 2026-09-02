// SPDX-License-Identifier: AGPL-3.0-only
/**
 * @howtobaby/core — deterministic age/context logic (docs/REPOSITORY_STRUCTURE.md §3):
 * calendar-date arithmetic, chronological age, the corrected-development proxy, stage bins and
 * the actual/browsed/preview context model. Pure functions over plain data: no React, no
 * storage, no user-facing medical prose (labels and copy live in apps/web and the knowledge
 * translations). Deterministic input + content version = deterministic output.
 */
export * from "./types/index.ts";
export * from "./age/index.ts";
export * from "./context/index.ts";
export * from "./applicability/index.ts";
