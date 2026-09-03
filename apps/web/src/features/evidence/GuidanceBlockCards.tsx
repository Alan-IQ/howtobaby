// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Pairs the EN and VI views of the same guidance blocks and renders one GuidanceEvidenceCard per
 * block (both locales prerendered; the global language picks which renders). A block missing in
 * either locale is skipped rather than half-rendered — the coverage/parity gates make that a
 * build failure for released content anyway.
 */

import type { StageDefinition } from "@howtobaby/core";

import { GuidanceEvidenceCard } from "./GuidanceEvidenceCard";
import type { GuidanceBlockView } from "./load";

export interface GuidanceBlockCardsProps {
  en: readonly GuidanceBlockView[];
  vi: readonly GuidanceBlockView[];
  /** When set, stage blocks use the stage range as their eyebrow; cross-stage blocks keep the topic eyebrow. */
  stage?: StageDefinition | undefined;
  /** Card title heading level (h2 on a page whose sections are the cards; h3 under a stage heading). */
  headingLevel?: "h2" | "h3";
}

export function GuidanceBlockCards({ en, vi, stage, headingLevel = "h2" }: GuidanceBlockCardsProps) {
  return (
    <>
      {en.map((enBlock) => {
        const viBlock = vi.find((b) => b.blockId === enBlock.blockId);
        if (!viBlock) return null;
        return (
          <GuidanceEvidenceCard key={enBlock.blockId} variants={{ en: enBlock, vi: viBlock }} stage={enBlock.stage !== undefined ? stage : undefined} headingLevel={headingLevel} />
        );
      })}
    </>
  );
}
