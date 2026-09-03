// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Canonical knowledge-graph types.
 *
 * These mirror the contracts in docs/EVIDENCE_PROVENANCE.md (SourceRecord, ClaimSourceRef,
 * SourceLocator) and docs/GUIDANCE_CONTENT_CONTRACT.md (Claim, guidance/precision/safety/review
 * classes). The docs own the meaning; this module owns the machine-checkable shape.
 *
 * Authoring stays in Git-tracked YAML under packages/knowledge/src/**; everything importing these
 * types works on a loaded projection of that canonical data, never on a competing store.
 */

// ---------------------------------------------------------------------------------------------
// Sources (EVIDENCE_PROVENANCE.md §2)
// ---------------------------------------------------------------------------------------------

export const SOURCE_STATUSES = [
  "current",
  "changed-review-required",
  "superseded",
  "retired",
  "temporarily-unreachable",
] as const;
export type SourceStatus = (typeof SOURCE_STATUSES)[number];

export const SOURCE_ACCESS_MODES = [
  "link-only",
  "monitor-only",
  "approved-syndication",
  "public-domain-or-compatible-reuse",
] as const;
export type SourceAccessMode = (typeof SOURCE_ACCESS_MODES)[number];

/**
 * Machine-checkable editorial approval boundary (EVIDENCE_PROVENANCE.md §2/§4).
 * Only an `approved-primary` source may carry a `primary`/`direct-support` relationship, and only
 * inside its `approvedScopes` — declaring `relationship: primary` can never promote an unapproved
 * source (blog, retailer, manufacturer, influencer, …) into a canonical primary health source.
 */
export const SOURCE_APPROVAL_LEVELS = ["approved-primary", "approved-supporting", "unapproved"] as const;
export type SourceApprovalLevel = (typeof SOURCE_APPROVAL_LEVELS)[number];

/**
 * Who actually performed a verification/review (CLAUDE.md §5, GUIDANCE_CONTENT_CONTRACT.md §14).
 *
 * `lastVerifiedAt`/`reviewedAt` say WHEN; this says WHO, so an AI-assisted authoring pass can
 * never read as a maintainer or clinician having signed the record off. AI may assist retrieval,
 * drafting and translation, so `ai-assisted` is a legitimate recorded state — it is simply not
 * allowed to occupy the states that assert human clinical review (see validate.ts, category
 * `review`).
 */
export const REVIEW_ACTORS = ["maintainer", "ai-assisted"] as const;
export type ReviewActor = (typeof REVIEW_ACTORS)[number];

/** Review states that assert a human clinician actually reviewed the claim. */
export const CLINICIAN_ASSERTING_STATUSES = ["clinically-reviewed", "release-approved"] as const;

export interface SourceRecord {
  id: string;
  organization: string;
  title: string;
  canonicalUrl: string;
  jurisdiction: "US" | "global" | string;
  sourceType: string;
  publishedAt?: string;
  updatedAt?: string;
  lastVerifiedAt: string;
  /** Who performed the `lastVerifiedAt` verification — never inferred, always recorded. */
  verifiedBy: ReviewActor;
  nextReviewAt?: string;
  status: SourceStatus;
  supersededBy?: string;
  accessMode: SourceAccessMode;
  /** Editorial approval tier; validation gates primary/direct-support usage on it. */
  approvalLevel: SourceApprovalLevel;
  /** Knowledge domains this source is approved to support (required for approved tiers). */
  approvedScopes?: KnowledgeDomain[];
  notes?: string;
}

// ---------------------------------------------------------------------------------------------
// Claim-to-source relationship (EVIDENCE_PROVENANCE.md §3)
// ---------------------------------------------------------------------------------------------

export const SOURCE_RELATIONSHIPS = [
  "primary",
  "direct-support",
  "corroborating",
  "contextual",
  "conflicting",
] as const;
export type SourceRelationship = (typeof SOURCE_RELATIONSHIPS)[number];

