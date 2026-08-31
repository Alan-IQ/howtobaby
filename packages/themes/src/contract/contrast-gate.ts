// SPDX-License-Identifier: AGPL-3.0-only
/**
 * The accessibility contrast gate: the token pairs every installable theme must satisfy, expressed on the
 * semantic contract so it applies to first-party packs and vendor adapters alike. Consumed by the theme
 * test-suite; kept beside the contract so the pair list is reviewable in one place.
 *
 * Backgrounds may be solid colours or single linear/radial gradients: gradients are measured stop-by-stop
 * (each stop alpha-composited over the mode's canvas) and must pass at their WORST stop, i.e. text must be
 * readable at every point of the rendered glass surface. The solid `.soft`/`.glass.solid` fallbacks are
 * gated separately for the reduced-transparency / no-backdrop-filter rendering path — they are fallbacks,
 * not proxies. A required pair whose background cannot be measured is a failure, never a silent skip.
 */

import type { ColorMode, ThemeDefinition } from "./manifest.ts";
import { WCAG, worstCaseContrastRatio } from "./contrast.ts";
import type { SemanticColorToken } from "./tokens.ts";

export interface ContrastRequirement {
  readonly fg: SemanticColorToken;
  readonly bg: SemanticColorToken;
  readonly min: number;
  readonly note: string;
}

const TEXT_SURFACES: readonly SemanticColorToken[] = [
  "canvas",
  "surface.1",
  "surface.2",
  "surface.glass", // the rendered glass surface itself (gradient-aware, worst stop)
  "surface.glass.solid", // its opaque reduced-transparency fallback
];

const ACCENTS = ["brand", "feeding", "play", "sleep", "safety", "tools"] as const;

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

  // Domain accents are used as compact label text (eyebrows, nav highlight) on canvas/cards, and body copy
  // sits on the tinted-glass card surfaces. `.glass` is measured as rendered (worst gradient stop over
  // canvas); `.soft` is the opaque fallback surface and is gated in its own right.
  ...ACCENTS.flatMap((a): ContrastRequirement[] => [
    { fg: `accent.${a}` as SemanticColorToken, bg: "canvas", min: WCAG.text, note: `accent ${a} as label text on canvas` },
    { fg: `accent.${a}` as SemanticColorToken, bg: "surface.1", min: WCAG.text, note: `accent ${a} as label text on cards` },
    ...(["glass", "soft"] as const).flatMap((surface): ContrastRequirement[] => [
      { fg: `accent.${a}` as SemanticColorToken, bg: `accent.${a}.${surface}` as SemanticColorToken, min: WCAG.text, note: `accent ${a} label on its ${surface} tint` },
      { fg: "text.primary", bg: `accent.${a}.${surface}` as SemanticColorToken, min: WCAG.text, note: `primary text on ${a} ${surface} surface` },
      { fg: "text.secondary", bg: `accent.${a}.${surface}` as SemanticColorToken, min: WCAG.text, note: `secondary text on ${a} ${surface} surface` },
      { fg: "text.muted", bg: `accent.${a}.${surface}` as SemanticColorToken, min: WCAG.text, note: `muted text on ${a} ${surface} surface` },
    ]),
  ]),
];

export interface ContrastFinding {
  readonly mode: ColorMode;
  readonly fg: string;
  readonly bg: string;
  readonly min: number;
  /** worst-case measured ratio; undefined = the pair could not be measured, which is itself a failure */
  readonly ratio: number | undefined;
  readonly note: string;
}

/**
 * Requirements a theme fails. Every listed pair MUST be measurable — a background the contrast module
 * cannot parse (multi-layer image, unsupported colour syntax) is reported as a finding with
 * `ratio: undefined` so gate coverage can never rot silently.
 */
export function contrastFindings(theme: ThemeDefinition): ContrastFinding[] {
  const findings: ContrastFinding[] = [];
  for (const mode of theme.manifest.modes) {
    const tokens = theme.modes[mode];
    if (!tokens) continue;
    for (const req of CONTRAST_REQUIREMENTS) {
      const ratio = worstCaseContrastRatio(tokens[req.fg], tokens[req.bg], tokens.canvas);
      if (ratio === undefined) {
        findings.push({ mode, fg: req.fg, bg: req.bg, min: req.min, ratio: undefined, note: `${req.note} — UNMEASURABLE background` });
      } else if (ratio < req.min) {
        findings.push({ mode, fg: req.fg, bg: req.bg, min: req.min, ratio, note: req.note });
      }
    }
  }
  return findings;
}
