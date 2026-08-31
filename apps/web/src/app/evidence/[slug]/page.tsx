// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Evidence detail route (docs/EVIDENCE_PROVENANCE.md §8, docs/GUI_DESIGN.md §11.5): a trust/audit
 * surface for one claim — its EN/VI text, classification, applicability, source relationships,
 * locators, review state and original-source links. It renders canonical data via the knowledge
 * read model and is never edited independently.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Badge, Card, ReferenceList } from "@howtobaby/ui";

import { PageShell } from "@/components/PageShell";
import { GUIDANCE_CLASS_LABELS, UI_STRINGS, formatDate } from "@/features/evidence/labels";
import { L } from "@/i18n/L";
import { evidenceSourceViews, knowledgeRepository, referenceEntryForSource } from "@/features/evidence/load";

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

const REVIEW_STATUS_LABELS: Record<string, string> = {
  draft: "Draft — not published guidance",
  "source-verified": "Source-verified",
  "clinical-review-required": "Awaiting clinical review",
  "clinically-reviewed": "Clinically reviewed",
  "release-approved": "Release-approved",
  superseded: "Superseded",
};

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const repo = knowledgeRepository();
  const entries = await repo.listClaimEvidence();
  const evidence = entries.find((entry) => entry.publicSlug === slug);
  if (!evidence) notFound();

  const [enText, viText, sources] = await Promise.all([
    repo.getText("en", evidence.textKey),
    repo.getText("vi", evidence.textKey),
    evidenceSourceViews(evidence, "en"),
  ]);
  const impactSources = await Promise.all(evidence.sourceRefs.map((ref) => repo.getSource(ref.sourceId)));
  const references = impactSources.filter((record) => record !== null).map((record) => referenceEntryForSource(record, "en"));

  return (
    <PageShell
      eyebrow={<L en="Evidence" vi="Bằng chứng" />}
      title={`Evidence: ${evidence.claimId}`}
      lede={<L en="What this claim says, which original sources support it, and when it was last verified." vi="Nội dung của nhận định này, những nguồn gốc nào hỗ trợ nó, và lần kiểm chứng gần nhất." />}
      printable
    >
      <Card icon="document" title={<L en="Claim" vi="Nhận định" />} titleAs="h2">
        <div className="prose">
          <p>{enText}</p>
          <p lang="vi" className="muted">{viText}</p>
          <p>
            <Badge>{GUIDANCE_CLASS_LABELS.en[evidence.guidanceClass as keyof (typeof GUIDANCE_CLASS_LABELS)["en"]] ?? evidence.guidanceClass}</Badge>{" "}
            <Badge>{evidence.precisionClass}</Badge> <Badge status={evidence.safetyLevel as "info"}>{evidence.safetyLevel}</Badge>
          </p>
          <p className="muted">
            {REVIEW_STATUS_LABELS[evidence.reviewStatus] ?? evidence.reviewStatus} · Reviewed {formatDate(evidence.reviewedAt, "en")} · Domain: {evidence.domain}
          </p>
        </div>
      </Card>
      <Card icon="globe" title={<L en="Supporting sources" vi="Nguồn hỗ trợ" />} titleAs="h2">
        <div className="prose">
          {sources.map((source, index) => {
            const record = impactSources[index];
            return (
              <p key={source.sourceId}>
                <strong>{source.organization}</strong> — {source.title}
                <br />
                {UI_STRINGS.en.metaRole}: {source.relationshipLabel} · {UI_STRINGS.en.metaStatus}: {source.statusLabel}
                <br />
                <span className="muted">
                  {source.meta.map((entry) => `${entry.label}: ${entry.value}`).join(" · ")}
                  {record?.updatedAt ? <> · Source updated {formatDate(record.updatedAt, "en")}</> : null}
                </span>
              </p>
            );
          })}
          <p className="muted">{UI_STRINGS.en.disclaimer} HowToBaby summarizes and interprets; the original wording belongs to the source.</p>
        </div>
      </Card>
      <ReferenceList title={<L en="Original sources" vi="Nguồn gốc" />} entries={references} />
    </PageShell>
  );
}
