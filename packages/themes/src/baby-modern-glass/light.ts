// SPDX-License-Identifier: AGPL-3.0-only
/** Baby Modern Glass — Light (docs/GUI_DESIGN.md §4.2): luminous, not washed out. */

import type { ColorTokens } from "../contract/index.ts";

export const babyModernGlassLight: ColorTokens = {
  canvas: "#f7f6fb",
  "canvas.tint":
    "radial-gradient(60rem 40rem at 10% -10%, rgba(154, 166, 245, 0.28), transparent 60%), radial-gradient(48rem 32rem at 100% 0%, rgba(240, 149, 107, 0.18), transparent 55%), radial-gradient(40rem 32rem at 50% 110%, rgba(108, 203, 163, 0.16), transparent 55%)",
  "surface.1": "#ffffff",
  "surface.2": "#f1f1f8",
  "surface.glass": "rgba(255, 255, 255, 0.72)",
  "surface.glass.solid": "#ffffff",
  "surface.glass.border": "rgba(96, 88, 140, 0.16)",

  "text.primary": "#1e1b33",
  "text.secondary": "#4a4766",
  "text.muted": "#6e6b8a",
  "text.on-accent": "#ffffff",
  "text.link": "#3e4fb5",

  "border.subtle": "rgba(30, 27, 51, 0.10)",
  "border.strong": "rgba(30, 27, 51, 0.28)",
  "focus.ring": "#3e4fb5",

  "interactive.primary.bg": "#4a5bd0",
  "interactive.primary.fg": "#ffffff",
  "interactive.primary.hover": "#3e4fb5",
  "interactive.subtle.bg": "rgba(74, 91, 208, 0.08)",
  "interactive.subtle.hover": "rgba(74, 91, 208, 0.14)",
  "interactive.disabled.bg": "#e6e5ef",
  "interactive.disabled.fg": "#8a88a0",

  "status.info": "#2b5fa8",
  "status.info.bg": "#eaf1fb",
  "status.info.border": "#b9cdeb",
  "status.caution": "#8a5a00",
  "status.caution.bg": "#fff4de",
  "status.caution.border": "#f0d08a",
  "status.clinician": "#7a3e9d",
  "status.clinician.bg": "#f5ecfa",
  "status.clinician.border": "#d9bde8",
  "status.urgent": "#b4361a",
  "status.urgent.bg": "#fdece6",
  "status.urgent.border": "#f3b8a6",
  "status.emergency": "#8f1d17",
  "status.emergency.bg": "#fbe4e2",
  "status.emergency.border": "#e89c95",

  "accent.brand": "#5b6cd9",
  "accent.brand.soft": "#e9ecfb",
  "accent.feeding": "#c65d2e",
  "accent.feeding.soft": "#fbe9e0",
  "accent.play": "#2e8b6b",
  "accent.play.soft": "#e1f4ec",
  "accent.sleep": "#4a5bd0",
  "accent.sleep.soft": "#e6e9f9",
  "accent.safety": "#a83a5a",
  "accent.safety.soft": "#f9e4ea",
  "accent.tools": "#1f7fa3",
  "accent.tools.soft": "#e0f2f8",

  "shadow.1": "0 1px 2px rgba(30, 27, 51, 0.06), 0 4px 12px rgba(30, 27, 51, 0.06)",
  "shadow.2": "0 8px 28px rgba(30, 27, 51, 0.12)",
};
