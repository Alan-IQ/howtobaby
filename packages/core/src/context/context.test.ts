// SPDX-License-Identifier: AGPL-3.0-only
import { describe, expect, it } from "vitest";

import { calendarDate } from "../age/calendar-date";
import { isAgeWithinRange, safetyRangeApplies } from "../applicability/age-range";
import { STAGE_DOMAINS } from "../types/context";
import { resolveAgeContext } from "./child-age-context";
import { actualStageIn, browsedStageRelation, isFuturePreview, resolveGuidanceContext, safetyContextOf } from "./guidance-context";
import { adjacentStages, allStages, DEVELOPMENT_STAGES, FEEDING_STAGES, resolveStage, SLEEP_STAGES, stageById, stageBySlug, STAGE_SCOPE_MAX_MONTHS, stagesFor } from "./stages";

describe("stage tables (contract §3–§5)", () => {
  it("cover birth to <5 years contiguously with half-open bins in every domain", () => {
    for (const domain of STAGE_DOMAINS) {
      const table = stagesFor(domain);
      expect(table[0]?.minMonths).toBe(0);
      expect(table.at(-1)?.maxMonths).toBe(STAGE_SCOPE_MAX_MONTHS);
      for (let i = 1; i < table.length; i += 1) expect(table[i]?.minMonths).toBe(table[i - 1]?.maxMonths);
      for (const stage of table) expect(stage.minMonths).toBeLessThan(stage.maxMonths);
    }
    expect(DEVELOPMENT_STAGES).toHaveLength(12);
    expect(FEEDING_STAGES).toHaveLength(7);
    expect(SLEEP_STAGES).toHaveLength(14);
  });

  it("keeps ids and slugs unique per domain and slugs free of anything but broad age words", () => {
    const ids = allStages().map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const domain of STAGE_DOMAINS) {
      const slugs = stagesFor(domain).map((s) => s.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
      for (const slug of slugs) expect(slug).toMatch(/^\d{1,2}-\d{1,2}-(months|years)$/);
    }
    expect(stageById("dev-06-09m")?.slug).toBe("6-9-months");
    expect(stageBySlug("feeding", "6-8-months")?.id).toBe("feed-06-08m");
    expect(stageBySlug("feeding", "6-8-months")?.approximateLowerBound).toBe(true);
    expect(stageBySlug("development", "6-8-months")).toBeUndefined();
  });

  it("resolves on the exact boundary to the next bin (half-open) and never outside scope", () => {
    expect(resolveStage("development", 0)?.id).toBe("dev-00-02m");
    expect(resolveStage("development", 1)?.id).toBe("dev-00-02m");
    expect(resolveStage("development", 2)?.id).toBe("dev-02-04m");
    expect(resolveStage("development", 59)?.id).toBe("dev-48-60m");
    expect(resolveStage("development", 60)).toBeUndefined();
    expect(resolveStage("development", -1)).toBeUndefined();
    expect(resolveStage("feeding", 5)?.id).toBe("feed-04-06m"); // 4m does not unlock the solids bin
    expect(resolveStage("feeding", 6)?.id).toBe("feed-06-08m");
    expect(resolveStage("sleep", 7)?.id).toBe("sleep-07-08m");
    expect(resolveStage("sleep", 36)?.id).toBe("sleep-36-60m");
  });

  it("walks previous/next within a domain only", () => {
    const first = DEVELOPMENT_STAGES[0]!;
    const last = DEVELOPMENT_STAGES.at(-1)!;
    expect(adjacentStages(first).previous).toBeUndefined();
    expect(adjacentStages(first).next?.id).toBe("dev-02-04m");
    expect(adjacentStages(last).next).toBeUndefined();
    expect(adjacentStages(last).previous?.id).toBe("dev-36-48m");
  });
});

