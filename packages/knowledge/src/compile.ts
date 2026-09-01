// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Compiles the loaded canonical graph into the derived read models described by
 * docs/SYSTEM_ARCHITECTURE.md §5 and docs/EVIDENCE_PROVENANCE.md §17:
 * manifests, the four reverse evidence indexes, the public source index, and the
 * deterministic content version.
 *
 * Everything here is a pure function of the canonical YAML: same input bytes → same output bytes.
 * Collections are already ID-sorted by the loader; this module additionally serializes JSON with
 * sorted object keys so the generated artifacts are byte-stable across rebuilds and platforms.
 */

import { createHash } from "node:crypto";

import type { CanonicalKnowledge } from "./loader.ts";
import {
  type Claim,
  type ClaimSourceRef,
  type ContentVersionRecord,
  type GuidanceBlock,
  type KnowledgeDomain,
  type SourceRecord,
  type SourceStatus,
  type ToolEvidenceRecord,
} from "./schemas/types.ts";

// --- Derived shapes ----------------------------------------------------------------------------

export interface CompiledClaim extends Claim {
  domain: KnowledgeDomain;
}

/** claim-evidence-index.json: claimId → everything evidence UI needs for that claim. */
export interface ClaimEvidenceEntry {
  claimId: string;
  domain: KnowledgeDomain;
  publicSlug: string;
  textKey: string;
  guidanceClass: string;
  precisionClass: string;
  safetyLevel: string;
  reviewStatus: string;
  reviewedAt: string;
  /**
   * Source-lifecycle propagation (EVIDENCE_PROVENANCE.md §14/§16): true when any supporting
   * source is `changed-review-required`, so surfaces can show a calm "reviewing an update"
   * signal instead of presenting the support as fully current.
   */
  sourceReviewPending: boolean;
  uncertaintyNoteKey?: string;
  sourceRefs: ClaimSourceRef[];
}

/** route-evidence-index.json: route → the claims/sources actually rendered on it. */
export interface RouteEvidenceEntry {
  route: string;
  claimIds: string[];
  sourceIds: string[];
}

/** tool-evidence-index.json: toolId → the claims/sources the tool depends on. */
export interface ToolEvidenceEntry {
  toolId: string;
  toolClass: string;
  lifecycle: string;
  claimIds: string[];
  sourceIds: string[];
}

/** Public trust-surface projection of a source (no internal workflow noise). */
export interface PublicSourceEntry {
  sourceId: string;
  organization: string;
  title: string;
  canonicalUrl: string;
  jurisdiction: string;
  sourceType: string;
  status: SourceStatus;
  /**
   * Source-version dates as the authority states them (EVIDENCE_PROVENANCE.md §2/§14):
   * `publishedAt` = publication date, `updatedAt` = the source's current revision/update date.
   * They are DIFFERENT upstream facts, copied verbatim from the canonical record and never derived
   * from each other (even when equal); public surfaces present them through one conditional matrix
   * (Published + Updated / Published / Current source version / omitted — never an invented date).
   * Both are distinct from `lastVerifiedAt`, which is HowToBaby's own verification date.
   */
  publishedAt?: string;
  updatedAt?: string;
  lastVerifiedAt: string;
  claimCount: number;
}

export interface CompiledKnowledge {
  contentVersion: ContentVersionRecord;
  sources: SourceRecord[];
  claims: CompiledClaim[];
  guidance: GuidanceBlock[];
  translations: Record<string, Record<string, string>>;
  tools: ToolEvidenceRecord[];
  claimEvidence: ClaimEvidenceEntry[];
  sourceClaims: Array<{ sourceId: string; claimIds: string[] }>;
  routeEvidence: RouteEvidenceEntry[];
  toolEvidence: ToolEvidenceEntry[];
  publicSources: PublicSourceEntry[];
}

// --- Deterministic serialization ---------------------------------------------------------------

/** JSON.stringify with recursively sorted object keys — the byte-stability contract for generated files. */
export function stableStringify(value: unknown): string {
  return `${JSON.stringify(sortValue(value), null, 2)}\n`;
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue);
  if (typeof value === "object" && value !== null) {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      const v = (value as Record<string, unknown>)[key];
      if (v !== undefined) sorted[key] = sortValue(v);
    }
    return sorted;
  }
  return value;
}

function sha256(parts: Iterable<Buffer | string>): string {
  const hash = createHash("sha256");
  for (const part of parts) hash.update(part);
  return hash.digest("hex");
}

/** Content version = hash of every canonical byte, keyed by path, so any authored change moves it. */
function computeContentVersion(knowledge: CanonicalKnowledge): ContentVersionRecord {
  const paths = [...knowledge.files.keys()].sort();
  const all: Array<Buffer | string> = [];
  const registry: Array<Buffer | string> = [];
  const perLocale = new Map<string, Array<Buffer | string>>();
  for (const path of paths) {
    const bytes = knowledge.files.get(path)!;
    all.push(`${path}\0`, bytes, "\0");
    if (path.startsWith("sources/")) registry.push(`${path}\0`, bytes, "\0");
    const localeMatch = /^translations\/([a-z]{2})\//.exec(path);
    if (localeMatch) {
      const list = perLocale.get(localeMatch[1]!) ?? [];
      list.push(`${path}\0`, bytes, "\0");
      perLocale.set(localeMatch[1]!, list);
    }
  }
  const localeVersions: Record<string, string> = {};
  for (const locale of [...perLocale.keys()].sort()) localeVersions[locale] = sha256(perLocale.get(locale)!).slice(0, 16);
  return {
    contentVersion: sha256(all).slice(0, 16),
    sourceRegistryVersion: sha256(registry).slice(0, 16),
    localeVersions,
  };
}

