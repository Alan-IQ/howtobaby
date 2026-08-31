// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Local persistence of the app-level language preference (GUIDANCE_CONTENT_CONTRACT.md §10: EN is
 * canonical, VI has full semantic parity; GUI_DESIGN.md §6 header language control). localStorage
 * only — a device preference, never sent anywhere. Storage failures (private mode, quota,
 * disabled) degrade silently to the canonical default.
 */

import type { UiLocale } from "@/features/evidence/labels";

export const LANGUAGE_STORAGE_KEY = "htb.language.v1";
export const DEFAULT_LANGUAGE: UiLocale = "en";

export interface LanguagePreferenceStore {
  read(): UiLocale | undefined;
  write(language: UiLocale): void;
}

export function parseLanguage(value: string | null | undefined): UiLocale | undefined {
  return value === "en" || value === "vi" ? value : undefined;
}

export function createLanguagePreferenceStore(storage: () => Pick<Storage, "getItem" | "setItem"> | undefined, key = LANGUAGE_STORAGE_KEY): LanguagePreferenceStore {
  return {
    read(): UiLocale | undefined {
      try {
        return parseLanguage(storage()?.getItem(key));
      } catch {
        return undefined;
      }
    },
    write(language: UiLocale): void {
      try {
        storage()?.setItem(key, language);
      } catch {
        // Ignore: the in-memory preference still applies for this session.
      }
    },
  };
}

/** Browser store; safe to construct during SSR (storage is resolved lazily). */
export const localLanguagePreferenceStore = createLanguagePreferenceStore(() => (typeof window === "undefined" ? undefined : window.localStorage));
