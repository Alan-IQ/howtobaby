// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Age-range applicability predicates. Half-open `[minMonths, maxMonths)` on completed months, the
 * same convention as stage bins (GUIDANCE_CONTENT_CONTRACT.md §2). Age selects candidate
 * guidance; these predicates never assert readiness, suitability or diagnosis.
 */

import type { ElapsedAge } from "../types/age.ts";
import type { ChildAgeContext, GuidanceContext } from "../types/context.ts";
import { safetyContextOf } from "../context/guidance-context.ts";

export interface AgeRangeMonths {
  readonly minMonths: number;
  /** Exclusive; omit for an open upper bound. */
  readonly maxMonths?: number;
}

export function isAgeWithinRange(age: ElapsedAge, range: AgeRangeMonths): boolean {
  if (age.days < 0) return false;
  if (age.completedMonths < range.minMonths) return false;
  return range.maxMonths === undefined || age.completedMonths < range.maxMonths;
}

/**
 * Applicability of safety-sensitive, chronological-scope guidance: resolved on the ACTUAL child
 * only. Returns `undefined` without a profile (public browsing shows scope, not applicability).
 */
export function safetyRangeApplies(context: GuidanceContext, range: AgeRangeMonths): boolean | undefined {
  const actual: ChildAgeContext | undefined = safetyContextOf(context);
  return actual ? isAgeWithinRange(actual.chronological, range) : undefined;
}
