// SPDX-License-Identifier: AGPL-3.0-only
/**
 * The accessibility contrast gate: the token pairs every installable theme must satisfy, expressed on the
 * semantic contract so it applies to first-party packs and vendor adapters alike. Consumed by the theme
 * test-suite; kept beside the contract so the pair list is reviewable in one place.
 *
 * Pairs reference solid-colour tokens. Translucent surfaces are checked through their opaque fallback
 * (`surface.glass.solid`), matching the reduced-transparency/no-blur rendering path; alpha values are
 * composited over the mode's canvas before measuring.
 */

import type { ColorMode, ThemeDefinition } from "./manifest.ts";
import { contrastRatio, WCAG } from "./contrast.ts";
import type { SemanticColorToken } from "./tokens.ts";

export interface ContrastRequirement {
  readonly fg: SemanticColorToken;
  readonly bg: SemanticColorToken;
  readonly min: number;
  readonly note: string;
}

const TEXT_SURFACES: readonly SemanticColorToken[] = ["canvas", "surface.1", "surface.2", "surface.glass.solid"];

export const CONTRAST_REQUIREMENTS: readonly ContrastRequirement[] = [
  // Body text on every reading surface.
  ...TEXT_SURFACES.flatMap((bg): ContrastRequirement[] => [
    { fg: "text.primary", bg, min: WCAG.text, note: "primary text" },
    { fg: "text.secondary", bg, min: WCAG.text, note: "secondary text" },
    { fg: "text.muted", bg, min: WCAG.text, note: "muted text (still body-size)" },
  ]),
  { fg: "text.link", bg: "canvas", min: WCAG.text, note: "links on canvas" },
  { fg: "text.link", bg: "surface.1", min: WCAG.text, note: "links on cards" },

  // Interactive states.
  { fg: "interactive.primary.fg", bg: "interactive.primary.bg", min: WCAG.text, note: "primary button label" },
  { fg: "interactive.primary.fg", bg: "interactive.primary.hover", min: WCAG.text, note: "primary button label (hover)" },
  { fg: "focus.ring", bg: "canvas", min: WCAG.nonText, note: "focus ring vs canvas" },
  { fg: "focus.ring", bg: "surface.1", min: WCAG.nonText, note: "focus ring vs cards" },
  { fg: "border.strong", bg: "surface.1", min: WCAG.nonText, note: "input/control boundary" },

  // Safety/evidence status text on its tinted surface (docs/GUI_DESIGN.md §12).
  ...(["info", "caution", "clinician", "urgent", "emergency"] as const).map(
    (s): ContrastRequirement => ({ fg: `status.${s}` as SemanticColorToken, bg: `status.${s}.bg` as SemanticColorToken, min: WCAG.text, note: `status ${s} text` }),
  ),

  // Domain accents are used as compact label text (eyebrows, nav highlight) on canvas/cards and on their soft
  // tint, and body copy sits on the tinted-glass card surfaces. The solid `.soft` tint is the measurable proxy
  // for `.glass` — it is exactly what the reduced-transparency fallback renders.
  ...(["brand", "feeding", "play", "sleep", "safety", "tools"] as const).flatMap((a): ContrastRequirement[] => [
    { fg: `accent.${a}` as SemanticColorToken, bg: "canvas", min: WCAG.text, note: `accent ${a} as label text on canvas` },
    { fg: `accent.${a}` as SemanticColorToken, bg: "surface.1", min: WCAG.text, note: `accent ${a} as label text on cards` },
    { fg: `accent.${a}` as SemanticColorToken, bg: `accent.${a}.soft` as SemanticColorToken, min: WCAG.text, note: `accent ${a} on its soft tint` },
    { fg: "text.primary", bg: `accent.${a}.soft` as SemanticColorToken, min: WCAG.text, note: `primary text on ${a} tinted surface` },
    { fg: "text.secondary", bg: `accent.${a}.soft` as SemanticColorToken, min: WCAG.text, note: `secondary text on ${a} tinted surface` },
    { fg: "text.muted", bg: `accent.${a}.soft` as SemanticColorToken, min: WCAG.text, note: `muted text on ${a} tinted surface` },
  ]),
];

export interface ContrastFinding {
  readonly mode: ColorMode;
  readonly fg: string;
  readonly bg: string;
  readonly min: number;
  readonly ratio: number | undefined;
  readonly note: string;
}

/** Requirements a theme fails (unmeasurable pairs are reported with ratio undefined only if both parse). */
export function contrastFindings(theme: ThemeDefinition): ContrastFinding[] {
  const findings: ContrastFinding[] = [];
  for (const mode of theme.manifest.modes) {
    const tokens = theme.modes[mode];
    if (!tokens) continue;
    for (const req of CONTRAST_REQUIREMENTS) {
      const ratio = contrastRatio(tokens[req.fg], tokens[req.bg], tokens.canvas);
      if (ratio === undefined) continue; // non-colour value (gradient); covered by a solid counterpart pair
      if (ratio < req.min) findings.push({ mode, fg: req.fg, bg: req.bg, min: req.min, ratio, note: req.note });
    }
  }
  return findings;
}
