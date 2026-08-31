// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Text-hierarchy gate: primary/secondary/muted must form a visibly ordered ramp in every mode of
 * every shipped theme, so "hierarchy by colour" can be reviewed as a stable machine check instead
 * of eyeballing. Ratios are measured on the mode's canvas; the WCAG floor for each tier is already
 * enforced by the contrast gate — this test guards the *separation* between tiers.
 */

import { describe, expect, it } from "vitest";

import { defaultThemeDefinitions } from "../registry/default-registry.ts";
import { worstCaseContrastRatio } from "./contrast.ts";

/** Primary must stand clearly above secondary; secondary clearly above muted. */
const MIN_PRIMARY_OVER_SECONDARY = 1.4;
const MIN_SECONDARY_OVER_MUTED = 1.15;

describe("text hierarchy separation (title/body vs supporting vs metadata)", () => {
  for (const theme of defaultThemeDefinitions) {
    for (const mode of theme.manifest.modes) {
      const tokens = theme.modes[mode];
      if (!tokens) continue;
      it(`${theme.manifest.id} ${mode}: primary > secondary > muted with review-stable separation`, () => {
        const on = (token: "text.primary" | "text.secondary" | "text.muted") => {
          const ratio = worstCaseContrastRatio(tokens[token], tokens.canvas, tokens.canvas);
          expect(ratio, `${token} must be measurable on canvas`).toBeDefined();
          return ratio!;
        };
        const primary = on("text.primary");
        const secondary = on("text.secondary");
        const muted = on("text.muted");
        expect(primary / secondary, "primary vs secondary separation").toBeGreaterThanOrEqual(MIN_PRIMARY_OVER_SECONDARY);
        expect(secondary / muted, "secondary vs muted separation").toBeGreaterThanOrEqual(MIN_SECONDARY_OVER_MUTED);
      });
    }
  }
});
