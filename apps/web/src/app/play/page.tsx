// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";
import Link from "next/link";

import { Card } from "@howtobaby/ui";

import { PageShell } from "@/components/PageShell";
import { BrowseByAge } from "@/features/context/BrowseByAge";
import { ALL_STAGES_ROUTE } from "@/features/context/routes";
import { GuidanceBlockCards } from "@/features/evidence/GuidanceBlockCards";
import { LocalizedReferences } from "@/features/evidence/LocalizedReferences";
import { loadGuidanceBlockViews, loadReferenceEntries } from "@/features/evidence/load";
import { T } from "@/i18n/T";

// The PAGE title keeps the full domain name ("Play & Development" / "Chơi & Phát triển");
// only navigation labels shorten to "Play"/"Chơi" (domain.play.title vs nav.play.label).
export const metadata: Metadata = { title: "Play & Development" };

const ROUTE = "/play";

export default async function Page() {
  // Canonical data only: the cross-stage "how to read milestones" block, its chips/drawer and the
  // page references all resolve from the knowledge read model (docs/EVIDENCE_PROVENANCE.md §6);
  // per-stage guidance lives on the static stage routes reached through Browse by age.
  const [enBlocks, viBlocks, enReferences, viReferences] = await Promise.all([
    loadGuidanceBlockViews(ROUTE, "en"),
    loadGuidanceBlockViews(ROUTE, "vi"),
    loadReferenceEntries(ROUTE, "en"),
    loadReferenceEntries(ROUTE, "vi"),
  ]);

  return (
    <PageShell
      eyebrow={<T id="domain.play.title" />}
      icon="play"
      accent="play"
      title={<T id="domain.play.title" />}
      lede={<T id="page.play.lede" />}
      printable
    >
      <BrowseByAge domain="development" />
      <GuidanceBlockCards en={enBlocks} vi={viBlocks} />
      <Card icon="print" accent="play" title={<T id="play.allStages.title" />} titleAs="h2">
        <div className="prose">
          <p className="muted">
            <T id="play.allStages.note" />
          </p>
          <p>
            <Link href={ALL_STAGES_ROUTE} className="all-stages-link">
              <T id="play.allStages.link" />
            </Link>
          </p>
        </div>
      </Card>
      <LocalizedReferences entries={{ en: enReferences, vi: viReferences }} />
    </PageShell>
  );
}
