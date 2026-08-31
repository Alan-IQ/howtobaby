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
    "radial-gradient(circle at 7% 2%, rgba(80, 147, 200, 0.30), transparent 31%), radial-gradient(circle at 94% 7%, rgba(224, 151, 95, 0.24), transparent 27%), radial-gradient(circle at 20% 55%, rgba(120, 184, 146, 0.14), transparent 24%), radial-gradient(circle at 82% 88%, rgba(145, 119, 205, 0.20), transparent 28%), linear-gradient(180deg, #dfeaf3 0%, #eaf0f5 54%, #e2ebf2 100%)",
  "surface.1": "#fbfdfe",
  "surface.2": "#edf3f8",
  "surface.glass": "linear-gradient(180deg, rgba(248, 252, 255, 0.84), rgba(235, 244, 251, 0.62))",
  "surface.glass.solid": "#f3f8fc",
  "surface.glass.border": "rgba(91, 139, 178, 0.52)",
  "surface.glass.highlight": "rgba(255, 255, 255, 0.85)",

  "text.primary": "#203247",
  "text.secondary": "#3d566d",
  "text.muted": "#4d6579",
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
  "accent.brand.glass": "linear-gradient(180deg, rgba(200, 227, 247, 0.78), rgba(228, 242, 252, 0.60))",
  "accent.brand.glass.border": "rgba(94, 153, 195, 0.68)",
  "accent.feeding": "#9c4f1e",
  "accent.feeding.soft": "#f7e5d6",
  "accent.feeding.glass": "linear-gradient(180deg, rgba(242, 205, 176, 0.72), rgba(247, 224, 207, 0.56))",
  "accent.feeding.glass.border": "rgba(223, 149, 88, 0.62)",
  "accent.play": "#2c6b4d",
  "accent.play.soft": "#def0e5",
  "accent.play.glass": "linear-gradient(180deg, rgba(205, 235, 216, 0.74), rgba(232, 247, 237, 0.58))",
  "accent.play.glass.border": "rgba(101, 173, 130, 0.62)",
  "accent.sleep": "#5a4b8a",
  "accent.sleep.soft": "#e9e4f5",
  "accent.sleep.glass": "linear-gradient(180deg, rgba(226, 211, 244, 0.74), rgba(242, 234, 250, 0.58))",
  "accent.sleep.glass.border": "rgba(151, 124, 203, 0.58)",
  "accent.safety": "#99364f",
  "accent.safety.soft": "#f6e0e7",
  "accent.safety.glass": "linear-gradient(180deg, rgba(244, 210, 221, 0.72), rgba(248, 230, 236, 0.56))",
  "accent.safety.glass.border": "rgba(200, 132, 150, 0.62)",
  "accent.tools": "#22697f",
  "accent.tools.soft": "#dcedf3",
  "accent.tools.glass": "linear-gradient(180deg, rgba(198, 229, 239, 0.74), rgba(226, 243, 248, 0.58))",
  "accent.tools.glass.border": "rgba(70, 150, 178, 0.58)",

  "shadow.1": "0 2px 6px rgba(51, 76, 99, 0.08), 0 10px 22px rgba(51, 76, 99, 0.12)",
  "shadow.2": "0 4px 12px rgba(51, 76, 99, 0.10), 0 20px 42px rgba(51, 76, 99, 0.20)",
};
