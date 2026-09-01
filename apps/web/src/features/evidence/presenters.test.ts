// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Localized evidence presentation: source-status tone mapping shared by every surface, and the
 * /sources registry presenter producing a fully localized view for ANY registered locale — no
 * hard-coded "en" presentation anywhere.
 */

import { describe, expect, it } from "vitest";

import { SUPPORTED_LOCALES } from "@howtobaby/i18n";
import type { PublicSourceEntry } from "@howtobaby/knowledge/repository";

import { PRECISION_CLASS_LABELS, REVIEW_STATUS_LABELS, SAFETY_LEVEL_LABELS, SOURCE_TYPE_LABELS, STATUS_LABELS, UI_STRINGS, sourceStatusTone } from "./labels";
import { sourceRegistryEntryView } from "./presenters";

const ENTRY: PublicSourceEntry = {
  sourceId: "cdc-solids",
  organization: "CDC",
  title: "When, What, and How to Introduce Solid Foods",
  canonicalUrl: "https://example.test/cdc",
  jurisdiction: "US",
  sourceType: "fact-sheet",
  status: "current",
  lastVerifiedAt: "2026-08-26",
  claimCount: 1,
};

describe("source status tone (shared by /sources badge and Evidence Drawer)", () => {
  it("treats current as calm/neutral — never caution", () => {
    expect(sourceStatusTone("current")).toBe("calm");
  });

  it("treats every non-current state as attention", () => {
    expect(sourceStatusTone("changed-review-required")).toBe("attention");
    expect(sourceStatusTone("superseded")).toBe("attention");
    expect(sourceStatusTone("retired")).toBe("attention");
    expect(sourceStatusTone("temporarily-unreachable")).toBe("attention");
  });
});

describe("/sources registry presenter", () => {
  it("localizes every label for every registered locale, keeping title/organization/URL verbatim", () => {
    for (const { id: locale } of SUPPORTED_LOCALES) {
      const view = sourceRegistryEntryView(ENTRY, locale);
      expect(view.title).toBe(ENTRY.title);
      expect(view.organization).toBe(ENTRY.organization);
      expect(view.url).toBe(ENTRY.canonicalUrl);
      expect(view.statusLabel).toBeUndefined(); // healthy current source: no badge
      expect(view.metaLine).toContain(UI_STRINGS[locale].jurisdictionUS);
      expect(view.metaLine).toContain(SOURCE_TYPE_LABELS[locale]["fact-sheet"]);
      expect(view.metaLine).toContain(UI_STRINGS[locale].metaLastVerified);
    }
  });

  it("renders Vietnamese presentation under vi — not the English fallback", () => {
    const view = sourceRegistryEntryView({ ...ENTRY, updatedAt: "2026-04-14" }, "vi");
    expect(view.metaLine).toContain("Phiên bản nguồn hiện tại: 14/04/2026");
    expect(view.metaLine).toContain("Hoa Kỳ");
    expect(view.metaLine).toContain("26/08/2026");
    expect(view.metaLine).not.toContain("United States");
  });

  it("renders no status badge for a current source but keeps every non-current state visible", () => {
    expect(sourceRegistryEntryView(ENTRY, "en").statusLabel).toBeUndefined();
    expect(sourceRegistryEntryView(ENTRY, "en").statusTone).toBe("calm");
    for (const status of ["changed-review-required", "superseded", "retired", "temporarily-unreachable"] as const) {
      const view = sourceRegistryEntryView({ ...ENTRY, status }, "en");
      expect(view.statusLabel).toBe(STATUS_LABELS.en[status]);
      expect(view.statusTone).toBe("attention");
    }
  });

  it("renders the source-date matrix before HowToBaby's verification, or omits it", () => {
    const both = sourceRegistryEntryView({ ...ENTRY, publishedAt: "2025-01-10", updatedAt: "2026-04-14" }, "en").metaLine;
    expect(both).toContain("Published: Jan 10, 2025 · Updated: Apr 14, 2026 · Last verified by HowToBaby: Aug 26, 2026");
    expect(sourceRegistryEntryView({ ...ENTRY, publishedAt: "2026-08-04" }, "en").metaLine).toContain("Published: Aug 4, 2026 · Last verified");
    expect(sourceRegistryEntryView({ ...ENTRY, updatedAt: "2026-04-14" }, "en").metaLine).toContain("Current source version: Apr 14, 2026 · Last verified");
    const none = sourceRegistryEntryView(ENTRY, "en").metaLine;
    for (const label of ["Published", "Updated", "Current source version"]) expect(none).not.toContain(label);
  });
});

describe("evidence vocabulary label parity", () => {
  it("defines identical key sets for every registered locale", () => {
    for (const table of [REVIEW_STATUS_LABELS, PRECISION_CLASS_LABELS, SAFETY_LEVEL_LABELS, SOURCE_TYPE_LABELS]) {
      const keySets = SUPPORTED_LOCALES.map(({ id }) => Object.keys(table[id]).sort());
      for (const keys of keySets) expect(keys).toEqual(keySets[0]);
    }
  });
});
