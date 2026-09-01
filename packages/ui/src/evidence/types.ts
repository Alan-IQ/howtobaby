// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Presentational view models for the evidence primitives (docs/GUI_DESIGN.md §11).
 *
 * packages/ui receives structured, pre-localized display data and renders it; it never resolves
 * claims, decides medical applicability, or reaches into the knowledge graph. apps/web maps
 * canonical provenance (via KnowledgeRepository) into these shapes — the one canonical graph
 * stays the only citation source.
 */

import type { IconName } from "../primitives/Icon.tsx";

/**
 * One labeled metadata row for a source (e.g. label "Applies to", value "United States").
 * Labels are explicit so the drawer never shows bare values like "United States" whose meaning
 * the reader has to guess; every row is caller-localized and derived from canonical metadata.
 * The optional icon is a decorative visual anchor — never the only signal (label text carries
 * the meaning).
 */
export interface EvidenceMetaEntry {
  label: string;
  value: string;
  icon?: IconName;
}

/** One supporting source as shown in the EvidenceDrawer (EVIDENCE_PROVENANCE.md §6 Layer B). */
export interface EvidenceSourceView {
  sourceId: string;
  organization: string;
  title: string;
  /** Localized relationship value rendered as a compact role badge, e.g. "Primary source". */
  relationshipLabel: string;
  /**
   * Localized public status rendered as a compact badge — present only for a NON-current source
   * (reviewing an update, superseded, retired, temporarily unavailable). A healthy `current`
   * source carries no badge: its trust information is the source-date and verification rows.
   */
  statusLabel?: string;
  /** "attention" uses the caution tint for non-current states; never the only signal. */
  statusTone?: "calm" | "attention";
  /**
   * Labeled metadata rows in display order (relevant section, applies-to/scope, source
   * publication/version rows, last verified by HowToBaby) — all caller-localized and derived from canonical
   * metadata upstream.
   */
  meta: EvidenceMetaEntry[];
  /** Localized heading for the secondary "Why this source is used" block. */
  whyLabel?: string;
  /** Why the source is used, derived from canonical relationship metadata upstream. */
  whyText?: string;
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
  /**
   * Source publication/version metadata as one compact line ("Published: … · Updated: …",
   * "Published: …" or "Current source version: …") — omitted when the authority records no date.
   */
  sourceDateLabel?: string;
  verifiedLabel: string;
  url: string;
  /** Public status for a NON-current source only; a healthy `current` source shows none. */
  statusLabel?: string;
}