/** Relationships that count as approved direct/primary support for `official-guidance`. */
export const DIRECT_SUPPORT_RELATIONSHIPS: readonly SourceRelationship[] = ["primary", "direct-support"];

export interface SourceLocator {
  heading?: string;
  section?: string;
  anchor?: string;
  page?: number;
  table?: string;
  figure?: string;
  paragraphHint?: string;
  sourceVersionHint?: string;
}

export interface ClaimSourceRef {
  sourceId: string;
  relationship: SourceRelationship;
  locator?: SourceLocator;
  supportNoteKey?: string;
  verifiedAt: string;
}

// ---------------------------------------------------------------------------------------------
// Claims (GUIDANCE_CONTENT_CONTRACT.md §1/§6/§9)
// ---------------------------------------------------------------------------------------------

export const GUIDANCE_CLASSES = [
  "official-guidance",
  "evidence-synthesis",
  "typical-pattern",
  "example-plan",
  "practical-interpretation",
  "product-heuristic",
] as const;
export type GuidanceClass = (typeof GUIDANCE_CLASSES)[number];

export const PRECISION_CLASSES = ["source-exact", "source-approximate", "source-range", "product-heuristic"] as const;
export type PrecisionClass = (typeof PRECISION_CLASSES)[number];

export const SAFETY_LEVELS = ["info", "caution", "clinician", "urgent", "emergency"] as const;
export type SafetyLevel = (typeof SAFETY_LEVELS)[number];

export const REVIEW_STATUSES = [
  "draft",
  "source-verified",
  "clinical-review-required",
  "clinically-reviewed",
  "release-approved",
  "superseded",
] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

/** Review states in which a claim counts as source-reviewed (urgent/emergency wording gate). */
export const SOURCE_REVIEWED_STATUSES: readonly ReviewStatus[] = [
  "source-verified",
  "clinically-reviewed",
  "release-approved",
];

/**
 * Review states eligible to render on public guidance routes. Enforced as a build/validation gate
 * (validate.ts `unreleased-claim-rendered`), never merely as a UI filter: a draft /
 * clinical-review-required / superseded claim attached to any GuidanceBlock fails the build even
 * when the claim is absent from the coverage matrix.
 */
export const RELEASE_ELIGIBLE_STATUSES: readonly ReviewStatus[] = SOURCE_REVIEWED_STATUSES;

/** Ordering for minimum-review-status comparisons; `superseded` never satisfies any minimum. */
export const REVIEW_STATUS_RANK: Record<ReviewStatus, number> = {
  superseded: -1,
  draft: 0,
  "clinical-review-required": 1,
  "source-verified": 2,
  "clinically-reviewed": 3,
  "release-approved": 4,
};

export interface Claim {
  id: string;
  /** Translation key resolving the parent-facing claim text in every locale. */
  textKey: string;
  /** Stable public slug for the /evidence/... trust route (EVIDENCE_PROVENANCE.md §8). */
  publicSlug: string;
  guidanceClass: GuidanceClass;
  precisionClass: PrecisionClass;
  safetyLevel: SafetyLevel;
  sourceRefs: ClaimSourceRef[];
  applicability?: string[];
  exclusions?: string[];
  uncertaintyNoteKey?: string;
  reviewedAt: string;
  reviewStatus: ReviewStatus;
  /** Who performed the review recorded by `reviewStatus`/`reviewedAt`. */
  reviewedBy: ReviewActor;
}

// ---------------------------------------------------------------------------------------------
// Guidance blocks (GUIDANCE_CONTENT_CONTRACT.md §1; route mapping feeds route-evidence index)
// ---------------------------------------------------------------------------------------------

export const KNOWLEDGE_DOMAINS = ["feeding", "development", "sleep", "safety"] as const;
export type KnowledgeDomain = (typeof KNOWLEDGE_DOMAINS)[number];

