// SPDX-License-Identifier: AGPL-3.0-only
import type { CalendarDate } from "../types/calendar.ts";
import type { ElapsedAge } from "../types/age.ts";
import { addMonthsClamped, completedMonthsBetween, daysBetween } from "./calendar-date.ts";

/** Age from `origin` to `onDate`; negative `days` (and zeroed month fields) before the origin. */
export function elapsedAge(origin: CalendarDate, onDate: CalendarDate): ElapsedAge {
  const days = daysBetween(origin, onDate);
  if (days < 0) return { days, weeks: 0, completedMonths: 0, remainderDays: 0 };
  const completedMonths = completedMonthsBetween(origin, onDate);
  return {
    days,
    weeks: Math.floor(days / 7),
    completedMonths,
    remainderDays: daysBetween(addMonthsClamped(origin, completedMonths), onDate),
  };
}

/** Chronological age: elapsed age from the date of birth. */
export function chronologicalAge(dateOfBirth: CalendarDate, onDate: CalendarDate): ElapsedAge {
  return elapsedAge(dateOfBirth, onDate);
}
