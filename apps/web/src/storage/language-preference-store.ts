// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Local persistence of the app-level language preference (GUIDANCE_CONTENT_CONTRACT.md §10: EN is
 * canonical, other locales need full semantic parity; GUI_DESIGN.md §6 header language control).
 * localStorage only — a device preference, never sent anywhere. Storage failures (private mode,
 * quota, disabled) degrade silently to the canonical default. Which values are valid is owned by
 * the @howtobaby/i18n supported-locale registry, never re-declared here.
 */

import { DEFAULT_LOCALE, parseLocale, type AppLocale } from "@howtobaby/i18n";

export const LANGUAGE_STORAGE_KEY = "htb.language.v1";
export const DEFAULT_LANGUAGE: AppLocale = DEFAULT_LOCALE;

export interface LanguagePreferenceStore {
  read(): AppLocale | undefined;
  write(language: AppLocale): void;
}

/** Parse a stored value against the central locale registry. */
export function parseLanguage(value: string | null | undefined): AppLocale | undefined {
  return parseLocale(value);
}

export function createLanguagePreferenceStore(storage: () => Pick<Storage, "getItem" | "setItem"> | undefined, key = LANGUAGE_STORAGE_KEY): LanguagePreferenceStore {
  return {
    read(): AppLocale | undefined {
      try {
        return parseLanguage(storage()?.getItem(key));
      } catch {
        return undefined;
      }
    },
    write(language: AppLocale): void {
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
