// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Server component: inlines the css-vars adapter output for every registered theme and the pre-hydration
 * boot script. Deterministic at build time, so the static export contains the full theme CSS with no runtime
 * fetch (docs/THEME_SYSTEM.md §13: token packs are the low-cost theme path).
 */

import { createThemeBootScript, registryToCss } from "@howtobaby/themes";

import { appThemeDefinitions, appThemeRegistry } from "@/theme-registry";

const themeCss = registryToCss(appThemeDefinitions, appThemeRegistry.defaultThemeId);

const bootScript = createThemeBootScript({
  themes: Object.fromEntries(appThemeRegistry.list().map((m) => [m.id, m.modes])),
  defaultThemeId: appThemeRegistry.defaultThemeId,
});

export function ThemeStyles() {
  return <style id="htb-theme-tokens" dangerouslySetInnerHTML={{ __html: themeCss }} />;
}

export function ThemeBootScript() {
  return <script id="htb-theme-boot" dangerouslySetInnerHTML={{ __html: bootScript }} />;
}
