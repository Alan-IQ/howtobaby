// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Cross-record validation for the canonical knowledge graph.
 *
 * Implements the Phase 2 CI gates from docs/IMPLEMENTATION_ROADMAP.md and the build-time rules in
 * docs/EVIDENCE_PROVENANCE.md §16 / docs/GUIDANCE_CONTENT_CONTRACT.md §10–§11:
 *   - source IDs, relationships, locators and supersession chains resolve;
 *   - `official-guidance` requires an approved primary/direct source whose approved scope covers
 *     the claim's domain and whose status is still usable — `relationship: primary` alone can
 *     never promote an unapproved source into a canonical primary health source;
 *   - the public release gate: a claim rendered by any GuidanceBlock (and therefore on a public
 *     route) must be in a release-eligible review state — enforced here, not by UI filters, so a
 *     draft claim cannot ship by being attached to a block while omitted from the coverage matrix;
 *   - source lifecycle: a `changed-review-required` source propagates a review signal to every
 *     dependent claim (warning; error when a release-approved claim's support went stale);
 *   - precision classes cannot invent precision (qualifiers/ranges must appear in the text);
 *   - urgent/emergency wording requires a source-reviewed state;
 *   - EN is canonical and VI must keep semantic-critical parity: quantities in order, their
 *     units, boundary qualifiers (before/after/about), and negation;
 *   - the coverage matrix validates stage × domain × section × locales × source coverage ×
 *     review status;
 *   - locator hints stay concise paraphrased context, never long verbatim quotations;
 *   - tool claim references resolve and fixtures cannot ship.
 *
 * Every rule reports through IssueCollector so scripts/CI render one consistent report.
 */

import type { CanonicalKnowledge } from "./loader.ts";
import type { IssueCollector } from "./schemas/issues.ts";
import {
  CANONICAL_LOCALE,
  DIRECT_SUPPORT_RELATIONSHIPS,
  LOCALES,
  RELEASE_ELIGIBLE_STATUSES,
  REVIEW_STATUS_RANK,
  SOURCE_REVIEWED_STATUSES,
  type Claim,
  type KnowledgeDomain,
  type SourceRecord,
} from "./schemas/types.ts";

/** English approximation qualifiers that satisfy `source-approximate` (no invented precision). */
const EN_APPROXIMATION = /\b(about|around|approximately|roughly|typically|usually|when (?:developmentally )?ready|may)\b/i;
/** Vietnamese approximation qualifiers with the same semantic role. */
const VI_APPROXIMATION = /(khoảng|tầm|xấp xỉ|gần|thường|khi (?:bé |trẻ )?(?:đã )?sẵn sàng|có thể)/i;
/** English negation/prohibition markers whose meaning must survive translation. */
const EN_NEGATION = /\b(not recommended|do not|don't|never|avoid|no\b)/i;
const VI_NEGATION = /(không|đừng|tránh|chưa nên)/i;
/** A numeric range expression for `source-range` claims. */
const RANGE_EXPRESSION = /\d+\s*(?:–|—|-|to|through)\s*\d+/i;

/** Source statuses that keep a reference usable as support (superseded/retired are not). */
const USABLE_SOURCE_STATUSES = ["current", "changed-review-required", "temporarily-unreachable"] as const;

// ---------------------------------------------------------------------------------------------
// EN/VI semantic number tokens: value + unit + boundary qualifier, compared IN ORDER.
// Sorting all numbers and comparing sets would let "about 6 months … before 4 months" pass
// against a Vietnamese text that swapped the boundaries ("khoảng 4 tháng … trước 6 tháng").
// ---------------------------------------------------------------------------------------------

type BoundaryQualifier = "before" | "after" | "about";

interface NumberToken {
  value: string;
  unit?: string;
  qualifier?: BoundaryQualifier;
}

const UNIT_PATTERNS: Record<"en" | "vi", Array<[RegExp, string]>> = {
  en: [
    [/^months?\b/i, "month"],
    [/^weeks?\b/i, "week"],
    [/^days?\b/i, "day"],
    [/^years?\b/i, "year"],
    [/^hours?\b/i, "hour"],
    [/^minutes?\b/i, "minute"],
    [/^(?:milliliters?|ml)\b/i, "ml"],
    [/^(?:ounces?|oz)\b/i, "oz"],
  ],
  vi: [
    [/^tháng\b/i, "month"],
    [/^tuần\b/i, "week"],
    [/^ngày\b/i, "day"],
    [/^năm\b/i, "year"],
    [/^(?:giờ|tiếng)\b/i, "hour"],
    [/^phút\b/i, "minute"],
    [/^ml\b/i, "ml"],
    [/^oz\b/i, "oz"],
  ],
};

const QUALIFIER_PATTERNS: Record<"en" | "vi", Array<[RegExp, BoundaryQualifier]>> = {
  en: [
    [/\b(?:before|under|younger than|earlier than)\s*$/i, "before"],
    [/\b(?:after|over|older than|later than)\s*$/i, "after"],
    [/\b(?:about|around|approximately|roughly)\s*$/i, "about"],
  ],
  vi: [
    [/(?:trước|dưới|chưa đầy|chưa đến|sớm hơn)\s*$/i, "before"],
    [/(?:sau|trên|quá|muộn hơn)\s*$/i, "after"],
    [/(?:khoảng|tầm|xấp xỉ|gần)\s*$/i, "about"],
  ],
};

/** Extract the ordered semantic number tokens (value, unit, boundary qualifier) of a text. */
export function semanticNumberTokens(text: string, locale: "en" | "vi"): NumberToken[] {
  const tokens: NumberToken[] = [];
  const numberPattern = /\d+(?:[.,]\d+)?/g;
  let match: RegExpExecArray | null;
  while ((match = numberPattern.exec(text)) !== null) {
    const value = match[0].replace(",", ".");
    const windowBefore = text.slice(Math.max(0, match.index - 20), match.index);
    const windowAfter = text.slice(match.index + match[0].length).trimStart();
    let unit: string | undefined;
    for (const [pattern, name] of UNIT_PATTERNS[locale]) {
      if (pattern.test(windowAfter)) {
        unit = name;
        break;
      }
    }
    let qualifier: BoundaryQualifier | undefined;
    for (const [pattern, name] of QUALIFIER_PATTERNS[locale]) {
      if (pattern.test(windowBefore)) {
        qualifier = name;
        break;
      }
    }
    tokens.push({ value, ...(unit !== undefined ? { unit } : {}), ...(qualifier !== undefined ? { qualifier } : {}) });
  }
  return tokens;
}

function describeTokens(tokens: NumberToken[]): string {
  return tokens.map((t) => [t.qualifier, t.value, t.unit].filter(Boolean).join(" ")).join(", ");
}

function collectUsedKeys(knowledge: CanonicalKnowledge): Map<string, string> {
  const used = new Map<string, string>(); // key → describing subject
  for (const { claim } of knowledge.claims) {
    used.set(claim.textKey, claim.id);
    if (claim.uncertaintyNoteKey) used.set(claim.uncertaintyNoteKey, claim.id);
    for (const ref of claim.sourceRefs) {
      if (ref.supportNoteKey) used.set(ref.supportNoteKey, claim.id);
    }
  }
  for (const block of knowledge.guidance) used.set(block.titleKey, block.id);
  return used;
}

function validateSources(knowledge: CanonicalKnowledge, issues: IssueCollector, today: string): Map<string, SourceRecord> {
  const byId = new Map<string, SourceRecord>();
  for (const source of knowledge.sources) {
    if (byId.has(source.id)) {
      issues.error("source", "duplicate-source-id", `source ID \`${source.id}\` is defined more than once`, source.id);
      continue;
    }
    byId.set(source.id, source);
  }
  for (const source of knowledge.sources) {
    if (source.lastVerifiedAt > today) {
      issues.error("source", "future-date", `\`lastVerifiedAt\` ${source.lastVerifiedAt} is in the future`, source.id);
    }
    if (source.supersededBy !== undefined) {
      const successor = byId.get(source.supersededBy);
      if (!successor) {
        issues.error("source", "unresolved-successor", `\`supersededBy\` references unknown source \`${source.supersededBy}\``, source.id);
      } else if (successor.id === source.id) {
        issues.error("source", "self-supersession", "a source cannot supersede itself", source.id);
      }
    }
  }
  return byId;
}

/** True when the source may back a claim right now (approval + scope + lifecycle status). */
function isApprovedUsablePrimary(source: SourceRecord | undefined, domain: KnowledgeDomain): boolean {
  if (!source) return false;
  if (source.approvalLevel !== "approved-primary") return false;
  if (!(source.approvedScopes ?? []).includes(domain)) return false;
  return (USABLE_SOURCE_STATUSES as readonly string[]).includes(source.status);
}

function validateClaims(knowledge: CanonicalKnowledge, issues: IssueCollector, sources: Map<string, SourceRecord>, today: string): Map<string, Claim> {
  const byId = new Map<string, Claim>();
  const slugs = new Map<string, string>();
  const en = knowledge.translations[CANONICAL_LOCALE];

  for (const { claim, file } of knowledge.claims) {
    if (byId.has(claim.id)) {
      issues.error("schema", "duplicate-claim-id", `claim ID \`${claim.id}\` is defined more than once`, claim.id, file);
      continue;
    }
    byId.set(claim.id, claim);
    const slugOwner = slugs.get(claim.publicSlug);
    if (slugOwner) issues.error("schema", "duplicate-public-slug", `public slug \`${claim.publicSlug}\` is already used by \`${slugOwner}\``, claim.id, file);
    slugs.set(claim.publicSlug, claim.id);
  }

  for (const { claim, domain, file } of knowledge.claims) {
    if (claim.reviewedAt > today) issues.error("schema", "future-date", `\`reviewedAt\` ${claim.reviewedAt} is in the future`, claim.id, file);

    // Provenance: references resolve; verification dates are sane; approval boundary holds.
    for (const ref of claim.sourceRefs) {
      const source = sources.get(ref.sourceId);
      if (!source) {
        issues.error("provenance", "unresolved-source", `references unknown source ID \`${ref.sourceId}\``, claim.id, file);
        continue;
      }
      if (ref.verifiedAt > today) issues.error("provenance", "future-date", `sourceRef \`${ref.sourceId}\` has a future \`verifiedAt\` ${ref.verifiedAt}`, claim.id, file);
      if (source.status === "superseded" && source.supersededBy) {
        issues.warn("provenance", "superseded-support", `sourceRef \`${ref.sourceId}\` is superseded by \`${source.supersededBy}\`; the reference needs review`, claim.id, file);
      }

      // Approval boundary (EVIDENCE_PROVENANCE.md §4): primary/direct-support is an approved role,
      // not a free-form label — an unapproved source cannot become primary by declaration.
      if (DIRECT_SUPPORT_RELATIONSHIPS.includes(ref.relationship)) {
        if (source.approvalLevel !== "approved-primary") {
          issues.error("provenance", "unapproved-primary-source", `sourceRef \`${ref.sourceId}\` declares \`${ref.relationship}\` but the source's approvalLevel is \`${source.approvalLevel}\`; only approved primary health sources may carry primary/direct-support relationships`, claim.id, file);
        } else if (!(source.approvedScopes ?? []).includes(domain)) {
          issues.error("provenance", "primary-source-scope-mismatch", `sourceRef \`${ref.sourceId}\` is approved for [${(source.approvedScopes ?? []).join(", ")}] but is used as \`${ref.relationship}\` support in domain \`${domain}\``, claim.id, file);
        }
      }

      // Source lifecycle propagation (EVIDENCE_PROVENANCE.md §16): a changed source must not be
      // silently treated as fully current by its dependent claims.
      if (source.status === "changed-review-required") {
        const changedAt = source.updatedAt;
        if (changedAt !== undefined && ref.verifiedAt < changedAt) {
          if (claim.reviewStatus === "release-approved") {
            issues.error("provenance", "release-on-changed-source", `sourceRef \`${ref.sourceId}\` changed on ${changedAt} (status \`changed-review-required\`) after it was last verified (${ref.verifiedAt}); a release-approved claim cannot keep treating this source as current without re-review`, claim.id, file);
          } else {
            issues.warn("provenance", "changed-source-review-required", `sourceRef \`${ref.sourceId}\` changed on ${changedAt} after it was last verified (${ref.verifiedAt}); re-verify the reference against the updated source`, claim.id, file);
          }
        } else {
          issues.warn("provenance", "changed-source-pending-review", `sourceRef \`${ref.sourceId}\` is \`changed-review-required\`; this claim's support is under review and must not be presented as fully current`, claim.id, file);
        }
      }

      // Rights boundary (EVIDENCE_PROVENANCE.md §12–§13, LICENSING_POLICY.md): locator hints are
      // concise paraphrased context for finding the passage, not stored verbatim quotations.
      const hint = ref.locator?.paragraphHint;
      if (hint !== undefined && (hint.length > 240 || /["“”«»][^"“”«»]{80,}["“”«»]/.test(hint))) {
        issues.warn("provenance", "verbatim-locator-hint", `sourceRef \`${ref.sourceId}\` has a \`paragraphHint\` that looks like a long verbatim quotation; keep locator hints as concise paraphrased locator/context`, claim.id, file);
      }
    }

    // official-guidance: at least one approved primary/direct source whose approved scope covers
    // the claim's domain and whose status is still usable (EVIDENCE_PROVENANCE.md §4/§16).
    if (claim.guidanceClass === "official-guidance") {
      const direct = claim.sourceRefs.filter((ref) => DIRECT_SUPPORT_RELATIONSHIPS.includes(ref.relationship));
      if (direct.length === 0) {
        issues.error("provenance", "official-guidance-direct-support", "an official-guidance claim requires at least one `primary` or `direct-support` source reference", claim.id, file);
      } else {
        const statusUsable = direct.filter((ref) => (USABLE_SOURCE_STATUSES as readonly string[]).includes(sources.get(ref.sourceId)?.status ?? ""));
        if (statusUsable.length === 0) {
          issues.error("provenance", "official-guidance-superseded-support", "every direct/primary support for this official-guidance claim is superseded or retired", claim.id, file);
        }
        const approvedUsable = direct.filter((ref) => isApprovedUsablePrimary(sources.get(ref.sourceId), domain));
        if (approvedUsable.length === 0) {
          issues.error("provenance", "official-guidance-approved-scope-support", `an official-guidance claim requires at least one approved primary/direct source whose \`approvedScopes\` cover domain \`${domain}\` and whose status is usable`, claim.id, file);
        }
      }
    }
    if (claim.guidanceClass === "evidence-synthesis" && claim.sourceRefs.length === 0) {
      issues.error("provenance", "synthesis-without-sources", "an evidence-synthesis claim must record all materially used source references", claim.id, file);
    }
    if (claim.guidanceClass === "practical-interpretation" && claim.sourceRefs.length === 0) {
      issues.error("provenance", "interpretation-without-basis", "a practical-interpretation claim must reference the source(s)/claim support it interprets", claim.id, file);
    }
    if (claim.sourceRefs.some((ref) => ref.relationship === "conflicting") && !claim.uncertaintyNoteKey) {
      issues.warn("provenance", "conflict-without-note", "claim records a conflicting source but no `uncertaintyNoteKey`; meaningful disagreement must stay visible", claim.id, file);
    }

    // Safety wording gate (GUIDANCE_CONTENT_CONTRACT.md §6).
    if ((claim.safetyLevel === "urgent" || claim.safetyLevel === "emergency") && !SOURCE_REVIEWED_STATUSES.includes(claim.reviewStatus)) {
      issues.error("schema", "unreviewed-urgency", `safetyLevel \`${claim.safetyLevel}\` requires a source-reviewed state (got \`${claim.reviewStatus}\`)`, claim.id, file);
    }

    // No invented precision (GUIDANCE_CONTENT_CONTRACT.md §1: approximate/range language must survive).
    const enText = en[claim.textKey];
    if (enText !== undefined) {
      if (claim.precisionClass === "source-approximate" && !EN_APPROXIMATION.test(enText)) {
        issues.error("schema", "invented-precision", "precisionClass `source-approximate` but the canonical EN text carries no approximation qualifier (about/around/when ready/…)", claim.id, file);
      }
      if (claim.precisionClass === "source-range" && !RANGE_EXPRESSION.test(enText)) {
        issues.error("schema", "invented-precision", "precisionClass `source-range` but the canonical EN text contains no numeric range", claim.id, file);
      }
    }
  }
  return byId;
}

function validateGuidance(knowledge: CanonicalKnowledge, issues: IssueCollector, claims: Map<string, Claim>): void {
  const seen = new Set<string>();
  const claimDomain = new Map(knowledge.claims.map((c) => [c.claim.id, c.domain]));
  for (const block of knowledge.guidance) {
    if (seen.has(block.id)) {
      issues.error("schema", "duplicate-guidance-id", `guidance block ID \`${block.id}\` is defined more than once`, block.id);
      continue;
    }
    seen.add(block.id);
    for (const claimId of block.claimIds) {
      const claim = claims.get(claimId);
      if (!claim) {
        issues.error("schema", "unresolved-claim", `references unknown claim ID \`${claimId}\``, block.id);
        continue;
      }
      const domain = claimDomain.get(claimId);
      if (domain !== undefined && domain !== block.domain) {
        issues.warn("schema", "cross-domain-claim", `renders claim \`${claimId}\` from domain \`${domain}\` inside domain \`${block.domain}\``, block.id);
      }
      // Public release gate: every claim a block renders reaches a public route, so it must be in
      // a release-eligible review state. Enforced at the validation/build gate — a draft or
      // clinical-review-required or superseded claim cannot ship by bypassing the coverage matrix.
      if (!RELEASE_ELIGIBLE_STATUSES.includes(claim.reviewStatus)) {
        issues.error("schema", "unreleased-claim-rendered", `renders claim \`${claimId}\` whose reviewStatus is \`${claim.reviewStatus}\`; only ${RELEASE_ELIGIBLE_STATUSES.map((s) => `\`${s}\``).join("/")} claims may appear on public guidance routes`, block.id);
      }
    }
  }
}

function validateTranslations(knowledge: CanonicalKnowledge, issues: IssueCollector): void {
  const en = knowledge.translations.en;
  const vi = knowledge.translations.vi;
  const used = collectUsedKeys(knowledge);

  for (const [key, subject] of used) {
    if (en[key] === undefined) issues.error("translation", "missing-canonical-text", `key \`${key}\` (used by \`${subject}\`) has no canonical EN text`, key);
  }
  for (const key of Object.keys(en)) {
    if (vi[key] === undefined) issues.error("translation", "missing-vi-parity", `EN key \`${key}\` has no Vietnamese translation (semantic parity is release-required)`, key);
    if (!used.has(key)) issues.warn("translation", "unused-key", `EN key \`${key}\` is not referenced by any claim or guidance block`, key);
  }
  for (const key of Object.keys(vi)) {
    if (en[key] === undefined) issues.error("translation", "orphan-vi-key", `VI key \`${key}\` has no canonical EN counterpart`, key);
  }

  // Semantic-critical parity (GUIDANCE_CONTENT_CONTRACT.md §10): quantities are compared in
  // order together with their units and boundary qualifiers, so identical numbers with swapped
  // semantics ("about 6 … before 4" vs "khoảng 4 … trước 6") cannot pass.
  for (const key of Object.keys(en)) {
    const enText = en[key]!;
    const viText = vi[key];
    if (viText === undefined) continue;
    const enTokens = semanticNumberTokens(enText, "en");
    const viTokens = semanticNumberTokens(viText, "vi");
    if (enTokens.map((t) => t.value).join(",") !== viTokens.map((t) => t.value).join(",")) {
      issues.error("translation", "quantity-parity", `numeric values (in order) differ between EN [${describeTokens(enTokens)}] and VI [${describeTokens(viTokens)}]; identical numbers in a different semantic order (e.g. swapped age boundaries) are a parity break`, key);
    } else {
      for (let i = 0; i < enTokens.length; i += 1) {
        const enToken = enTokens[i]!;
        const viToken = viTokens[i]!;
        // Canonical EN decides the unit: VI must preserve it — a dropped unit ("khoảng 6") is as
        // much a parity break as a changed one ("khoảng 6 tuần").
        if (enToken.unit !== undefined && enToken.unit !== viToken.unit) {
          issues.error("translation", "unit-parity", `quantity ${enToken.value} carries unit \`${enToken.unit}\` in EN but ${viToken.unit !== undefined ? `\`${viToken.unit}\`` : "no recognizable unit"} in VI`, key);
        }
        if ((enToken.qualifier ?? "(none)") !== (viToken.qualifier ?? "(none)")) {
          issues.error("translation", "boundary-parity", `quantity ${enToken.value} is qualified as \`${enToken.qualifier ?? "(none)"}\` in EN but \`${viToken.qualifier ?? "(none)"}\` in VI (before/after/about boundaries must survive translation)`, key);
        }
      }
    }
    if (EN_NEGATION.test(enText) && !VI_NEGATION.test(viText)) {
      issues.error("translation", "negation-parity", "EN text contains a negation/prohibition the VI text does not preserve", key);
    }
  }
  for (const { claim } of knowledge.claims) {
    const viText = vi[claim.textKey];
    if (viText !== undefined && claim.precisionClass === "source-approximate" && !VI_APPROXIMATION.test(viText)) {
      issues.error("translation", "qualifier-parity", "claim is `source-approximate` but the VI text carries no approximation qualifier (khoảng/…)", claim.textKey);
    }
  }
}

function validateCoverage(knowledge: CanonicalKnowledge, issues: IssueCollector, claims: Map<string, Claim>, sources: Map<string, SourceRecord>): void {
  const claimDomain = new Map(knowledge.claims.map((c) => [c.claim.id, c.domain]));
  const renderedClaims = new Set(knowledge.guidance.flatMap((b) => b.claimIds));
  const seen = new Set<string>();
  for (const cell of knowledge.coverage.cells) {
    const cellId = `${cell.domain}/${cell.stage}`;
    if (seen.has(cellId)) {
      issues.error("coverage", "duplicate-cell", `coverage cell \`${cellId}\` is defined more than once`, cellId);
      continue;
    }
    seen.add(cellId);
    for (const section of cell.sections) {
      const sectionId = `${cellId}#${section.section}`;
      const minimumStatus = section.minimumReviewStatus ?? "source-verified";
      const minimumRank = REVIEW_STATUS_RANK[minimumStatus];
      const requiredLocales = section.requiredLocales ?? LOCALES;
      for (const claimId of section.requiredClaimIds) {
        const claim = claims.get(claimId);
        if (!claim) {
          issues.error("coverage", "unresolved-claim", `requires unknown claim ID \`${claimId}\``, sectionId);
          continue;
        }
        if (claimDomain.get(claimId) !== cell.domain) {
          issues.error("coverage", "domain-mismatch", `required claim \`${claimId}\` belongs to domain \`${claimDomain.get(claimId)}\`, not \`${cell.domain}\``, sectionId);
        }
        if (REVIEW_STATUS_RANK[claim.reviewStatus] < minimumRank) {
          issues.error("coverage", "unreviewed-claim", `required claim \`${claimId}\` is \`${claim.reviewStatus}\`; this section requires at least \`${minimumStatus}\``, sectionId);
        }
        for (const locale of requiredLocales) {
          if (knowledge.translations[locale]?.[claim.textKey] === undefined) {
            issues.error("coverage", "missing-locale-text", `required claim \`${claimId}\` has no \`${locale}\` text`, sectionId);
          }
        }
        if (!renderedClaims.has(claimId)) {
          issues.error("coverage", "unrendered-claim", `required claim \`${claimId}\` is not rendered by any guidance block/route`, sectionId);
        }
        if (section.requireApprovedPrimarySource === true) {
          const supported = claim.sourceRefs.some((ref) => DIRECT_SUPPORT_RELATIONSHIPS.includes(ref.relationship) && isApprovedUsablePrimary(sources.get(ref.sourceId), cell.domain));
          if (!supported) {
            issues.error("coverage", "missing-approved-primary-source", `required claim \`${claimId}\` has no usable approved primary/direct source covering domain \`${cell.domain}\``, sectionId);
          }
        }
      }
    }
  }
}

function validateTools(knowledge: CanonicalKnowledge, issues: IssueCollector, claims: Map<string, Claim>): void {
  const seen = new Set<string>();
  for (const tool of knowledge.tools) {
    if (seen.has(tool.id)) {
      issues.error("tool", "duplicate-tool-id", `tool ID \`${tool.id}\` is defined more than once`, tool.id);
      continue;
    }
    seen.add(tool.id);
    for (const claimId of [...(tool.guidanceClaimIds ?? []), ...(tool.safetyClaimIds ?? [])]) {
      const claim = claims.get(claimId);
      if (!claim) {
        issues.error("tool", "unresolved-claim", `references unknown claim ID \`${claimId}\``, tool.id);
        continue;
      }
      if (tool.lifecycle === "released" && claim.reviewStatus !== "release-approved") {
        issues.error("tool", "released-tool-unapproved-claim", `released tool depends on claim \`${claimId}\` whose review status is \`${claim.reviewStatus}\``, tool.id);
      }
    }
  }
}

/**
 * Run all cross-record rules, appending to the knowledge's own IssueCollector.
 * `today` is injectable so tests are deterministic; ISO date strings compare lexically.
 */
export function validateKnowledge(knowledge: CanonicalKnowledge, today: string = new Date().toISOString().slice(0, 10)): IssueCollector {
  const issues = knowledge.issues;
  const sources = validateSources(knowledge, issues, today);
  const claims = validateClaims(knowledge, issues, sources, today);
  validateGuidance(knowledge, issues, claims);
  validateTranslations(knowledge, issues);
  validateCoverage(knowledge, issues, claims, sources);
  validateTools(knowledge, issues, claims);
  return issues;
}
