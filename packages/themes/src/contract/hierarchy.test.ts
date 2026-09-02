// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Text-hierarchy gate: primary/secondary/muted must form a visibly ordered ramp in every mode of
 * every shipped theme, so "hierarchy by colour" can be reviewed as a stable machine check instead
 * of eyeballing. Ratios are measured on the mode's canvas; the WCAG floor for each tier is already
 * enforced by the contrast gate — this test guards the *separation* between tiers.
 */

import { describe, expect, it } from "vitest";

import { defaultThemeDefinitions } from "../registry/default-registry.ts";
import { parseColor, relativeLuminance, worstCaseContrastRatio } from "./contrast.ts";

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

/**
 * Domain accent role separation: `accent.<domain>.visual` (icon/strip/underline) may share the
 * text-safe `accent.<domain>` label tone (a vendor adapter with one colour per domain is valid) but must
 * never be darker than it in any theme/mode. The first-party Baby Modern Glass light mode goes further:
 * the whole point of the split there is a visibly brighter identity colour, so it is held to a minimum
 * luminance step over the label tone.
 */
const ACCENTS = ["brand", "feeding", "play", "sleep", "safety", "tools"] as const;
const FIRST_PARTY_THEME_ID = "baby-modern-glass";
const MIN_LIGHT_VISUAL_OVER_TEXT_LUMINANCE = 1.4;

describe("domain accent roles (text-safe label vs visual marker)", () => {
  for (const theme of defaultThemeDefinitions) {
    for (const mode of theme.manifest.modes) {
      const tokens = theme.modes[mode];
      if (!tokens) continue;
      it(`${theme.manifest.id} ${mode}: accent.*.visual is at least as luminous as accent.*`, () => {
        for (const a of ACCENTS) {
          const text = parseColor(tokens[`accent.${a}`]);
          const visual = parseColor(tokens[`accent.${a}.visual`]);
          expect(text, `accent.${a} must be a solid colour`).toBeDefined();
          expect(visual, `accent.${a}.visual must be a solid colour`).toBeDefined();
          const ratio = relativeLuminance(visual!) / relativeLuminance(text!);
          const min = theme.manifest.id === FIRST_PARTY_THEME_ID && mode === "light" ? MIN_LIGHT_VISUAL_OVER_TEXT_LUMINANCE : 1;
          expect(ratio, `accent.${a}.visual vs accent.${a} luminance (${mode}, min ${min})`).toBeGreaterThanOrEqual(min);
        }
      });
    }
  }
});
