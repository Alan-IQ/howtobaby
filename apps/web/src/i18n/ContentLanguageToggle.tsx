// SPDX-License-Identifier: AGPL-3.0-only
/**
 * The LOCAL content-language control for guidance surfaces (docs/GUI_DESIGN.md §11.9): ONE
 * binary toggle styled as a compact slider pill. BOTH full native names are visible
 * ("Tiếng Việt" / "English", later e.g. "Español"; never short codes), with a raised thumb
 * resting on the language the content is CURRENTLY displayed in. It is still a single button:
 * one tap/click anywhere flips active-global ↔ canonical — the user never picks one of two
 * independent options, and the thumb slides across (motion tokens; reduced motion → instant).
 *
 * Hidden entirely while the global locale IS the canonical locale. Semantics come from the
 * @howtobaby/i18n registry (contentLocaleToggleOptions/toggleContentLocale), so nothing here is
 * hard-coded to a locale pair. The accessible name stays "<label>: <displayed native name>".
 */

"use client";

import { contentLocaleToggleOptions, localeDefinition, toggleContentLocale, type AppLocale } from "@howtobaby/i18n";

export interface ContentLanguageToggleProps {
  globalLocale: AppLocale;
  /** The locale the surface's canonical content currently renders in. */
  contentLocale: AppLocale;
  /** Accessible-name prefix in the GLOBAL language (control chrome), e.g. "Guidance language". */
  label: string;
  /** Receives the locale one activation switches the surface to. */
  onToggle: (nextLocale: AppLocale) => void;
  className?: string;
}

export function ContentLanguageToggle({ globalLocale, contentLocale, label, onToggle, className }: ContentLanguageToggleProps) {
  // No local toggle while the global language IS the canonical locale.
  const options = contentLocaleToggleOptions(globalLocale);
  if (options === undefined) return null;
  const next = toggleContentLocale(globalLocale, contentLocale);
  if (next === undefined) return null;
  const displayed = localeDefinition(contentLocale);
  const activeIndex = options.indexOf(contentLocale);
  return (
    <button
      type="button"
      className={["content-lang-toggle", className].filter(Boolean).join(" ")}
      style={{ "--htb-toggle-index": activeIndex < 0 ? 0 : activeIndex } as React.CSSProperties}
      aria-label={`${label}: ${displayed.nativeName}`}
      onClick={() => onToggle(next)}
    >
      <span aria-hidden="true" className="content-lang-toggle__thumb" />
      {options.map((locale) => (
        <span
          key={locale}
          className="content-lang-toggle__label"
          data-displayed={locale === contentLocale ? "true" : "false"}
          lang={locale}
        >
          {localeDefinition(locale).nativeName}
        </span>
      ))}
    </button>
  );
}
