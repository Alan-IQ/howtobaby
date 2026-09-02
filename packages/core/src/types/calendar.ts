// SPDX-License-Identifier: AGPL-3.0-only
/**
 * A calendar date, not a timestamp (GUIDANCE_CONTENT_CONTRACT.md §2). Year/month/day are
 * carried explicitly; `month` is 1–12. Comparisons go through timezone-independent day serials.
 */
export interface CalendarDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

/** ISO-8601 calendar date text, `YYYY-MM-DD`, the only textual form the core accepts. */
export type CalendarDateText = string;
