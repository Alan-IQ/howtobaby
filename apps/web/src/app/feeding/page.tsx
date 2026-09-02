// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";

import { Card } from "@howtobaby/ui";

import { PageShell } from "@/components/PageShell";
import { BrowseByAge } from "@/features/context/BrowseByAge";
import { LocalizedReferences } from "@/features/evidence/LocalizedReferences";
import { loadGuidanceBlockViews, loadReferenceEntries } from "@/features/evidence/load";
import { GuidanceEvidenceCard } from "@/features/feeding/GuidanceEvidenceCard";
import { T } from "@/i18n/T";

export const metadata: Metadata = { title: "Feeding" };

const ROUTE = "/feeding";

export default async function Page() {
  // Canonical data only: guidance blocks, claim text, chips, drawer and the page references all
  // resolve from the knowledge read model (docs/EVIDENCE_PROVENANCE.md §6) — nothing is authored here.
  // Both locales are prerendered; the global language preference picks which one renders.
  const [enBlocks, viBlocks, enReferences, viReferences] = await Promise.all([
    loadGuidanceBlockViews(ROUTE, "en"),
    loadGuidanceBlockViews(ROUTE, "vi"),
    loadReferenceEntries(ROUTE, "en"),
    loadReferenceEntries(ROUTE, "vi"),
  ]);

  return (
    <PageShell
      eyebrow={<T id="domain.feeding.title" />}
      icon="feeding"
      accent="feeding"
      title={<T id="domain.feeding.title" />}
      lede={<T id="page.feeding.lede" />}
      printable
    >
      <BrowseByAge domain="feeding" />
      {enBlocks.map((enBlock) => {
        const viBlock = viBlocks.find((b) => b.blockId === enBlock.blockId);
        return viBlock ? <GuidanceEvidenceCard key={enBlock.blockId} variants={{ en: enBlock, vi: viBlock }} /> : null;
      })}
      <Card icon="feeding" title={<T id="section.placeholder.title" />} titleAs="h2">
        <div className="prose">
          <p>
            <T id="page.feeding.hold.p1" />
          </p>
          <p className="muted">
            <T id="page.feeding.hold.p2" />
          </p>
        </div>
      </Card>
      <LocalizedReferences entries={{ en: enReferences, vi: viReferences }} />
    </PageShell>
  );
}
