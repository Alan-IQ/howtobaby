// SPDX-License-Identifier: AGPL-3.0-only
/**
 * EN/VI presentation-parity guards for the evidence UI vocabulary: both locales must expose the
 * same label sets (no meaning available in one language only), a healthy `current` source must
 * carry no public status badge (its trust signal is the source-date + verification rows),
 * and metadata helpers must emit labeled rows, never bare values.
 */

import { describe, expect, it } from "vitest";

import type { SourceRecord } from "@howtobaby/knowledge";

import {
  GUIDANCE_CLASS_LABELS,
  RELATIONSHIP_LABELS,
  RELATIONSHIP_WHY_LABELS,
  STATUS_LABELS,
  UI_STRINGS,
  jurisdictionMeta,
  publicStatusLabel,
  sourceDateLabel,
  sourceDateMeta,
  verifiedLabel,
} from "./labels";

const baseSource: SourceRecord = {
  id: "cdc-introduction-solid-foods",
  organization: "CDC",
  title: "When, What, and How to Introduce Solid Foods",
  canonicalUrl: "https://www.cdc.gov/example",
  jurisdiction: "US",
  sourceType: "public-health-guidance",
  lastVerifiedAt: "2026-08-31",
  status: "current",
  accessMode: "link-only",
  approvalLevel: "approved-primary",
  approvedScopes: ["feeding"],
};

describe("EN/VI presentation parity", () => {
  it("every label set carries identical keys in both locales", () => {
    expect(Object.keys(GUIDANCE_CLASS_LABELS.vi).sort()).toEqual(Object.keys(GUIDANCE_CLASS_LABELS.en).sort());
    expect(Object.keys(RELATIONSHIP_LABELS.vi).sort()).toEqual(Object.keys(RELATIONSHIP_LABELS.en).sort());
    expect(Object.keys(RELATIONSHIP_WHY_LABELS.vi).sort()).toEqual(Object.keys(RELATIONSHIP_WHY_LABELS.en).sort());
    expect(Object.keys(STATUS_LABELS.vi).sort()).toEqual(Object.keys(STATUS_LABELS.en).sort());
    expect(Object.keys(UI_STRINGS.vi).sort()).toEqual(Object.keys(UI_STRINGS.en).sort());
  });

  it("renders no public status badge for a healthy current source, in both locales", () => {
    expect("current" in STATUS_LABELS.en).toBe(false);
    expect(publicStatusLabel("current", "en")).toBeUndefined();
    expect(publicStatusLabel("current", "vi")).toBeUndefined();
  });

  it("keeps every non-current lifecycle state visible with the shared vocabulary", () => {
    expect(publicStatusLabel("changed-review-required", "en")).toBe("Reviewing an update");
    expect(publicStatusLabel("changed-review-required", "vi")).toBe("Đang rà soát bản cập nhật");
    expect(publicStatusLabel("superseded", "en")).toBe("Superseded");
    expect(publicStatusLabel("retired", "en")).toBe("Retired");
    expect(publicStatusLabel("temporarily-unreachable", "en")).toBe("Source temporarily unavailable");
  });
});

