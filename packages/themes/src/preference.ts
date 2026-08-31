// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Local theme preference codec (docs/THEME_SYSTEM.md §12). Pure, DOM-free: the storage layer in apps/web and
 * the pre-hydration script both use these helpers so the stored shape has exactly one definition.
 */

import type { ThemePreference } from "./contract/manifest.ts";

/** Versioned key; bump the suffix if the stored shape ever changes incompatibly. */
export const THEME_PREFERENCE_STORAGE_KEY = "htb.theme-preference.v1";

export const DOM_ATTRIBUTES = {
  theme: "data-theme",
  colorMode: "data-color-mode",
  colorModePreference: "data-color-mode-preference",
  reduceMotion: "data-reduce-motion",
  reduceTransparency: "data-reduce-transparency",
} as const;

export function serializeThemePreference(preference: ThemePreference): string {
  return JSON.stringify({ themeId: preference.themeId, colorMode: preference.colorMode });
}

/** Parse a stored value; returns a partial preference (unknown ids are left for the registry to normalise). */
export function parseThemePreference(raw: string | null | undefined): Partial<ThemePreference> | undefined {
  if (!raw) return undefined;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return undefined;
    const record = value as Record<string, unknown>;
    const out: { themeId?: string; colorMode?: ThemePreference["colorMode"] } = {};
    if (typeof record["themeId"] === "string") out.themeId = record["themeId"];
    if (record["colorMode"] === "light" || record["colorMode"] === "dark" || record["colorMode"] === "system") out.colorMode = record["colorMode"];
    return out;
  } catch {
    return undefined;
  }
}
