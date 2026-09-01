// SPDX-License-Identifier: AGPL-3.0-only
/**
 * The LOCAL content-language control for guidance surfaces (docs/GUI_DESIGN.md §11.9): a single
 * binary toggle button. One tap/click flips the surface's canonical content between the active
 * global locale and the canonical locale — the user never picks from a pair of options.
 *
 * The visible text is always the full native name of the language the content is CURRENTLY
 * showing in ("Tiếng Việt", "English", later e.g. "Español") — never a short code — and carries
 * that language's `lang`. Hidden entirely while the global locale IS the canonical locale. The
 * semantics come from the @howtobaby/i18n registry (toggleContentLocale), so the control is
 * generic over locales, never hard-coded to a pair. Label swaps get a subtle token-driven slide
 * (reduced motion collapses it to an instant change).
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
  if (contentLocaleToggleOptions(globalLocale) === undefined) return null;
  const next = toggleContentLocale(globalLocale, contentLocale);
  if (next === undefined) return null;
  const displayed = localeDefinition(contentLocale);
  return (
    <button
      type="button"
      className={["content-lang-toggle", className].filter(Boolean).join(" ")}
      aria-label={`${label}: ${displayed.nativeName}`}
      onClick={() => onToggle(next)}
    >
      <span key={contentLocale} className="content-lang-toggle__label" lang={contentLocale}>
        {displayed.nativeName}
      </span>
    </button>
  );
}
