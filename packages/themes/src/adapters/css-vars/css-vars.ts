// SPDX-License-Identifier: AGPL-3.0-only
/**
 * css-vars adapter (docs/THEME_SYSTEM.md §7): turns a validated ThemeDefinition into CSS custom properties.
 *
 * Output contract consumed by @howtobaby/ui and apps/web (never by domain code directly):
 *   --htb-<semantic-token>          colour tokens, dots → dashes   e.g. --htb-surface-1, --htb-status-urgent-bg
 *   --htb-font-*, --htb-space-*, --htb-radius-*, --htb-motion-*, --htb-glass-*, --htb-layout-*   foundation
 *
 * Selectors: [data-theme="<id>"][data-color-mode="<mode>"]. Reduced transparency / missing backdrop-filter /
 * reduced motion / print fallbacks are emitted here so every theme gets them by construction.
 */

import type { ColorMode, ThemeDefinition } from "../../contract/manifest.ts";
import { GEOMETRY_TOKEN_PATHS, SEMANTIC_COLOR_TOKENS, getGeometryToken, type FoundationTokens } from "../../contract/tokens.ts";

export const CSS_VAR_PREFIX = "--htb";

export function colorTokenVar(token: string): string {
  return `${CSS_VAR_PREFIX}-${token.replace(/\./g, "-")}`;
}

const GEOMETRY_PREFIX: Record<string, string> = {
  typography: "font",
  spacing: "space",
  radius: "radius",
  motion: "motion",
  glass: "glass",
  layout: "layout",
};

export function geometryTokenVar(path: string): string {
  const [group, ...rest] = path.split(".");
  const prefix = GEOMETRY_PREFIX[group ?? ""] ?? group;
  const tail = rest.map((s) => s.replace(/([A-Z])/g, "-$1").toLowerCase()).join("-");
  // Collapse a duplicated group prefix: typography.fontSans -> --htb-font-sans, not --htb-font-font-sans.
  return tail.startsWith(`${prefix}-`) ? `${CSS_VAR_PREFIX}-${tail}` : `${CSS_VAR_PREFIX}-${prefix}-${tail}`;
}

function declarations(entries: Array<[string, string]>, indent = "  "): string {
  return entries.map(([name, value]) => `${indent}${name}: ${value};`).join("\n");
}

export function foundationDeclarations(foundation: FoundationTokens): Array<[string, string]> {
  return GEOMETRY_TOKEN_PATHS.map((path) => [geometryTokenVar(path), getGeometryToken(foundation, path) ?? ""]);
}

export function colorDeclarations(definition: ThemeDefinition, mode: ColorMode): Array<[string, string]> {
  const tokens = definition.modes[mode];
  if (!tokens) throw new Error(`Theme "${definition.manifest.id}" has no "${mode}" mode`);
  return SEMANTIC_COLOR_TOKENS.map((token) => [colorTokenVar(token), tokens[token]]);
}

export function themeSelector(themeId: string, mode?: ColorMode): string {
  return mode ? `[data-theme="${themeId}"][data-color-mode="${mode}"]` : `[data-theme="${themeId}"]`;
}

