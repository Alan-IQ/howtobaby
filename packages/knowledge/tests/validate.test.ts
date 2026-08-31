// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Phase 2 gate proofs (docs/IMPLEMENTATION_ROADMAP.md): invalid source IDs, claim relationships
 * and precision states fail validation; `official-guidance` without approved direct/primary
 * support fails; EN/VI semantic parity is enforced. Each test mutates a valid fixture through the
 * real loader so the CI scripts and these tests can never diverge.
 */

import { describe, expect, it } from "vitest";

import { loadCanonicalKnowledge, validateKnowledge } from "../src/index.ts";
import { VALID_FIXTURE, cleanupFixture, loadFixture, rules } from "./helpers.ts";

function check(overrides: Record<string, string | null>): string[] {
  const { knowledge, dir } = loadFixture(overrides);
  cleanupFixture(dir);
  return rules(knowledge, "error");
}

describe("canonical fixture", () => {
  it("passes every gate when valid", () => {
    const { knowledge, dir } = loadFixture();
    cleanupFixture(dir);
    expect(knowledge.issues.errors).toEqual([]);
    expect(knowledge.issues.warnings).toEqual([]);
  });

  it("the real authored repository content passes every gate", () => {
    const knowledge = loadCanonicalKnowledge();
    validateKnowledge(knowledge);
    expect(knowledge.issues.errors).toEqual([]);
  });
});

describe("source gates", () => {
  it("rejects a malformed source ID", () => {
    expect(check({
      "sources/registry.yaml": VALID_FIXTURE["sources/registry.yaml"]!.replace("id: who-complementary-feeding", "id: WHO_Complementary"),
    })).toContain("invalid-format");
  });

  it("rejects a superseded source without a successor", () => {
    expect(check({
      "sources/registry.yaml": VALID_FIXTURE["sources/registry.yaml"]!.replace("    status: current\n    accessMode: link-only\n", "    status: superseded\n    accessMode: link-only\n"),
    })).toContain("superseded-without-successor");
  });

  it("rejects an http (non-https) canonical URL", () => {
    expect(check({
      "sources/registry.yaml": VALID_FIXTURE["sources/registry.yaml"]!.replace("https://www.who.int", "http://www.who.int"),
    })).toContain("invalid-url");
  });
});

describe("provenance gates", () => {
  it("fails a claim referencing an unknown source ID", () => {
    expect(check({
      "claims/feeding/solids.yaml": VALID_FIXTURE["claims/feeding/solids.yaml"]!.replace("sourceId: who-complementary-feeding", "sourceId: who-nonexistent-source"),
    })).toContain("unresolved-source");
  });

  it("fails official-guidance without a primary/direct-support reference", () => {
    expect(check({
      "claims/feeding/solids.yaml": VALID_FIXTURE["claims/feeding/solids.yaml"]!.replace("relationship: primary", "relationship: contextual"),
    })).toContain("official-guidance-direct-support");
  });

  it("fails official-guidance whose only direct support is superseded", () => {
    const sources = VALID_FIXTURE["sources/registry.yaml"]!.replace(
      `    lastVerifiedAt: 2026-08-30
    status: current
    accessMode: link-only
  - id: who-complementary-feeding`,
      `    lastVerifiedAt: 2026-08-30
    status: superseded
    supersededBy: who-complementary-feeding
    accessMode: link-only
  - id: who-complementary-feeding`,
    );
    expect(check({ "sources/registry.yaml": sources })).toContain("official-guidance-superseded-support");
  });

  it("rejects an invalid relationship enum", () => {
    expect(check({
      "claims/feeding/solids.yaml": VALID_FIXTURE["claims/feeding/solids.yaml"]!.replace("relationship: corroborating", "relationship: inspired-by"),
    })).toContain("invalid-enum");
  });
});

describe("precision and safety gates", () => {
  it("fails a source-approximate claim whose EN text drops the qualifier (no invented precision)", () => {
    expect(check({
      "translations/en/feeding.yaml": VALID_FIXTURE["translations/en/feeding.yaml"]!.replace("at about 6 months", "at exactly 6 months"),
      "translations/vi/feeding.yaml": VALID_FIXTURE["translations/vi/feeding.yaml"]!.replace("khi bé khoảng 6 tháng tuổi", "đúng lúc 6 tháng tuổi"),
    })).toContain("invented-precision");
  });

  it("fails urgent wording on an unreviewed claim", () => {
    expect(check({
      "claims/feeding/solids.yaml": VALID_FIXTURE["claims/feeding/solids.yaml"]!
        .replace("safetyLevel: info", "safetyLevel: urgent")
        .replace("reviewStatus: source-verified", "reviewStatus: draft"),
    })).toEqual(expect.arrayContaining(["unreviewed-urgency", "unreviewed-claim"]));
  });
});

describe("EN/VI parity gates", () => {
  it("fails when a claim key has no Vietnamese text", () => {
    expect(check({
      "translations/vi/feeding.yaml": `
locale: vi
strings:
  guidance.feeding.solids-start.title: Bắt đầu ăn dặm
`,
    })).toEqual(expect.arrayContaining(["missing-vi-parity", "missing-vi"]));
  });

  it("fails when quantities diverge between EN and VI", () => {
    expect(check({
      "translations/vi/feeding.yaml": VALID_FIXTURE["translations/vi/feeding.yaml"]!.replace("khoảng 6 tháng", "khoảng 7 tháng"),
    })).toContain("quantity-parity");
  });

  it("fails when VI loses the negation", () => {
    expect(check({
      "translations/vi/feeding.yaml": VALID_FIXTURE["translations/vi/feeding.yaml"]!.replace(
        "Không khuyến nghị bắt đầu trước 4 tháng tuổi.",
        "Có thể cân nhắc bắt đầu trước 4 tháng tuổi.",
      ),
    })).toContain("negation-parity");
  });

  it("fails when VI loses the approximation qualifier of a source-approximate claim", () => {
    expect(check({
      "translations/vi/feeding.yaml": VALID_FIXTURE["translations/vi/feeding.yaml"]!.replace("khi bé khoảng 6 tháng tuổi", "khi bé đủ 6 tháng tuổi"),
    })).toContain("qualifier-parity");
  });
});

describe("coverage and tool gates", () => {
  it("fails when a required claim is not rendered by any guidance block", () => {
    expect(check({ "guidance/feeding/solids.yaml": "blocks: []\n" })).toContain("unrendered-claim");
  });

  it("fails when a tool references a missing claim", () => {
    expect(check({
      "tools/registry.yaml": VALID_FIXTURE["tools/registry.yaml"]!.replace("feeding.solids.start", "feeding.solids.removed"),
    })).toContain("unresolved-claim");
  });

  it("fails a released guidance-linked tool whose claim is not release-approved", () => {
    expect(check({
      "tools/registry.yaml": VALID_FIXTURE["tools/registry.yaml"]!.replace("lifecycle: fixture", "lifecycle: released"),
    })).toContain("released-tool-unapproved-claim");
  });
});
