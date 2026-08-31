// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Baby Modern Glass — Light (docs/GUI_DESIGN.md §4.2): luminous, not washed out.
 *
 * Refined against the approved Phase 1 visual references: pale blue-tinted canvas with soft circle motifs,
 * readable translucent glass with a thin defined border and an inset top highlight, soft blue-grey shadows,
 * restrained blue/peach/mint/lavender accents. Every value passes the contract contrast gate
 * (contract/contrast-gate.ts); accent/status foreground tones are deepened relative to the decorative
 * reference palette because we use them as label text.
 */

import type { ColorTokens } from "../contract/index.ts";

export const babyModernGlassLight: ColorTokens = {
  canvas: "#e8eef5",
  "canvas.tint":
    "radial-gradient(circle at 7% 2%, rgba(80, 147, 200, 0.22), transparent 31%), radial-gradient(circle at 94% 7%, rgba(224, 151, 95, 0.18), transparent 27%), radial-gradient(circle at 82% 88%, rgba(145, 119, 205, 0.15), transparent 28%), linear-gradient(180deg, #dfeaf3 0%, #eaf0f5 54%, #e2ebf2 100%)",
  "surface.1": "#fbfdfe",
  "surface.2": "#edf3f8",
  "surface.glass": "rgba(246, 251, 254, 0.72)",
  "surface.glass.solid": "#f3f8fc",
  "surface.glass.border": "rgba(91, 139, 178, 0.5)",

  "text.primary": "#203247",
  "text.secondary": "#3d566d",
  "text.muted": "#516b82",
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

  "accent.brand": "#38678f",
  "accent.brand.soft": "#dcebf5",
  "accent.feeding": "#9c4f1e",
  "accent.feeding.soft": "#f7e5d6",
  "accent.play": "#2c6b4d",
  "accent.play.soft": "#def0e5",
  "accent.sleep": "#5a4b8a",
  "accent.sleep.soft": "#e9e4f5",
  "accent.safety": "#99364f",
  "accent.safety.soft": "#f6e0e7",
  "accent.tools": "#22697f",
  "accent.tools.soft": "#dcedf3",

  "shadow.1": "0 2px 6px rgba(51, 76, 99, 0.08), 0 12px 26px rgba(51, 76, 99, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.75)",
  "shadow.2": "0 3px 10px rgba(51, 76, 99, 0.08), 0 18px 40px rgba(51, 76, 99, 0.20), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
};
