// SPDX-License-Identifier: AGPL-3.0-only
import { describe, expect, it } from "vitest";

import { allStages, chronologicalAge, calendarDate, stageById } from "@howtobaby/core";
import { SUPPORTED_LOCALES } from "@howtobaby/i18n";

import { MESSAGES } from "@/i18n/messages";
import { fill, formatCorrectedAge, formatDayCount, formatElapsedAge, formatStageChip, formatStageRange, formatTimeUntilDueDate } from "./format";

describe("stage labels express the half-open bin in ordinary language", () => {
  it("renders the first bin, months bins, whole-year bins and the `about` lower bound per locale", () => {
    expect(formatStageRange(stageById("feed-00-04m")!, "en")).toBe("under 4 months");
    expect(formatStageRange(stageById("feed-00-04m")!, "vi")).toBe("dưới 4 tháng");
    expect(formatStageRange(stageById("feed-04-06m")!, "en")).toBe("4 to under 6 months");
    expect(formatStageRange(stageById("feed-04-06m")!, "vi")).toBe("từ 4 đến dưới 6 tháng");
    expect(formatStageRange(stageById("feed-06-08m")!, "en")).toBe("about 6 to under 8 months");
    expect(formatStageRange(stageById("feed-06-08m")!, "vi")).toBe("khoảng 6 đến dưới 8 tháng");
    expect(formatStageRange(stageById("feed-24-36m")!, "en")).toBe("2 to under 3 years");
    expect(formatStageRange(stageById("feed-24-36m")!, "vi")).toBe("từ 2 đến dưới 3 tuổi");
    expect(formatStageRange(stageById("dev-06-09m")!, "en")).toBe("6 to under 9 months");
    expect(formatStageRange(stageById("dev-36-48m")!, "vi")).toBe("từ 3 đến dưới 4 tuổi");
    expect(formatStageRange(stageById("feed-12-24m")!, "en")).toBe("12 to under 24 months");
  });

  it("chips stay short and keep the same words and numbers", () => {
    expect(formatStageChip(stageById("feed-00-04m")!, "en")).toBe("under 4 mo");
    expect(formatStageChip(stageById("feed-00-04m")!, "vi")).toBe("dưới 4 tháng");
    expect(formatStageChip(stageById("feed-04-06m")!, "en")).toBe("4 to under 6 mo");
    expect(formatStageChip(stageById("feed-04-06m")!, "vi")).toBe("4 đến dưới 6 tháng");
    expect(formatStageChip(stageById("feed-06-08m")!, "en")).toBe("about 6 to under 8 mo");
    expect(formatStageChip(stageById("feed-06-08m")!, "vi")).toBe("khoảng 6 đến dưới 8 tháng");
    expect(formatStageChip(stageById("feed-24-36m")!, "en")).toBe("2 to under 3 y");
    expect(formatStageChip(stageById("feed-24-36m")!, "vi")).toBe("2 đến dưới 3 tuổi");
    expect(formatStageChip(stageById("dev-48-60m")!, "en")).toBe("4 to under 5 y");
  });

  it("never exposes interval notation (`–<`, `<`, `~`) for any stage in any locale", () => {
    const stages = allStages();
    expect(stages.length).toBeGreaterThan(0);
    for (const stage of stages) {
      for (const locale of SUPPORTED_LOCALES.map((l) => l.id)) {
        for (const text of [formatStageRange(stage, locale), formatStageChip(stage, locale)]) {
          expect(text, `${stage.id} ${locale}`).not.toContain("–<");
          expect(text, `${stage.id} ${locale}`).not.toContain("<");
          expect(text, `${stage.id} ${locale}`).not.toContain("~");
          // The `about` qualifier of a source-worded lower bound survives in both renderings.
          expect(/^(about|khoảng) /.test(text), `${stage.id} ${locale}: ${text}`).toBe(stage.approximateLowerBound === true);
        }
      }
    }
  });
});

describe("elapsed age labels always carry units", () => {
  it("formats days, months + days, and years + months", () => {
    expect(formatElapsedAge(chronologicalAge(calendarDate(2026, 8, 20), calendarDate(2026, 9, 2)), "en")).toBe("13 days");
    expect(formatElapsedAge(chronologicalAge(calendarDate(2026, 5, 28), calendarDate(2026, 9, 2)), "en")).toBe("3 months, 5 days");
    expect(formatElapsedAge(chronologicalAge(calendarDate(2026, 6, 2), calendarDate(2026, 9, 2)), "vi")).toBe("3 tháng");
    expect(formatElapsedAge(chronologicalAge(calendarDate(2024, 6, 2), calendarDate(2026, 9, 2)), "en")).toBe("2 years, 3 months");
    expect(formatElapsedAge(chronologicalAge(calendarDate(2024, 9, 2), calendarDate(2026, 9, 2)), "vi")).toBe("2 năm");
    expect(formatElapsedAge(chronologicalAge(calendarDate(2026, 8, 3), calendarDate(2026, 9, 2)), "en")).toBe("30 days");
    expect(formatElapsedAge(chronologicalAge(calendarDate(2026, 8, 2), calendarDate(2026, 9, 2)), "en")).toBe("1 month");
  });

  it("formats early-by-days as weeks and days", () => {
    expect(formatDayCount(22, "en")).toBe("3 weeks, 1 day");
    expect(formatDayCount(14, "vi")).toBe("2 tuần");
    expect(formatDayCount(5, "en")).toBe("5 days");
  });
});

describe("message placeholders", () => {
  it("fills known placeholders and leaves unknown ones visible", () => {
    expect(fill("A {x} and {y}", { x: 1, y: "two" })).toBe("A 1 and two");
    expect(fill("A {x}", {})).toBe("A {x}");
  });

  it("every locale carries the same placeholder set for every key (EN/VI parity of values)", () => {
    const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    for (const key of Object.keys(MESSAGES.en) as (keyof typeof MESSAGES.en)[]) {
      const expected = placeholders(MESSAGES.en[key]);
      for (const { id } of SUPPORTED_LOCALES) expect(placeholders(MESSAGES[id][key]), `${id}: ${key}`).toEqual(expected);
    }
  });
});

describe("ages before their origin never render as signed numbers", () => {
  const beforeDue = { days: -9, weeks: 0, completedMonths: 0, remainderDays: 0 };

  it("phrases a corrected age before the due date as a countdown", () => {
    expect(formatTimeUntilDueDate(beforeDue, "en")).toBe("9 days until the due date");
    expect(formatTimeUntilDueDate(beforeDue, "vi")).toBe("còn 9 ngày nữa đến ngày dự sinh");
    expect(formatTimeUntilDueDate({ ...beforeDue, days: -15 }, "en")).toBe("2 weeks, 1 day until the due date");
    expect(formatCorrectedAge(beforeDue, "en")).toBe("9 days until the due date");
    expect(formatCorrectedAge({ days: 61, weeks: 8, completedMonths: 2, remainderDays: 0 }, "vi")).toBe("2 tháng");
  });

  it("formatElapsedAge degrades to an unsigned day count and every formatter output is sign-free", () => {
    for (const locale of ["en", "vi"] as const) {
      for (const text of [formatElapsedAge(beforeDue, locale), formatCorrectedAge(beforeDue, locale), formatTimeUntilDueDate(beforeDue, locale)]) {
        expect(text).not.toMatch(/-\d/);
        expect(text).not.toMatch(/−\d/);
      }
    }
  });
});