describe("resolveAgeContext — age basis by domain", () => {
  const dob = calendarDate(2026, 1, 10);
  const edd = calendarDate(2026, 3, 1); // 50 days early → proxy eligible

  it("uses corrected-development age for development only; feeding, sleep and safety stay chronological", () => {
    const context = resolveAgeContext({ dateOfBirth: dob, estimatedDueDate: edd }, calendarDate(2026, 9, 15));
    expect(context.chronological.completedMonths).toBe(8);
    expect(context.correctedDevelopment.useCorrectedDevelopmentAge).toBe(true);
    expect(context.domains.development).toMatchObject({ basis: "corrected-development" });
    expect(context.domains.development.age.completedMonths).toBe(6);
    expect(context.domains.development.stage?.id).toBe("dev-06-09m");
    expect(context.domains.feeding).toMatchObject({ basis: "chronological" });
    expect(context.domains.feeding.stage?.id).toBe("feed-08-12m");
    expect(context.domains.sleep.stage?.id).toBe("sleep-08-10m");
    expect(context.infantSafeSleepScope).toBe(true);
  });

  it("falls back to chronological development age without a due date or when the proxy is not met", () => {
    const noEdd = resolveAgeContext({ dateOfBirth: dob }, calendarDate(2026, 9, 15));
    expect(noEdd.domains.development).toMatchObject({ basis: "chronological" });
    expect(noEdd.domains.development.stage?.id).toBe("dev-06-09m");
    const term = resolveAgeContext({ dateOfBirth: dob, estimatedDueDate: calendarDate(2026, 1, 20) }, calendarDate(2026, 9, 15));
    expect(term.domains.development.basis).toBe("chronological");
  });

  it("leaves development unresolved while corrected age is negative (before the due date)", () => {
    const context = resolveAgeContext({ dateOfBirth: dob, estimatedDueDate: edd }, calendarDate(2026, 2, 15));
    expect(context.domains.development.basis).toBe("corrected-development");
    expect(context.domains.development.age.days).toBeLessThan(0);
    expect(context.domains.development.stage).toBeUndefined();
    expect(context.domains.feeding.stage?.id).toBe("feed-00-04m");
  });

  it("leaves everything unresolved and outside safe-sleep scope before birth or beyond 5 years", () => {
    const before = resolveAgeContext({ dateOfBirth: dob }, calendarDate(2026, 1, 1));
    for (const domain of STAGE_DOMAINS) expect(before.domains[domain].stage).toBeUndefined();
    expect(before.infantSafeSleepScope).toBe(false);
    const five = resolveAgeContext({ dateOfBirth: dob }, calendarDate(2031, 1, 10));
    for (const domain of STAGE_DOMAINS) expect(five.domains[domain].stage).toBeUndefined();
  });

  it("infant safe-sleep scope ends exactly at the first birthday (half-open)", () => {
    expect(resolveAgeContext({ dateOfBirth: dob }, calendarDate(2027, 1, 9)).infantSafeSleepScope).toBe(true);
    expect(resolveAgeContext({ dateOfBirth: dob }, calendarDate(2027, 1, 10)).infantSafeSleepScope).toBe(false);
    // Corrected age never extends or relaxes the chronological safe-sleep scope.
    expect(resolveAgeContext({ dateOfBirth: dob, estimatedDueDate: edd }, calendarDate(2027, 1, 10)).infantSafeSleepScope).toBe(false);
  });

  it("stage boundaries follow completed months exactly (month-end and leap-day births included)", () => {
    const jan31 = { dateOfBirth: calendarDate(2025, 1, 31) };
    expect(resolveAgeContext(jan31, calendarDate(2025, 3, 30)).domains.development.stage?.id).toBe("dev-00-02m");
    expect(resolveAgeContext(jan31, calendarDate(2025, 3, 31)).domains.development.stage?.id).toBe("dev-02-04m");
    const leap = { dateOfBirth: calendarDate(2024, 2, 29) };
    expect(resolveAgeContext(leap, calendarDate(2025, 2, 27)).domains.feeding.stage?.id).toBe("feed-08-12m");
    expect(resolveAgeContext(leap, calendarDate(2025, 2, 28)).domains.feeding.stage?.id).toBe("feed-12-24m");
    expect(resolveAgeContext(leap, calendarDate(2025, 2, 28)).infantSafeSleepScope).toBe(false);
  });
});

