// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Phase 4 gate proofs (docs/IMPLEMENTATION_ROADMAP.md, GUIDANCE_CONTENT_CONTRACT.md §3) over the
 * real authored Play & Development graph:
 *   - every Development stage ships every required section, in EN and VI, source-verified;
 *   - milestones are references, never deadlines, scores or pass/fail tests — the canonical
 *     wording in both locales must not drift into that framing;
 *   - every official-guidance development claim resolves to an approved primary source whose
 *     scope covers `development` (original-source provenance through the canonical evidence UI);
 *   - list-structured claims keep the same item structure in EN and VI.
 */

import { describe, expect, it } from "vitest";

import { DIRECT_SUPPORT_RELATIONSHIPS, loadCanonicalKnowledge, validateKnowledge } from "../src/index.ts";

const DEVELOPMENT_STAGES = [
  "dev-00-02m", "dev-02-04m", "dev-04-06m", "dev-06-09m", "dev-09-12m", "dev-12-15m",
  "dev-15-18m", "dev-18-24m", "dev-24-30m", "dev-30-36m", "dev-36-48m", "dev-48-60m",
];

/** The required sections of GUIDANCE_CONTENT_CONTRACT.md §3, in contract order. */
const REQUIRED_SECTIONS = [
  "at-a-glance", "milestone-context", "development-focus", "gross-motor", "fine-motor", "communication",
  "cognitive", "social-emotional", "activities", "variants", "safety-environment", "what-not-to-force",
  "what-to-observe", "clinician-cues",
];

const CROSS_STAGE_CLAIMS = [
  "development.milestones.reference",
  "development.milestones.not-pass-fail",
  "development.milestones.younger-checklist",
  "development.milestones.corrected-age",
  "development.milestones.act-early",
];

/** Pass/fail, scoring and deadline framing that must never describe a milestone (EN + VI). */
const BANNED_EN = /\b(pass|passed|passes|fail|failed|fails|score|scored|scoring|deadline|deadlines|percentile|behind schedule|falling behind|on schedule)\b/i;
const BANNED_VI = /(không đạt|đạt yêu cầu|chấm điểm|điểm số|hạn chót|đúng hạn|trễ hạn|chậm phát triển|tụt lại)/i;
/** The only allowed mention: the explicit statement that milestones are NOT pass/fail tests. */
const ALLOWED_EN = /not (?:as )?deadlines, scores or pass\/fail tests/;
const ALLOWED_VI = /không phải như thời hạn phải đạt, điểm số hay bài kiểm tra đạt–không đạt/;

const knowledge = loadCanonicalKnowledge();
validateKnowledge(knowledge);
const en = knowledge.translations.en;
const vi = knowledge.translations.vi;
const claimsById = new Map(knowledge.claims.map((c) => [c.claim.id, c]));
const sourcesById = new Map(knowledge.sources.map((s) => [s.id, s]));

describe("Development stage map (contract §3)", () => {
  it("passes every knowledge gate", () => {
    expect(knowledge.issues.errors).toEqual([]);
  });

  it("ships every required section for all 12 stages as a guidance block on the stage route and the all-stages print route", () => {
    for (const stage of DEVELOPMENT_STAGES) {
      const blocks = knowledge.guidance.filter((b) => b.domain === "development" && b.stage === stage);
      expect(blocks.map((b) => b.section).sort(), stage).toEqual([...REQUIRED_SECTIONS].sort());
      for (const block of blocks) {
        expect(block.routes.some((r) => /^\/play\/\d{1,2}-\d{1,2}-(months|years)$/.test(r)), block.id).toBe(true);
        expect(block.routes, block.id).toContain("/play/all-stages");
      }
    }
  });

  it("declares a coverage cell per stage requiring every section plus the cross-stage reading claims, EN + VI", () => {
    for (const stage of DEVELOPMENT_STAGES) {
      const cell = knowledge.coverage.cells.find((c) => c.domain === "development" && c.stage === stage);
      expect(cell, stage).toBeDefined();
      expect(cell!.sections.map((s) => s.section).sort()).toEqual([...REQUIRED_SECTIONS, "reading-milestones"].sort());
      for (const section of cell!.sections) {
        expect(section.requiredLocales).toEqual(["en", "vi"]);
        expect(section.minimumReviewStatus).toBe("source-verified");
      }
      expect(cell!.sections.find((s) => s.section === "reading-milestones")?.requiredClaimIds).toEqual(CROSS_STAGE_CLAIMS);
    }
  });

  it("renders the cross-stage reading block on the Play landing page, every stage route and the print route", () => {
    const block = knowledge.guidance.find((b) => b.id === "guidance.development.reading-milestones");
    expect(block?.claimIds).toEqual(CROSS_STAGE_CLAIMS);
    expect(block?.routes).toContain("/play");
    expect(block?.routes).toContain("/play/all-stages");
    expect(block?.routes.filter((r) => /^\/play\/\d/.test(r))).toHaveLength(12);
  });
});

