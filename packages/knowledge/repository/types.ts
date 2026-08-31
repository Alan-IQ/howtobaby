// SPDX-License-Identifier: AGPL-3.0-only
/**
 * KnowledgeRepository — the read-model boundary from docs/SYSTEM_ARCHITECTURE.md §5.1.
 *
 * Domain/application code must not assume canonical knowledge is read directly from YAML files;
 * it queries one of these implementations instead:
 *   - GeneratedKnowledgeRepository (./generated.ts) — JSON manifests, used by build-time rendering;
 *   - SQLiteKnowledgeRepository (./sqlite.ts) — knowledge.sqlite, used by build scripts,
 *     validation, reports and Evidence Watch impact queries.
 *
 * No implementation is ever the canonical authoring source: delete all derived stores, rebuild
 * from Git-tracked YAML, and an equivalent projection must come back.
 */

import type {
  ClaimEvidenceEntry,
  CompiledClaim,
  PublicSourceEntry,
  RouteEvidenceEntry,
} from "../src/compile.ts";
import type { ContentVersionRecord, GuidanceBlock, Locale, SourceRecord } from "../src/schemas/types.ts";

export type ClaimId = string;
export type SourceId = string;

export interface GuidanceQuery {
  domain?: string;
  stage?: string;
  route?: string;
}

/** Result of the source → claim → route/tool reverse-dependency lookup (Evidence Watch impact). */
export interface SourceImpact {
  sourceId: SourceId;
  claimIds: ClaimId[];
  routes: string[];
  toolIds: string[];
}

export interface KnowledgeRepository {
  getClaim(id: ClaimId): Promise<CompiledClaim | null>;
  getSource(id: SourceId): Promise<SourceRecord | null>;
  findGuidance(query: GuidanceQuery): Promise<GuidanceBlock[]>;
  findClaimsBySource(sourceId: SourceId): Promise<CompiledClaim[]>;

  /** Everything the evidence UI needs for one claim (chips, drawer, evidence detail page). */
  getClaimEvidence(id: ClaimId): Promise<ClaimEvidenceEntry | null>;
  /** All published claim-evidence entries (evidence detail static params, audits). */
  listClaimEvidence(): Promise<ClaimEvidenceEntry[]>;
  /** Deduplicated claims/sources rendered on a route (page References, print citations). */
  getRouteEvidence(route: string): Promise<RouteEvidenceEntry | null>;
  /** source → dependent claims → affected routes/tools. */
  getSourceImpact(sourceId: SourceId): Promise<SourceImpact>;
  /** Public trust-surface source registry (/sources). */
  listPublicSources(): Promise<PublicSourceEntry[]>;
  /** Resolve one translated string; EN is canonical, VI is parity-validated. */
  getText(locale: Locale, key: string): Promise<string | null>;
  getContentVersion(): Promise<ContentVersionRecord>;
}
