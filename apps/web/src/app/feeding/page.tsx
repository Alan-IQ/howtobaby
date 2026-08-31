// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";

import { Card, ReferenceList } from "@howtobaby/ui";

import { PageShell } from "@/components/PageShell";
import { loadGuidanceBlockViews, loadReferenceEntries } from "@/features/evidence/load";
import { GuidanceEvidenceCard } from "@/features/feeding/GuidanceEvidenceCard";

export const metadata: Metadata = { title: "Feeding" };

const ROUTE = "/feeding";

export default async function Page() {
  // Canonical data only: guidance blocks, claim text, chips, drawer and the page references all
  // resolve from the knowledge read model (docs/EVIDENCE_PROVENANCE.md §6) — nothing is authored here.
  const [enBlocks, viBlocks, references] = await Promise.all([
    loadGuidanceBlockViews(ROUTE, "en"),
    loadGuidanceBlockViews(ROUTE, "vi"),
    loadReferenceEntries(ROUTE, "en"),
  ]);

  return (
    <PageShell eyebrow="Feeding" icon="feeding" accent="feeding" title="Feeding" lede="Feeding guidance by stage and readiness, with the source behind every statement." printable>
      {enBlocks.map((enBlock) => {
        const viBlock = viBlocks.find((b) => b.blockId === enBlock.blockId);
        return viBlock ? <GuidanceEvidenceCard key={enBlock.blockId} variants={{ en: enBlock, vi: viBlock }} /> : null;
      })}
      <Card title="What this section will hold" titleAs="h2">
        <div className="prose">
          <p>Milk feeding, starting solids, textures, responsive feeding, allergen introduction and feeding safety — organized by stage and readiness rather than by a single age cut-off, with each claim linked to its original source.</p>
          <p className="muted">Guidance appears here only after it has passed the content, evidence and review pipeline — never as unreviewed text. The full feeding domain migrates in a later phase.</p>
        </div>
      </Card>
      <ReferenceList entries={references} />
    </PageShell>
  );
}