describe("milestones are references, not pass/fail (Phase 4 gate)", () => {
  const developmentKeys = Object.keys(en).filter((key) => key.startsWith("development."));

  it("covers every development claim in both locales", () => {
    expect(developmentKeys.length).toBeGreaterThanOrEqual(12 * REQUIRED_SECTIONS.length + CROSS_STAGE_CLAIMS.length);
    for (const key of developmentKeys) expect(vi[key], key).toBeDefined();
  });

  it("never frames a milestone as a deadline, score, percentile or pass/fail result, in EN or VI", () => {
    for (const key of developmentKeys) {
      const enText = en[key]!.replace(ALLOWED_EN, "");
      const viText = vi[key]!.replace(ALLOWED_VI, "");
      expect(enText, `${key} (en)`).not.toMatch(BANNED_EN);
      expect(viText, `${key} (vi)`).not.toMatch(BANNED_VI);
    }
  });

  it("states the reference framing explicitly and keeps CDC's 'most children (75% or more)' qualifier on every milestone context", () => {
    expect(en["development.milestones.not-pass-fail"]).toMatch(ALLOWED_EN);
    expect(vi["development.milestones.not-pass-fail"]).toMatch(ALLOWED_VI);
    for (const stage of DEVELOPMENT_STAGES) {
      const key = `development.${stage.slice(4)}.milestone-context`;
      expect(en[key], key).toContain("75% or more");
      expect(vi[key], key).toContain("từ 75% trở lên");
    }
  });

  it("keeps the same list structure (lead line + items) in EN and VI", () => {
    for (const key of developmentKeys) {
      const enItems = en[key]!.split("\n").filter((line) => line.startsWith("- ")).length;
      const viItems = vi[key]!.split("\n").filter((line) => line.startsWith("- ")).length;
      expect(viItems, key).toBe(enItems);
    }
  });
});

describe("Development provenance (original-source links through the canonical graph)", () => {
  const development = knowledge.claims.filter((c) => c.domain === "development");

  it("has 12 × 14 stage claims plus the cross-stage claims, all source-verified", () => {
    expect(development).toHaveLength(12 * REQUIRED_SECTIONS.length + CROSS_STAGE_CLAIMS.length);
    for (const { claim } of development) expect(claim.reviewStatus, claim.id).toBe("source-verified");
  });

  it("backs every official-guidance claim with an approved primary source whose scope covers development", () => {
    for (const { claim } of development) {
      if (claim.guidanceClass !== "official-guidance") continue;
      const direct = claim.sourceRefs.filter((ref) => DIRECT_SUPPORT_RELATIONSHIPS.includes(ref.relationship));
      expect(direct.length, claim.id).toBeGreaterThan(0);
      for (const ref of direct) {
        const source = sourcesById.get(ref.sourceId);
        expect(source?.approvalLevel, `${claim.id} → ${ref.sourceId}`).toBe("approved-primary");
        expect(source?.approvedScopes, `${claim.id} → ${ref.sourceId}`).toContain("development");
        expect(source?.status, `${claim.id} → ${ref.sourceId}`).toBe("current");
        expect(source?.canonicalUrl).toMatch(/^https:\/\/(www\.)?(cdc\.gov|healthychildren\.org|publications\.aap\.org|who\.int)\//);
      }
    }
  });

  it("gives every source reference a locator, so the drawer can name the relevant section", () => {
    for (const { claim } of development) {
      for (const ref of claim.sourceRefs) expect(ref.locator, `${claim.id} → ${ref.sourceId}`).toBeDefined();
    }
  });

  it("cites the matching CDC checklist for every milestone section of a stage with a checklist", () => {
    const checklistByStage: Record<string, string> = {
      "dev-02-04m": "cdc-milestones-2-months", "dev-04-06m": "cdc-milestones-4-months", "dev-06-09m": "cdc-milestones-6-months",
      "dev-09-12m": "cdc-milestones-9-months", "dev-12-15m": "cdc-milestones-1-year", "dev-15-18m": "cdc-milestones-15-months",
      "dev-18-24m": "cdc-milestones-18-months", "dev-24-30m": "cdc-milestones-2-years", "dev-30-36m": "cdc-milestones-30-months",
      "dev-36-48m": "cdc-milestones-3-years", "dev-48-60m": "cdc-milestones-4-years",
    };
    for (const [stage, sourceId] of Object.entries(checklistByStage)) {
      for (const section of ["gross-motor", "fine-motor", "communication", "cognitive", "social-emotional", "activities", "clinician-cues"]) {
        const claim = claimsById.get(`development.${stage.slice(4)}.${section}`)?.claim;
        expect(claim?.sourceRefs.some((ref) => ref.sourceId === sourceId && ref.relationship === "primary"), `${stage}/${section}`).toBe(true);
      }
    }
    // Under 2 months there is no checklist: the 2-month checklist is cited as the FIRST reference.
    expect(claimsById.get("development.00-02m.milestone-context")?.claim.applicability).toContain("cdc-checklist:none-before-2-months");
  });
});
