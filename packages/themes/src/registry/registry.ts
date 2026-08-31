// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Theme Registry (docs/THEME_SYSTEM.md §4, §12). Holds validated ThemeDefinitions only; a definition that fails
 * the contract is refused at registration time so the app can never select an incomplete theme.
 */

import { assertThemeDefinition } from "../contract/validate.ts";
import type { ColorMode, ColorModePreference, ThemeDefinition, ThemeManifest, ThemePreference } from "../contract/manifest.ts";

export interface ThemeRegistry {
  readonly defaultThemeId: string;
  list(): readonly ThemeManifest[];
  has(themeId: string): boolean;
  get(themeId: string): ThemeDefinition;
  /** Returns the definition for `themeId`, or the default theme when the id is unknown. */
  resolve(themeId: string | undefined): ThemeDefinition;
  /** Clamp a colour-mode preference to a mode the theme actually provides. */
  resolveColorMode(themeId: string, preference: ColorModePreference, systemMode: ColorMode): ColorMode;
  /** Normalise a (possibly stale/foreign) preference into something selectable. */
  normalizePreference(preference: Partial<ThemePreference> | undefined): ThemePreference;
}

export function createThemeRegistry(definitions: readonly ThemeDefinition[], options: { defaultThemeId?: string } = {}): ThemeRegistry {
  if (definitions.length === 0) throw new Error("ThemeRegistry needs at least one theme definition");
  const byId = new Map<string, ThemeDefinition>();
  for (const definition of definitions) {
    assertThemeDefinition(definition);
    if (byId.has(definition.manifest.id)) throw new Error(`Duplicate theme id "${definition.manifest.id}"`);
    byId.set(definition.manifest.id, definition);
  }
  const defaultThemeId = options.defaultThemeId ?? definitions[0]!.manifest.id;
  if (!byId.has(defaultThemeId)) throw new Error(`Default theme "${defaultThemeId}" is not registered`);

  const get = (themeId: string): ThemeDefinition => {
    const definition = byId.get(themeId);
    if (!definition) throw new Error(`Unknown theme "${themeId}"`);
    return definition;
  };
  const resolve = (themeId: string | undefined): ThemeDefinition => (themeId && byId.has(themeId) ? byId.get(themeId)! : byId.get(defaultThemeId)!);

  const resolveColorMode = (themeId: string, preference: ColorModePreference, systemMode: ColorMode): ColorMode => {
    const modes = resolve(themeId).manifest.modes;
    const wanted: ColorMode = preference === "system" ? systemMode : preference;
    if (modes.includes(wanted)) return wanted;
    return modes[0] ?? "light";
  };

  return {
    defaultThemeId,
    list: () => [...byId.values()].map((d) => d.manifest),
    has: (themeId) => byId.has(themeId),
    get,
    resolve,
    resolveColorMode,
    normalizePreference: (preference) => {
      const themeId = preference?.themeId && byId.has(preference.themeId) ? preference.themeId : defaultThemeId;
      const colorMode: ColorModePreference =
        preference?.colorMode === "light" || preference?.colorMode === "dark" || preference?.colorMode === "system" ? preference.colorMode : "system";
      return { themeId, colorMode };
    },
  };
}
