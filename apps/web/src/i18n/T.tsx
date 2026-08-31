// SPDX-License-Identifier: AGPL-3.0-only
/**
 * App-copy leaf: renders one message from the app dictionary in the active global language.
 * Server components stay server components and drop `<T id="…"/>` where user-facing app copy
 * lives; only this leaf (and the hook below for attribute strings) is a client boundary.
 *
 * App copy only. Canonical guidance/claim text always comes from the knowledge translations via
 * the KnowledgeRepository — never from the app dictionary.
 */

"use client";

import { createTranslator } from "@howtobaby/i18n";

import { useLanguage } from "./LanguageProvider";
import { MESSAGES, type AppMessageKey } from "./messages";

export function T({ id }: { id: AppMessageKey }) {
  const { language } = useLanguage();
  return <>{MESSAGES[language][id]}</>;
}

/** Translator bound to the active global language — for attribute strings (aria-label, alt, …). */
export function useMessages(): (id: AppMessageKey) => string {
  const { language } = useLanguage();
  return createTranslator(MESSAGES, language);
}
