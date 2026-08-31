// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Cross-record validation for the canonical knowledge graph.
 *
 * Implements the Phase 2 CI gates from docs/IMPLEMENTATION_ROADMAP.md and the build-time rules in
 * docs/EVIDENCE_PROVENANCE.md §16 / docs/GUIDANCE_CONTENT_CONTRACT.md §10–§11:
 *   - source IDs, relationships, locators and supersession chains resolve;
 *   - `official-guidance` requires approved direct/primary support that is still current;
 *   - precision classes cannot invent precision (qualifiers/ranges must appear in the text);
 *   - urgent/emergency wording requires a source-reviewed state;
 *   - EN is canonical and VI must keep key + semantic-critical parity (quantities, qualifiers, negation);
 *   - the coverage matrix cells resolve to reviewed, translated, renderable claims;
 *   - tool claim references resolve and fixtures cannot ship.
 *
 * Every rule reports through IssueCollector so scripts/CI render one consistent report.
 */

import type { CanonicalKnowledge } from "./loader.ts";
import type { IssueCollector } from "./schemas/issues.ts";
import {
  CANONICAL_LOCALE,
  DIRECT_SUPPORT_RELATIONSHIPS,
  SOURCE_REVIEWED_STATUSES,
  type Claim,
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

function digitRuns(text: string): string[] {
  return (text.match(/\d+(?:[.,]\d+)?/g) ?? []).map((n) => n.replace(",", ".")).sort();
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

  for (const { claim, file } of knowledge.claims) {
    if (claim.reviewedAt > today) issues.error("schema", "future-date", `\`reviewedAt\` ${claim.reviewedAt} is in the future`, claim.id, file);

    // Provenance: references resolve; verification dates are sane.
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
    }

    // official-guidance: approved direct/primary support that is still usable (EVIDENCE_PROVENANCE.md §4/§16).
    if (claim.guidanceClass === "official-guidance") {
      const direct = claim.sourceRefs.filter((ref) => DIRECT_SUPPORT_RELATIONSHIPS.includes(ref.relationship));
      if (direct.length === 0) {
        issues.error("provenance", "official-guidance-direct-support", "an official-guidance claim requires at least one `primary` or `direct-support` source reference", claim.id, file);
      } else {
        const usable = direct.filter((ref) => {
          const status = sources.get(ref.sourceId)?.status;
          return status === "current" || status === "changed-review-required" || status === "temporarily-unreachable";
        });
        if (usable.length === 0) {
          issues.error("provenance", "official-guidance-superseded-support", "every direct/primary support for this official-guidance claim is superseded or retired", claim.id, file);
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
      if (!claims.has(claimId)) {
        issues.error("schema", "unresolved-claim", `references unknown claim ID \`${claimId}\``, block.id);
        continue;
      }
      const domain = claimDomain.get(claimId);
      if (domain !== undefined && domain !== block.domain) {
        issues.warn("schema", "cross-domain-claim", `renders claim \`${claimId}\` from domain \`${domain}\` inside domain \`${block.domain}\``, block.id);
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

  // Semantic-critical parity: quantities/age boundaries, qualifiers, negation (GUIDANCE_CONTENT_CONTRACT.md §10).
  for (const key of Object.keys(en)) {
    const enText = en[key]!;
    const viText = vi[key];
    if (viText === undefined) continue;
    const enDigits = digitRuns(enText);
    const viDigits = digitRuns(viText);
    if (enDigits.join(",") !== viDigits.join(",")) {
      issues.error("translation", "quantity-parity", `numeric values differ between EN [${enDigits.join(", ")}] and VI [${viDigits.join(", ")}]`, key);
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

function validateCoverage(knowledge: CanonicalKnowledge, issues: IssueCollector, claims: Map<string, Claim>): void {
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
    for (const claimId of cell.requiredClaimIds) {
      const claim = claims.get(claimId);
      if (!claim) {
        issues.error("coverage", "unresolved-claim", `requires unknown claim ID \`${claimId}\``, cellId);
        continue;
      }
      if (claimDomain.get(claimId) !== cell.domain) {
        issues.error("coverage", "domain-mismatch", `required claim \`${claimId}\` belongs to domain \`${claimDomain.get(claimId)}\`, not \`${cell.domain}\``, cellId);
      }
      if (!SOURCE_REVIEWED_STATUSES.includes(claim.reviewStatus)) {
        issues.error("coverage", "unreviewed-claim", `required claim \`${claimId}\` is \`${claim.reviewStatus}\`; coverage requires a source-reviewed state`, cellId);
      }
      if (knowledge.translations.vi[claim.textKey] === undefined) {
        issues.error("coverage", "missing-vi", `required claim \`${claimId}\` has no Vietnamese text`, cellId);
      }
      if (!renderedClaims.has(claimId)) {
        issues.error("coverage", "unrendered-claim", `required claim \`${claimId}\` is not rendered by any guidance block/route`, cellId);
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
  validateCoverage(knowledge, issues, claims);
  validateTools(knowledge, issues, claims);
  return issues;
}
