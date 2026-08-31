// SPDX-License-Identifier: AGPL-3.0-only
/**
 * @howtobaby/themes — public entry (docs/THEME_SYSTEM.md).
 *
 * apps/web and packages/ui import from here only. Theme packs and vendor adapters are reachable through the
 * registry, never by path, so product code stays vendor-neutral (scripts/check-theme-boundary.ts enforces it).
 */

export * from "./contract/index.ts";
export { createThemeRegistry, type ThemeRegistry } from "./registry/registry.ts";
export { defaultThemeRegistry, defaultThemeDefinitions, vendorFixtureTheme } from "./registry/default-registry.ts";
export { BABY_MODERN_GLASS_ID, babyModernGlass } from "./baby-modern-glass/index.ts";
export { VENDOR_FIXTURE_THEME_ID } from "./adapters/vendor-fixture/index.ts";
export { colorTokenVar, geometryTokenVar, registryToCss, themeToCss, themeSelector, CSS_VAR_PREFIX } from "./adapters/css-vars/index.ts";
export * from "./preference.ts";
export { createThemeBootScript, type ThemeBootScriptOptions } from "./boot-script.ts";
