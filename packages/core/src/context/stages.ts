// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Stage bins from GUIDANCE_CONTENT_CONTRACT.md §3 (Development/Play), §4 (Feeding) and §5
 * (Sleep). Ranges are half-open `[minMonths, maxMonths)` in completed months. Ids are the stable
 * content-contract ids; slugs are the public route segments (broad age state only). Feeding and
 * sleep bins are resolver/editorial bins, not medical thresholds; age selects candidate guidance
 * and never proves readiness, suitability or developmental status.
 */

import { STAGE_DOMAINS, type StageDefinition, type StageDomain } from "../types/context.ts";

function bin(domain: StageDomain, id: string, slug: string, minMonths: number, maxMonths: number, approximateLowerBound?: true): StageDefinition {
  return approximateLowerBound ? { id, domain, slug, minMonths, maxMonths, approximateLowerBound } : { id, domain, slug, minMonths, maxMonths };
}

export const DEVELOPMENT_STAGES: readonly StageDefinition[] = [
  bin("development", "dev-00-02m", "0-2-months", 0, 2),
  bin("development", "dev-02-04m", "2-4-months", 2, 4),
  bin("development", "dev-04-06m", "4-6-months", 4, 6),
  bin("development", "dev-06-09m", "6-9-months", 6, 9),
  bin("development", "dev-09-12m", "9-12-months", 9, 12),
  bin("development", "dev-12-15m", "12-15-months", 12, 15),
  bin("development", "dev-15-18m", "15-18-months", 15, 18),
  bin("development", "dev-18-24m", "18-24-months", 18, 24),
  bin("development", "dev-24-30m", "24-30-months", 24, 30),
  bin("development", "dev-30-36m", "30-36-months", 30, 36),
  bin("development", "dev-36-48m", "3-4-years", 36, 48),
  bin("development", "dev-48-60m", "4-5-years", 48, 60),
];

export const FEEDING_STAGES: readonly StageDefinition[] = [
  bin("feeding", "feed-00-04m", "0-4-months", 0, 4),
  bin("feeding", "feed-04-06m", "4-6-months", 4, 6),
  bin("feeding", "feed-06-08m", "6-8-months", 6, 8, true),
  bin("feeding", "feed-08-12m", "8-12-months", 8, 12),
  bin("feeding", "feed-12-24m", "12-24-months", 12, 24),
  bin("feeding", "feed-24-36m", "2-3-years", 24, 36),
  bin("feeding", "feed-36-60m", "3-5-years", 36, 60),
];

export const SLEEP_STAGES: readonly StageDefinition[] = [
  bin("sleep", "sleep-00-02m", "0-2-months", 0, 2),
  bin("sleep", "sleep-02-03m", "2-3-months", 2, 3),
  bin("sleep", "sleep-03-04m", "3-4-months", 3, 4),
  bin("sleep", "sleep-04-05m", "4-5-months", 4, 5),
  bin("sleep", "sleep-05-06m", "5-6-months", 5, 6),
  bin("sleep", "sleep-06-07m", "6-7-months", 6, 7),
  bin("sleep", "sleep-07-08m", "7-8-months", 7, 8),
  bin("sleep", "sleep-08-10m", "8-10-months", 8, 10),
  bin("sleep", "sleep-10-12m", "10-12-months", 10, 12),
  bin("sleep", "sleep-12-15m", "12-15-months", 12, 15),
  bin("sleep", "sleep-15-18m", "15-18-months", 15, 18),
  bin("sleep", "sleep-18-24m", "18-24-months", 18, 24),
  bin("sleep", "sleep-24-36m", "2-3-years", 24, 36),
  bin("sleep", "sleep-36-60m", "3-5-years", 36, 60),
];

export const STAGE_TABLES: Readonly<Record<StageDomain, readonly StageDefinition[]>> = {
  development: DEVELOPMENT_STAGES,
  feeding: FEEDING_STAGES,
  sleep: SLEEP_STAGES,
};

/** The upper bound of the initial product scope: birth through `<5 years` (60 months). */
export const STAGE_SCOPE_MAX_MONTHS = 60;

export function stagesFor(domain: StageDomain): readonly StageDefinition[] {
  return STAGE_TABLES[domain];
}

export function allStages(): readonly StageDefinition[] {
  return STAGE_DOMAINS.flatMap((domain) => STAGE_TABLES[domain]);
}

export function stageById(id: string): StageDefinition | undefined {
  return allStages().find((stage) => stage.id === id);
}

export function stageBySlug(domain: StageDomain, slug: string): StageDefinition | undefined {
  return STAGE_TABLES[domain].find((stage) => stage.slug === slug);
}

/** Half-open membership test in completed months. */
export function isWithinStage(completedMonths: number, stage: StageDefinition): boolean {
  return completedMonths >= stage.minMonths && completedMonths < stage.maxMonths;
}

/**
 * The stage bin for an age in completed months, or `undefined` outside `[0, 60)` — including a
 * negative (pre-birth / pre-due-date) age. Never interpolates or invents a bin.
 */
export function resolveStage(domain: StageDomain, completedMonths: number): StageDefinition | undefined {
  if (!Number.isFinite(completedMonths) || completedMonths < 0) return undefined;
  return STAGE_TABLES[domain].find((stage) => isWithinStage(completedMonths, stage));
}

export function adjacentStages(stage: StageDefinition): { previous: StageDefinition | undefined; next: StageDefinition | undefined } {
  const table = STAGE_TABLES[stage.domain];
  const index = table.findIndex((candidate) => candidate.id === stage.id);
  return { previous: index > 0 ? table[index - 1] : undefined, next: index >= 0 ? table[index + 1] : undefined };
}