// --- Compilation -------------------------------------------------------------------------------

export function compileKnowledge(knowledge: CanonicalKnowledge): CompiledKnowledge {
  const claims: CompiledClaim[] = knowledge.claims.map(({ claim, domain }) => ({ ...claim, domain }));
  const claimById = new Map(claims.map((c) => [c.id, c]));
  const sourceById = new Map(knowledge.sources.map((s) => [s.id, s]));

  const claimEvidence: ClaimEvidenceEntry[] = claims.map((claim) => ({
    claimId: claim.id,
    domain: claim.domain,
    publicSlug: claim.publicSlug,
    textKey: claim.textKey,
    guidanceClass: claim.guidanceClass,
    precisionClass: claim.precisionClass,
    safetyLevel: claim.safetyLevel,
    reviewStatus: claim.reviewStatus,
    reviewedAt: claim.reviewedAt,
    sourceReviewPending: claim.sourceRefs.some((ref) => sourceById.get(ref.sourceId)?.status === "changed-review-required"),
    ...(claim.uncertaintyNoteKey !== undefined ? { uncertaintyNoteKey: claim.uncertaintyNoteKey } : {}),
    sourceRefs: claim.sourceRefs,
  }));

  // source → claims (reverse dependency graph reused later by Evidence Watch impact analysis).
  const sourceClaimMap = new Map<string, Set<string>>();
  for (const claim of claims) {
    for (const ref of claim.sourceRefs) {
      const set = sourceClaimMap.get(ref.sourceId) ?? new Set<string>();
      set.add(claim.id);
      sourceClaimMap.set(ref.sourceId, set);
    }
  }
  const sourceClaims = [...sourceClaimMap.keys()].sort().map((sourceId) => ({
    sourceId,
    claimIds: [...sourceClaimMap.get(sourceId)!].sort(),
  }));

  // route → claims → sources, derived from guidance-block route declarations.
  const routeClaimMap = new Map<string, Set<string>>();
  for (const block of knowledge.guidance) {
    for (const route of block.routes) {
      const set = routeClaimMap.get(route) ?? new Set<string>();
      for (const claimId of block.claimIds) set.add(claimId);
      routeClaimMap.set(route, set);
    }
  }
  const routeEvidence: RouteEvidenceEntry[] = [...routeClaimMap.keys()].sort().map((route) => {
    const claimIds = [...routeClaimMap.get(route)!].sort();
    const sourceIds = [...new Set(claimIds.flatMap((id) => claimById.get(id)?.sourceRefs.map((r) => r.sourceId) ?? []))].sort();
    return { route, claimIds, sourceIds };
  });

  // tool → claims → sources.
  const toolEvidence: ToolEvidenceEntry[] = knowledge.tools.map((tool) => {
    const claimIds = [...new Set([...(tool.guidanceClaimIds ?? []), ...(tool.safetyClaimIds ?? [])])].sort();
    const sourceIds = [...new Set(claimIds.flatMap((id) => claimById.get(id)?.sourceRefs.map((r) => r.sourceId) ?? []))].sort();
    return { toolId: tool.id, toolClass: tool.toolClass, lifecycle: tool.lifecycle, claimIds, sourceIds };
  });

  const publicSources: PublicSourceEntry[] = knowledge.sources.map((source) => ({
    sourceId: source.id,
    organization: source.organization,
    title: source.title,
    canonicalUrl: source.canonicalUrl,
    jurisdiction: source.jurisdiction,
    sourceType: source.sourceType,
    status: source.status,
    ...(source.publishedAt !== undefined ? { publishedAt: source.publishedAt } : {}),
    ...(source.updatedAt !== undefined ? { updatedAt: source.updatedAt } : {}),
    lastVerifiedAt: source.lastVerifiedAt,
    claimCount: sourceClaimMap.get(source.id)?.size ?? 0,
  }));

  return {
    contentVersion: computeContentVersion(knowledge),
    sources: knowledge.sources,
    claims,
    guidance: knowledge.guidance,
    translations: knowledge.translations,
    tools: knowledge.tools,
    claimEvidence,
    sourceClaims,
    routeEvidence,
    toolEvidence,
    publicSources,
  };
}

/** File map for the generated JSON artifacts (path under packages/knowledge/generated → content). */
export function generatedJsonArtifacts(compiled: CompiledKnowledge): Map<string, string> {
  return new Map<string, string>([
    ["content-manifest.json", stableStringify({
      contentVersion: compiled.contentVersion.contentVersion,
      claims: compiled.claims,
      guidance: compiled.guidance,
      translations: compiled.translations,
      coverageClaimCount: compiled.claims.length,
    })],
    ["source-manifest.json", stableStringify({ contentVersion: compiled.contentVersion.contentVersion, sources: compiled.sources })],
    ["evidence-manifest.json", stableStringify({ contentVersion: compiled.contentVersion.contentVersion, tools: compiled.tools })],
    ["claim-evidence-index.json", stableStringify(compiled.claimEvidence)],
    ["source-claim-index.json", stableStringify(compiled.sourceClaims)],
    ["route-evidence-index.json", stableStringify(compiled.routeEvidence)],
    ["tool-evidence-index.json", stableStringify(compiled.toolEvidence)],
    ["source-public-index.json", stableStringify(compiled.publicSources)],
    ["content-version.json", stableStringify(compiled.contentVersion)],
  ]);
}
