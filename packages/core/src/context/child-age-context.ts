// SPDX-License-Identifier: AGPL-3.0-only
/**
 * `resolveAgeContext(profile, planDate)` (SYSTEM_ARCHITECTURE.md §6): the actual child on one
 * plan date. Domains resolve on their own age basis (GUIDANCE_CONTENT_CONTRACT.md §2):
 * development/play use the corrected-development age when the proxy is eligible, feeding and
 * sleep use chronological age, and the infant safe-sleep scope is chronological only.
 */

import { chronologicalAge } from "../age/chronological-age.ts";
import { resolveCorrectedDevelopmentProxy } from "../age/corrected-age.ts";
import type { CalendarDate } from "../types/calendar.ts";
import type { ElapsedAge } from "../types/age.ts";
import type { ChildAgeContext, ChildProfile, DomainAgeResolution, StageDomain } from "../types/context.ts";
import { resolveStage } from "./stages.ts";

/** Full infant safe-sleep scope: birth to `<12 months` chronological (GUIDANCE_CONTENT_CONTRACT.md §6). */
export const INFANT_SAFE_SLEEP_SCOPE_MAX_MONTHS = 12;

function domainResolution(domain: StageDomain, basis: DomainAgeResolution["basis"], age: ElapsedAge): DomainAgeResolution {
  return { basis, age, stage: age.days < 0 ? undefined : resolveStage(domain, age.completedMonths) };
}

export function resolveAgeContext(profile: ChildProfile, planDate: CalendarDate): ChildAgeContext {
  const chronological = chronologicalAge(profile.dateOfBirth, planDate);
  const correctedDevelopment = resolveCorrectedDevelopmentProxy(profile.dateOfBirth, profile.estimatedDueDate, planDate, chronological);
  const developmentAge =
    correctedDevelopment.useCorrectedDevelopmentAge && correctedDevelopment.correctedDevelopmentAge
      ? domainResolution("development", "corrected-development", correctedDevelopment.correctedDevelopmentAge)
      : domainResolution("development", "chronological", chronological);
  return {
    planDate,
    chronological,
    correctedDevelopment,
    domains: {
      development: developmentAge,
      feeding: domainResolution("feeding", "chronological", chronological),
      sleep: domainResolution("sleep", "chronological", chronological),
    },
    infantSafeSleepScope: chronological.days >= 0 && chronological.completedMonths < INFANT_SAFE_SLEEP_SCOPE_MAX_MONTHS,
  };
}
