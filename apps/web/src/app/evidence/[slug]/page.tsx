// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Evidence detail route (docs/EVIDENCE_PROVENANCE.md §8, docs/GUI_DESIGN.md §11.5): a trust/audit
 * surface for one claim — its canonical text in every registered locale, classification,
 * applicability, source relationships, locators, review state and original-source links. It
 * renders canonical data via the knowledge read model and is never edited independently.
 *
 * The page follows the ONE global language preference: the view model is prerendered for every
 * registered locale (loadEvidenceDetailViews) and a client leaf picks the active one — no
 * hard-coded `"en"` presentation. Canonical identifiers (claim id, domain id) stay verbatim.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SUPPORTED_LOCALES, type AppLocale } from "@howtobaby/i18n";

import { PageShell } from "@/components/PageShell";
import { LocalizedEvidenceDetail } from "@/features/evidence/LocalizedEvidenceDetail";
import { knowledgeRepository, loadEvidenceDetailViews } from "@/features/evidence/load";
import { T } from "@/i18n/T";

interface Params {
  slug: string;
}

export const dynamicParams = false;

export async function generateStaticParams(): Promise<Params[]> {
  const entries = await knowledgeRepository().listClaimEvidence();
  return entries.map((entry) => ({ slug: entry.publicSlug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Evidence: ${slug}` };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const repo = knowledgeRepository();
  const entries = await repo.listClaimEvidence();
  const evidence = entries.find((entry) => entry.publicSlug === slug);
  if (!evidence) notFound();

  const views = await loadEvidenceDetailViews(evidence);
  const texts = {} as Record<AppLocale, string | null>;
  for (const { id } of SUPPORTED_LOCALES) texts[id] = await repo.getText(id, evidence.textKey);

  return (
    <PageShell
      eyebrow={<T id="page.evidence.eyebrow" />}
      title={
        <>
          <T id="page.evidence.eyebrow" />: {evidence.claimId}
        </>
      }
      lede={<T id="page.evidence.lede" />}
      printable
    >
      <LocalizedEvidenceDetail texts={texts} views={views} />
    </PageShell>
  );
}
