// SPDX-License-Identifier: AGPL-3.0-only
/**
 * App-level language state: ONE global preference (from the @howtobaby/i18n supported-locale
 * registry) driving every user-facing surface — page copy, navigation, evidence UI, footer.
 * The single header control is the only global switch; guidance surfaces may layer a LOCAL
 * content-language override on top (content-locale semantics in @howtobaby/i18n) without ever
 * touching this preference.
 *
 * Pages are statically prerendered in the canonical locale; `useSyncExternalStore` serves the
 * canonical snapshot during SSR/hydration and swaps to the stored preference immediately after,
 * so there is no hydration mismatch. `<html lang>` follows the active language so assistive tech
 * announces the correct one. Public routes are locale-neutral (the Phase 3 age routes included);
 * locale-prefixed routing, if ever adopted, plugs into this provider.
 */

"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";

import type { AppLocale } from "@howtobaby/i18n";

import { DEFAULT_LANGUAGE, localLanguagePreferenceStore } from "@/storage/language-preference-store";

const listeners = new Set<() => void>();
let currentLanguage: AppLocale | undefined;

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): AppLocale {
  currentLanguage ??= localLanguagePreferenceStore.read() ?? DEFAULT_LANGUAGE;
  return currentLanguage;
}

function getServerSnapshot(): AppLocale {
  return DEFAULT_LANGUAGE;
}

function setGlobalLanguage(next: AppLocale): void {
  if (currentLanguage === next) return;
  currentLanguage = next;
  localLanguagePreferenceStore.write(next);
  for (const listener of listeners) listener();
}

interface LanguageContextValue {
  language: AppLocale;
  setLanguage: (language: AppLocale) => void;
}

const LanguageContext = createContext<LanguageContextValue>({ language: DEFAULT_LANGUAGE, setLanguage: setGlobalLanguage });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Keep <html lang> in sync so assistive tech announces the active language.
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage: setGlobalLanguage }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
