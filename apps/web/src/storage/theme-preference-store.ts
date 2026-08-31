// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Local persistence of the presentation preference (docs/THEME_SYSTEM.md §12). localStorage only — it is a
 * device preference, never sent anywhere. Storage failures (private mode, quota, disabled) degrade to the
 * default theme silently.
 */

import { parseThemePreference, serializeThemePreference, THEME_PREFERENCE_STORAGE_KEY, type ThemePreference } from "@howtobaby/themes";
import type { ThemePreferenceStore } from "@howtobaby/ui";

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function createThemePreferenceStore(storage: () => KeyValueStorage | undefined, key = THEME_PREFERENCE_STORAGE_KEY): ThemePreferenceStore {
  return {
    read(): Partial<ThemePreference> | undefined {
      try {
        return parseThemePreference(storage()?.getItem(key));
      } catch {
        return undefined;
      }
    },
    write(preference: ThemePreference): void {
      try {
        storage()?.setItem(key, serializeThemePreference(preference));
      } catch {
        // Ignore: the in-memory preference still applies for this session.
      }
    },
  };
}

/** Browser store; safe to construct during SSR (storage is resolved lazily). */
export const localThemePreferenceStore = createThemePreferenceStore(() => (typeof window === "undefined" ? undefined : window.localStorage));
