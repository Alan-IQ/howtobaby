// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Play & Development stage anatomy (GUIDANCE_CONTENT_CONTRACT.md §3, GUI_DESIGN.md §8): the
 * contract's required sections in presentation order. Guidance blocks carry the canonical
 * `section` id; the page orders them by this list instead of by block id, so authoring order and
 * ids never decide the reading order. Cross-stage blocks (no `stage`, e.g. "How to read
 * milestones") always follow the stage's own sections.
 */

import type { KnowledgeDomain } from "@howtobaby/knowledge";

import type { GuidanceBlockView } from "@/features/evidence/load";

export const DEVELOPMENT_SECTION_ORDER: readonly string[] = [
  "at-a-glance",
  "milestone-context",
  "development-focus",
  "gross-motor",
  "fine-motor",
  "communication",
  "cognitive",
  "social-emotional",
  "activities",
  "variants",
  "safety-environment",
  "what-not-to-force",
  "what-to-observe",
  "clinician-cues",
];

/** Section presentation order per domain; domains without a section contract keep block order. */
const SECTION_ORDER: Partial<Record<KnowledgeDomain, readonly string[]>> = {
  development: DEVELOPMENT_SECTION_ORDER,
};

function sectionRank(block: GuidanceBlockView): number {
  const order = SECTION_ORDER[block.domain];
  if (!order || block.section === undefined) return Number.MAX_SAFE_INTEGER;
  const index = order.indexOf(block.section);
  return index === -1 ? Number.MAX_SAFE_INTEGER - 1 : index;
}

/**
 * Stage blocks first (in contract section order, unknown sections after the known ones), then
 * cross-stage blocks; ties keep the repository's stable id order.
 */
export function orderGuidanceBlocks<T extends GuidanceBlockView>(blocks: readonly T[]): T[] {
  return [...blocks].sort((a, b) => {
    const aStage = a.stage !== undefined ? 0 : 1;
    const bStage = b.stage !== undefined ? 0 : 1;
    if (aStage !== bStage) return aStage - bStage;
    return sectionRank(a) - sectionRank(b);
  });
}
