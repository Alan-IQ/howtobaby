// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Presentational view models for the evidence primitives (docs/GUI_DESIGN.md §11).
 *
 * packages/ui receives structured, pre-localized display data and renders it; it never resolves
 * claims, decides medical applicability, or reaches into the knowledge graph. apps/web maps
 * canonical provenance (via KnowledgeRepository) into these shapes — the one canonical graph
 * stays the only citation source.
 */

/** One supporting source as shown in the EvidenceDrawer (EVIDENCE_PROVENANCE.md §6 Layer B). */
export interface EvidenceSourceView {
  sourceId: string;
  organization: string;
  title: string;
  /** Localized relationship label, e.g. "Primary source" / "Corroborating". */
  relationshipLabel: string;
  /** Localized locator hint, e.g. "Section: Complementary feeding". */
  locatorLabel?: string;
  /** Localized jurisdiction/context label, e.g. "United States" / "Global (WHO)". */
  jurisdictionLabel?: string;
  /** Calm freshness signal, e.g. "Verified Aug 31, 2026" (EVIDENCE_PROVENANCE.md §14). */
  verifiedLabel: string;
  /** Present only when the state needs surfacing, e.g. "Reviewing an update". */
  statusLabel?: string;
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
