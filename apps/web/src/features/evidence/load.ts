// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Build-time evidence loading for app routes.
 *
 * Server components call these helpers while prerendering; they resolve canonical data through the
 * GeneratedKnowledgeRepository (JSON read models built by `pnpm build:knowledge`) and map it into
 * the presentational view models that @howtobaby/ui evidence primitives accept. Chips, drawer,
 * page references and evidence detail all derive from the same claim-provenance graph — no page
 * declares a source by hand.
 */

import type { ClaimEvidenceEntry, SourceRecord } from "@howtobaby/knowledge";
import { GeneratedKnowledgeRepository } from "@howtobaby/knowledge/repository";
import type { EvidenceMetaEntry, EvidenceSourceView, ReferenceEntry } from "@howtobaby/ui";

import {
  GUIDANCE_CLASS_LABELS,
  RELATIONSHIP_LABELS,
  RELATIONSHIP_WHY_LABELS,
  STATUS_LABELS,
  UI_STRINGS,
  formatDate,
  jurisdictionMeta,
  verifiedLabel,
  type UiLocale,
} from "./labels";

let repository: GeneratedKnowledgeRepository | undefined;

export function knowledgeRepository(): GeneratedKnowledgeRepository {
  repository ??= new GeneratedKnowledgeRepository();
  return repository;
}

/** Value for the "Relevant section" row: heading/section plus page/table/figure specifics. */
function relevantSectionValue(entry: ClaimEvidenceEntry["sourceRefs"][number], locale: UiLocale): string | undefined {
  const locator = entry.locator;
  if (!locator) return undefined;
  const parts: string[] = [];
  if (locator.heading) parts.push(`“${locator.heading}”`);
  if (locator.section) parts.push(`“${locator.section}”`);
  if (locator.page !== undefined) parts.push(`${locale === "vi" ? "Trang" : "Page"} ${locator.page}`);
  if (locator.table) parts.push(`${locale === "vi" ? "Bảng" : "Table"} ${locator.table}`);
  if (locator.figure) parts.push(`${locale === "vi" ? "Hình" : "Figure"} ${locator.figure}`);
  return parts.length > 0 ? parts.join(" · ") : undefined;
}

/**
 * Labeled metadata rows for one source reference (GUI_DESIGN.md §11.3): every row carries an
 * explicit label ("Applies to", "Source status", "Last verified by HowToBaby", …) and every value
 * derives from canonical metadata — the "why" line comes from the canonical relationship, never
 * from prose hard-coded in a component.
 */
function sourceMetaRows(ref: ClaimEvidenceEntry["sourceRefs"][number], source: SourceRecord, locale: UiLocale): EvidenceMetaEntry[] {
  const strings = UI_STRINGS[locale];
  const meta: EvidenceMetaEntry[] = [{ label: strings.metaRole, value: RELATIONSHIP_LABELS[locale][ref.relationship] }];
  const section = relevantSectionValue(ref, locale);
  if (section !== undefined) meta.push({ label: strings.metaRelevantSection, value: section });
  meta.push(jurisdictionMeta(source, locale));
  meta.push({ label: strings.metaStatus, value: STATUS_LABELS[locale][source.status] });
  meta.push({ label: strings.metaLastVerified, value: formatDate(source.lastVerifiedAt, locale) });
  meta.push({ label: strings.metaWhy, value: RELATIONSHIP_WHY_LABELS[locale][ref.relationship] });
  return meta;
}

/** Map one claim's provenance into the EvidenceDrawer view model for a locale. */
export async function evidenceSourceViews(evidence: ClaimEvidenceEntry, locale: UiLocale): Promise<EvidenceSourceView[]> {
  const repo = knowledgeRepository();
  const views: EvidenceSourceView[] = [];
  for (const ref of evidence.sourceRefs) {
    const source = await repo.getSource(ref.sourceId);
    if (!source) continue; // validation gates guarantee resolution; never fabricate a source here
    const note = ref.supportNoteKey ? await repo.getText(locale, ref.supportNoteKey) : null;
    views.push({
      sourceId: source.id,
      organization: source.organization,
      title: source.title,
      relationshipLabel: RELATIONSHIP_LABELS[locale][ref.relationship],
      meta: sourceMetaRows(ref, source, locale),
      url: source.canonicalUrl,
      ...(note !== null && note !== undefined ? { noteText: note } : {}),
    });
  }
  return views;
}

/** ReferenceList entry for one source record (shared by route references and evidence detail). */
export function referenceEntryForSource(source: SourceRecord, locale: UiLocale): ReferenceEntry {
  return {
    sourceId: source.id,
    organization: source.organization,
    title: source.title,
    verifiedLabel: verifiedLabel(source.lastVerifiedAt, locale),
    url: source.canonicalUrl,
    statusLabel: STATUS_LABELS[locale][source.status],
  };
}

/** One claim rendered inside a guidance card, fully localized. */
export interface ClaimView {
  claimId: string;
  text: string;
  classLabel: string;
  organizations: string[];
  sources: EvidenceSourceView[];
  uncertaintyNote?: string;
}

/** One guidance block localized for rendering (title + claims + the drawer/chips strings). */
export interface GuidanceBlockView {
  blockId: string;
  locale: UiLocale;
  title: string;
  claims: ClaimView[];
  strings: (typeof UI_STRINGS)[UiLocale];
}

export async function loadGuidanceBlockViews(route: string, locale: UiLocale): Promise<GuidanceBlockView[]> {
  const repo = knowledgeRepository();
  const blocks = await repo.findGuidance({ route });
  const views: GuidanceBlockView[] = [];
  for (const block of blocks) {
    const title = (await repo.getText(locale, block.titleKey)) ?? (await repo.getText("en", block.titleKey)) ?? block.titleKey;
    const claims: ClaimView[] = [];
    for (const claimId of block.claimIds) {
      const evidence = await repo.getClaimEvidence(claimId);
      if (!evidence) continue;
      const text = (await repo.getText(locale, evidence.textKey)) ?? "";
      const uncertaintyNote = evidence.uncertaintyNoteKey ? await repo.getText(locale, evidence.uncertaintyNoteKey) : null;
      const sources = await evidenceSourceViews(evidence, locale);
      claims.push({
        claimId,
        text,
        classLabel: GUIDANCE_CLASS_LABELS[locale][evidence.guidanceClass as keyof (typeof GUIDANCE_CLASS_LABELS)["en"]] ?? evidence.guidanceClass,
        organizations: [...new Set(sources.map((s) => s.organization))],
        sources,
        ...(uncertaintyNote !== null && uncertaintyNote !== undefined ? { uncertaintyNote } : {}),
      });
    }
    views.push({ blockId: block.id, locale, title, claims, strings: UI_STRINGS[locale] });
  }
  return views;
}

/** Page-references entries for a route, derived from the route-evidence index (never page code). */
export async function loadReferenceEntries(route: string, locale: UiLocale): Promise<ReferenceEntry[]> {
  const repo = knowledgeRepository();
  const routeEvidence = await repo.getRouteEvidence(route);
  if (!routeEvidence) return [];
  const entries: ReferenceEntry[] = [];
  for (const sourceId of routeEvidence.sourceIds) {
    const source = await repo.getSource(sourceId);
    if (!source) continue;
    entries.push(referenceEntryForSource(source, locale));
  }
  return entries;
}

export type { SourceRecord };
