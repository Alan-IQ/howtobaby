// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Stable semantic token vocabulary (docs/THEME_SYSTEM.md §5).
 *
 * Product/domain components consume these names (through the CSS variables the css-vars adapter emits);
 * theme packs — first-party or vendor adapters — map their palettes INTO these names. HowToBaby never maps
 * components to vendor colour names.
 */

/** Colour-mode dependent tokens. Every production-selectable theme must resolve all of them per mode. */
export const SEMANTIC_COLOR_TOKENS = [
  // canvas / surfaces
  "canvas",
  "canvas.tint",
  "surface.1",
  "surface.2",
  "surface.glass",
  "surface.glass.solid", // opaque fallback used when blur is unavailable or transparency is reduced
  "surface.glass.border",
  "surface.glass.highlight", // inset top light-edge that sells the glass; subtle (but present) in dark mode
  "surface.glass.glow", // lit selection pill, INNER 1px rim — bright in light mode, quietly dark in dark mode
  "surface.glass.seam", // lit selection pill, OUTER 1px contour — dark in light mode, thinly luminous in dark mode (the two invert between modes: what is dark in light is the part that lights up in dark)
  // text
  "text.primary",
  "text.secondary",
  "text.muted",
  "text.on-accent",
  "text.link",
  // borders / focus
  "border.subtle",
  "border.strong",
  "focus.ring",
  // interaction
  "interactive.primary.bg",
  "interactive.primary.fg",
  "interactive.primary.hover",
  "interactive.subtle.bg",
  "interactive.subtle.hover",
  "interactive.disabled.bg",
  "interactive.disabled.fg",
  // safety / evidence status (meaning is carried by icon/text/structure too — never colour alone)
  "status.info",
  "status.info.bg",
  "status.info.border",
  "status.caution",
  "status.caution.bg",
  "status.caution.border",
  "status.clinician",
  "status.clinician.bg",
  "status.clinician.border",
  "status.urgent",
  "status.urgent.bg",
  "status.urgent.border",
  "status.emergency",
  "status.emergency.bg",
  "status.emergency.border",
  // domain accents
  // Per-domain accent: text-safe label colour, visual marker colour, solid soft tint, and the tinted-glass
  // surface pair. `accent.<domain>` is TEXT — eyebrows, nav highlight, badge labels, stage-chip fills under
  // `text.on-accent` — and is gated at 4.5:1. `accent.<domain>.visual` is the NON-TEXT domain identity
  // colour — card title icon, the 3px card identity strip, nav underline, stage markers — gated at the
  // 3:1 non-text floor so a light theme can keep it bright and vivid while the label tone stays deep.
  // `.glass` is the translucent tinted background (may be a gradient); `.glass.border` its defined edge;
  // `.soft` doubles as the opaque reduced-transparency fallback for `.glass`.
  "accent.brand",
  "accent.brand.visual",
  "accent.brand.soft",
  "accent.brand.glass",
  "accent.brand.glass.border",
  "accent.feeding",
  "accent.feeding.visual",
  "accent.feeding.soft",
  "accent.feeding.glass",
  "accent.feeding.glass.border",
  "accent.play",
  "accent.play.visual",
  "accent.play.soft",
  "accent.play.glass",
  "accent.play.glass.border",
  "accent.sleep",
  "accent.sleep.visual",
  "accent.sleep.soft",
  "accent.sleep.glass",
  "accent.sleep.glass.border",
  "accent.safety",
  "accent.safety.visual",
  "accent.safety.soft",
  "accent.safety.glass",
  "accent.safety.glass.border",
  "accent.tools",
  "accent.tools.visual",
  "accent.tools.soft",
  "accent.tools.glass",
  "accent.tools.glass.border",
  // elevation
  "shadow.1",
  "shadow.2",
] as const;

export type SemanticColorToken = (typeof SEMANTIC_COLOR_TOKENS)[number];

/** A complete colour token set for one colour mode. */
export type ColorTokens = Readonly<Record<SemanticColorToken, string>>;

