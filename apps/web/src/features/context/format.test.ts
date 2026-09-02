// SPDX-License-Identifier: AGPL-3.0-only
import { describe, expect, it } from "vitest";

import { chronologicalAge, calendarDate, stageById } from "@howtobaby/core";
import { SUPPORTED_LOCALES } from "@howtobaby/i18n";

import { MESSAGES } from "@/i18n/messages";
import { fill, formatDayCount, formatElapsedAge, formatStageChip, formatStageRange } from "./format";

describe("stage labels keep the half-open contract notation and qualifiers", () => {
  it("renders months bins, whole-year bins and the `about` lower bound per locale", () => {
    expect(formatStageRange(stageById("dev-06-09m")!, "en")).toBe("6–<9 months");
    expect(formatStageRange(stageById("dev-06-09m")!, "vi")).toBe("6–<9 tháng");
    expect(formatStageRange(stageById("dev-36-48m")!, "en")).toBe("3–<4 years");
    expect(formatStageRange(stageById("dev-36-48m")!, "vi")).toBe("3–<4 tuổi");
    expect(formatStageRange(stageById("feed-06-08m")!, "en")).toBe("about 6–<8 months");
    expect(formatStageRange(stageById("feed-06-08m")!, "vi")).toBe("khoảng 6–<8 tháng");
    expect(formatStageRange(stageById("feed-12-24m")!, "en")).toBe("12–<24 months");
  });

  it("chips stay short and keep the same numbers", () => {
    expect(formatStageChip(stageById("dev-06-09m")!, "en")).toBe("6–<9 mo");
    expect(formatStageChip(stageById("dev-48-60m")!, "en")).toBe("4–<5 y");
    expect(formatStageChip(stageById("feed-06-08m")!, "en")).toBe("~6–<8 mo");
    expect(formatStageChip(stageById("feed-06-08m")!, "vi")).toBe("~6–<8 tháng");
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
