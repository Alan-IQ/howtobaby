// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Pre-hydration boot script: applies the stored theme/colour-mode preference to <html> before first paint so a
 * dark-mode user never sees a light flash. Inlined by the app layout; must stay dependency-free and tiny.
 * Preference semantics are the same as ThemeRegistry.normalizePreference / resolveColorMode.
 */

import { DOM_ATTRIBUTES, THEME_PREFERENCE_STORAGE_KEY } from "./preference.ts";

export interface ThemeBootScriptOptions {
  /** id → modes it supports */
  readonly themes: Readonly<Record<string, readonly ("light" | "dark")[]>>;
  readonly defaultThemeId: string;
  readonly storageKey?: string;
}

export function createThemeBootScript(options: ThemeBootScriptOptions): string {
  const key = options.storageKey ?? THEME_PREFERENCE_STORAGE_KEY;
  const themes = JSON.stringify(options.themes);
  const A = DOM_ATTRIBUTES;
  return (
    `(function(){try{var T=${themes},D=${JSON.stringify(options.defaultThemeId)},K=${JSON.stringify(key)};` +
    `var p={};try{var r=localStorage.getItem(K);if(r){p=JSON.parse(r)||{}}}catch(e){}` +
    `var id=(typeof p.themeId==="string"&&T[p.themeId])?p.themeId:D;` +
    `var pref=(p.colorMode==="light"||p.colorMode==="dark")?p.colorMode:"system";` +
    `var sys=(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches)?"dark":"light";` +
    `var want=pref==="system"?sys:pref;var modes=T[id]||["light"];var mode=modes.indexOf(want)>=0?want:modes[0];` +
    `var h=document.documentElement;h.setAttribute(${JSON.stringify(A.theme)},id);h.setAttribute(${JSON.stringify(A.colorMode)},mode);h.setAttribute(${JSON.stringify(A.colorModePreference)},pref);` +
    `}catch(e){}})();`
  );
}