/**
 * Foundation (geometry) tokens are shared by every colour mode of a theme family — Light/Dark are modes of one
 * family, not different layouts (docs/GUI_DESIGN.md §3). HowToBaby enforces minimums on some of them.
 */
export interface FoundationTokens {
  readonly typography: {
    readonly fontSans: string;
    readonly fontMono: string;
    readonly size: Readonly<Record<"xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl", string>>;
    readonly lineHeight: Readonly<Record<"tight" | "normal" | "relaxed", string>>;
    readonly weight: Readonly<Record<"regular" | "medium" | "semibold" | "bold", string>>;
  };
  readonly spacing: Readonly<Record<"2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl", string>>;
  readonly radius: Readonly<Record<"sm" | "md" | "lg" | "xl" | "pill", string>>;
  readonly motion: {
    readonly durationFast: string;
    readonly durationBase: string;
    readonly durationSlow: string;
    readonly easingStandard: string;
    readonly easingEmphasized: string;
  };
  readonly glass: {
    /** backdrop-filter blur radius; enhancement only (docs/GUI_DESIGN.md §4.4) */
    readonly blur: string;
    readonly saturate: string;
  };
  readonly layout: {
    readonly contentMaxWidth: string;
    readonly headerHeight: string;
    readonly mobileNavHeight: string;
    /** minimum pointer target for one-hand mobile use */
    readonly touchTarget: string;
  };
}

/** Ink-efficient print profile (docs/GUI_DESIGN.md §15). Print is a render profile, not a screenshot of glass UI. */
export interface PrintTokens {
  readonly canvas: string;
  readonly text: string;
  readonly textSecondary: string;
  readonly border: string;
  readonly fontSans: string;
}

export const GEOMETRY_TOKEN_PATHS = [
  "typography.fontSans",
  "typography.fontMono",
  "typography.size.xs",
  "typography.size.sm",
  "typography.size.md",
  "typography.size.lg",
  "typography.size.xl",
  "typography.size.2xl",
  "typography.size.3xl",
  "typography.lineHeight.tight",
  "typography.lineHeight.normal",
  "typography.lineHeight.relaxed",
  "typography.weight.regular",
  "typography.weight.medium",
  "typography.weight.semibold",
  "typography.weight.bold",
  "spacing.2xs",
  "spacing.xs",
  "spacing.sm",
  "spacing.md",
  "spacing.lg",
  "spacing.xl",
  "spacing.2xl",
  "spacing.3xl",
  "radius.sm",
  "radius.md",
  "radius.lg",
  "radius.xl",
  "radius.pill",
  "motion.durationFast",
  "motion.durationBase",
  "motion.durationSlow",
  "motion.easingStandard",
  "motion.easingEmphasized",
  "glass.blur",
  "glass.saturate",
  "layout.contentMaxWidth",
  "layout.headerHeight",
  "layout.mobileNavHeight",
  "layout.touchTarget",
] as const;

export type GeometryTokenPath = (typeof GEOMETRY_TOKEN_PATHS)[number];

export const PRINT_TOKEN_KEYS = ["canvas", "text", "textSecondary", "border", "fontSans"] as const satisfies readonly (keyof PrintTokens)[];

/**
 * Accessibility minimums enforced by HowToBaby regardless of theme (docs/THEME_SYSTEM.md §5 "critical minimums").
 * Values are compared as CSS pixel lengths; themes may exceed them.
 */
export const FOUNDATION_MINIMUMS = {
  /** body text (typography.size.md) */
  bodyFontSizePx: 16,
  /** layout.touchTarget */
  touchTargetPx: 44,
} as const;

/** Read a dotted geometry path from a foundation object. */
export function getGeometryToken(foundation: FoundationTokens, path: GeometryTokenPath): string | undefined {
  let node: unknown = foundation;
  for (const key of path.split(".")) {
    if (node === null || typeof node !== "object") return undefined;
    node = (node as Record<string, unknown>)[key];
  }
  return typeof node === "string" ? node : undefined;
}
