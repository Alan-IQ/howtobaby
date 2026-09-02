// SPDX-License-Identifier: AGPL-3.0-only
/**
 * An elapsed age between two calendar dates. `days` is exact; `completedMonths` counts full
 * calendar months (a monthly anniversary that does not exist in a shorter month falls on that
 * month's last day) and `remainderDays` the days since that last completed month. `weeks` is
 * `floor(days / 7)`. Before the origin date `days` is negative and the month/week/remainder
 * fields are zero — callers must check `days < 0` rather than reading a partial age.
 */
export interface ElapsedAge {
  readonly days: number;
  readonly weeks: number;
  readonly completedMonths: number;
  readonly remainderDays: number;
}

/** Why the corrected-development proxy did or did not apply (GUIDANCE_CONTENT_CONTRACT.md §2). */
export type CorrectedDevelopmentEligibility =
  | "eligible"
  | "no-due-date"
  | "not-early-by-proxy"
  | "chronological-age-limit";

/**
 * The corrected-development proxy. It is an implementation proxy for selecting development
 * guidance, never a prematurity diagnosis: the due-date gap alone decides eligibility.
 */
export interface CorrectedDevelopmentProxy {
  /** `estimatedDueDate - dateOfBirth` in days; `undefined` without a due date. */
  readonly earlyByDays: number | undefined;
  /** `earlyByDays > 21`. */
  readonly likelyPretermByDueDateProxy: boolean;
  /** `likelyPretermByDueDateProxy && chronologicalAge < 24 months`. */
  readonly useCorrectedDevelopmentAge: boolean;
  readonly eligibility: CorrectedDevelopmentEligibility;
  /** `planDate - estimatedDueDate`; present whenever a due date exists (even when not used). */
  readonly correctedDevelopmentAge: ElapsedAge | undefined;
}
