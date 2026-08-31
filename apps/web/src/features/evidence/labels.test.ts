// SPDX-License-Identifier: AGPL-3.0-only
/**
 * EN/VI presentation-parity guards for the evidence UI vocabulary: both locales must expose the
 * same label sets (no meaning available in one language only), statuses must include an explicit
 * "Current", and metadata helpers must emit labeled rows, never bare values.
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

  it("source status labels include an explicit Current in both locales", () => {
    expect(STATUS_LABELS.en.current).toBe("Current");
    expect(STATUS_LABELS.vi.current).toBe("Hiện hành");
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
