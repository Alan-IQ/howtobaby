// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Reduced-motion / motion-token contract for the sliding-selection system: every transition on
 * the persistent indicators (tab bar ::after, desktop nav pill, segmented pill, popover-style
 * controls) must be driven by the semantic motion tokens — never a literal duration — because
 * the tokens are what `prefers-reduced-motion: reduce` and the project reduced-motion preference
 * collapse to 0ms (css-vars adapter). A literal duration would escape reduced motion.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "styles.css"), "utf8");

function block(selector: string): string {
  const start = css.indexOf(`${selector} {`);
  expect(start, `selector ${selector} present`).toBeGreaterThan(-1);
  return css.slice(start, css.indexOf("}", start));
}

describe("sliding indicators animate on motion tokens only", () => {
  for (const selector of [".htb-nav--tabs::before,\n.htb-nav--tabs::after", ".htb-nav__indicator", ".htb-segmented__indicator"]) {
    it(`${selector} transitions use var(--htb-motion-*) and no literal duration`, () => {
      const rules = block(selector);
      expect(rules).toContain("transition:");
      expect(rules).toMatch(/var\(--htb-motion-duration-(fast|base)\)/);
      expect(rules).not.toMatch(/transition:[^;]*\d+m?s/); // no literal 200ms/0.2s etc.
    });
  }

  it("the tab-bar indicator moves by transform (composited), not by animating left/width", () => {
    const rules = block(".htb-nav--tabs::before,\n.htb-nav--tabs::after");
    expect(rules).toContain("transform: translateX(");
    expect(rules).not.toMatch(/transition:[^;]*\bleft\b/);
    expect(rules).not.toMatch(/transition:[^;]*\bwidth\b/);
  });
});
