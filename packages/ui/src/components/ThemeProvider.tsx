// SPDX-License-Identifier: AGPL-3.0-only
"use client";

/**
 * ThemeProvider (docs/THEME_SYSTEM.md §12, docs/GUI_DESIGN.md §3). Owns the runtime theme/colour-mode
 * preference, mirrors it to <html data-*> for the css-vars adapter, and persists it through an injected
 * store. It knows nothing about content, age, evidence or safety state — switching themes changes only
 * presentation.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { DOM_ATTRIBUTES, type ColorMode, type ColorModePreference, type ThemeManifest, type ThemePreference, type ThemeRegistry } from "@howtobaby/themes";

import { usePrefersDarkColorScheme } from "../accessibility/useMediaPreference.ts";

export interface ThemePreferenceStore {
  read(): Partial<ThemePreference> | undefined;
  write(preference: ThemePreference): void;
}

export interface ThemeContextValue {
  readonly registry: ThemeRegistry;
  readonly themes: readonly ThemeManifest[];
  readonly preference: ThemePreference;
  /** Effective mode after resolving "system" and clamping to what the theme provides. */
  readonly colorMode: ColorMode;
  /** True once the persisted preference has been applied on the client. */
  readonly hydrated: boolean;
  setThemeId(themeId: string): void;
  setColorMode(mode: ColorModePreference): void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  registry: ThemeRegistry;
  store?: ThemePreferenceStore;
  children: ReactNode;
}

export function ThemeProvider({ registry, store, children }: ThemeProviderProps) {
  const [preference, setPreference] = useState<ThemePreference>(() => registry.normalizePreference(undefined));
  const [hydrated, setHydrated] = useState(false);
  const prefersDark = usePrefersDarkColorScheme();
  const systemMode: ColorMode = prefersDark ? "dark" : "light";
  const colorMode = registry.resolveColorMode(preference.themeId, preference.colorMode, systemMode);

  // Load the stored preference once on the client (the boot script already painted it pre-hydration).
  useEffect(() => {
    setPreference(registry.normalizePreference(store?.read()));
    setHydrated(true);
  }, [registry, store]);

  // Mirror state to <html> for the css-vars adapter selectors.
  useEffect(() => {
    if (!hydrated) return;
    const html = document.documentElement;
    html.setAttribute(DOM_ATTRIBUTES.theme, preference.themeId);
    html.setAttribute(DOM_ATTRIBUTES.colorMode, colorMode);
    html.setAttribute(DOM_ATTRIBUTES.colorModePreference, preference.colorMode);
  }, [hydrated, preference, colorMode]);

  const update = useCallback(
    (next: ThemePreference) => {
      const normalized = registry.normalizePreference(next);
      setPreference(normalized);
      store?.write(normalized);
    },
    [registry, store],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      registry,
      themes: registry.list(),
      preference,
      colorMode,
      hydrated,
      setThemeId: (themeId) => update({ ...preference, themeId }),
      setColorMode: (mode) => update({ ...preference, colorMode: mode }),
    }),
    [registry, preference, colorMode, hydrated, update],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