describe("source date matrix (publishedAt / updatedAt are distinct upstream facts, never inferred)", () => {
  it("A. publishedAt only → a single Published row (no Updated, no Current source version)", () => {
    expect(sourceDateMeta({ publishedAt: "2026-08-04" }, "en")).toEqual([{ label: "Published", value: "Aug 4, 2026" }]);
    expect(sourceDateLabel({ publishedAt: "2026-08-04" }, "vi")).toBe("Phát hành: 04/08/2026");
    expect(sourceDateLabel({ publishedAt: "2026-08-04" }, "en")).not.toContain("Updated");
    expect(sourceDateLabel({ publishedAt: "2026-08-04" }, "en")).not.toContain("Current source version");
  });

  it("B. updatedAt only → Current source version (never presented as a publication date)", () => {
    expect(sourceDateMeta({ updatedAt: "2026-04-14" }, "en")).toEqual([{ label: "Current source version", value: "Apr 14, 2026" }]);
    expect(sourceDateLabel({ updatedAt: "2026-04-14" }, "vi")).toBe("Phiên bản nguồn hiện tại: 14/04/2026");
    expect(sourceDateLabel({ updatedAt: "2026-04-14" }, "en")).not.toContain("Published");
  });

  it("C. both dates equal → Published only; no duplicate Updated / source-version row", () => {
    const equal = { publishedAt: "2026-04-14", updatedAt: "2026-04-14" };
    expect(sourceDateMeta(equal, "en")).toEqual([{ label: "Published", value: "Apr 14, 2026" }]);
    expect(sourceDateMeta(equal, "vi")).toEqual([{ label: "Phát hành", value: "14/04/2026" }]);
    expect(sourceDateLabel(equal, "en")).toBe("Published: Apr 14, 2026");
    expect(sourceDateLabel(equal, "vi")).toBe("Phát hành: 14/04/2026");
    expect(sourceDateLabel(equal, "en")).not.toContain("Updated");
    expect(sourceDateLabel(equal, "en")).not.toContain("Current source version");
  });

  it("D. updatedAt later than publishedAt → Published + Updated rows, in that order, in both locales", () => {
    const both = { publishedAt: "2025-01-10", updatedAt: "2026-04-14" };
    expect(sourceDateMeta(both, "en")).toEqual([
      { label: "Published", value: "Jan 10, 2025" },
      { label: "Updated", value: "Apr 14, 2026" },
    ]);
    expect(sourceDateMeta(both, "vi")).toEqual([
      { label: "Phát hành", value: "10/01/2025" },
      { label: "Cập nhật", value: "14/04/2026" },
    ]);
    expect(sourceDateLabel(both, "en")).toBe("Published: Jan 10, 2025 · Updated: Apr 14, 2026");
    expect(sourceDateLabel(both, "vi")).toBe("Phát hành: 10/01/2025 · Cập nhật: 14/04/2026");
  });

  it("E. neither → no rows and no label; a date is never invented", () => {
    expect(sourceDateMeta({}, "en")).toEqual([]);
    expect(sourceDateMeta({}, "vi")).toEqual([]);
    expect(sourceDateLabel({}, "en")).toBeUndefined();
    expect(sourceDateLabel({}, "vi")).toBeUndefined();
  });

  it("never conflates source dates with HowToBaby's verification date", () => {
    const source = { ...baseSource, updatedAt: "2026-04-14" };
    expect(sourceDateLabel(source, "en")).toBe("Current source version: Apr 14, 2026");
    expect(verifiedLabel(source.lastVerifiedAt, "en")).toBe("Last verified by HowToBaby: Aug 31, 2026");
  });
});

describe("labeled metadata", () => {
  it("US sources get a labeled Applies to row instead of a bare country name", () => {
    expect(jurisdictionMeta(baseSource, "en")).toEqual({ label: "Applies to", value: "United States" });
    expect(jurisdictionMeta(baseSource, "vi")).toEqual({ label: "Áp dụng cho", value: "Hoa Kỳ" });
  });

  it("global sources get a labeled Scope row instead of Global (WHO)", () => {
    const who: SourceRecord = { ...baseSource, id: "who-complementary-feeding", organization: "WHO", jurisdiction: "global" };
    expect(jurisdictionMeta(who, "en")).toEqual({ label: "Scope", value: "Global" });
    expect(jurisdictionMeta(who, "vi")).toEqual({ label: "Phạm vi", value: "Toàn cầu" });
  });

  it("verification is attributed to HowToBaby, not left as a bare Verified date", () => {
    expect(verifiedLabel("2026-08-31", "en")).toBe("Last verified by HowToBaby: Aug 31, 2026");
    expect(verifiedLabel("2026-08-31", "vi")).toBe("HowToBaby kiểm chứng lần cuối: 31/08/2026");
  });
});
