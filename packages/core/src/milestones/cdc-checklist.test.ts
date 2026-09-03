// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Phase 4 gate (docs/IMPLEMENTATION_ROADMAP.md): CDC checklist resolution behavior — between two
 * checklist ages the YOUNGER checklist is the reference (GUIDANCE_CONTENT_CONTRACT.md §3), never
 * an interpolated one, and a corrected age before the due date resolves to no checklist.
 */
import { describe, expect, it } from "vitest";

import { calendarDate } from "../age/calendar-date";
import { resolveAgeContext } from "../context/child-age-context";
import { DEVELOPMENT_STAGES, stageById } from "../context/stages";
import { CDC_MILESTONE_CHECKLIST_MONTHS, cdcChecklistForStage, resolveCdcChecklist } from "./cdc-checklist";

describe("resolveCdcChecklist (younger-checklist rule)", () => {
  it("lists CDC's checklist ages ascending, from 2 months to 5 years", () => {
    expect(CDC_MILESTONE_CHECKLIST_MONTHS).toEqual([2, 4, 6, 9, 12, 15, 18, 24, 30, 36, 48, 60]);
  });

  it("resolves an age between two checklist ages to the younger checklist", () => {
    expect(resolveCdcChecklist(7)).toEqual({ checklistMonths: 6, nextChecklistMonths: 9, exact: false });
    expect(resolveCdcChecklist(8)).toEqual({ checklistMonths: 6, nextChecklistMonths: 9, exact: false });
    expect(resolveCdcChecklist(11)).toEqual({ checklistMonths: 9, nextChecklistMonths: 12, exact: false });
    expect(resolveCdcChecklist(23)).toEqual({ checklistMonths: 18, nextChecklistMonths: 24, exact: false });
    expect(resolveCdcChecklist(47)).toEqual({ checklistMonths: 36, nextChecklistMonths: 48, exact: false });
    expect(resolveCdcChecklist(59)).toEqual({ checklistMonths: 48, nextChecklistMonths: 60, exact: false });
  });

  it("resolves an exact checklist age to that checklist", () => {
    for (const age of CDC_MILESTONE_CHECKLIST_MONTHS) {
      const resolution = resolveCdcChecklist(age);
      expect(resolution.checklistMonths).toBe(age);
      expect(resolution.exact).toBe(true);
    }
    expect(resolveCdcChecklist(60).nextChecklistMonths).toBeUndefined();
  });

  it("never interpolates: the resolved checklist is always one of the published ages", () => {
    for (let months = 0; months < 72; months += 1) {
      const { checklistMonths } = resolveCdcChecklist(months);
      if (checklistMonths !== undefined) expect(CDC_MILESTONE_CHECKLIST_MONTHS).toContain(checklistMonths);
      expect(checklistMonths ?? -1).toBeLessThanOrEqual(months);
    }
  });

  it("has no checklist before 2 months and none for a negative or invalid age", () => {
    expect(resolveCdcChecklist(0)).toEqual({ checklistMonths: undefined, nextChecklistMonths: 2, exact: false });
    expect(resolveCdcChecklist(1)).toEqual({ checklistMonths: undefined, nextChecklistMonths: 2, exact: false });
    expect(resolveCdcChecklist(-3)).toEqual({ checklistMonths: undefined, nextChecklistMonths: 2, exact: false });
    expect(resolveCdcChecklist(Number.NaN).checklistMonths).toBeUndefined();
  });
});

describe("cdcChecklistForStage", () => {
  it("maps every Development stage to the checklist at its lower bound, uniformly across the bin", () => {
    for (const stage of DEVELOPMENT_STAGES) {
      const forStage = cdcChecklistForStage(stage);
      for (let months = stage.minMonths; months < stage.maxMonths; months += 1) {
        expect(resolveCdcChecklist(months).checklistMonths, `${stage.id} at ${months} months`).toBe(forStage.checklistMonths);
      }
    }
    expect(cdcChecklistForStage(stageById("dev-00-02m")!)).toEqual({ checklistMonths: undefined, nextChecklistMonths: 2, exact: false });
    expect(cdcChecklistForStage(stageById("dev-06-09m")!).checklistMonths).toBe(6);
    expect(cdcChecklistForStage(stageById("dev-36-48m")!).checklistMonths).toBe(36);
    expect(cdcChecklistForStage(stageById("dev-48-60m")!).checklistMonths).toBe(48);
  });
});

describe("corrected age feeds checklist resolution for Development", () => {
  it("uses the corrected development age, not age from birth, when the proxy is eligible", () => {
    // Born 8 weeks early: at 4 months from birth the corrected age is about 2 months.
    const context = resolveAgeContext({ dateOfBirth: calendarDate(2026, 3, 1), estimatedDueDate: calendarDate(2026, 4, 26) }, calendarDate(2026, 7, 1));
    expect(context.domains.development.basis).toBe("corrected-development");
    expect(context.chronological.completedMonths).toBe(4);
    expect(context.domains.development.age.completedMonths).toBe(2);
    expect(resolveCdcChecklist(context.domains.development.age.completedMonths).checklistMonths).toBe(2);
    expect(resolveCdcChecklist(context.chronological.completedMonths).checklistMonths).toBe(4);
  });

  it("resolves to no checklist and no stage while the corrected age is before the due date", () => {
    const context = resolveAgeContext({ dateOfBirth: calendarDate(2026, 6, 1), estimatedDueDate: calendarDate(2026, 8, 1) }, calendarDate(2026, 7, 1));
    expect(context.domains.development.basis).toBe("corrected-development");
    expect(context.domains.development.age.days).toBeLessThan(0);
    expect(context.domains.development.stage).toBeUndefined();
    expect(resolveCdcChecklist(context.domains.development.age.days).checklistMonths).toBeUndefined();
  });
});
