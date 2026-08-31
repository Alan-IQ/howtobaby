// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Server component: inlines the css-vars adapter output for every registered theme and the pre-hydration
 * boot script. Deterministic at build time, so the static export contains the full theme CSS with no runtime
 * fetch (docs/THEME_SYSTEM.md §13: token packs are the low-cost theme path).
 */

import { createThemeBootScript, defaultThemeDefinitions, defaultThemeRegistry, registryToCss } from "@howtobaby/themes";

const themeCss = registryToCss(defaultThemeDefinitions, defaultThemeRegistry.defaultThemeId);

const bootScript = createThemeBootScript({
  themes: Object.fromEntries(defaultThemeRegistry.list().map((m) => [m.id, m.modes])),
  defaultThemeId: defaultThemeRegistry.defaultThemeId,
});

export function ThemeStyles() {
  return <style id="htb-theme-tokens" dangerouslySetInnerHTML={{ __html: themeCss }} />;
}

export function ThemeBootScript() {
  return <script id="htb-theme-boot" dangerouslySetInnerHTML={{ __html: bootScript }} />;
}
