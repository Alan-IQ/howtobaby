// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Evidence Drawer / References view-model mapping (docs/GUI_DESIGN.md §11.3, §11.8): the
 * metadata rows keep the required order (section → jurisdiction/scope → current source version →
 * last verified by HowToBaby), the source-version row derives from `updatedAt ?? publishedAt`
 * and is omitted when the authority gives no date, and a healthy `current` source carries no
 * public status while every non-current state stays visible.
 */

import { describe, expect, it } from "vitest";

import type { ClaimEvidenceEntry, SourceRecord } from "@howtobaby/knowledge";

import { referenceEntryForSource, sourceMetaRows } from "./load";

const ref: ClaimEvidenceEntry["sourceRefs"][number] = {
  sourceId: "cdc-introduction-solid-foods",
  relationship: "primary",
  verifiedAt: "2026-08-31",
  locator: { heading: "When, What, and How to Introduce Solid Foods" },
};

const cdc: SourceRecord = {
  id: "cdc-introduction-solid-foods",
  organization: "CDC",
  title: "When, What, and How to Introduce Solid Foods",
  canonicalUrl: "https://www.cdc.gov/example",
  jurisdiction: "US",
  sourceType: "public-health-guidance",
  publishedAt: "2025-01-10",
  updatedAt: "2026-04-14",
  lastVerifiedAt: "2026-08-31",
  status: "current",
  accessMode: "link-only",
  approvalLevel: "approved-primary",
  approvedScopes: ["feeding"],
};

/** Copy of a source record with the given optional date fields removed (not set to undefined). */
function without(source: SourceRecord, ...keys: Array<"publishedAt" | "updatedAt">): SourceRecord {
  const copy: SourceRecord = { ...source };
  for (const key of keys) delete copy[key];
  return copy;
}

describe("Evidence Drawer metadata rows", () => {
  it("orders rows: relevant section → applies-to → current source version → last verified by HowToBaby", () => {
    expect(sourceMetaRows(ref, cdc, "en").map((row) => `${row.label}: ${row.value}`)).toEqual([
      "Relevant section: “When, What, and How to Introduce Solid Foods”",
      "Applies to: United States",
      "Current source version: Apr 14, 2026",
      "Last verified by HowToBaby: Aug 31, 2026",
    ]);
    expect(sourceMetaRows(ref, cdc, "vi").map((row) => `${row.label}: ${row.value}`)).toEqual([
      "Phần liên quan: “When, What, and How to Introduce Solid Foods”",
      "Áp dụng cho: Hoa Kỳ",
      "Phiên bản nguồn hiện tại: 14/04/2026",
      "HowToBaby kiểm chứng lần cuối: 31/08/2026",
    ]);
  });

  it("falls back to publishedAt, and omits the row when the authority provides no date", () => {
    expect(sourceMetaRows(ref, without(cdc, "updatedAt"), "en").map((row) => row.value)).toContain("Jan 10, 2025");
    const labels = sourceMetaRows(ref, without(cdc, "publishedAt", "updatedAt"), "en").map((row) => row.label);
    expect(labels).toEqual(["Relevant section", "Applies to", "Last verified by HowToBaby"]);
  });
});

describe("page References entry", () => {
  it("carries the source version and HowToBaby verification, with no status for a current source", () => {
    expect(referenceEntryForSource(cdc, "en")).toEqual({
      sourceId: cdc.id,
      organization: "CDC",
      title: cdc.title,
      versionLabel: "Current source version: Apr 14, 2026",
      verifiedLabel: "Last verified by HowToBaby: Aug 31, 2026",
      url: cdc.canonicalUrl,
    });
  });

  it("keeps a non-current status visible and omits the version label without a source date", () => {
    const entry = referenceEntryForSource({ ...without(cdc, "publishedAt", "updatedAt"), status: "changed-review-required" }, "vi");
    expect(entry.statusLabel).toBe("Đang rà soát bản cập nhật");
    expect(entry.versionLabel).toBeUndefined();
  });
});
