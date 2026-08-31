// SPDX-License-Identifier: AGPL-3.0-only
/**
 * WCAG 2.x contrast math for theme validation (docs/GUI_DESIGN.md §16, docs/THEME_SYSTEM.md §11).
 * Pure and dependency-free. Only solid colours can be compared exactly; alpha colours are composited
 * over a supplied backdrop first, and non-colour values (gradients, shadow lists) return undefined.
 */

export interface Rgb {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  /** 0..1 */
  readonly a: number;
}

/** Parse #rgb/#rgba/#rrggbb/#rrggbbaa or rgb()/rgba() with byte channels. Returns undefined otherwise. */
export function parseColor(value: string): Rgb | undefined {
  const v = value.trim().toLowerCase();
  const hex = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(v)?.[1];
  if (hex) {
    if (hex.length <= 4) {
      const [r, g, b, a] = [...hex].map((c) => Number.parseInt(c + c, 16));
      return { r: r!, g: g!, b: b!, a: a === undefined ? 1 : a / 255 };
    }
    const n = (i: number) => Number.parseInt(hex.slice(i, i + 2), 16);
    return { r: n(0), g: n(2), b: n(4), a: hex.length === 8 ? n(6) / 255 : 1 };
  }
  const fn = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/.exec(v);
  if (fn) {
    return { r: Number(fn[1]), g: Number(fn[2]), b: Number(fn[3]), a: fn[4] === undefined ? 1 : Number(fn[4]) };
  }
  return undefined;
}

/** Composite `fg` over an opaque `backdrop` (alpha blending). */
export function composite(fg: Rgb, backdrop: Rgb): Rgb {
  const a = fg.a + backdrop.a * (1 - fg.a);
  const mix = (c: number, b: number) => (c * fg.a + b * backdrop.a * (1 - fg.a)) / (a || 1);
  return { r: mix(fg.r, backdrop.r), g: mix(fg.g, backdrop.g), b: mix(fg.b, backdrop.b), a };
}

function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/** WCAG relative luminance of an opaque colour. */
export function relativeLuminance(color: Rgb): number {
  return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
}

/** WCAG contrast ratio between two colours; alpha is composited over `backdrop` (defaults to white). */
export function contrastRatio(foreground: string, background: string, backdrop = "#ffffff"): number | undefined {
  const bd = parseColor(backdrop);
  const bgRaw = parseColor(background);
  const fgRaw = parseColor(foreground);
  if (!bd || !bgRaw || !fgRaw) return undefined;
  const bg = composite(bgRaw, { ...bd, a: 1 });
  const fg = composite(fgRaw, bg);
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

export const WCAG = {
  /** normal text (AA) */
  text: 4.5,
  /** large text / bold >= 18.66px (AA) */
  largeText: 3,
  /** non-text UI boundaries: focus rings, control borders (AA 1.4.11) */
  nonText: 3,
} as const;
