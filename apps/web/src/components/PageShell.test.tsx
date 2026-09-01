// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Shared page-shell/layout contract: every page renders the same container anatomy — one
 * `.page-shell` with a toolbar row that reserves the same height whether or not a print action
 * renders, so titles start on the same vertical rhythm site-wide — and every app route goes
 * through PageShell (no page may ship its own diverging container).
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PageShell } from "./PageShell";

describe("PageShell anatomy contract", () => {
  it("renders identical shell anatomy with and without a print action (toolbar always present)", () => {
    for (const printable of [true, false]) {
      const html = renderToStaticMarkup(
        <PageShell title="Title" lede="Lede" eyebrow="Eyebrow" printable={printable}>
          <p>body</p>
        </PageShell>,
      );
      expect(html).toContain('class="page-shell"');
      // The toolbar row exists on every page — its reserved min-height (CSS) keeps the title
      // starting at the same y whether or not the print control renders.
      expect(html).toContain("page-shell__toolbar");
      expect(html).toContain("page-shell__header");
      expect(html).toContain("page-shell__body");
      expect(html).toContain("print-context");
    }
  });

  it("every app route renders through PageShell (one container contract, no per-page layouts)", () => {
    const appDir = join(__dirname, "..", "app");
    const pages: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) walk(path);
        else if (entry.name === "page.tsx" || entry.name === "not-found.tsx") pages.push(path);
      }
    };
    walk(appDir);
    expect(pages.length).toBeGreaterThanOrEqual(14);
    for (const page of pages) {
      if (page.includes("theme-lab")) continue; // dev-only laboratory, not a shipped surface
      expect(readFileSync(page, "utf8"), `${page} must use PageShell`).toContain("<PageShell");
    }
  });
});
