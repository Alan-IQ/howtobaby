// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Presentational view models for the evidence primitives (docs/GUI_DESIGN.md §11).
 *
 * packages/ui receives structured, pre-localized display data and renders it; it never resolves
 * claims, decides medical applicability, or reaches into the knowledge graph. apps/web maps
 * canonical provenance (via KnowledgeRepository) into these shapes — the one canonical graph
 * stays the only citation source.
 */

/**
 * One labeled metadata row for a source (e.g. label "Applies to", value "United States").
 * Labels are explicit so the drawer never shows bare values like "United States" whose meaning
 * the reader has to guess; every row is caller-localized, derived from canonical metadata.
 */
export interface EvidenceMetaEntry {
  label: string;
  value: string;
}

/** One supporting source as shown in the EvidenceDrawer (EVIDENCE_PROVENANCE.md §6 Layer B). */
export interface EvidenceSourceView {
  sourceId: string;
  organization: string;
  title: string;
  /** Localized relationship value, e.g. "Primary source" / "Corroborating source". */
  relationshipLabel: string;
  /**
   * Labeled metadata rows in display order: role in this guidance, relevant section,
   * applies-to/scope, source status (including "Current"), last verified by HowToBaby, and an
   * optional "Why this source is used" line — all derived from canonical metadata upstream.
   */
  meta: EvidenceMetaEntry[];
  /** Canonical original-source URL (never an affiliate/tracking redirect). */
  url: string;
  /** Concise HowToBaby interpretation/uncertainty note when needed. */
  noteText?: string;
}

/** Deduplicated page-references entry (EVIDENCE_PROVENANCE.md §6 Layer C). */
export interface ReferenceEntry {
  sourceId: string;
  organization: string;
  title: string;
  verifiedLabel: string;
  url: string;
  statusLabel?: string;
}
