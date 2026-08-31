// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Baby Modern Glass — shared foundation (docs/GUI_DESIGN.md §4.1). Geometry is identical for Light and Dark:
 * they are modes of one family. Raw values live only here and in light.ts/dark.ts; product code uses tokens.
 */

import type { FoundationTokens, PrintTokens, ThemeCapabilities } from "../contract/index.ts";

export const BABY_MODERN_GLASS_ID = "baby-modern-glass";

export const babyModernGlassFoundation: FoundationTokens = {
  typography: {
    // System stack: no third-party font files, full Vietnamese diacritic coverage on every major platform.
    fontSans: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
    fontMono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
    size: { xs: "12px", sm: "14px", md: "16px", lg: "18px", xl: "22px", "2xl": "28px", "3xl": "36px" },
    lineHeight: { tight: "1.2", normal: "1.5", relaxed: "1.65" },
    weight: { regular: "400", medium: "500", semibold: "600", bold: "700" },
  },
  spacing: { "2xs": "4px", xs: "8px", sm: "12px", md: "16px", lg: "24px", xl: "32px", "2xl": "48px", "3xl": "64px" },
  radius: { sm: "8px", md: "12px", lg: "18px", xl: "26px", pill: "999px" },
  motion: {
    durationFast: "120ms",
    durationBase: "200ms",
    durationSlow: "320ms",
    easingStandard: "cubic-bezier(0.2, 0, 0, 1)",
    easingEmphasized: "cubic-bezier(0.3, 0, 0, 1)",
  },
  glass: { blur: "18px", saturate: "1.4" },
  layout: { contentMaxWidth: "1120px", headerHeight: "60px", mobileNavHeight: "64px", touchTarget: "44px" },
};

export const babyModernGlassPrint: PrintTokens = {
  canvas: "#ffffff",
  text: "#111111",
  textSecondary: "#444444",
  border: "#bbbbbb",
  fontSans: 'Georgia, "Times New Roman", ui-serif, serif',
};

export const babyModernGlassCapabilities: ThemeCapabilities = {
  glass: true,
  decorativeMotifs: true,
  reducedTransparencyFallback: true,
  printProfile: true,
  supportsEvidenceStates: true,
  supportsSafetyStates: true,
  supportsToolSurfaces: true,
};
