// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Shared stage-route page (docs/GUI_DESIGN.md §8 anatomy): title + stage context, stage
 * navigator, Why-this-stage, the canonical guidance blocks mapped to this route, previous/next
 * stage links and page References. Statically generated for every stage bin; the route carries
 * broad age state only. The actual child (local profile) is layered on client-side by the
 * navigator/Why-this-stage components — never by this server component, never in metadata.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import type { StageDomain } from "@howtobaby/core";
import { Card } from "@howtobaby/ui";

import { PageShell } from "@/components/PageShell";
import { orderGuidanceBlocks } from "@/features/development/sections";
import { GuidanceBlockCards } from "@/features/evidence/GuidanceBlockCards";
import { LocalizedReferences } from "@/features/evidence/LocalizedReferences";
import { loadGuidanceBlockViews, loadReferenceEntries } from "@/features/evidence/load";
import { T } from "@/i18n/T";
import { formatStageRange } from "./format";
import { STAGE_DESTINATIONS, stageForRoute, stageHref } from "./routes";
import { StageNavigator } from "./StageNavigator";
import { StagePager } from "./StagePager";
import { StageRangeLabel } from "./StageRangeLabel";
import { WhyThisStage } from "./WhyThisStage";

export interface StageRouteParams {
  params: Promise<{ stage: string }>;
}

/** Document metadata from the stage bin alone — canonical English, no child data by construction. */
export async function stageMetadata(domain: StageDomain, { params }: StageRouteParams): Promise<Metadata> {
  const { stage: slug } = await params;
  const stage = stageForRoute(domain, slug);
  if (!stage) return {};
  return { title: `${STAGE_DESTINATIONS[domain].metadataTitle} · ${formatStageRange(stage, "en")}` };
}

export async function StagePage({ domain, params }: { domain: StageDomain } & StageRouteParams) {
  const { stage: slug } = await params;
  const stage = stageForRoute(domain, slug);
  if (!stage) notFound();
  const destination = STAGE_DESTINATIONS[domain];
  const route = stageHref(stage);
  const [enBlocks, viBlocks, enReferences, viReferences] = await Promise.all([
    loadGuidanceBlockViews(route, "en"),
    loadGuidanceBlockViews(route, "vi"),
    loadReferenceEntries(route, "en"),
    loadReferenceEntries(route, "vi"),
  ]);
  // Contract section order, not block-id order (GUI_DESIGN.md §8 anatomy): an "at a glance"
  // section leads the page, above Why-this-stage; every other section follows it.
  const ordered = orderGuidanceBlocks(enBlocks);
  const lead = ordered.filter((block) => block.section === "at-a-glance");
  const rest = ordered.filter((block) => block.section !== "at-a-glance");

  return (
    <PageShell
      eyebrow={
        <>
          <T id={destination.titleKey} /> · <T id="stage.eyebrow.browsing" />
        </>
      }
      icon={destination.icon}
      accent={destination.accent}
      title={
        <>
          <T id={destination.titleKey} /> · <StageRangeLabel stage={stage} />
        </>
      }
      lede={<T id={destination.ledeKey} />}
      printable
    >
      <StageNavigator domain={domain} currentSlug={stage.slug} />
      <GuidanceBlockCards en={lead} vi={viBlocks} stage={stage} />
      <WhyThisStage stage={stage} />
      {rest.length > 0 ? (
        <GuidanceBlockCards en={rest} vi={viBlocks} stage={stage} />
      ) : (
        <Card icon={destination.icon} title={<T id="stage.empty.title" />} titleAs="h2">
          <p className="muted">
            <T id="stage.empty.note" />
          </p>
        </Card>
      )}
      <StagePager stage={stage} />
      <LocalizedReferences entries={{ en: enReferences, vi: viReferences }} />
    </PageShell>
  );
}
