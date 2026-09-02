// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Calendar-date utilities (GUIDANCE_CONTENT_CONTRACT.md §2): dates are calendar dates, parsed as
 * explicit year/month/day, compared through timezone-independent day serials. No `Date` object
 * ever represents a calendar date here; `Date` appears only at the two edges that turn an instant
 * into "today" in a given time zone.
 */

import type { CalendarDate, CalendarDateText } from "../types/calendar.ts";

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 86_400_000;

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

export function isValidCalendarDate(value: unknown): value is CalendarDate {
  if (typeof value !== "object" || value === null) return false;
  const { year, month, day } = value as Record<string, unknown>;
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return false;
  const y = year as number;
  const m = month as number;
  const d = day as number;
  return y >= 1 && y <= 9999 && m >= 1 && m <= 12 && d >= 1 && d <= daysInMonth(y, m);
}

/** Build a validated calendar date; throws on an impossible date (e.g. 2025-02-29). */
export function calendarDate(year: number, month: number, day: number): CalendarDate {
  const value = { year, month, day };
  if (!isValidCalendarDate(value)) throw new RangeError(`Invalid calendar date: ${year}-${month}-${day}`);
  return value;
}

/** Strict `YYYY-MM-DD` parse with calendar validation; anything else is `undefined`, never a guess. */
export function parseCalendarDate(text: unknown): CalendarDate | undefined {
  if (typeof text !== "string") return undefined;
  const match = ISO_DATE.exec(text);
  if (!match) return undefined;
  const value = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  return isValidCalendarDate(value) ? value : undefined;
}

export function formatCalendarDate(date: CalendarDate): CalendarDateText {
  const pad = (n: number, width: number) => String(n).padStart(width, "0");
  return `${pad(date.year, 4)}-${pad(date.month, 2)}-${pad(date.day, 2)}`;
}

/** Days since 1970-01-01 — the timezone-independent comparison key. */
export function toDaySerial(date: CalendarDate): number {
  return Math.round(Date.UTC(date.year, date.month - 1, date.day) / MS_PER_DAY);
}

export function fromDaySerial(serial: number): CalendarDate {
  const utc = new Date(serial * MS_PER_DAY);
  return { year: utc.getUTCFullYear(), month: utc.getUTCMonth() + 1, day: utc.getUTCDate() };
}

export function compareCalendarDates(a: CalendarDate, b: CalendarDate): number {
  return toDaySerial(a) - toDaySerial(b);
}

export function isSameCalendarDate(a: CalendarDate, b: CalendarDate): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

export function addDays(date: CalendarDate, days: number): CalendarDate {
  return fromDaySerial(toDaySerial(date) + days);
}

/** `to - from` in days (negative when `to` precedes `from`). */
export function daysBetween(from: CalendarDate, to: CalendarDate): number {
  return toDaySerial(to) - toDaySerial(from);
}

/**
 * Add calendar months, clamping to the last day of the target month when the anniversary day
 * does not exist there (Jan 31 + 1 month = Feb 28/29; Feb 29 + 12 months = Feb 28).
 */
export function addMonthsClamped(date: CalendarDate, months: number): CalendarDate {
  const total = date.year * 12 + (date.month - 1) + months;
  const year = Math.floor(total / 12);
  const month = (total % 12) + 1;
  return { year, month, day: Math.min(date.day, daysInMonth(year, month)) };
}

/**
 * Completed calendar months from `from` to `to` (0 when `to` precedes `from`). The n-th month is
 * complete on the n-th monthly anniversary, with the clamping rule of `addMonthsClamped`.
 */
export function completedMonthsBetween(from: CalendarDate, to: CalendarDate): number {
  if (compareCalendarDates(to, from) < 0) return 0;
  let months = (to.year - from.year) * 12 + (to.month - from.month);
  if (compareCalendarDates(addMonthsClamped(from, months), to) > 0) months -= 1;
  return Math.max(0, months);
}

/**
 * The calendar date of an instant in a named IANA time zone — the only sanctioned way to turn
 * "now" into "today". Two users at the same instant on either side of midnight get different
 * calendar dates, which is correct: age is counted on the child's local calendar.
 */
export function calendarDateInTimeZone(instant: Date, timeZone: string): CalendarDate {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(instant);
  const read = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
  return calendarDate(read("year"), read("month"), read("day"));
}

/** The calendar date of an instant in the runtime's local time zone (browser "today"). */
export function localCalendarDate(instant: Date): CalendarDate {
  return calendarDate(instant.getFullYear(), instant.getMonth() + 1, instant.getDate());
}
