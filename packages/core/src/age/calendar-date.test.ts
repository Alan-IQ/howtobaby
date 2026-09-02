// SPDX-License-Identifier: AGPL-3.0-only
import { describe, expect, it } from "vitest";

import {
  addDays,
  addMonthsClamped,
  calendarDate,
  calendarDateInTimeZone,
  compareCalendarDates,
  completedMonthsBetween,
  daysBetween,
  daysInMonth,
  formatCalendarDate,
  fromDaySerial,
  isLeapYear,
  isValidCalendarDate,
  localCalendarDate,
  msUntilNextLocalMidnight,
  parseCalendarDate,
  toDaySerial,
} from "./calendar-date";

describe("calendar validation and parsing", () => {
  it("knows leap years (Gregorian rules) and month lengths", () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2100)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2025, 2)).toBe(28);
    expect(daysInMonth(2025, 4)).toBe(30);
    expect(daysInMonth(2025, 12)).toBe(31);
  });

  it("parses only strict YYYY-MM-DD calendar-valid text", () => {
    expect(parseCalendarDate("2024-02-29")).toEqual({ year: 2024, month: 2, day: 29 });
    expect(parseCalendarDate("2025-02-29")).toBeUndefined();
    expect(parseCalendarDate("2025-04-31")).toBeUndefined();
    expect(parseCalendarDate("2025-13-01")).toBeUndefined();
    expect(parseCalendarDate("2025-1-5")).toBeUndefined();
    expect(parseCalendarDate("2025-01-05T00:00:00Z")).toBeUndefined();
    expect(parseCalendarDate("05/01/2025")).toBeUndefined();
    expect(parseCalendarDate("")).toBeUndefined();
    expect(parseCalendarDate(null)).toBeUndefined();
    expect(parseCalendarDate(20250105)).toBeUndefined();
  });

  it("round-trips through the text form", () => {
    for (const text of ["2024-02-29", "2025-12-31", "0999-01-01"]) {
      expect(formatCalendarDate(parseCalendarDate(text)!)).toBe(text);
    }
  });

  it("rejects impossible dates as values", () => {
    expect(isValidCalendarDate({ year: 2025, month: 2, day: 29 })).toBe(false);
    expect(isValidCalendarDate({ year: 2025, month: 0, day: 1 })).toBe(false);
    expect(isValidCalendarDate({ year: 2025.5, month: 1, day: 1 })).toBe(false);
    expect(isValidCalendarDate(null)).toBe(false);
    expect(() => calendarDate(2023, 2, 29)).toThrow(RangeError);
  });
});

