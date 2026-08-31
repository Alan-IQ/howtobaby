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

function ratioOver(fgRaw: Rgb, bgRaw: Rgb, backdrop: Rgb): number {
  const bg = composite(bgRaw, { ...backdrop, a: 1 });
  const fg = composite(fgRaw, bg);
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

/** WCAG contrast ratio between two colours; alpha is composited over `backdrop` (defaults to white). */
export function contrastRatio(foreground: string, background: string, backdrop = "#ffffff"): number | undefined {
  const bd = parseColor(backdrop);
  const bgRaw = parseColor(background);
  const fgRaw = parseColor(foreground);
  if (!bd || !bgRaw || !fgRaw) return undefined;
  return ratioOver(fgRaw, bgRaw, bd);
}

const STOP_COLOR = /^(#[0-9a-f]{3,8}|rgba?\([^()]*\)|transparent)/i;
/** direction / shape / position preamble of a gradient argument list — not a colour stop */
const GRADIENT_PREAMBLE = /^(-?[\d.]+(deg|grad|rad|turn)$|to\s|circle|ellipse|closest-|farthest-|at\s)/;

/** Split on commas that sit outside any parentheses. */
function splitTopLevel(value: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < value.length; i++) {
    const ch = value[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    else if (ch === "," && depth === 0) {
      parts.push(value.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(value.slice(start).trim());
  return parts;
}

/**
 * Extract the colour of every stop from a SINGLE `linear-gradient()`/`radial-gradient()` value.
 * Multi-layer backgrounds and any stop whose colour this module can't parse return undefined —
 * callers that require the value to be measurable must treat that as a failure, never a skip.
 */
export function parseGradientStops(value: string): Rgb[] | undefined {
  const v = value.trim();
  if (splitTopLevel(v).length !== 1) return undefined; // layered backgrounds are not exactly measurable
  const m = /^(?:linear|radial)-gradient\((.*)\)$/is.exec(v);
  if (!m) return undefined;
  const stops: Rgb[] = [];
  const args = splitTopLevel(m[1]!);
  for (const [i, arg] of args.entries()) {
    if (i === 0 && GRADIENT_PREAMBLE.test(arg)) continue; // direction / shape / position
    if (/^-?[\d.]+%$/.test(arg)) continue; // bare interpolation hint
    const colorText = STOP_COLOR.exec(arg)?.[1];
    if (!colorText) return undefined; // unknown stop syntax — refuse to guess
    const color = colorText.toLowerCase() === "transparent" ? { r: 0, g: 0, b: 0, a: 0 } : parseColor(colorText);
    if (!color) return undefined;
    stops.push(color);
  }
  return stops.length >= 2 ? stops : undefined;
}

/**
 * Worst-case (minimum) WCAG contrast of `foreground` over `background`, where the background may be a
 * solid colour OR a single linear/radial gradient. Every stop (alpha composited over `backdrop`) is
 * measured and the lowest ratio returned, so a gradient passes only if text is readable at ALL points.
 * Undefined means unmeasurable — callers decide whether that is acceptable for the pair.
 */
export function worstCaseContrastRatio(foreground: string, background: string, backdrop = "#ffffff"): number | undefined {
  const bd = parseColor(backdrop);
  const fgRaw = parseColor(foreground);
  if (!bd || !fgRaw) return undefined;
  const solidBg = parseColor(background);
  if (solidBg) return ratioOver(fgRaw, solidBg, bd);
  const stops = parseGradientStops(background);
  if (!stops) return undefined;
  let worst = Number.POSITIVE_INFINITY;
  for (const stop of stops) worst = Math.min(worst, ratioOver(fgRaw, stop, bd));
  return worst;
}

export const WCAG = {
  /** normal text (AA) */
  text: 4.5,
  /** large text / bold >= 18.66px (AA) */
  largeText: 3,
  /** non-text UI boundaries: focus rings, control borders (AA 1.4.11) */
  nonText: 3,
} as const;
