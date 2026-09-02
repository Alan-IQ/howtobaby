// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Presentation of core age/stage values (no date math here — SYSTEM_ARCHITECTURE §6 "no date
 * math in UI components"). Labels carry the contract's half-open notation (`6–<9 months`) so a
 * bin boundary is never read as an inclusive age, and the `about` qualifier of a source-worded
 * lower bound is preserved. Canonical English labels double as document metadata.
 */

import type { AppLocale } from "@howtobaby/i18n";
import type { ElapsedAge, StageDefinition } from "@howtobaby/core";

/** Minimal `{name}` template fill for app copy with values. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

const UNITS: Record<AppLocale, { day: [string, string]; week: [string, string]; month: [string, string]; year: [string, string]; about: string; sep: string }> = {
  en: { day: ["day", "days"], week: ["week", "weeks"], month: ["month", "months"], year: ["year", "years"], about: "about", sep: ", " },
  vi: { day: ["ngày", "ngày"], week: ["tuần", "tuần"], month: ["tháng", "tháng"], year: ["tuổi", "tuổi"], about: "khoảng", sep: ", " },
};

function unit(locale: AppLocale, kind: "day" | "week" | "month" | "year", n: number): string {
  const [one, many] = UNITS[locale][kind];
  return `${n} ${n === 1 ? one : many}`;
}

/**
 * `13 days` / `3 months, 5 days` / `2 years, 3 months` — never a bare number without its unit and
 * never a signed number: an age before its origin is not an age, so callers must phrase it
 * (see `formatTimeUntilDueDate`); this formatter only degrades to the unsigned day count.
 */
export function formatElapsedAge(age: ElapsedAge, locale: AppLocale): string {
  const u = UNITS[locale];
  if (age.days < 0) return formatDayCount(-age.days, locale);
  if (age.completedMonths < 1) return unit(locale, "day", age.days);
  if (age.completedMonths < 24) return age.remainderDays > 0 ? `${unit(locale, "month", age.completedMonths)}${u.sep}${unit(locale, "day", age.remainderDays)}` : unit(locale, "month", age.completedMonths);
  const years = Math.floor(age.completedMonths / 12);
  const months = age.completedMonths % 12;
  const yearLabel = locale === "vi" ? `${years} năm` : unit(locale, "year", years);
  return months > 0 ? `${yearLabel}${u.sep}${unit(locale, "month", months)}` : yearLabel;
}

/** A day count as `n days` / `n weeks, n days` (for "born … before the due date"). */
export function formatDayCount(days: number, locale: AppLocale): string {
  const weeks = Math.floor(days / 7);
  const rest = days % 7;
  if (weeks === 0) return unit(locale, "day", days);
  return rest > 0 ? `${unit(locale, "week", weeks)}${UNITS[locale].sep}${unit(locale, "day", rest)}` : unit(locale, "week", weeks);
}

/**
 * Parent-facing phrasing for a corrected age that has not started yet (plan date before the
 * estimated due date): "9 days until the due date" / "còn 9 ngày nữa đến ngày dự sinh".
 */
export function formatTimeUntilDueDate(correctedAge: ElapsedAge, locale: AppLocale): string {
  const days = Math.max(0, -correctedAge.days);
  // Under two weeks a plain day count reads more naturally than "1 week, 2 days".
  const remaining = days < 14 ? unit(locale, "day", days) : formatDayCount(days, locale);
  return locale === "vi" ? `còn ${remaining} nữa đến ngày dự sinh` : `${remaining} until the due date`;
}

/** Corrected age for display: the elapsed age once the due date has passed, else the countdown to it. */
export function formatCorrectedAge(correctedAge: ElapsedAge, locale: AppLocale): string {
  return correctedAge.days < 0 ? formatTimeUntilDueDate(correctedAge, locale) : formatElapsedAge(correctedAge, locale);
}

/** `6–<9 months`, `about 6–<8 months`, `3–<4 years` (whole-year bins only). */
export function formatStageRange(stage: StageDefinition, locale: AppLocale): string {
  const u = UNITS[locale];
  const wholeYears = stage.minMonths % 12 === 0 && stage.maxMonths % 12 === 0 && stage.minMonths >= 24;
  const range = wholeYears ? `${stage.minMonths / 12}–<${stage.maxMonths / 12} ${u.year[1]}` : `${stage.minMonths}–<${stage.maxMonths} ${u.month[1]}`;
  return stage.approximateLowerBound ? `${u.about} ${range}` : range;
}

/** Short chip label: `6–<9 mo` / `3–<4 y`; VI keeps the full unit word (it is already short). */
export function formatStageChip(stage: StageDefinition, locale: AppLocale): string {
  if (locale === "vi") return formatStageRange(stage, locale).replace(/^khoảng /, "~");
  const wholeYears = stage.minMonths % 12 === 0 && stage.maxMonths % 12 === 0 && stage.minMonths >= 24;
  const range = wholeYears ? `${stage.minMonths / 12}–<${stage.maxMonths / 12} y` : `${stage.minMonths}–<${stage.maxMonths} mo`;
  return stage.approximateLowerBound ? `~${range}` : range;
}
