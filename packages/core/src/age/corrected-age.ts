// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Corrected-development proxy, verbatim from GUIDANCE_CONTENT_CONTRACT.md §2:
 *
 *   earlyByDays = estimatedDueDate - dateOfBirth
 *   likelyPretermByDueDateProxy = earlyByDays > 21
 *   useCorrectedDevelopmentAge = likelyPretermByDueDateProxy AND chronologicalAge < 24 months
 *   correctedDevelopmentAge = planDate - estimatedDueDate
 *
 * An implementation proxy for choosing development guidance — not a prematurity diagnosis.
 */

import type { CalendarDate } from "../types/calendar.ts";
import type { CorrectedDevelopmentProxy, ElapsedAge } from "../types/age.ts";
import { daysBetween } from "./calendar-date.ts";
import { elapsedAge } from "./chronological-age.ts";

/** `earlyByDays` must exceed this many days for the proxy to consider the child likely preterm. */
export const PRETERM_PROXY_EARLY_DAYS = 21;
/** Corrected age is used only while chronological age is below this many completed months. */
export const CORRECTED_AGE_CHRONOLOGICAL_LIMIT_MONTHS = 24;

export function resolveCorrectedDevelopmentProxy(
  dateOfBirth: CalendarDate,
  estimatedDueDate: CalendarDate | undefined,
  planDate: CalendarDate,
  chronological: ElapsedAge = elapsedAge(dateOfBirth, planDate),
): CorrectedDevelopmentProxy {
  if (!estimatedDueDate) {
    return { earlyByDays: undefined, likelyPretermByDueDateProxy: false, useCorrectedDevelopmentAge: false, eligibility: "no-due-date", correctedDevelopmentAge: undefined };
  }
  const earlyByDays = daysBetween(dateOfBirth, estimatedDueDate);
  const likelyPretermByDueDateProxy = earlyByDays > PRETERM_PROXY_EARLY_DAYS;
  const correctedDevelopmentAge = elapsedAge(estimatedDueDate, planDate);
  if (!likelyPretermByDueDateProxy) {
    return { earlyByDays, likelyPretermByDueDateProxy, useCorrectedDevelopmentAge: false, eligibility: "not-early-by-proxy", correctedDevelopmentAge };
  }
  const underLimit = chronological.completedMonths < CORRECTED_AGE_CHRONOLOGICAL_LIMIT_MONTHS;
  return {
    earlyByDays,
    likelyPretermByDueDateProxy,
    useCorrectedDevelopmentAge: underLimit,
    eligibility: underLimit ? "eligible" : "chronological-age-limit",
    correctedDevelopmentAge,
  };
}