describe("day serials are timezone-independent", () => {
  it("assigns consecutive serials across leap day, month end and year end", () => {
    expect(toDaySerial(calendarDate(1970, 1, 1))).toBe(0);
    expect(toDaySerial(calendarDate(2024, 3, 1)) - toDaySerial(calendarDate(2024, 2, 28))).toBe(2);
    expect(toDaySerial(calendarDate(2025, 3, 1)) - toDaySerial(calendarDate(2025, 2, 28))).toBe(1);
    expect(toDaySerial(calendarDate(2026, 1, 1)) - toDaySerial(calendarDate(2025, 12, 31))).toBe(1);
    expect(fromDaySerial(toDaySerial(calendarDate(2024, 2, 29)))).toEqual({ year: 2024, month: 2, day: 29 });
  });

  it("round-trips every day of the declared range boundaries, including years 1–99 (no Date.UTC 1900 mapping)", () => {
    for (const text of ["0001-01-01", "0001-12-31", "0099-02-28", "0099-12-31", "0100-01-01", "0100-03-01", "0400-02-29", "1582-10-15", "1899-12-31", "1900-02-28", "1970-01-01", "2000-02-29", "9999-01-01", "9999-12-31"]) {
      const date = parseCalendarDate(text)!;
      expect(formatCalendarDate(fromDaySerial(toDaySerial(date)))).toBe(text);
    }
    // Year 1 really is year 1: 0001-01-01 lies ~1969 years before the epoch, not in 1901.
    expect(toDaySerial(calendarDate(1, 1, 1))).toBe(-719162);
    expect(toDaySerial(calendarDate(99, 12, 31)) - toDaySerial(calendarDate(99, 1, 1))).toBe(364);
    expect(toDaySerial(calendarDate(100, 1, 1)) - toDaySerial(calendarDate(99, 12, 31))).toBe(1);
    expect(toDaySerial(calendarDate(9999, 12, 31)) - toDaySerial(calendarDate(9999, 1, 1))).toBe(364);
    expect(daysBetween(calendarDate(1, 1, 1), calendarDate(9999, 12, 31))).toBe(3652058);
    // Agrees with Date.UTC wherever Date.UTC is trustworthy (years >= 100).
    for (const [y, m, d] of [[100, 1, 1], [1600, 2, 29], [2026, 9, 2], [9999, 12, 31]] as const) {
      expect(toDaySerial(calendarDate(y, m, d))).toBe(Date.UTC(y, m - 1, d) / 86_400_000);
    }
    // Serial walk across a full leap-cycle boundary stays consecutive.
    let previous = toDaySerial(calendarDate(99, 12, 1));
    for (let i = 1; i <= 120; i += 1) {
      const serial = toDaySerial(addDays(calendarDate(99, 12, 1), i));
      expect(serial).toBe(previous + 1);
      previous = serial;
    }
  });

  it("is unaffected by the process time zone (serials never touch local time)", () => {
    const original = process.env.TZ;
    try {
      const serials = ["UTC", "Pacific/Kiritimati", "Pacific/Pago_Pago", "America/Los_Angeles"].map((tz) => {
        process.env.TZ = tz;
        return toDaySerial(calendarDate(2026, 3, 8)); // US DST switch day
      });
      expect(new Set(serials).size).toBe(1);
    } finally {
      if (original === undefined) delete process.env.TZ;
      else process.env.TZ = original;
    }
  });

  it("compares, adds and subtracts days across DST switch days without drift", () => {
    expect(daysBetween(calendarDate(2026, 3, 7), calendarDate(2026, 3, 9))).toBe(2);
    expect(daysBetween(calendarDate(2026, 11, 1), calendarDate(2026, 10, 31))).toBe(-1);
    expect(addDays(calendarDate(2026, 3, 8), 1)).toEqual(calendarDate(2026, 3, 9));
    expect(addDays(calendarDate(2024, 2, 28), 1)).toEqual(calendarDate(2024, 2, 29));
    expect(addDays(calendarDate(2025, 2, 28), 1)).toEqual(calendarDate(2025, 3, 1));
    expect(compareCalendarDates(calendarDate(2025, 1, 1), calendarDate(2025, 1, 1))).toBe(0);
    expect(compareCalendarDates(calendarDate(2025, 1, 2), calendarDate(2025, 1, 1))).toBeGreaterThan(0);
  });
});

