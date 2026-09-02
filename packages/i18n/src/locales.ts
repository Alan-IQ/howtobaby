// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Central supported-locale registry (GUIDANCE_CONTENT_CONTRACT.md §10: EN is canonical; every
 * other locale must reach full semantic parity before release).
 *
 * This is the ONE place a locale is declared. Adding a locale means adding one entry here (plus
 * its canonical knowledge translations and app message entries); the language selector, the
 * language provider and the local content-language override all read this registry and need no
 * redesign. Locale-prefixed public routing is deliberately absent here (public routes are locale-neutral).
 */

export interface LocaleDefinition {
  /** BCP 47 language tag; also the `<html lang>` value while the locale is active. */
  readonly id: string;
  /** Short display code for compact UI such as the header language trigger (e.g. "EN"). */
  readonly code: string;
  /** The language's own name for itself — how it is listed in a language menu. */
  readonly nativeName: string;
  /** English name, for tooling, logs and docs. */
  readonly englishName: string;
}

/** Every locale the app can render, in menu order. Canonical locale first. */
export const SUPPORTED_LOCALES = [
  { id: "en", code: "EN", nativeName: "English", englishName: "English" },
  { id: "vi", code: "VI", nativeName: "Tiếng Việt", englishName: "Vietnamese" },
] as const satisfies readonly LocaleDefinition[];

/** A supported app locale id ("en" | "vi" today; widens automatically with the registry). */
export type AppLocale = (typeof SUPPORTED_LOCALES)[number]["id"];

/** The canonical authoring locale: guidance is authored in it and it is the parity reference. */
export const CANONICAL_LOCALE = "en" as const satisfies AppLocale;

/** What a first visit renders before any stored preference exists. */
export const DEFAULT_LOCALE: AppLocale = CANONICAL_LOCALE;

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === "string" && SUPPORTED_LOCALES.some((locale) => locale.id === value);
}

/** Parse an untrusted stored/incoming value into a supported locale, else undefined. */
export function parseLocale(value: string | null | undefined): AppLocale | undefined {
  return isAppLocale(value) ? value : undefined;
}

export function localeDefinition(id: AppLocale): LocaleDefinition {
  const definition = SUPPORTED_LOCALES.find((locale) => locale.id === id);
  if (!definition) throw new Error(`Locale is not registered: ${id}`);
  return definition;
}
