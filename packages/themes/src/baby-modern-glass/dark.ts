// SPDX-License-Identifier: AGPL-3.0-only
/** Baby Modern Glass — Dark (docs/GUI_DESIGN.md §4.3): deep cool-tinted canvas, still baby-modern. */

import type { ColorTokens } from "../contract/index.ts";

export const babyModernGlassDark: ColorTokens = {
  canvas: "#14131f",
  "canvas.tint":
    "radial-gradient(60rem 40rem at 10% -10%, rgba(154, 166, 245, 0.16), transparent 60%), radial-gradient(48rem 32rem at 100% 0%, rgba(240, 149, 107, 0.10), transparent 55%), radial-gradient(40rem 32rem at 50% 110%, rgba(108, 203, 163, 0.10), transparent 55%)",
  "surface.1": "#1d1c2b",
  "surface.2": "#26243a",
  "surface.glass": "rgba(38, 36, 58, 0.62)",
  "surface.glass.solid": "#26243a",
  "surface.glass.border": "rgba(255, 255, 255, 0.10)",

  "text.primary": "#f1effa",
  "text.secondary": "#c2bfd6",
  "text.muted": "#9895b3",
  "text.on-accent": "#14131f",
  "text.link": "#a9b3f7",

  "border.subtle": "rgba(255, 255, 255, 0.10)",
  "border.strong": "rgba(255, 255, 255, 0.38)",
  "focus.ring": "#a9b3f7",

  "interactive.primary.bg": "#9aa6f5",
  "interactive.primary.fg": "#14131f",
  "interactive.primary.hover": "#b0b9f8",
  "interactive.subtle.bg": "rgba(154, 166, 245, 0.12)",
  "interactive.subtle.hover": "rgba(154, 166, 245, 0.20)",
  "interactive.disabled.bg": "#2b2a3d",
  "interactive.disabled.fg": "#6f6d89",

  "status.info": "#8fb6f0",
  "status.info.bg": "#182338",
  "status.info.border": "#2d4468",
  "status.caution": "#f2c266",
  "status.caution.bg": "#2e2410",
  "status.caution.border": "#6b5320",
  "status.clinician": "#cfa3eb",
  "status.clinician.bg": "#2a1e36",
  "status.clinician.border": "#5a3f72",
  "status.urgent": "#f39a80",
  "status.urgent.bg": "#33201a",
  "status.urgent.border": "#6e3a2b",
  "status.emergency": "#ff9e96",
  "status.emergency.bg": "#3a1a18",
  "status.emergency.border": "#7a2e29",

  "accent.brand": "#9aa6f5",
  "accent.brand.soft": "#22243e",
  "accent.feeding": "#f0956b",
  "accent.feeding.soft": "#33231b",
  "accent.play": "#6ccba3",
  "accent.play.soft": "#16302a",
  "accent.sleep": "#9aa6f5",
  "accent.sleep.soft": "#22243e",
  "accent.safety": "#e88ca6",
  "accent.safety.soft": "#33202a",
  "accent.tools": "#6dc3e3",
  "accent.tools.soft": "#163038",

  "shadow.1": "0 1px 2px rgba(0, 0, 0, 0.40), 0 4px 14px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
  "shadow.2": "0 10px 30px rgba(0, 0, 0, 0.50), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
};