describe("month arithmetic clamps to month end", () => {
  it("clamps the anniversary day when the target month is shorter", () => {
    expect(addMonthsClamped(calendarDate(2025, 1, 31), 1)).toEqual(calendarDate(2025, 2, 28));
    expect(addMonthsClamped(calendarDate(2024, 1, 31), 1)).toEqual(calendarDate(2024, 2, 29));
    expect(addMonthsClamped(calendarDate(2024, 2, 29), 12)).toEqual(calendarDate(2025, 2, 28));
    expect(addMonthsClamped(calendarDate(2024, 2, 29), 48)).toEqual(calendarDate(2028, 2, 29));
    expect(addMonthsClamped(calendarDate(2025, 3, 31), 1)).toEqual(calendarDate(2025, 4, 30));
    expect(addMonthsClamped(calendarDate(2025, 11, 15), 2)).toEqual(calendarDate(2026, 1, 15));
  });

  it("counts completed months on the (clamped) monthly anniversary — half-open", () => {
    const born = calendarDate(2025, 1, 31);
    expect(completedMonthsBetween(born, calendarDate(2025, 2, 27))).toBe(0);
    expect(completedMonthsBetween(born, calendarDate(2025, 2, 28))).toBe(1); // clamped anniversary
    expect(completedMonthsBetween(born, calendarDate(2025, 3, 30))).toBe(1);
    expect(completedMonthsBetween(born, calendarDate(2025, 3, 31))).toBe(2);
    expect(completedMonthsBetween(born, calendarDate(2026, 1, 30))).toBe(11);
    expect(completedMonthsBetween(born, calendarDate(2026, 1, 31))).toBe(12);
  });

  it("handles a leap-day birthday: the birthday falls on Feb 28 in common years", () => {
    const born = calendarDate(2024, 2, 29);
    expect(completedMonthsBetween(born, calendarDate(2025, 2, 27))).toBe(11);
    expect(completedMonthsBetween(born, calendarDate(2025, 2, 28))).toBe(12);
    expect(completedMonthsBetween(born, calendarDate(2025, 3, 1))).toBe(12);
    expect(completedMonthsBetween(born, calendarDate(2028, 2, 28))).toBe(47);
    expect(completedMonthsBetween(born, calendarDate(2028, 2, 29))).toBe(48);
  });

  it("is zero before the origin", () => {
    expect(completedMonthsBetween(calendarDate(2025, 6, 1), calendarDate(2025, 5, 31))).toBe(0);
  });
});

describe("today in a time zone", () => {
  // 2026-09-02T05:30:00Z: still Sept 1 in Los Angeles (UTC-7), already Sept 2 in Ho Chi Minh City (UTC+7).
  const instant = new Date(Date.UTC(2026, 8, 2, 5, 30));

  it("yields different calendar dates on either side of local midnight", () => {
    expect(calendarDateInTimeZone(instant, "America/Los_Angeles")).toEqual(calendarDate(2026, 9, 1));
    expect(calendarDateInTimeZone(instant, "Asia/Ho_Chi_Minh")).toEqual(calendarDate(2026, 9, 2));
    expect(calendarDateInTimeZone(instant, "UTC")).toEqual(calendarDate(2026, 9, 2));
  });

  it("crosses a month, year and leap-day boundary correctly", () => {
    const newYear = new Date(Date.UTC(2026, 0, 1, 2, 0)); // Jan 1 02:00Z = Dec 31 18:00 in Los Angeles
    expect(calendarDateInTimeZone(newYear, "America/Los_Angeles")).toEqual(calendarDate(2025, 12, 31));
    expect(calendarDateInTimeZone(newYear, "Asia/Tokyo")).toEqual(calendarDate(2026, 1, 1));
    const leap = new Date(Date.UTC(2024, 2, 1, 3, 0)); // Mar 1 03:00Z = Feb 29 19:00 in Los Angeles
    expect(calendarDateInTimeZone(leap, "America/Los_Angeles")).toEqual(calendarDate(2024, 2, 29));
  });

  it("measures the wait until the next local midnight (rollover scheduling, DST-safe)", () => {
    expect(msUntilNextLocalMidnight(new Date(2026, 8, 2, 23, 59, 59, 500))).toBe(500);
    expect(msUntilNextLocalMidnight(new Date(2026, 8, 2, 0, 0, 0, 0))).toBe(24 * 3_600_000);
    const eve = new Date(2026, 2, 7, 12, 0); // day before a possible DST switch: length is 23–25h, never negative
    const wait = msUntilNextLocalMidnight(eve);
    expect(wait).toBeGreaterThan(0);
    expect(localCalendarDate(new Date(eve.getTime() + wait))).toEqual(calendarDate(2026, 3, 8));
  });

  it("uses the runtime's local calendar for localCalendarDate", () => {
    const local = new Date(2026, 8, 2, 23, 59);
    expect(localCalendarDate(local)).toEqual(calendarDate(2026, 9, 2));
  });
});
