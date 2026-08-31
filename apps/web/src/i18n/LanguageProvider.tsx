// SPDX-License-Identifier: AGPL-3.0-only
/**
 * App-level language state: ONE global EN/VI preference driving every user-facing surface — page
 * copy, navigation, evidence UI, footer. There are no per-page or per-card language toggles; the
 * single header control is the only switch, so the UI can never sit half in one language.
 *
 * Pages are statically prerendered in canonical English; `useSyncExternalStore` serves the
 * canonical snapshot during SSR/hydration and swaps to the stored preference immediately after,
 * so there is no hydration mismatch. `<html lang>` follows the active language so assistive tech
 * announces the correct one. Locale-prefixed public routes are a Phase 3 routing concern; this
 * provider is the Phase 2 foundation they will plug into.
 */

"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";

import type { UiLocale } from "@/features/evidence/labels";
import { DEFAULT_LANGUAGE, localLanguagePreferenceStore } from "@/storage/language-preference-store";

const listeners = new Set<() => void>();
let currentLanguage: UiLocale | undefined;

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): UiLocale {
  currentLanguage ??= localLanguagePreferenceStore.read() ?? DEFAULT_LANGUAGE;
  return currentLanguage;
}

function getServerSnapshot(): UiLocale {
  return DEFAULT_LANGUAGE;
}

function setGlobalLanguage(next: UiLocale): void {
  if (currentLanguage === next) return;
  currentLanguage = next;
  localLanguagePreferenceStore.write(next);
  for (const listener of listeners) listener();
}

interface LanguageContextValue {
  language: UiLocale;
  setLanguage: (language: UiLocale) => void;
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