export interface GuidanceBlock {
  id: string;
  domain: KnowledgeDomain;
  /** Stage bin from GUIDANCE_CONTENT_CONTRACT.md §3–§5 (e.g. `feed-06-08m`); optional for cross-stage blocks. */
  stage?: string;
  titleKey: string;
  /**
   * Stable kebab-case section id within the stage (GUIDANCE_CONTENT_CONTRACT.md §3 required
   * sections, e.g. `gross-motor`); it matches the coverage-matrix section id so a stage page can
   * order and group its blocks by section instead of by block id. Optional for cross-stage blocks.
   */
  section?: string;
  /** Claims rendered by this block, in presentation order. */
  claimIds: string[];
  /** App routes on which this block renders; the route-evidence index derives from this mapping. */
  routes: string[];
}

// ---------------------------------------------------------------------------------------------
// Translations (GUIDANCE_CONTENT_CONTRACT.md §10 — EN canonical, VI semantic parity)
// ---------------------------------------------------------------------------------------------

export const LOCALES = ["en", "vi"] as const;
export type Locale = (typeof LOCALES)[number];
export const CANONICAL_LOCALE: Locale = "en";

/** One authored translation file: a flat key → string bundle for a single locale. */
export interface TranslationBundle {
  locale: Locale;
  strings: Record<string, string>;
}

// ---------------------------------------------------------------------------------------------
// Tool evidence links (TOOL_PLATFORM.md §3/§7 — knowledge side only records claim dependencies)
// ---------------------------------------------------------------------------------------------

export const TOOL_CLASSES = ["utility", "guidance-linked", "safety-sensitive"] as const;
export type ToolClass = (typeof TOOL_CLASSES)[number];

export const TOOL_LIFECYCLES = ["fixture", "planned", "released"] as const;
export type ToolLifecycle = (typeof TOOL_LIFECYCLES)[number];

/**
 * Canonical record of a tool's guidance/safety claim dependencies. The runtime ToolDefinition
 * (packages/tool-platform) references these claim IDs; it never duplicates medical prose or
 * source URLs (CLAUDE.md §8). `lifecycle: "fixture"` marks architecture-proof records that must
 * never ship as product tools.
 */
export interface ToolEvidenceRecord {
  id: string;
  title: string;
  toolClass: ToolClass;
  lifecycle: ToolLifecycle;
  guidanceClaimIds?: string[];
  safetyClaimIds?: string[];
}

// ---------------------------------------------------------------------------------------------
// Coverage matrix framework (GUIDANCE_CONTENT_CONTRACT.md §11)
// ---------------------------------------------------------------------------------------------

/**
 * One required content section inside a coverage cell. The full coverage contract is
 * stage × domain × required section × required locales (EN/VI) × source coverage × review status
 * (GUIDANCE_CONTENT_CONTRACT.md §11).
 */
export interface CoverageSectionRequirement {
  /** Stable kebab-case section id within the cell, e.g. `solids-introduction`. */
  section: string;
  requiredClaimIds: string[];
  /** Minimum review status every required claim must reach (default `source-verified`). */
  minimumReviewStatus?: ReviewStatus;
  /** Locales that must carry each required claim's text (default: every supported locale). */
  requiredLocales?: Locale[];
  /** Require at least one approved primary/direct source covering the cell's domain. */
  requireApprovedPrimarySource?: boolean;
}

/** One stage × domain coverage cell: the sections a stage must ship with. */
export interface CoverageCell {
  domain: KnowledgeDomain;
  stage: string;
  sections: CoverageSectionRequirement[];
}

export interface CoverageMatrix {
  cells: CoverageCell[];
}

// ---------------------------------------------------------------------------------------------
// Content release metadata (SYSTEM_ARCHITECTURE.md §11)
// ---------------------------------------------------------------------------------------------

/** Deterministic content-version record (volatile builtAt/gitSha live in build-info.json instead). */
export interface ContentVersionRecord {
  contentVersion: string;
  sourceRegistryVersion: string;
  localeVersions: Record<string, string>;
}
