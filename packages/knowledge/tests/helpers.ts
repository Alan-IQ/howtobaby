// SPDX-License-Identifier: AGPL-3.0-only
// Test helpers: write a minimal canonical-YAML fixture tree and load it through the real loader,
// so every test exercises the same ingestion path as the build scripts.

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { loadCanonicalKnowledge, validateKnowledge, type CanonicalKnowledge } from "../src/index.ts";

export const TODAY = "2026-08-31";

/** A structurally valid single-claim graph the tests mutate to prove each gate. */
export const VALID_FIXTURE: Record<string, string> = {
  "sources/registry.yaml": `
sources:
  - id: cdc-introduction-solid-foods
    organization: CDC
    title: "When, What, and How to Introduce Solid Foods"
    canonicalUrl: "https://www.cdc.gov/infant-toddler-nutrition/foods-and-drinks/when-what-and-how-to-introduce-solid-foods.html"
    jurisdiction: US
    sourceType: public-health-guidance
    lastVerifiedAt: 2026-08-30
    status: current
    accessMode: link-only
    approvalLevel: approved-primary
    approvedScopes: [feeding]
  - id: who-complementary-feeding
    organization: WHO
    title: "Infant and young child feeding"
    canonicalUrl: "https://www.who.int/news-room/fact-sheets/detail/infant-and-young-child-feeding"
    jurisdiction: global
    sourceType: fact-sheet
    lastVerifiedAt: 2026-08-30
    status: current
    accessMode: link-only
    approvalLevel: approved-primary
    approvedScopes: [feeding]
`,
  "claims/feeding/solids.yaml": `
domain: feeding
claims:
  - id: feeding.solids.start
    textKey: feeding.solids.start
    publicSlug: feeding-solids-start
    guidanceClass: official-guidance
    precisionClass: source-approximate
    safetyLevel: info
    sourceRefs:
      - sourceId: cdc-introduction-solid-foods
        relationship: primary
        verifiedAt: 2026-08-30
      - sourceId: who-complementary-feeding
        relationship: corroborating
        verifiedAt: 2026-08-30
    reviewedAt: 2026-08-30
    reviewStatus: source-verified
`,
  "guidance/feeding/solids.yaml": `
blocks:
  - id: guidance.feeding.solids-start
    domain: feeding
    stage: feed-06-08m
    titleKey: guidance.feeding.solids-start.title
    claimIds: [feeding.solids.start]
    routes: [/feeding]
`,
  "translations/en/feeding.yaml": `
locale: en
strings:
  feeding.solids.start: >-
    Introduce foods other than breast milk or formula at about 6 months.
    Starting before 4 months is not recommended.
  guidance.feeding.solids-start.title: Starting solid foods
`,
  "translations/vi/feeding.yaml": `
locale: vi
strings:
  feeding.solids.start: >-
    Cho bé ăn thức ăn khác ngoài sữa mẹ hoặc sữa công thức khi bé khoảng 6 tháng tuổi.
    Không khuyến nghị bắt đầu trước 4 tháng tuổi.
  guidance.feeding.solids-start.title: Bắt đầu ăn dặm
`,
  "tools/registry.yaml": `
tools:
  - id: tool.fixture.evidence-pipeline
    title: "Evidence pipeline fixture"
    toolClass: guidance-linked
    lifecycle: fixture
    guidanceClaimIds: [feeding.solids.start]
`,
  "coverage/matrix.yaml": `
cells:
  - domain: feeding
    stage: feed-06-08m
    sections:
      - section: solids-introduction
        requiredClaimIds: [feeding.solids.start]
        minimumReviewStatus: source-verified
        requiredLocales: [en, vi]
        requireApprovedPrimarySource: true
`,
};

/** Write `files` (fixture + overrides; `null` deletes) into a temp dir and load + validate it. */
export function loadFixture(overrides: Record<string, string | null> = {}): { knowledge: CanonicalKnowledge; dir: string } {
  const dir = mkdtempSync(join(tmpdir(), "htb-knowledge-fixture-"));
  const files: Record<string, string | null> = { ...VALID_FIXTURE, ...overrides };
  for (const [path, content] of Object.entries(files)) {
    if (content === null) continue;
    const full = join(dir, path);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, content);
  }
  const knowledge = loadCanonicalKnowledge(dir);
  validateKnowledge(knowledge, TODAY);
  return { knowledge, dir };
}

export function cleanupFixture(dir: string): void {
  rmSync(dir, { recursive: true, force: true });
}

export function rules(knowledge: CanonicalKnowledge, severity?: "error" | "warning"): string[] {
  return knowledge.issues.issues.filter((i) => severity === undefined || i.severity === severity).map((i) => i.rule);
}
