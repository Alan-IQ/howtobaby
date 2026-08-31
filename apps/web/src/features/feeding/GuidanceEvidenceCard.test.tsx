// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Local guidance content-language override (GUI_DESIGN.md §11 + Phase 2 i18n foundation):
 * rendering semantics of the card + Evidence Drawer under global/local locale combinations.
 * The override STATE semantics (reset on global change, no effect on the global preference,
 * third-locale generality) are covered by the pure content-locale tests in @howtobaby/i18n.
 */

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { UI_STRINGS } from "@/features/evidence/labels";
import type { GuidanceBlockView } from "@/features/evidence/load";
import { GuidanceEvidenceCardView, type GuidanceEvidenceCardViewProps } from "./GuidanceEvidenceCard";

function block(locale: "en" | "vi"): GuidanceBlockView {
  const text = locale === "vi" ? "Bắt đầu ăn dặm khi bé khoảng 6 tháng tuổi." : "Start solid foods at about 6 months.";
  const title = locale === "vi" ? "Bắt đầu ăn dặm" : "Starting solid foods";
  return {
    blockId: "feeding-solids-start",
    locale,
    title,
    strings: UI_STRINGS[locale],
    claims: [
      {
        claimId: "claim-solids-start",
        text,
        classLabel: locale === "vi" ? "Hướng dẫn chính thức" : "Official guidance",
        organizations: ["CDC"],
        sources: [
          {
            sourceId: "cdc-solids",
            organization: "CDC",
            title: "When, What, and How to Introduce Solid Foods",
            relationshipLabel: locale === "vi" ? "Nguồn chính" : "Primary source",
            statusLabel: locale === "vi" ? "Hiện hành" : "Current",
            statusTone: "calm",
            meta: [],
            whyLabel: UI_STRINGS[locale].metaWhy,
            whyText: "why",
            url: "https://example.test/cdc",
          },
        ],
      },
    ],
  };
}

const VARIANTS = { en: block("en"), vi: block("vi") };

function render(overrides: Partial<GuidanceEvidenceCardViewProps>): string {
  const props: GuidanceEvidenceCardViewProps = {
    variants: VARIANTS,
    globalLocale: "en",
    contentLocale: "en",
    contentLanguageLabel: "Guidance language",
    eyebrow: "Starting solids",
    onSelectContentLocale: () => {},
    openClaimId: null,
    onOpenClaim: () => {},
    ...overrides,
  };
  return renderToStaticMarkup(<GuidanceEvidenceCardView {...props} />);
}

describe("local guidance content-language override", () => {
  it("hides the local toggle while the global language is canonical (global EN)", () => {
    const html = render({ globalLocale: "en", contentLocale: "en" });
    expect(html).not.toContain("guidance-lang-toggle");
    expect(html).toContain("Start solid foods at about 6 months.");
    // Content matches <html lang>; no per-element lang override is emitted.
    expect(html).not.toContain('lang="en"');
  });

  it("shows a VI ↔ EN local toggle while the global language is VI, VI active by default", () => {
    const html = render({ globalLocale: "vi", contentLocale: "vi" });
    expect(html).toContain("guidance-lang-toggle");
    expect(html).toContain('aria-label="Guidance language"');
    // Active global locale listed first, canonical second; state via aria-pressed, never colour.
    expect(html.indexOf(">VI</button>")).toBeGreaterThan(-1);
    expect(html.indexOf(">VI</button>")).toBeLessThan(html.indexOf(">EN</button>"));
    expect(html).toMatch(/aria-pressed="true"[^>]*lang="vi"|lang="vi"[^>]*aria-pressed="true"/);
    expect(html).toContain("Bắt đầu ăn dặm khi bé khoảng 6 tháng tuổi.");
    // Card content equals the global language — no lang attribute on the claim block.
    expect(html).not.toContain('class="guidance-evidence-card__claim" lang');
  });

  it("renders canonical content with an explicit lang when locally switched to EN under global VI", () => {
    const html = render({ globalLocale: "vi", contentLocale: "en" });
    expect(html).toContain("Start solid foods at about 6 months.");
    expect(html).not.toContain("Bắt đầu ăn dặm khi bé khoảng 6 tháng tuổi.");
    // Claim block and title carry lang="en" because <html lang> stays "vi" (global unchanged).
    expect(html).toMatch(/guidance-evidence-card__claim" lang="en"/);
    expect(html).toContain('<span lang="en">Starting solid foods</span>');
    // EN is the active toggle option now.
    expect(html).toMatch(/aria-pressed="true"[^>]*lang="en"|lang="en"[^>]*aria-pressed="true"/);
    // Card chrome (eyebrow, toggle group label) stays in the GLOBAL language surface.
    expect(html).toContain("Starting solids");
  });

  it("keeps the Evidence Drawer on the card's local content locale, with the matching lang", () => {
    const html = render({ globalLocale: "vi", contentLocale: "en", openClaimId: "claim-solids-start" });
    expect(html).toContain(UI_STRINGS.en.sourcesDrawerTitle);
    expect(html).not.toContain(UI_STRINGS.vi.sourcesDrawerTitle);
    expect(html).toMatch(/<dialog[^>]*lang="en"/);
  });

  it("keeps the Evidence Drawer in the global language while no local override applies", () => {
    const html = render({ globalLocale: "vi", contentLocale: "vi", openClaimId: "claim-solids-start" });
    expect(html).toContain(UI_STRINGS.vi.sourcesDrawerTitle);
    // Drawer locale equals <html lang>; no redundant lang attribute.
    expect(html).not.toMatch(/<dialog[^>]*lang=/);
  });

  it("names each toggle option in its own language for assistive tech", () => {
    const html = render({ globalLocale: "vi", contentLocale: "vi" });
    expect(html).toContain('aria-label="Tiếng Việt"');
    expect(html).toContain('aria-label="English"');
  });
});
