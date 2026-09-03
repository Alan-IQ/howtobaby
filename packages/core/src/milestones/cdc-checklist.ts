// SPDX-License-Identifier: AGPL-3.0-only
/**
 * CDC milestone checklist resolution (GUIDANCE_CONTENT_CONTRACT.md §3):
 *
 *   "When using CDC milestone checklists and a child falls between checklist ages, resolve to
 *    the younger checklist rather than interpolating a new threshold."
 *
 * CDC's "Learn the Signs. Act Early." program publishes one checklist per age (2, 4, 6, 9, 12,
 * 15, 18, 24, 30, 36, 48 and 60 months). A checklist describes what most children do BY that
 * age, so an age between two checklist ages is compared with the younger one — never with an
 * estimate in between — and an age below the first checklist has no checklist yet. Milestones are
 * references for noticing development, not deadlines, scores or pass/fail tests; this module only
 * decides WHICH checklist is the reference. It holds no milestone prose (that is canonical
 * knowledge) and no date math (ages arrive already resolved in completed months).
 */

import type { StageDefinition } from "../types/context.ts";

/** Checklist ages in completed months, as CDC publishes them (ascending). */
export const CDC_MILESTONE_CHECKLIST_MONTHS: readonly number[] = [2, 4, 6, 9, 12, 15, 18, 24, 30, 36, 48, 60];

/** Resolution of one age (in completed months) to the CDC checklist that serves as its reference. */
export interface CdcChecklistResolution {
  /** The reference checklist age in months, or `undefined` before the first checklist (under 2 months). */
  readonly checklistMonths: number | undefined;
  /** The next checklist age after the resolved one (or the first one when none applies yet); `undefined` past the last. */
  readonly nextChecklistMonths: number | undefined;
  /** True when the age equals the checklist age exactly (no younger-checklist rule was needed). */
  readonly exact: boolean;
}

/**
 * The reference checklist for an age in completed months: the checklist whose age is the largest
 * one not exceeding the child's age (the "younger checklist" rule). Negative or non-finite ages —
 * e.g. a corrected development age before the due date — resolve to no checklist, never to a
 * fabricated one.
 */
export function resolveCdcChecklist(completedMonths: number): CdcChecklistResolution {
  if (!Number.isFinite(completedMonths) || completedMonths < 0) {
    return { checklistMonths: undefined, nextChecklistMonths: CDC_MILESTONE_CHECKLIST_MONTHS[0], exact: false };
  }
  let resolved: number | undefined;
  let next: number | undefined;
  for (const age of CDC_MILESTONE_CHECKLIST_MONTHS) {
    if (age <= completedMonths) resolved = age;
    else {
      next = age;
      break;
    }
  }
  return { checklistMonths: resolved, nextChecklistMonths: next, exact: resolved === completedMonths };
}

/**
 * The reference checklist for a whole development stage bin: every age inside `[min,max)`
 * resolves to the same checklist because the Development stage bins start exactly at checklist
 * ages (2, 4, 6, 9, … months); only the first bin (under 2 months) has no checklist yet.
 */
export function cdcChecklistForStage(stage: StageDefinition): CdcChecklistResolution {
  return resolveCdcChecklist(stage.minMonths);
}