/** CSS for one theme: foundation on the theme selector, colours per mode, plus mandatory fallbacks. */
export function themeToCss(definition: ThemeDefinition): string {
  const id = definition.manifest.id;
  const blocks: string[] = [];

  blocks.push(`${themeSelector(id)} {\n${declarations(foundationDeclarations(definition.foundation))}\n  color-scheme: ${definition.manifest.modes.join(" ")};\n}`);

  for (const mode of definition.manifest.modes) {
    blocks.push(`${themeSelector(id, mode)} {\n${declarations(colorDeclarations(definition, mode))}\n  color-scheme: ${mode};\n}`);
  }

  // Glass fallback (docs/GUI_DESIGN.md §4.4): when blur is unavailable or the user reduces transparency,
  // every glass surface — neutral and accent-tinted — becomes its opaque counterpart. Border/shadow
  // hierarchy is untouched. [data-color-mode] keeps specificity >= the per-mode block so the fallback wins.
  const glassFallbackDecls = [
    `  ${colorTokenVar("surface.glass")}: var(${colorTokenVar("surface.glass.solid")});`,
    ...(["brand", "feeding", "play", "sleep", "safety", "tools"] as const).map(
      (a) => `  ${colorTokenVar(`accent.${a}.glass`)}: var(${colorTokenVar(`accent.${a}.soft`)});`,
    ),
    `  ${geometryTokenVar("glass.blur")}: 0px;`,
    `  ${geometryTokenVar("glass.saturate")}: 1;`,
  ].join("\n");
  const glassFallback = `${themeSelector(id)}[data-color-mode] {\n${glassFallbackDecls}\n}`;
  blocks.push(`@media (prefers-reduced-transparency: reduce) {\n${glassFallback}\n}`);
  blocks.push(`@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {\n${glassFallback}\n}`);
  blocks.push(`${themeSelector(id)}[data-color-mode][data-reduce-transparency="true"] {\n${glassFallbackDecls}\n}`);

  // Reduced motion: durations collapse to 0 so transitions/animations built on the tokens stop.
  const motionOff = declarations([
    [geometryTokenVar("motion.durationFast"), "0ms"],
    [geometryTokenVar("motion.durationBase"), "0ms"],
    [geometryTokenVar("motion.durationSlow"), "0ms"],
  ]);
  blocks.push(`@media (prefers-reduced-motion: reduce) {\n${themeSelector(id)} {\n${motionOff}\n}\n}`);
  blocks.push(`${themeSelector(id)}[data-reduce-motion="true"] {\n${motionOff}\n}`);

  // Print profile: ink-efficient surfaces, no blur, no shadows, black-ish text on white-ish canvas.
  if (definition.print) {
    const p = definition.print;
    const printDecls = declarations([
      [colorTokenVar("canvas"), p.canvas],
      [colorTokenVar("canvas.tint"), p.canvas],
      [colorTokenVar("surface.1"), p.canvas],
      [colorTokenVar("surface.2"), p.canvas],
      [colorTokenVar("surface.glass"), p.canvas],
      [colorTokenVar("surface.glass.solid"), p.canvas],
      [colorTokenVar("surface.glass.border"), p.border],
      [colorTokenVar("surface.glass.highlight"), "transparent"],
      [colorTokenVar("surface.glass.glow"), "transparent"],
      [colorTokenVar("surface.glass.seam"), "transparent"],
      [colorTokenVar("text.primary"), p.text],
      [colorTokenVar("text.secondary"), p.textSecondary],
      [colorTokenVar("text.muted"), p.textSecondary],
      [colorTokenVar("text.link"), p.text],
      [colorTokenVar("border.subtle"), p.border],
      [colorTokenVar("border.strong"), p.text],
      [colorTokenVar("shadow.1"), "none"],
      [colorTokenVar("shadow.2"), "none"],
      [geometryTokenVar("typography.fontSans"), p.fontSans],
      [geometryTokenVar("glass.blur"), "0px"],
      [geometryTokenVar("glass.saturate"), "1"],
      // Domain accents print as neutral ink; safety/evidence status tokens keep their (icon+text backed) tone.
      ...(["brand", "feeding", "play", "sleep", "safety", "tools"] as const).flatMap((a): Array<[string, string]> => [
        [colorTokenVar(`accent.${a}`), p.textSecondary],
        [colorTokenVar(`accent.${a}.visual`), p.textSecondary],
        [colorTokenVar(`accent.${a}.soft`), p.canvas],
        [colorTokenVar(`accent.${a}.glass`), p.canvas],
        [colorTokenVar(`accent.${a}.glass.border`), p.border],
      ]),
    ]);
    // Same specificity as the per-mode selector (two attributes) and emitted later, so print wins over the mode block.
    blocks.push(`@media print {\n${themeSelector(id)}[data-color-mode] {\n${printDecls}\n  color-scheme: light;\n}\n}`);
  }

  return blocks.join("\n\n");
}

/** CSS for a whole registry, with the default theme's tokens also applied to :root as a pre-hydration baseline. */
export function registryToCss(definitions: readonly ThemeDefinition[], defaultThemeId: string): string {
  const defaultTheme = definitions.find((d) => d.manifest.id === defaultThemeId);
  if (!defaultTheme) throw new Error(`Default theme "${defaultThemeId}" is not in the definition list`);
  const defaultMode: ColorMode = defaultTheme.manifest.modes.includes("light") ? "light" : defaultTheme.manifest.modes[0]!;
  const root = `:root {\n${declarations([...foundationDeclarations(defaultTheme.foundation), ...colorDeclarations(defaultTheme, defaultMode)])}\n}`;
  return [root, ...definitions.map(themeToCss)].join("\n\n");
}
