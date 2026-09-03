// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Public stage routes: `/<destination>/<stage slug>` — the ONLY child-related state a public URL
 * may encode is a broad stage bin (PROJECT_PROFILE §6). Slugs come from the core stage tables;
 * nothing here ever sees a profile.
 */

import { stageBySlug, stagesFor, type StageDefinition, type StageDomain } from "@howtobaby/core";
import type { DomainAccent, IconName } from "@howtobaby/ui";

import type { AppMessageKey } from "@/i18n/messages";

export interface StageDestination {
  readonly domain: StageDomain;
  /** Route base, e.g. `/play`. */
  readonly base: string;
  readonly icon: IconName;
  readonly accent: DomainAccent;
  readonly titleKey: AppMessageKey;
  readonly ledeKey: AppMessageKey;
  /** Canonical English title for document metadata (prerendered in the canonical locale). */
  readonly metadataTitle: string;
}

export const STAGE_DESTINATIONS: Readonly<Record<StageDomain, StageDestination>> = {
  development: { domain: "development", base: "/play", icon: "play", accent: "play", titleKey: "domain.play.title", ledeKey: "page.play.lede", metadataTitle: "Play & Development" },
  feeding: { domain: "feeding", base: "/feeding", icon: "feeding", accent: "feeding", titleKey: "domain.feeding.title", ledeKey: "page.feeding.lede", metadataTitle: "Feeding" },
  sleep: { domain: "sleep", base: "/sleep", icon: "sleep", accent: "sleep", titleKey: "domain.sleep.title", ledeKey: "page.sleep.lede", metadataTitle: "Sleep" },
};

/** Static all-stages reference/print page for Play & Development (docs/GUI_DESIGN.md §15 "all-stage reference mode"). */
export const ALL_STAGES_ROUTE = "/play/all-stages";

export function stageHref(stage: StageDefinition): string {
  return `${STAGE_DESTINATIONS[stage.domain].base}/${stage.slug}`;
}

export function stageForRoute(domain: StageDomain, slug: string): StageDefinition | undefined {
  return stageBySlug(domain, slug);
}

/** Static params for a destination's `[stage]` segment — every bin, nothing else (dynamicParams is off). */
export function stageStaticParams(domain: StageDomain): { stage: string }[] {
  return stagesFor(domain).map((stage) => ({ stage: stage.slug }));
}
