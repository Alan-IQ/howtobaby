// SPDX-License-Identifier: AGPL-3.0-only
/**
 * vendor-fixture adapter (docs/THEME_SYSTEM.md §7, docs/IMPLEMENTATION_ROADMAP.md Phase 1: "sample adapter
 * fixture proving a third-party theme can map without domain imports").
 *
 * Level A (tokens) adapter: translates the vendor kit's own token names into HowToBaby semantic tokens. It
 * imports nothing from packages/core, packages/knowledge, packages/ui, or apps/web — only the contract and the
 * vendor export. Switching between this theme and Baby Modern Glass changes presentation only.
 */

import type { ColorTokens, FoundationTokens, ThemeDefinition, ThemeLicenseRecord } from "../../contract/index.ts";
import { vendorSampleKit, type VendorSampleKitTokens } from "./vendor-sample-kit.ts";

export const VENDOR_FIXTURE_THEME_ID = "vendor-fixture-paper-soft";

type VendorPalette = VendorSampleKitTokens["palette"];

function withAlpha(hex: string, alpha: number): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const n = Number.parseInt(m[1]!, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/** Map one vendor palette into the full semantic token set. Every required token must be assigned. */
function mapPalette(p: VendorPalette, mode: "light" | "dark"): ColorTokens {
  const onAccent = mode === "light" ? p.card : p.paper;
  const soft = (c: string) => withAlpha(c, mode === "light" ? 0.12 : 0.18);
  const statusBg = (c: string) => withAlpha(c, mode === "light" ? 0.1 : 0.16);
  const statusBorder = (c: string) => withAlpha(c, mode === "light" ? 0.35 : 0.4);
  return {
    canvas: p.paper,
    "canvas.tint": `linear-gradient(180deg, ${p.paperTint}, ${p.paper} 60%)`,
    "surface.1": p.card,
    "surface.2": p.cardAlt,
    // The fixture kit has no glass concept: glass resolves to a slightly translucent card so blur still reads.
    "surface.glass": withAlpha(p.card, 0.86),
    "surface.glass.solid": p.card,
    "surface.glass.border": p.line,

    "text.primary": p.ink,
    "text.secondary": p.inkSoft,
    "text.muted": p.inkFaint,
    "text.on-accent": onAccent,
    "text.link": p.brandDeep,

    "border.subtle": p.line,
    "border.strong": p.lineBold,
    "focus.ring": p.brand,

    "interactive.primary.bg": p.brand,
    "interactive.primary.fg": onAccent,
    "interactive.primary.hover": p.brandDeep,
    "interactive.subtle.bg": withAlpha(p.brand, 0.1),
    "interactive.subtle.hover": withAlpha(p.brand, 0.18),
    "interactive.disabled.bg": p.cardAlt,
    "interactive.disabled.fg": p.inkFaint,

    "status.info": p.brandDeep,
    "status.info.bg": statusBg(p.brand),
    "status.info.border": statusBorder(p.brand),
    "status.caution": p.warning,
    "status.caution.bg": statusBg(p.warning),
    "status.caution.border": statusBorder(p.warning),
    "status.clinician": p.violet,
    "status.clinician.bg": statusBg(p.violet),
    "status.clinician.border": statusBorder(p.violet),
    "status.urgent": p.danger,
    "status.urgent.bg": statusBg(p.danger),
    "status.urgent.border": statusBorder(p.danger),
    "status.emergency": p.dangerDeep,
    "status.emergency.bg": statusBg(p.dangerDeep),
    "status.emergency.border": statusBorder(p.dangerDeep),

    "accent.brand": p.brand,
    "accent.brand.soft": soft(p.brand),
    "accent.feeding": p.coral,
    "accent.feeding.soft": soft(p.coral),
    "accent.play": p.success,
    "accent.play.soft": soft(p.success),
    "accent.sleep": p.violet,
    "accent.sleep.soft": soft(p.violet),
    "accent.safety": p.rose,
    "accent.safety.soft": soft(p.rose),
    "accent.tools": p.teal,
    "accent.tools.soft": soft(p.teal),

    "shadow.1": mode === "light" ? "0 1px 2px rgba(31, 36, 33, 0.08)" : "0 1px 2px rgba(0, 0, 0, 0.45)",
    "shadow.2": mode === "light" ? "0 6px 20px rgba(31, 36, 33, 0.12)" : "0 8px 24px rgba(0, 0, 0, 0.55)",
  };
}

/**
 * Foundation: the vendor kit supplies a type family, base size and corner scale; everything it does not
 * define falls back to HowToBaby's baseline geometry so accessibility minimums are never the vendor's call.
 */
function mapFoundation(kit: VendorSampleKitTokens, baseline: FoundationTokens): FoundationTokens {
  const base = Math.max(kit.type.baseSize, 16);
  const px = (n: number) => `${Math.round(n)}px`;
  return {
    ...baseline,
    typography: {
      ...baseline.typography,
      fontSans: kit.type.family,
      size: {
        xs: px(base * 0.75),
        sm: px(base * 0.875),
        md: px(base),
        lg: px(base * 1.125),
        xl: px(base * 1.375),
        "2xl": px(base * 1.75),
        "3xl": px(base * 2.25),
      },
    },
    radius: { sm: px(kit.shape.cornerSm), md: px(kit.shape.cornerMd), lg: px(kit.shape.cornerLg), xl: px(kit.shape.cornerLg * 1.6), pill: "999px" },
    glass: { blur: "8px", saturate: "1.1" },
  };
}

export const vendorFixtureLicense: ThemeLicenseRecord = {
  themeId: VENDOR_FIXTURE_THEME_ID,
  vendor: "HowToBaby (fixture standing in for a vendor)",
  version: vendorSampleKit.kitVersion,
  licenseType: "AGPL-3.0-only (fixture data authored by HowToBaby)",
  redistribution: "allowed",
  sourceLocation: "packages/themes/src/adapters/vendor-fixture/vendor-sample-kit.ts",
  reviewedAt: "2026-08-30",
  notes: "Test fixture only. A real vendor kit would be installed under vendor-themes/<id>/ (gitignored) and referenced here.",
};

/** Build the fixture theme from a vendor token export and HowToBaby's baseline geometry. */
export function adaptVendorSampleKit(kit: VendorSampleKitTokens, baselineFoundation: FoundationTokens): ThemeDefinition {
  return {
    manifest: {
      id: VENDOR_FIXTURE_THEME_ID,
      label: `${kit.kitName}`,
      source: "third-party",
      integrationLevel: "tokens",
      modes: ["light", "dark"],
      adapterId: "vendor-fixture",
      capabilities: {
        glass: false,
        decorativeMotifs: false,
        reducedTransparencyFallback: true,
        printProfile: true,
        supportsEvidenceStates: true,
        supportsSafetyStates: true,
        supportsToolSurfaces: true,
      },
      licenseRef: vendorFixtureLicense.themeId,
    },
    foundation: mapFoundation(kit, baselineFoundation),
    modes: { light: mapPalette(kit.palette, "light"), dark: mapPalette(kit.paletteDark, "dark") },
    print: { canvas: "#ffffff", text: "#111111", textSecondary: "#444444", border: "#bbbbbb", fontSans: kit.type.family },
    license: vendorFixtureLicense,
  };
}

export { vendorSampleKit };
