// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Key/message dictionary framework for app/page UI copy (chrome, navigation, page prose).
 *
 * A dictionary carries every supported locale, keyed by stable message ids; TypeScript enforces
 * that each locale defines exactly the same key set, so UI copy can never ship half-translated
 * silently. Canonical guidance/claim text is NOT app copy — it always comes from the knowledge
 * translation bundles via the KnowledgeRepository, never from these dictionaries.
 */

import { CANONICAL_LOCALE, type AppLocale } from "./locales.ts";

export type MessageDictionary<K extends string> = Readonly<Record<AppLocale, Readonly<Record<K, string>>>>;

/**
 * Identity helper that pins the dictionary shape: every supported locale present, every locale
 * carrying the same keys. A missing key or locale is a compile error, not a runtime surprise.
 */
export function defineMessages<K extends string>(messages: MessageDictionary<K>): MessageDictionary<K> {
  return messages;
}

/** Resolve one message, falling back to the canonical locale (defensive; parity is type-checked). */
export function getMessage<K extends string>(messages: MessageDictionary<K>, locale: AppLocale, key: K): string {
  return messages[locale][key] ?? messages[CANONICAL_LOCALE][key];
}

/** Bind a dictionary to a locale: `const t = createTranslator(MESSAGES, locale); t("nav.play.label")`. */
export function createTranslator<K extends string>(messages: MessageDictionary<K>, locale: AppLocale): (key: K) => string {
  return (key) => getMessage(messages, locale, key);
}
