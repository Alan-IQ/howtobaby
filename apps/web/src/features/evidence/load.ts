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

import { SUPPORTED_LOCALES } from "@howtobaby/i18n";

import {
  GUIDANCE_CLASS_LABELS,
  PRECISION_CLASS_LABELS,
  REVIEW_STATUS_LABELS,
  SAFETY_LEVEL_LABELS,
  RELATIONSHIP_LABELS,
  RELATIONSHIP_WHY_LABELS,
  STATUS_LABELS,
  UI_STRINGS,
  formatDate,
  jurisdictionMeta,
  sourceStatusTone,
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
 * explicit label with a small decorative icon anchor ("Relevant section", "Applies to"/"Scope",
 * "Last verified by HowToBaby") and every value derives from canonical metadata. Role and status
 * render as badges, and "why this source is used" is its own secondary block — all fed from the
 * same canonical graph, never prose hard-coded in a component.
 */
function sourceMetaRows(ref: ClaimEvidenceEntry["sourceRefs"][number], source: SourceRecord, locale: UiLocale): EvidenceMetaEntry[] {
  const strings = UI_STRINGS[locale];
  const meta: EvidenceMetaEntry[] = [];
  const section = relevantSectionValue(ref, locale);
  if (section !== undefined) meta.push({ label: strings.metaRelevantSection, value: section, icon: "document" });
  meta.push({ ...jurisdictionMeta(source, locale), icon: "globe" });
  meta.push({ label: strings.metaLastVerified, value: formatDate(source.lastVerifiedAt, locale), icon: "calendar" });
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
      statusLabel: STATUS_LABELS[locale][source.status],
      statusTone: sourceStatusTone(source.status),
      meta: sourceMetaRows(ref, source, locale),
      whyLabel: UI_STRINGS[locale].metaWhy,
      whyText: RELATIONSHIP_WHY_LABELS[locale][ref.relationship],
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

/* ---------- Evidence detail (localized per registered locale) ---------- */

/** One supporting-source line on the evidence detail page, fully localized. */
export interface EvidenceDetailSourceView {
  sourceId: string;
  organization: string;
  /** Exact original source title — never translated. */
  title: string;
  /** "Role in this guidance: … · Source status: …". */
  roleStatusLine: string;
  /** Joined labeled metadata rows ("Relevant section: … · Applies to: … · Last verified …"). */
  metaLine: string;
  /** "Source updated <date>", when the source records an update date. */
  sourceUpdatedText?: string;
}

/** The evidence detail trust surface for one claim, localized for one registered locale. */
export interface EvidenceDetailView {
  locale: UiLocale;
  classLabel: string;
  precisionLabel: string;
  safetyLabel: string;
  safetyLevel: string;
  /** "<review status> · Reviewed <date> · Domain: <canonical id>". */
  reviewLine: string;
  sources: EvidenceDetailSourceView[];
  /** No-endorsement disclaimer plus the original-wording note. */
  disclaimerLine: string;
  references: ReferenceEntry[];
}

/**
 * Build the evidence detail view for EVERY registered locale from one claim's provenance —
 * the page then follows the global language with no hard-coded `"en"` presentation anywhere.
 * Canonical identifiers (claim id, domain id) stay verbatim; their labels localize.
 */
export async function loadEvidenceDetailViews(evidence: ClaimEvidenceEntry): Promise<Record<UiLocale, EvidenceDetailView>> {
  const repo = knowledgeRepository();
  const records = await Promise.all(evidence.sourceRefs.map((ref) => repo.getSource(ref.sourceId)));
  const views = {} as Record<UiLocale, EvidenceDetailView>;
  for (const { id: locale } of SUPPORTED_LOCALES) {
    const strings = UI_STRINGS[locale];
    const sources = await evidenceSourceViews(evidence, locale);
    views[locale] = {
      locale,
      classLabel: GUIDANCE_CLASS_LABELS[locale][evidence.guidanceClass as keyof (typeof GUIDANCE_CLASS_LABELS)["en"]] ?? evidence.guidanceClass,
      precisionLabel: PRECISION_CLASS_LABELS[locale][evidence.precisionClass] ?? evidence.precisionClass,
      safetyLabel: SAFETY_LEVEL_LABELS[locale][evidence.safetyLevel] ?? evidence.safetyLevel,
      safetyLevel: evidence.safetyLevel,
      reviewLine: `${REVIEW_STATUS_LABELS[locale][evidence.reviewStatus] ?? evidence.reviewStatus} · ${strings.reviewedOn} ${formatDate(evidence.reviewedAt, locale)} · ${strings.domainLabel}: ${evidence.domain}`,
      sources: sources.map((source, index) => {
        const record = records[index];
        return {
          sourceId: source.sourceId,
          organization: source.organization,
          title: source.title,
          roleStatusLine: `${strings.metaRole}: ${source.relationshipLabel} · ${strings.metaStatus}: ${source.statusLabel}`,
          metaLine: source.meta.map((entry) => `${entry.label}: ${entry.value}`).join(" · "),
          ...(record?.updatedAt ? { sourceUpdatedText: `${strings.sourceUpdated} ${formatDate(record.updatedAt, locale)}` } : {}),
        };
      }),
      disclaimerLine: `${strings.disclaimer} ${strings.wordingNote}`,
      references: records.filter((record) => record !== null).map((record) => referenceEntryForSource(record, locale)),
    };
  }
  return views;
}

export type { SourceRecord };
