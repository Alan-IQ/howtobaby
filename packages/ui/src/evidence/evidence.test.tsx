// SPDX-License-Identifier: AGPL-3.0-only
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { EvidenceDrawer, ReferenceList, SourceChip, type EvidenceSourceView } from "./index.ts";

const RAW_COLOR = /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(/i;

const cdc: EvidenceSourceView = {
  sourceId: "cdc-introduction-solid-foods",
  organization: "CDC",
  title: "When, What, and How to Introduce Solid Foods",
  relationshipLabel: "Primary source",
  statusTone: "calm",
  meta: [
    { label: "Relevant section", value: "“When, What, and How to Introduce Solid Foods”", icon: "document" },
    { label: "Applies to", value: "United States", icon: "globe" },
    { label: "Published", value: "Jan 10, 2025", icon: "document" },
    { label: "Updated", value: "Apr 14, 2026", icon: "document" },
    { label: "Last verified by HowToBaby", value: "Aug 31, 2026", icon: "calendar" },
  ],
  whyLabel: "Why this source is used",
  whyText: "This guidance is based on the official recommendation this organization publishes.",
  url: "https://www.cdc.gov/infant-toddler-nutrition/foods-and-drinks/when-what-and-how-to-introduce-solid-foods.html",
};

describe("SourceChip (GUI_DESIGN.md §11.2)", () => {
  it("renders the class label with organization names, never URLs", () => {
    const html = renderToStaticMarkup(<SourceChip classLabel="Official guidance" organizations={["CDC", "WHO"]} onOpen={() => {}} />);
    expect(html).toContain("Official guidance");
    expect(html).toContain("CDC");
    expect(html).toContain("WHO");
    expect(html).not.toContain("https://");
    expect(html).toMatch(/^<button type="button"/);
    expect(html).toContain('aria-label="Official guidance — CDC, WHO"');
  });

  it("stays visible as a non-interactive label without onOpen", () => {
    const html = renderToStaticMarkup(<SourceChip classLabel="Official guidance" organizations={["CDC"]} />);
    expect(html).toMatch(/^<span/);
    expect(html).not.toContain("<button");
  });
});

describe("EvidenceDrawer (GUI_DESIGN.md §11.3)", () => {
  const html = renderToStaticMarkup(
    <EvidenceDrawer open onClose={() => {}} title="Sources for this guidance" claimText="Introduce solids at about 6 months." classLabel="Official guidance" sources={[cdc]} />,
  );

  it("shows organization, exact title, the role badge and every labeled metadata row", () => {
    for (const text of [
      "CDC",
      "When, What, and How to Introduce Solid Foods",
      "Primary source",
      "Relevant section",
      "Applies to",
      "United States",
      "Published",
      "Jan 10, 2025",
      "Updated",
      "Apr 14, 2026",
      "Last verified by HowToBaby",
      "Aug 31, 2026",
      "Why this source is used",
    ]) {
      expect(html).toContain(text);
    }
  });

  it("keeps metadata as a definition list with labeled rows, never bare value lines", () => {
    expect(html).toContain("<dl");
    expect(html).toMatch(/<dt>.*<span>Applies to<\/span><\/dt><dd>United States<\/dd>/);
    expect(html).toMatch(/<dt>.*<span>Last verified by HowToBaby<\/span><\/dt><dd>Aug 31, 2026<\/dd>/);
  });

  it("renders no status badge for a current source, and an attention badge for a non-current one", () => {
    expect(html).not.toContain("htb-evidence-source__badge--status");
    expect(html).not.toContain("htb-evidence-source__badge--attention");
    expect(html).toContain("htb-evidence-source__badge--role");
    const attention = renderToStaticMarkup(
      <EvidenceDrawer open onClose={() => {}} title="Sources" sources={[{ ...cdc, statusLabel: "Reviewing an update", statusTone: "attention" }]} />,
    );
    expect(attention).toContain("htb-evidence-source__badge--attention");
    expect(attention).toContain("Reviewing an update");
  });

  it("keeps metadata icons decorative (aria-hidden), never the only signal", () => {
    expect(html).toMatch(/<svg[^>]+aria-hidden="true"/);
    expect(html).not.toMatch(/<dt><svg[^>]*><\/svg><\/dt>/); // every dt also carries its text label
  });

  it("offers a safe View-original-source action", () => {
    expect(html).toContain("View original source");
    expect(html).toMatch(/<a[^>]+href="https:\/\/www\.cdc\.gov[^"]*"[^>]+target="_blank"[^>]+rel="noopener noreferrer"/);
  });

  it("never implies authority endorsement", () => {
    expect(html).toContain("These organizations publish the original sources but do not review or endorse HowToBaby’s guidance.");
  });

  it("presents the claim as HowToBaby guidance supported by sources, never as a source quote", () => {
    expect(html).toContain("This guidance is written by HowToBaby and supported by the original sources listed below. The wording is HowToBaby’s, not a direct quote from these organizations.");
    expect(html).toContain("HowToBaby guidance");
    expect(html).toContain("Introduce solids at about 6 months.");
    expect(html).toContain("Official guidance");
    expect(html).not.toContain("<blockquote");
  });
});

describe("ReferenceList (GUI_DESIGN.md §11.4)", () => {
  it("deduplicates by source ID and renders provenance per entry", () => {
    const entry = { sourceId: cdc.sourceId, organization: "CDC", title: cdc.title, sourceDateLabel: "Published: Jan 10, 2025 · Updated: Apr 14, 2026", verifiedLabel: "Last verified by HowToBaby: Aug 31, 2026", url: cdc.url };
    const html = renderToStaticMarkup(<ReferenceList entries={[entry, entry]} />);
    expect(html).toContain("Sources used on this page");
    expect(html.match(/htb-reference-list__entry/g)).toHaveLength(1);
    expect(html).toContain("Published: Jan 10, 2025 · Updated: Apr 14, 2026");
    expect(html).toContain("Last verified by HowToBaby: Aug 31, 2026");
    expect(html).not.toContain("htb-reference-list__status"); // current source: no status text
    const reviewing = renderToStaticMarkup(<ReferenceList entries={[{ ...entry, statusLabel: "Reviewing an update" }]} />);
    expect(reviewing).toContain("Reviewing an update");
    // Print keeps a scannable URL even though the interactive link is hidden on paper.
    expect(html).toContain("htb-reference-list__print-url");
  });

  it("renders nothing for an empty evidence set instead of an empty heading", () => {
    expect(renderToStaticMarkup(<ReferenceList entries={[]} />)).toBe("");
  });
});

describe("token discipline", () => {
  it("no evidence component emits raw palette values inline", () => {
    const html = renderToStaticMarkup(
      <>
        <SourceChip classLabel="Official guidance" organizations={["CDC"]} onOpen={() => {}} />
        <EvidenceDrawer open onClose={() => {}} title="Sources" sources={[cdc]} />
        <ReferenceList entries={[{ sourceId: "x-y", organization: "CDC", title: "T", verifiedLabel: "V", url: "https://example.org" }]} />
      </>,
    );
    expect(html).not.toMatch(RAW_COLOR);
  });
});
