// SPDX-License-Identifier: AGPL-3.0-only
import { describe, expect, it } from "vitest";

import { calendarDate } from "./calendar-date";
import { chronologicalAge } from "./chronological-age";
import { CORRECTED_AGE_CHRONOLOGICAL_LIMIT_MONTHS, PRETERM_PROXY_EARLY_DAYS, resolveCorrectedDevelopmentProxy } from "./corrected-age";

describe("chronological age", () => {
  it("is exact in days and reports completed months plus remainder", () => {
    const age = chronologicalAge(calendarDate(2026, 1, 15), calendarDate(2026, 4, 20));
    expect(age.days).toBe(95);
    expect(age.weeks).toBe(13);
    expect(age.completedMonths).toBe(3);
    expect(age.remainderDays).toBe(5);
  });

  it("is zero on the birth date and negative before it (month fields zeroed)", () => {
    expect(chronologicalAge(calendarDate(2026, 5, 1), calendarDate(2026, 5, 1))).toEqual({ days: 0, weeks: 0, completedMonths: 0, remainderDays: 0 });
    expect(chronologicalAge(calendarDate(2026, 5, 1), calendarDate(2026, 4, 28))).toEqual({ days: -3, weeks: 0, completedMonths: 0, remainderDays: 0 });
  });

  it("handles month-end births: Jan 31 baby is 1 month on Feb 28 and 1 month + 1 day on Mar 1", () => {
    expect(chronologicalAge(calendarDate(2025, 1, 31), calendarDate(2025, 2, 28))).toMatchObject({ completedMonths: 1, remainderDays: 0 });
    expect(chronologicalAge(calendarDate(2025, 1, 31), calendarDate(2025, 3, 1))).toMatchObject({ completedMonths: 1, remainderDays: 1 });
  });

  it("handles a leap-day birth", () => {
    expect(chronologicalAge(calendarDate(2024, 2, 29), calendarDate(2025, 2, 28))).toMatchObject({ days: 365, completedMonths: 12, remainderDays: 0 });
    expect(chronologicalAge(calendarDate(2024, 2, 29), calendarDate(2024, 3, 29))).toMatchObject({ days: 29, completedMonths: 1, remainderDays: 0 });
  });
});

describe("corrected-development proxy (contract §2)", () => {
  const dob = calendarDate(2026, 1, 10);

  it("does not apply without a due date", () => {
    const proxy = resolveCorrectedDevelopmentProxy(dob, undefined, calendarDate(2026, 6, 1));
    expect(proxy).toMatchObject({ earlyByDays: undefined, likelyPretermByDueDateProxy: false, useCorrectedDevelopmentAge: false, eligibility: "no-due-date" });
    expect(proxy.correctedDevelopmentAge).toBeUndefined();
  });

  it("uses a strict `earlyByDays > 21` threshold", () => {
    expect(PRETERM_PROXY_EARLY_DAYS).toBe(21);
    const at21 = resolveCorrectedDevelopmentProxy(dob, calendarDate(2026, 1, 31), calendarDate(2026, 6, 1));
    expect(at21).toMatchObject({ earlyByDays: 21, likelyPretermByDueDateProxy: false, useCorrectedDevelopmentAge: false, eligibility: "not-early-by-proxy" });
    const at22 = resolveCorrectedDevelopmentProxy(dob, calendarDate(2026, 2, 1), calendarDate(2026, 6, 1));
    expect(at22).toMatchObject({ earlyByDays: 22, likelyPretermByDueDateProxy: true, useCorrectedDevelopmentAge: true, eligibility: "eligible" });
  });

  it("a due date before birth (post-term) never triggers the proxy", () => {
    const proxy = resolveCorrectedDevelopmentProxy(dob, calendarDate(2026, 1, 1), calendarDate(2026, 6, 1));
    expect(proxy.earlyByDays).toBe(-9);
    expect(proxy.useCorrectedDevelopmentAge).toBe(false);
  });

  it("computes correctedDevelopmentAge = planDate - estimatedDueDate (negative before the due date)", () => {
    const edd = calendarDate(2026, 3, 1); // 50 days early
    const before = resolveCorrectedDevelopmentProxy(dob, edd, calendarDate(2026, 2, 20));
    expect(before.useCorrectedDevelopmentAge).toBe(true);
    expect(before.correctedDevelopmentAge?.days).toBe(-9);
    const after = resolveCorrectedDevelopmentProxy(dob, edd, calendarDate(2026, 5, 1));
    expect(after.correctedDevelopmentAge).toMatchObject({ days: 61, completedMonths: 2, remainderDays: 0 });
  });

  it("stops at 24 completed months of chronological age (half-open)", () => {
    expect(CORRECTED_AGE_CHRONOLOGICAL_LIMIT_MONTHS).toBe(24);
    const edd = calendarDate(2026, 3, 1);
    const dayBefore = resolveCorrectedDevelopmentProxy(dob, edd, calendarDate(2028, 1, 9));
    expect(dayBefore).toMatchObject({ useCorrectedDevelopmentAge: true, eligibility: "eligible" });
    const birthday = resolveCorrectedDevelopmentProxy(dob, edd, calendarDate(2028, 1, 10));
    expect(birthday).toMatchObject({ likelyPretermByDueDateProxy: true, useCorrectedDevelopmentAge: false, eligibility: "chronological-age-limit" });
    // The corrected age is still reported for transparency, just not used.
    expect(birthday.correctedDevelopmentAge?.completedMonths).toBe(22);
  });
});
