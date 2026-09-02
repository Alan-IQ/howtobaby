// SPDX-License-Identifier: AGPL-3.0-only
import type { CalendarDate } from "./calendar.ts";
import type { CorrectedDevelopmentProxy, ElapsedAge } from "./age.ts";

/** Domains that carry stage bins (GUIDANCE_CONTENT_CONTRACT.md §3–§5). Safety has none: it follows the actual child's chronological scope (§6). */
export const STAGE_DOMAINS = ["development", "feeding", "sleep"] as const;
export type StageDomain = (typeof STAGE_DOMAINS)[number];

/** One stage bin. Ranges are half-open `[minMonths, maxMonths)` in completed months. */
export interface StageDefinition {
  /** Stable stage id from the content contract (e.g. `dev-06-09m`); never changes with labels or slugs. */
  readonly id: string;
  readonly domain: StageDomain;
  /** Public route segment — broad age state only, never child data. */
  readonly slug: string;
  readonly minMonths: number;
  /** Exclusive upper bound in completed months. */
  readonly maxMonths: number;
  /** The source wording qualifies the lower bound ("about 6 months"); the bin is an editorial resolver bin, not a medical threshold. */
  readonly approximateLowerBound?: true;
}

/** Which age the domain resolves on (GUIDANCE_CONTENT_CONTRACT.md §2 "Age basis by domain"). */
export type AgeBasis = "chronological" | "corrected-development";

export interface DomainAgeResolution {
  readonly basis: AgeBasis;
  readonly age: ElapsedAge;
  readonly stage: StageDefinition | undefined;
}

/** Optional local child profile (PROJECT_PROFILE §6): DOB required, due date and name optional. Name is display-only. */
export interface ChildProfile {
  readonly dateOfBirth: CalendarDate;
  readonly estimatedDueDate?: CalendarDate;
  readonly displayName?: string;
}

/** The actual child resolved on one plan date — the only context safety-sensitive guidance may read. */
export interface ChildAgeContext {
  readonly planDate: CalendarDate;
  readonly chronological: ElapsedAge;
  readonly correctedDevelopment: CorrectedDevelopmentProxy;
  readonly domains: Readonly<Record<StageDomain, DomainAgeResolution>>;
  /** `birth <= chronological age < 12 months` (GUIDANCE_CONTENT_CONTRACT.md §6 full infant safe-sleep scope). */
  readonly infantSafeSleepScope: boolean;
}

/** A stage the user is browsing manually. Browsing never mutates the profile. */
export interface BrowsedStageContext {
  readonly domain: StageDomain;
  readonly stage: StageDefinition;
}

/** A future/past plan date previewed for the actual child. Never replaces present safety context. */
export interface PlanDateContext {
  readonly planDate: CalendarDate;
  readonly context: ChildAgeContext;
}

/** GUIDANCE_CONTENT_CONTRACT.md §7 — the three contexts stay separate fields, never merged. */
export interface GuidanceContext {
  readonly actualChildContext?: ChildAgeContext;
  readonly browsedContentContext?: BrowsedStageContext;
  readonly previewPlanDateContext?: PlanDateContext;
}

/** How a browsed stage relates to the actual child's current stage in the same domain. */
export type BrowsedStageRelation = "no-profile" | "unresolved" | "actual" | "earlier" | "later";
