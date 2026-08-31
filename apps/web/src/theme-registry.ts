// SPDX-License-Identifier: AGPL-3.0-only
/**
 * The theme registry this app actually ships (docs/THEME_SYSTEM.md §12).
 *
 * Production exposes Baby Modern Glass only. The vendor fixture exists to prove theme independence and is
 * registered — with its CSS — only when the Theme Lab build flag is on, so normal production UI can never
 * select or even download it.
 */

import { babyModernGlass, BABY_MODERN_GLASS_ID, createThemeRegistry, defaultThemeDefinitions, type ThemeDefinition } from "@howtobaby/themes";

import { THEME_LAB_ENABLED } from "@/theme-lab/config";

export const appThemeDefinitions: readonly ThemeDefinition[] = THEME_LAB_ENABLED ? defaultThemeDefinitions : [babyModernGlass];

export const appThemeRegistry = createThemeRegistry(appThemeDefinitions, { defaultThemeId: BABY_MODERN_GLASS_ID });
