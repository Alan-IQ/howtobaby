// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Baby Modern Glass — Light (docs/GUI_DESIGN.md §4.2): luminous, not washed out.
 *
 * Refined against the approved Phase 1 visual references: pale blue-tinted canvas with soft circle motifs,
 * readable translucent glass with a thin defined border and an inset top highlight, soft blue-grey shadows,
 * fresh, clearly distinct domain accents (coral, mint, lavender, rose, sky, blue). Every value
 * passes the contract contrast gate (contract/contrast-gate.ts); accent/status foreground tones are
 * deepened relative to the decorative reference palette because we use them as label text, while
 * the pastel soft/glass tints and vivid glass borders carry the brightness.
 */

import type { ColorTokens } from "../contract/index.ts";

export const babyModernGlassLight: ColorTokens = {
  canvas: "#e8eef5",
  "canvas.tint":
    "radial-gradient(circle at 7% 2%, rgba(80, 147, 200, 0.30), transparent 31%), radial-gradient(circle at 94% 7%, rgba(224, 151, 95, 0.24), transparent 27%), radial-gradient(circle at 20% 55%, rgba(120, 184, 146, 0.14), transparent 24%), radial-gradient(circle at 82% 88%, rgba(145, 119, 205, 0.20), transparent 28%), linear-gradient(180deg, #dfeaf3 0%, #eaf0f5 54%, #e2ebf2 100%)",
  "surface.1": "#fbfdfe",
  "surface.2": "#edf3f8",
  "surface.glass": "linear-gradient(180deg, rgba(248, 252, 255, 0.84), rgba(235, 244, 251, 0.62))",
  "surface.glass.solid": "#f3f8fc",
  "surface.glass.border": "rgba(91, 139, 178, 0.52)",
  "surface.glass.highlight": "rgba(255, 255, 255, 0.85)",
  // Lit selection pill: bright INNER rim (equals the glass highlight) + darker OUTER seam
  // (the pre-token value: glass border at 45% strength). In dark mode the pair inverts.
  "surface.glass.glow": "rgba(255, 255, 255, 0.85)",
  "surface.glass.seam": "rgba(91, 139, 178, 0.234)",

  // Text hierarchy: primary is a deep ink-navy so main content clearly leads; secondary keeps the
  // supporting blue-grey; muted drops saturation (slate, not blue) as well as luminance so metadata
  // visibly recedes while every step still clears the 4.5:1 gate on the worst glass/tint stop.
  "text.primary": "#182a3e",
  "text.secondary": "#3d566d",
  "text.muted": "#556170",
  "text.on-accent": "#ffffff",
  "text.link": "#31618c",

  "border.subtle": "rgba(32, 50, 71, 0.14)",
  "border.strong": "#7b93a6",
  "focus.ring": "#3e6f9c",

  "interactive.primary.bg": "#42749d",
  "interactive.primary.fg": "#ffffff",
  "interactive.primary.hover": "#365f83",
  "interactive.subtle.bg": "rgba(93, 145, 183, 0.14)",
  "interactive.subtle.hover": "rgba(93, 145, 183, 0.24)",
  "interactive.disabled.bg": "#dde6ee",
  "interactive.disabled.fg": "#7d8fa1",

  "status.info": "#2b5d84",
  "status.info.bg": "#e1eef7",
  "status.info.border": "#9fc2d8",
  "status.caution": "#5d502c",
  "status.caution.bg": "#f5ebc9",
  "status.caution.border": "#d9c27f",
  "status.clinician": "#584a80",
  "status.clinician.bg": "#ece6f5",
  "status.clinician.border": "#c0b2d8",
  "status.urgent": "#8a4517",
  "status.urgent.bg": "#f8e5d8",
  "status.urgent.border": "#dfb396",
  "status.emergency": "#8f2f3f",
  "status.emergency.bg": "#f4dfe5",
  "status.emergency.border": "#d9a7b5",

  // Domain accents (docs/GUI_DESIGN.md §4.2): light mode reads fresh and clearly distinct at a
  // glance — coral/warm orange, mint green, lavender/periwinkle, rose, sky cyan and a clean blue —
  // the same six families as dark mode, re-derived for a light canvas rather than copied. The label
  // colour (`accent.*`) is the deepest, most saturated tone that still clears 4.5:1 on canvas,
  // cards and its own soft/glass tints, because eyebrows and nav highlights are text. The domain
  // identity itself is carried by `accent.*.visual`: a clearly brighter, fresher tone for the
  // title icon, card identity strip and nav underline, gated at the 3:1 non-text floor on every
  // surface it is drawn on (contract/contrast-gate.ts VISUAL_ACCENT_SURFACES + its own soft/glass tints). The pastel `.soft`/`.glass` surfaces and vivid
  // `.glass.border` carry the rest of the brightness.
  "accent.brand": "#2c5f9e",
  "accent.brand.visual": "#4c78c6",
  "accent.brand.soft": "#dce9fb",
  "accent.brand.glass": "linear-gradient(180deg, rgba(204, 226, 252, 0.80), rgba(228, 240, 255, 0.62))",
  "accent.brand.glass.border": "rgba(88, 150, 224, 0.70)",
  "accent.feeding": "#b03b0b",
  "accent.feeding.visual": "#d05f32",
  "accent.feeding.soft": "#ffe4d5",
  "accent.feeding.glass": "linear-gradient(180deg, rgba(255, 222, 204, 0.78), rgba(255, 235, 224, 0.60))",
  "accent.feeding.glass.border": "rgba(240, 140, 90, 0.72)",
  "accent.play": "#1a7248",
  "accent.play.visual": "#2b9260",
  "accent.play.soft": "#d8f4e5",
  "accent.play.glass": "linear-gradient(180deg, rgba(202, 242, 222, 0.80), rgba(228, 248, 237, 0.60))",
  "accent.play.glass.border": "rgba(80, 190, 135, 0.70)",
  "accent.sleep": "#5847b3",
  "accent.sleep.visual": "#7b6bd5",
  "accent.sleep.soft": "#e6e2fb",
  "accent.sleep.glass": "linear-gradient(180deg, rgba(222, 214, 253, 0.80), rgba(238, 234, 254, 0.60))",
  "accent.sleep.glass.border": "rgba(150, 130, 235, 0.70)",
  "accent.safety": "#ad2857",
  "accent.safety.visual": "#cd4d77",
  "accent.safety.soft": "#fde0ea",
  "accent.safety.glass": "linear-gradient(180deg, rgba(253, 214, 229, 0.78), rgba(254, 231, 239, 0.60))",
  "accent.safety.glass.border": "rgba(235, 120, 160, 0.70)",
  "accent.tools": "#0c6a89",
  "accent.tools.visual": "#2789ad",
  "accent.tools.soft": "#d6f1fa",
  "accent.tools.glass": "linear-gradient(180deg, rgba(196, 236, 250, 0.80), rgba(224, 245, 252, 0.60))",
  "accent.tools.glass.border": "rgba(70, 180, 220, 0.72)",

  "shadow.1": "0 2px 6px rgba(51, 76, 99, 0.08), 0 10px 22px rgba(51, 76, 99, 0.12)",
  "shadow.2": "0 4px 12px rgba(51, 76, 99, 0.10), 0 20px 42px rgba(51, 76, 99, 0.20)",
};
