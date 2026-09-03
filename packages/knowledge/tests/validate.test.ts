// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Phase 2 gate proofs (docs/IMPLEMENTATION_ROADMAP.md): invalid source IDs, claim relationships
 * and precision states fail validation; `official-guidance` without approved direct/primary
 * support fails; EN/VI semantic parity is enforced. Each test mutates a valid fixture through the
 * real loader so the CI scripts and these tests can never diverge.
 */

import { describe, expect, it } from "vitest";

import { loadCanonicalKnowledge, semanticNumberTokens, validateKnowledge } from "../src/index.ts";
import { VALID_FIXTURE, cleanupFixture, loadFixture, rules } from "./helpers.ts";

function check(overrides: Record<string, string | null>): string[] {
  const { knowledge, dir } = loadFixture(overrides);
  cleanupFixture(dir);
  return rules(knowledge, "error");
}

function checkWarnings(overrides: Record<string, string | null>): string[] {
  const { knowledge, dir } = loadFixture(overrides);
  cleanupFixture(dir);
  return rules(knowledge, "warning");
}

/** CDC source block with the given field lines swapped in (fixture uses status: current). */
function cdcSource(lines: string): string {
  return VALID_FIXTURE["sources/registry.yaml"]!.replace(
    `    lastVerifiedAt: 2026-08-30
    verifiedBy: maintainer
    status: current
    accessMode: link-only
    approvalLevel: approved-primary
    approvedScopes: [feeding]
  - id: who-complementary-feeding`,
    `${lines}
  - id: who-complementary-feeding`,
  );
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

  describe("source-date provenance contract (publishedAt/updatedAt are the authority's dates)", () => {
    const base = `    lastVerifiedAt: 2026-08-30
    verifiedBy: maintainer
    status: current
    accessMode: link-only
    approvalLevel: approved-primary
    approvedScopes: [feeding]`;
    const withDates = (dates: string) => ({ "sources/registry.yaml": cdcSource(`${dates}\n${base}`) });

    it("accepts publishedAt only", () => {
      expect(check(withDates("    publishedAt: 2025-01-10"))).toEqual([]);
    });

    it("accepts updatedAt only", () => {
      expect(check(withDates("    updatedAt: 2026-04-14"))).toEqual([]);
    });

    it("accepts equal publishedAt/updatedAt (one source version)", () => {
      expect(check(withDates("    publishedAt: 2026-04-14\n    updatedAt: 2026-04-14"))).toEqual([]);
    });

    it("accepts updatedAt later than publishedAt", () => {
      expect(check(withDates("    publishedAt: 2025-01-10\n    updatedAt: 2026-04-14"))).toEqual([]);
    });

    it("accepts neither date (no date is inferred)", () => {
      expect(check(withDates(""))).toEqual([]);
    });

    it("rejects updatedAt earlier than publishedAt", () => {
      expect(check(withDates("    publishedAt: 2026-04-14\n    updatedAt: 2025-01-10"))).toContain("source-date-order");
    });

    it("rejects a future publishedAt", () => {
      expect(check(withDates("    publishedAt: 2026-09-01"))).toContain("future-date");
    });

    it("rejects a future updatedAt", () => {
      expect(check(withDates("    publishedAt: 2025-01-10\n    updatedAt: 2026-09-01"))).toContain("future-date");
    });

    it("rejects a non-calendar publishedAt/updatedAt", () => {
      expect(check(withDates("    publishedAt: 2025-02-30"))).toContain("invalid-date");
      expect(check(withDates("    updatedAt: 2026-13-01"))).toContain("invalid-date");
      expect(check(withDates('    updatedAt: "April 2026"'))).toContain("invalid-date");
    });
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
    verifiedBy: maintainer
    status: current
    accessMode: link-only
    approvalLevel: approved-primary
    approvedScopes: [feeding]
  - id: who-complementary-feeding`,
      `    lastVerifiedAt: 2026-08-30
    verifiedBy: maintainer
    status: superseded
    supersededBy: who-complementary-feeding
    accessMode: link-only
    approvalLevel: approved-primary
    approvedScopes: [feeding]
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
    })).toEqual(expect.arrayContaining(["missing-vi-parity", "missing-locale-text"]));
  });

  it("fails when quantities diverge between EN and VI", () => {
    expect(check({
      "translations/vi/feeding.yaml": VALID_FIXTURE["translations/vi/feeding.yaml"]!.replace("khoảng 6 tháng", "khoảng 7 tháng"),
    })).toContain("quantity-parity");
  });

  // Regression: `chưa` ("not yet") used to satisfy the single generic negation check, so a
  // Vietnamese "has not yet started before 4 months" could pass against an English
  // "is not recommended". Prohibition strength must survive translation for safety copy.
  describe("prohibition strength survives translation (`chưa` is not a prohibition)", () => {
    const viText = (line: string) =>
      VALID_FIXTURE["translations/vi/feeding.yaml"]!.replace("Không khuyến nghị bắt đầu trước 4 tháng tuổi.", line);

    it("fails when VI drops the negation entirely", () => {
      expect(check({ "translations/vi/feeding.yaml": viText("Có thể cân nhắc bắt đầu trước 4 tháng tuổi.") }))
        .toContain("prohibition-parity");
    });

    it("fails when an EN prohibition is rendered with `chưa` alone", () => {
      expect(check({ "translations/vi/feeding.yaml": viText("Bé chưa bắt đầu ăn dặm trước 4 tháng tuổi.") }))
        .toContain("prohibition-parity");
    });

    it.each(["Không khuyến nghị bắt đầu trước 4 tháng tuổi.", "Đừng bắt đầu trước 4 tháng tuổi.", "Tránh bắt đầu trước 4 tháng tuổi.", "Chớ bắt đầu trước 4 tháng tuổi."])(
      "accepts the prohibition marker in %j",
      (line) => {
        expect(check({ "translations/vi/feeding.yaml": viText(line) })).not.toContain("prohibition-parity");
      },
    );

    it("still accepts `chưa` for an EN \u201cnot yet\u201d, which is a timing statement", () => {
      const en = VALID_FIXTURE["translations/en/feeding.yaml"]!.replace(
        "Starting before 4 months is not recommended.",
        "Many babies are not yet ready before 4 months.",
      );
      const errors = check({
        "translations/en/feeding.yaml": en,
        "translations/vi/feeding.yaml": viText("Nhiều bé chưa sẵn sàng trước 4 tháng tuổi."),
      });
      expect(errors).not.toContain("prohibition-parity");
      expect(errors).not.toContain("negation-parity");
    });

    it("fails when an EN \u201cnot yet\u201d loses every VI negation", () => {
      const en = VALID_FIXTURE["translations/en/feeding.yaml"]!.replace(
        "Starting before 4 months is not recommended.",
        "Many babies are not yet ready before 4 months.",
      );
      expect(check({
        "translations/en/feeding.yaml": en,
        "translations/vi/feeding.yaml": viText("Nhiều bé đã sẵn sàng trước 4 tháng tuổi."),
      })).toContain("negation-parity");
    });
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

// ---------------------------------------------------------------------------------------------
// Phase 2 regression gates (public release gate, source approval/scope, EN/VI semantic order,
// source lifecycle propagation, coverage contract, rights boundary).
// ---------------------------------------------------------------------------------------------

describe("public release gate (build-time, not a UI filter)", () => {
  const EMPTY_COVERAGE = "cells: []\n";

  it("fails when a guidance block renders a draft claim, even when the claim is dropped from the coverage matrix", () => {
    expect(check({
      "claims/feeding/solids.yaml": VALID_FIXTURE["claims/feeding/solids.yaml"]!.replace("reviewStatus: source-verified", "reviewStatus: draft"),
      "coverage/matrix.yaml": EMPTY_COVERAGE, // the bypass attempt: no coverage cell references the claim
    })).toContain("unreleased-claim-rendered");
  });

  it("fails when a guidance block renders a clinical-review-required claim outside the coverage matrix", () => {
    expect(check({
      "claims/feeding/solids.yaml": VALID_FIXTURE["claims/feeding/solids.yaml"]!.replace("reviewStatus: source-verified", "reviewStatus: clinical-review-required"),
      "coverage/matrix.yaml": EMPTY_COVERAGE,
    })).toContain("unreleased-claim-rendered");
  });

  it("fails when a guidance block renders a superseded claim outside the coverage matrix", () => {
    expect(check({
      "claims/feeding/solids.yaml": VALID_FIXTURE["claims/feeding/solids.yaml"]!.replace("reviewStatus: source-verified", "reviewStatus: superseded"),
      "coverage/matrix.yaml": EMPTY_COVERAGE,
    })).toContain("unreleased-claim-rendered");
  });
});

describe("source approval boundary", () => {
  it("rejects a source missing the approval metadata entirely", () => {
    expect(check({
      "sources/registry.yaml": cdcSource(`    lastVerifiedAt: 2026-08-30
    verifiedBy: maintainer
    status: current
    accessMode: link-only`),
    })).toContain("invalid-enum"); // approvalLevel is required and machine-checkable
  });

  it("fails when a primary relationship points to an unapproved source (a blog cannot become primary by declaration)", () => {
    const errors = check({
      "sources/registry.yaml": cdcSource(`    lastVerifiedAt: 2026-08-30
    verifiedBy: maintainer
    status: current
    accessMode: link-only
    approvalLevel: unapproved`),
    });
    expect(errors).toContain("unapproved-primary-source");
    expect(errors).toContain("official-guidance-approved-scope-support");
  });

  it("fails official-guidance when the approved primary source does not cover the claim's domain", () => {
    const errors = check({
      "sources/registry.yaml": cdcSource(`    lastVerifiedAt: 2026-08-30
    verifiedBy: maintainer
    status: current
    accessMode: link-only
    approvalLevel: approved-primary
    approvedScopes: [sleep]`),
    });
    expect(errors).toContain("primary-source-scope-mismatch");
    expect(errors).toContain("official-guidance-approved-scope-support");
    expect(errors).toContain("missing-approved-primary-source"); // coverage source-coverage axis
  });

  it("rejects an approved source that declares no scopes", () => {
    expect(check({
      "sources/registry.yaml": cdcSource(`    lastVerifiedAt: 2026-08-30
    verifiedBy: maintainer
    status: current
    accessMode: link-only
    approvalLevel: approved-primary`),
    })).toContain("approved-source-without-scope");
  });
});

describe("EN/VI semantic order parity", () => {
  it("fails when identical numbers swap semantic positions (reversed age boundaries)", () => {
    // EN: "about 6 months … before 4 months"; VI mistranslation: "khoảng 4 tháng … trước 6 tháng".
    expect(check({
      "translations/vi/feeding.yaml": VALID_FIXTURE["translations/vi/feeding.yaml"]!
        .replace("khoảng 6 tháng tuổi", "khoảng 4 tháng tuổi")
        .replace("trước 4 tháng tuổi", "trước 6 tháng tuổi"),
    })).toContain("quantity-parity");
  });

  it("fails when a unit changes in translation (tháng → tuần)", () => {
    expect(check({
      "translations/vi/feeding.yaml": VALID_FIXTURE["translations/vi/feeding.yaml"]!.replace("khoảng 6 tháng tuổi", "khoảng 6 tuần tuổi"),
    })).toContain("unit-parity");
  });

  it("fails when the VI drops the unit entirely (about 6 months → khoảng 6)", () => {
    expect(check({
      "translations/vi/feeding.yaml": VALID_FIXTURE["translations/vi/feeding.yaml"]!.replace("khoảng 6 tháng tuổi", "khoảng 6"),
    })).toContain("unit-parity");
  });

  it("accepts a rephrased VI that preserves the unit", () => {
    expect(check({
      "translations/vi/feeding.yaml": VALID_FIXTURE["translations/vi/feeding.yaml"]!.replace("khoảng 6 tháng tuổi", "khoảng 6 tháng"),
    })).not.toContain("unit-parity");
  });

  it("fails when a boundary qualifier is dropped (trước 4 tháng → lúc 4 tháng)", () => {
    expect(check({
      "translations/vi/feeding.yaml": VALID_FIXTURE["translations/vi/feeding.yaml"]!.replace("bắt đầu trước 4 tháng tuổi", "bắt đầu lúc 4 tháng tuổi"),
    })).toContain("boundary-parity");
  });

  it("still fails when quantities differ outright", () => {
    expect(check({
      "translations/vi/feeding.yaml": VALID_FIXTURE["translations/vi/feeding.yaml"]!.replace("khoảng 6 tháng", "khoảng 7 tháng"),
    })).toContain("quantity-parity");
  });

  it("recognizes units whose last letter carries a diacritic (giờ) and the year unit tuổi", () => {
    expect(semanticNumberTokens("không quá 1 giờ mỗi ngày", "vi")).toEqual([{ value: "1", unit: "hour" }]);
    expect(semanticNumberTokens("trẻ dưới 2 tuổi", "vi")).toEqual([{ value: "2", unit: "year", qualifier: "before" }]);
    expect(semanticNumberTokens("children younger than 2 years", "en")).toEqual([{ value: "2", unit: "year", qualifier: "before" }]);
    expect(semanticNumberTokens("2 tuổi rưỡi", "vi")).toEqual([{ value: "2", unit: "year" }]);
  });

  it("does not read the negated upper bound `không quá` as an `after` boundary", () => {
    expect(semanticNumberTokens("no more than 1 hour a day", "en")).toEqual([{ value: "1", unit: "hour" }]);
    expect(semanticNumberTokens("quá 1 giờ", "vi")[0]?.qualifier).toBe("after");
    expect(semanticNumberTokens("sau 2 tuổi", "vi")[0]?.qualifier).toBe("after");
  });

  it("accepts `chưa` as the Vietnamese counterpart of an English `no … yet`", () => {
    expect(check({
      "translations/en/feeding.yaml": VALID_FIXTURE["translations/en/feeding.yaml"]!.replace("Starting before 4 months is not recommended.", "There is no checklist before 4 months yet."),
      "translations/vi/feeding.yaml": VALID_FIXTURE["translations/vi/feeding.yaml"]!.replace("Không khuyến nghị bắt đầu trước 4 tháng tuổi.", "Chưa có danh sách nào trước 4 tháng tuổi."),
    })).not.toContain("negation-parity");
  });
});

describe("source lifecycle propagation", () => {
  const CHANGED_CDC = `    updatedAt: 2026-08-31
    lastVerifiedAt: 2026-08-30
    verifiedBy: maintainer
    status: changed-review-required
    accessMode: link-only
    approvalLevel: approved-primary
    approvedScopes: [feeding]`;

  it("warns when a claim depends on a changed-review-required source (support is not fully current)", () => {
    expect(checkWarnings({
      "sources/registry.yaml": cdcSource(`    lastVerifiedAt: 2026-08-30
    verifiedBy: maintainer
    status: changed-review-required
    accessMode: link-only
    approvalLevel: approved-primary
    approvedScopes: [feeding]`),
    })).toContain("changed-source-pending-review");
  });

  it("warns for a stale reference when the source changed after the ref was last verified", () => {
    expect(checkWarnings({ "sources/registry.yaml": cdcSource(CHANGED_CDC) })).toContain("changed-source-review-required");
  });

  it("fails when a release-approved claim keeps relying on a changed, un-reverified source", () => {
    expect(check({
      "sources/registry.yaml": cdcSource(CHANGED_CDC),
      "claims/feeding/solids.yaml": VALID_FIXTURE["claims/feeding/solids.yaml"]!.replace("reviewStatus: source-verified", "reviewStatus: release-approved"),
    })).toContain("release-on-changed-source");
  });
});

describe("coverage contract (stage × domain × section × locales × source × review)", () => {
  it("fails when a section demands a higher review status than the claim has", () => {
    expect(check({
      "coverage/matrix.yaml": VALID_FIXTURE["coverage/matrix.yaml"]!.replace("minimumReviewStatus: source-verified", "minimumReviewStatus: release-approved"),
    })).toContain("unreviewed-claim");
  });

  it("rejects a duplicate section id within a cell", () => {
    expect(check({
      "coverage/matrix.yaml": `
cells:
  - domain: feeding
    stage: feed-06-08m
    sections:
      - section: solids-introduction
        requiredClaimIds: [feeding.solids.start]
      - section: solids-introduction
        requiredClaimIds: [feeding.solids.start]
`,
    })).toContain("duplicate-section");
  });

  it("rejects the legacy cell shape without sections", () => {
    expect(check({
      "coverage/matrix.yaml": `
cells:
  - domain: feeding
    stage: feed-06-08m
    requiredClaimIds: [feeding.solids.start]
`,
    })).toContain("missing-field");
  });
});

describe("rights boundary for locator hints", () => {
  it("warns when a paragraphHint stores a long verbatim quotation", () => {
    const quote = "The Dietary Guidelines for Americans and the American Academy of Pediatrics recommend introducing children to foods other than breast milk or infant formula at about 6 months.";
    expect(checkWarnings({
      "claims/feeding/solids.yaml": VALID_FIXTURE["claims/feeding/solids.yaml"]!.replace(
        `      - sourceId: cdc-introduction-solid-foods
        relationship: primary
        verifiedAt: 2026-08-30`,
        `      - sourceId: cdc-introduction-solid-foods
        relationship: primary
        locator:
          paragraphHint: '"${quote}"'
        verifiedAt: 2026-08-30`,
      ),
    })).toContain("verbatim-locator-hint");
  });

  it("accepts a concise paraphrased locator hint", () => {
    expect(checkWarnings({
      "claims/feeding/solids.yaml": VALID_FIXTURE["claims/feeding/solids.yaml"]!.replace(
        `      - sourceId: cdc-introduction-solid-foods
        relationship: primary
        verifiedAt: 2026-08-30`,
        `      - sourceId: cdc-introduction-solid-foods
        relationship: primary
        locator:
          paragraphHint: Paragraph on the recommended starting age (about 6 months); paraphrased context.
        verifiedAt: 2026-08-30`,
      ),
    })).not.toContain("verbatim-locator-hint");
  });
});

describe("honest review states (contract §14, CLAUDE.md §5)", () => {
  const claim = (from: string, to: string) => ({
    "claims/feeding/solids.yaml": VALID_FIXTURE["claims/feeding/solids.yaml"]!.replace(from, to),
  });

  it("rejects an ai-assisted review that claims a human clinical review", () => {
    expect(check(claim("reviewStatus: source-verified\n    reviewedBy: maintainer", "reviewStatus: clinically-reviewed\n    reviewedBy: ai-assisted")))
      .toContain("ai-assisted-clinical-review");
  });

  it("rejects an ai-assisted review that claims release approval", () => {
    expect(check(claim("reviewStatus: source-verified\n    reviewedBy: maintainer", "reviewStatus: release-approved\n    reviewedBy: ai-assisted")))
      .toContain("ai-assisted-clinical-review");
  });

  it("accepts a maintainer-reviewed claim in the same states", () => {
    const errors = check(claim("reviewStatus: source-verified", "reviewStatus: clinically-reviewed"));
    expect(errors).not.toContain("ai-assisted-clinical-review");
    expect(errors).not.toContain("ai-verified-source-under-clinical-claim");
  });

  it("rejects urgent/emergency wording resting on an ai-assisted review", () => {
    expect(check(claim("safetyLevel: info", "safetyLevel: urgent"))).not.toContain("ai-assisted-urgent-wording");
    expect(check({
      "claims/feeding/solids.yaml": VALID_FIXTURE["claims/feeding/solids.yaml"]!
        .replace("safetyLevel: info", "safetyLevel: emergency")
        .replace("reviewedBy: maintainer", "reviewedBy: ai-assisted"),
    })).toContain("ai-assisted-urgent-wording");
  });

  it("rejects a clinician-asserting claim standing on an ai-verified source", () => {
    expect(check({
      "sources/registry.yaml": VALID_FIXTURE["sources/registry.yaml"]!.replace("verifiedBy: maintainer", "verifiedBy: ai-assisted"),
      "claims/feeding/solids.yaml": VALID_FIXTURE["claims/feeding/solids.yaml"]!.replace("reviewStatus: source-verified", "reviewStatus: clinically-reviewed"),
    })).toContain("ai-verified-source-under-clinical-claim");
  });

  it("requires `reviewedBy` and `verifiedBy` to be recorded at all", () => {
    expect(check({
      "claims/feeding/solids.yaml": VALID_FIXTURE["claims/feeding/solids.yaml"]!.replace("    reviewedBy: maintainer\n", ""),
    })).toContain("invalid-enum");
    expect(check({
      "sources/registry.yaml": VALID_FIXTURE["sources/registry.yaml"]!.replaceAll("    verifiedBy: maintainer\n", ""),
    })).toContain("invalid-enum");
  });
});

describe("safety-bearing prohibitions need real provenance", () => {
  // Regression: `development.06-09m.what-not-to-force` attributed a jumper/bouncer prohibition to
  // an AAP source that only covers wheeled walkers. A prohibition is a recommendation; a merely
  // contextual reference cannot carry one.
  const prohibitionText = VALID_FIXTURE["translations/en/feeding.yaml"]!.replace(
    "Starting before 4 months is not recommended.",
    "Never start before 4 months.",
  );

  it("fails a caution-level prohibition whose references are only contextual", () => {
    expect(check({
      "translations/en/feeding.yaml": prohibitionText,
      "claims/feeding/solids.yaml": VALID_FIXTURE["claims/feeding/solids.yaml"]!
        .replace("guidanceClass: official-guidance", "guidanceClass: practical-interpretation")
        .replace("safetyLevel: info", "safetyLevel: caution")
        .replace("relationship: primary", "relationship: contextual"),
    })).toContain("unsupported-prohibition");
  });

  it("accepts the same prohibition when a direct/primary reference carries it", () => {
    expect(check({
      "translations/en/feeding.yaml": prohibitionText,
      "claims/feeding/solids.yaml": VALID_FIXTURE["claims/feeding/solids.yaml"]!.replace("safetyLevel: info", "safetyLevel: caution"),
    })).not.toContain("unsupported-prohibition");
  });

  it("does not police info-level text, which carries no safety recommendation", () => {
    expect(check({
      "translations/en/feeding.yaml": prohibitionText,
      "claims/feeding/solids.yaml": VALID_FIXTURE["claims/feeding/solids.yaml"]!
        .replace("guidanceClass: official-guidance", "guidanceClass: practical-interpretation")
        .replace("relationship: primary", "relationship: contextual"),
    })).not.toContain("unsupported-prohibition");
  });
});