describe("actual / browsed / preview isolation (contract §7)", () => {
  const profile = { dateOfBirth: calendarDate(2026, 6, 1) }; // 3 months old on Sept 2
  const today = calendarDate(2026, 9, 2);
  const olderStage = stageById("dev-18-24m")!;

  it("browse works with zero profile data", () => {
    const context = resolveGuidanceContext({ today, browsedStage: olderStage });
    expect(context.actualChildContext).toBeUndefined();
    expect(context.previewPlanDateContext).toBeUndefined();
    expect(context.browsedContentContext?.stage.id).toBe("dev-18-24m");
    expect(browsedStageRelation(context.actualChildContext, context.browsedContentContext!)).toBe("no-profile");
    expect(safetyContextOf(context)).toBeUndefined();
    expect(safetyRangeApplies(context, { minMonths: 0, maxMonths: 12 })).toBeUndefined();
  });

  it("browsing an older stage never changes the actual child's context or safety scope", () => {
    const plain = resolveGuidanceContext({ profile, today });
    const browsing = resolveGuidanceContext({ profile, today, browsedStage: olderStage });
    expect(browsing.actualChildContext).toEqual(plain.actualChildContext);
    expect(browsing.browsedContentContext?.stage.id).toBe("dev-18-24m");
    expect(actualStageIn(browsing, "development")?.id).toBe("dev-02-04m");
    expect(browsedStageRelation(browsing.actualChildContext, browsing.browsedContentContext!)).toBe("later");
    expect(safetyContextOf(browsing)?.infantSafeSleepScope).toBe(true);
    expect(safetyRangeApplies(browsing, { minMonths: 0, maxMonths: 12 })).toBe(true);
    // A toddler-scope range never applies just because a toddler stage is being browsed.
    expect(safetyRangeApplies(browsing, { minMonths: 12 })).toBe(false);
  });

  it("classifies browsed stages relative to the actual stage", () => {
    const earlier = resolveGuidanceContext({ profile, today, browsedStage: stageById("dev-00-02m")! });
    expect(browsedStageRelation(earlier.actualChildContext, earlier.browsedContentContext!)).toBe("earlier");
    const same = resolveGuidanceContext({ profile, today, browsedStage: stageById("dev-02-04m")! });
    expect(browsedStageRelation(same.actualChildContext, same.browsedContentContext!)).toBe("actual");
    const unborn = resolveGuidanceContext({ profile: { dateOfBirth: calendarDate(2026, 12, 1) }, today, browsedStage: olderStage });
    expect(browsedStageRelation(unborn.actualChildContext, unborn.browsedContentContext!)).toBe("unresolved");
  });

  it("a future preview lives in its own field and never replaces present safety context", () => {
    const context = resolveGuidanceContext({ profile, today, previewPlanDate: calendarDate(2027, 9, 2) });
    expect(context.actualChildContext?.planDate).toEqual(today);
    expect(context.actualChildContext?.chronological.completedMonths).toBe(3);
    expect(context.previewPlanDateContext?.context.chronological.completedMonths).toBe(15);
    expect(context.previewPlanDateContext?.context.infantSafeSleepScope).toBe(false);
    expect(isFuturePreview(context)).toBe(true);
    expect(safetyContextOf(context)?.infantSafeSleepScope).toBe(true);
    expect(safetyRangeApplies(context, { minMonths: 0, maxMonths: 12 })).toBe(true);
  });

  it("ignores a preview equal to today or without a profile", () => {
    expect(resolveGuidanceContext({ profile, today, previewPlanDate: today }).previewPlanDateContext).toBeUndefined();
    expect(resolveGuidanceContext({ today, previewPlanDate: calendarDate(2027, 1, 1) }).previewPlanDateContext).toBeUndefined();
    const past = resolveGuidanceContext({ profile, today, previewPlanDate: calendarDate(2026, 7, 1) });
    expect(past.previewPlanDateContext?.context.chronological.completedMonths).toBe(1);
    expect(isFuturePreview(past)).toBe(false);
  });

  it("guidance context inputs are never mutated (browsing never mutates the profile)", () => {
    const frozen = Object.freeze({ dateOfBirth: calendarDate(2026, 6, 1), displayName: "N" });
    const context = resolveGuidanceContext({ profile: frozen, today, browsedStage: olderStage, previewPlanDate: calendarDate(2027, 1, 1) });
    expect(frozen).toEqual({ dateOfBirth: calendarDate(2026, 6, 1), displayName: "N" });
    expect(context.actualChildContext).not.toHaveProperty("displayName");
    expect(JSON.stringify(context)).not.toContain("2026-06-01");
  });
});

describe("age-range applicability", () => {
  it("is half-open and false before birth", () => {
    const age = (completedMonths: number, days = completedMonths * 30) => ({ days, weeks: Math.floor(days / 7), completedMonths, remainderDays: 0 });
    expect(isAgeWithinRange(age(0), { minMonths: 0, maxMonths: 12 })).toBe(true);
    expect(isAgeWithinRange(age(11), { minMonths: 0, maxMonths: 12 })).toBe(true);
    expect(isAgeWithinRange(age(12), { minMonths: 0, maxMonths: 12 })).toBe(false);
    expect(isAgeWithinRange(age(30), { minMonths: 12 })).toBe(true);
    expect(isAgeWithinRange({ days: -1, weeks: 0, completedMonths: 0, remainderDays: 0 }, { minMonths: 0 })).toBe(false);
  });
});
