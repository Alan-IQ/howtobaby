// SPDX-License-Identifier: AGPL-3.0-only
/**
 * All Play & Development stages on one statically generated page — the "all-stage reference"
 * print mode of docs/GUI_DESIGN.md §15: every stage bin in order, each with its contract sections
 * (GUIDANCE_CONTENT_CONTRACT.md §3), the cross-stage "how to read milestones" block once, and the
 * page References for this route from the same provenance graph (EVIDENCE_PROVENANCE.md §18).
 * Like every public route it carries broad age state only: no profile, no child data.
 */

import type { Metadata } from "next";

import { stagesFor } from "@howtobaby/core";

import { PageShell } from "@/components/PageShell";
import { StageRangeLabel } from "@/features/context/StageRangeLabel";
import { ALL_STAGES_ROUTE, stageHref } from "@/features/context/routes";
import { orderGuidanceBlocks } from "@/features/development/sections";
import { GuidanceBlockCards } from "@/features/evidence/GuidanceBlockCards";
import { LocalizedReferences } from "@/features/evidence/LocalizedReferences";
import { loadGuidanceBlockViews, loadReferenceEntries } from "@/features/evidence/load";
import { T } from "@/i18n/T";

export const metadata: Metadata = { title: "Play & Development · All stages" };

const ROUTE = ALL_STAGES_ROUTE;

export default async function Page() {
  const [enBlocks, viBlocks, enReferences, viReferences] = await Promise.all([
    loadGuidanceBlockViews(ROUTE, "en"),
    loadGuidanceBlockViews(ROUTE, "vi"),
    loadReferenceEntries(ROUTE, "en"),
    loadReferenceEntries(ROUTE, "vi"),
  ]);
  const ordered = orderGuidanceBlocks(enBlocks);
  const crossStage = ordered.filter((block) => block.stage === undefined);

  return (
    <PageShell
      eyebrow={<T id="domain.play.title" />}
      icon="play"
      accent="play"
      title={<T id="page.play.allStages.title" />}
      lede={<T id="page.play.allStages.lede" />}
      printable
    >
      <GuidanceBlockCards en={crossStage} vi={viBlocks} headingLevel="h2" />
      {stagesFor("development").map((stage) => {
        const stageBlocks = ordered.filter((block) => block.stage === stage.id);
        return (
          <section key={stage.id} className="all-stages__stage" aria-labelledby={`stage-${stage.slug}`}>
            <h2 id={`stage-${stage.slug}`} className="all-stages__heading">
              <a href={stageHref(stage)}>
                <StageRangeLabel stage={stage} />
              </a>
            </h2>
            <GuidanceBlockCards en={stageBlocks} vi={viBlocks} stage={stage} headingLevel="h3" />
          </section>
        );
      })}
      <LocalizedReferences entries={{ en: enReferences, vi: viReferences }} />
    </PageShell>
  );
}
