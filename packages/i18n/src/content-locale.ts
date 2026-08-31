// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Local content-language override semantics (guidance cards + Evidence Drawer).
 *
 * The global language preference owns all site chrome and page copy. A guidance surface may
 * additionally offer a LOCAL toggle between the active global locale and the canonical locale —
 * shown only while the global locale is non-canonical — that switches just that surface's
 * canonical guidance content without touching the global preference.
 *
 * The override records the global locale it was made under; when the global locale changes the
 * stale override no longer applies and the surface follows the new global locale again. The
 * functions are generic over locale ids, so `EN ↔ active locale` keeps working unchanged when a
 * third locale is registered.
 */

import { CANONICAL_LOCALE, type AppLocale } from "./locales.ts";

export interface ContentLocaleOverride<L extends string = AppLocale> {
  /** The global locale this override was made under; any other current global locale voids it. */
  readonly base: L;
  /** The locale the surface's canonical content should render in. */
  readonly locale: L;
}

/**
 * The pair of content locales a local toggle offers under a global locale, in display order
 * (active global locale first, canonical second) — or undefined when the global locale IS the
 * canonical locale, in which case the toggle must not render at all.
 */
export function contentLocaleToggleOptions(globalLocale: AppLocale): readonly [AppLocale, AppLocale] | undefined;
export function contentLocaleToggleOptions<L extends string>(globalLocale: L, canonicalLocale: L): readonly [L, L] | undefined;
export function contentLocaleToggleOptions(globalLocale: string, canonicalLocale: string = CANONICAL_LOCALE): readonly [string, string] | undefined {
  return globalLocale === canonicalLocale ? undefined : [globalLocale, canonicalLocale];
}

/** Create an override for the current global locale. */
export function contentLocaleOverride<L extends string>(globalLocale: L, locale: L): ContentLocaleOverride<L> {
  return { base: globalLocale, locale };
}

/**
 * The locale a guidance surface should render its canonical content in: the override while it
 * matches the current global locale, otherwise the global locale (a global change resets/syncs
 * every local override implicitly).
 */
export function resolveContentLocale<L extends string>(globalLocale: L, override: ContentLocaleOverride<L> | undefined): L {
  return override !== undefined && override.base === globalLocale ? override.locale : globalLocale;
}
