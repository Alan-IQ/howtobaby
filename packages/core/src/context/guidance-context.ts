// SPDX-License-Identifier: AGPL-3.0-only
/**
 * GUIDANCE_CONTENT_CONTRACT.md §7 — actual vs browsed vs preview. The three contexts are built
 * once here and kept as separate fields:
 *   - the actual child always resolves on TODAY, never on a preview date;
 *   - a browsed stage is a value the user chose; it never touches the profile;
 *   - a preview plan date resolves the same profile on another date, in its own field.
 * Safety-sensitive guidance may read only `actualChildContext` (see `safetyContextOf`).
 */

import { compareCalendarDates, isSameCalendarDate } from "../age/calendar-date.ts";
import type { CalendarDate } from "../types/calendar.ts";
import type { BrowsedStageContext, BrowsedStageRelation, ChildAgeContext, ChildProfile, GuidanceContext, StageDefinition, StageDomain } from "../types/context.ts";
import { resolveAgeContext } from "./child-age-context.ts";

export interface GuidanceContextInput {
  readonly profile?: ChildProfile | undefined;
  /** The actual calendar date where the user is (see `calendarDateInTimeZone` / `localCalendarDate`). */
  readonly today: CalendarDate;
  readonly browsedStage?: StageDefinition | undefined;
  /** A plan date to preview; ignored when it equals today or when there is no profile. */
  readonly previewPlanDate?: CalendarDate | undefined;
}

export function resolveGuidanceContext(input: GuidanceContextInput): GuidanceContext {
  const context: { -readonly [K in keyof GuidanceContext]: GuidanceContext[K] } = {};
  if (input.profile) context.actualChildContext = resolveAgeContext(input.profile, input.today);
  if (input.browsedStage) context.browsedContentContext = { domain: input.browsedStage.domain, stage: input.browsedStage };
  if (input.profile && input.previewPlanDate && !isSameCalendarDate(input.previewPlanDate, input.today)) {
    context.previewPlanDateContext = { planDate: input.previewPlanDate, context: resolveAgeContext(input.profile, input.previewPlanDate) };
  }
  return context;
}

/** Relation of a browsed stage to the actual child's current stage in that domain. */
export function browsedStageRelation(actual: ChildAgeContext | undefined, browsed: BrowsedStageContext): BrowsedStageRelation {
  if (!actual) return "no-profile";
  const current = actual.domains[browsed.domain].stage;
  if (!current) return "unresolved";
  if (current.id === browsed.stage.id) return "actual";
  return browsed.stage.minMonths < current.minMonths ? "earlier" : "later";
}

/**
 * The only context safety-sensitive guidance may resolve on. Browsed stages and preview dates
 * are deliberately not parameters: an older browsed stage or a future preview can never unlock
 * or suppress the actual child's safety guidance.
 */
export function safetyContextOf(context: GuidanceContext): ChildAgeContext | undefined {
  return context.actualChildContext;
}

/** Whether the preview date lies after today (a "future plan" preview) — for banners only. */
export function isFuturePreview(context: GuidanceContext): boolean {
  const preview = context.previewPlanDateContext;
  const actual = context.actualChildContext;
  return !!preview && !!actual && compareCalendarDates(preview.planDate, actual.planDate) > 0;
}

/** Actual child's stage in a domain, or undefined without a profile / outside scope. */
export function actualStageIn(context: GuidanceContext, domain: StageDomain): StageDefinition | undefined {
  return context.actualChildContext?.domains[domain].stage;
}
