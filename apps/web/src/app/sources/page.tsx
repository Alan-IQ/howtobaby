// SPDX-License-Identifier: AGPL-3.0-only
/**
 * /sources trust surface (docs/EVIDENCE_PROVENANCE.md §9): the actual source registry the product
 * uses — organization, exact title, jurisdiction, verification date, status, how many claims use
 * it, and a link to the original. Rendered from the generated source-public-index; the same
 * provenance graph that powers inline source chips and page references.
 */

import type { Metadata } from "next";

import { Badge, Card } from "@howtobaby/ui";

import { PageShell } from "@/components/PageShell";
import { STATUS_LABELS, verifiedLabel } from "@/features/evidence/labels";
import { knowledgeRepository } from "@/features/evidence/load";
import { SITE } from "@/site";

export const metadata: Metadata = { title: "Sources" };

export default async function Page() {
  const sources = await knowledgeRepository().listPublicSources();

  return (
    <PageShell eyebrow="Trust" title="Sources" lede="The registry of original authorities HowToBaby guidance is built from." printable>
      {sources.map((source) => (
        <Card key={source.sourceId} title={source.title} titleAs="h2" eyebrow={source.organization}>
          <div className="prose">
            <p className="muted">
              {source.jurisdiction === "US" ? "United States" : source.jurisdiction === "global" ? "Global" : source.jurisdiction} · {source.sourceType} · {verifiedLabel(source.lastVerifiedAt, "en")}
              {STATUS_LABELS.en[source.status] ? <> · <Badge status="caution">{STATUS_LABELS.en[source.status]}</Badge></> : null}
            </p>
            <p className="muted">
              {source.claimCount === 1 ? "Used by 1 published claim" : `Used by ${source.claimCount} published claims`}
            </p>
            <p>
              <a href={source.canonicalUrl} target="_blank" rel="noopener noreferrer">
                View original source<span aria-hidden="true"> ↗</span>
              </a>
            </p>
          </div>
        </Card>
      ))}
      <Card tone="2">
        <div className="prose">
          <p className="muted">Every record above is maintained as reviewed data in the public repository; this page is generated from it and is never edited by hand.</p>
          <p><a href={SITE.sourceCodeUrl} rel="noopener">Browse the repository</a></p>
        </div>
      </Card>
    </PageShell>
  );
}
