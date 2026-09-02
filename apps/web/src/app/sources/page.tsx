// SPDX-License-Identifier: AGPL-3.0-only
/**
 * /sources trust surface (docs/EVIDENCE_PROVENANCE.md §9): the actual source registry the product
 * uses — organization, exact title, jurisdiction, verification date, status, how many claims use
 * it, and a link to the original. Rendered from the generated source-public-index; the same
 * provenance graph that powers inline source chips and page references.
 *
 * The whole page follows the ONE global language preference: rows localize through the shared
 * presenter (LocalizedSourceRegistry), page prose through the app dictionary. Exact source
 * titles, organization names and URLs stay verbatim.
 */

import type { Metadata } from "next";

import { Card } from "@howtobaby/ui";

import { ExternalLink } from "@/components/ExternalLink";
import { PageShell } from "@/components/PageShell";
import { LocalizedSourceRegistry } from "@/features/evidence/LocalizedSourceRegistry";
import { knowledgeRepository } from "@/features/evidence/load";
import { T } from "@/i18n/T";
import { SITE } from "@/site";

export const metadata: Metadata = { title: "Sources" };

export default async function Page() {
  const sources = await knowledgeRepository().listPublicSources();

  return (
    <PageShell eyebrow={<T id="trust.eyebrow" />} title={<T id="trust.sources.label" />} lede={<T id="page.sources.lede" />} printable>
      <LocalizedSourceRegistry sources={sources} />
      <Card tone="2">
        <div className="prose">
          <p className="muted">
            <T id="sources.generatedNote" />
          </p>
          <p>
            <ExternalLink href={SITE.sourceCodeUrl}>
              <T id="sources.browseRepository" />
            </ExternalLink>
          </p>
        </div>
      </Card>
    </PageShell>
  );
}
