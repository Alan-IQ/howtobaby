// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Compact global language control (GUI_DESIGN.md §6): a single trigger — globe above the active
 * locale code — opening an accessible popover that lists every locale from the @howtobaby/i18n
 * supported-locale registry. Nothing here is hard-coded to EN/VI: registering a locale adds a
 * menu row with no redesign. The active language is marked by `aria-selected` plus a check icon,
 * never colour alone. This is the ONE global switch; guidance surfaces may add a LOCAL
 * content-language override, which never touches this preference.
 *
 * Motion: the popover stays mounted and animates open with a short slide-down + fade and closed
 * with the reverse (CSS visibility keeps it out of the tab order and the accessibility tree
 * while closed, without unmounting mid-exit). Keyboard and focus behavior never depend on the
 * animation, and the motion tokens collapse it to instant under reduced motion.
 */

"use client";

import { useEffect, useId, useRef, useState } from "react";

import { SUPPORTED_LOCALES, localeDefinition, type AppLocale } from "@howtobaby/i18n";
import { Icon } from "@howtobaby/ui";

import { useLanguage } from "@/i18n/LanguageProvider";
import { useMessages } from "@/i18n/T";

export interface LanguageSwitcherProps {
  className?: string;
  /** Render with the menu already open (tests/dev only). */
  initialOpen?: boolean;
}

export function LanguageSwitcher({ className, initialOpen = false }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();
  const t = useMessages();
  const [open, setOpen] = useState(initialOpen);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const active = localeDefinition(language);

  // Close on pointer-down outside and on Escape (returning focus to the trigger).
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && event.target instanceof Node && !rootRef.current.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Move focus into the menu on open — start on the active language.
  useEffect(() => {
    if (!open || !rootRef.current) return;
    const selected = rootRef.current.querySelector<HTMLButtonElement>('.lang-menu__option[aria-selected="true"]');
    (selected ?? rootRef.current.querySelector<HTMLButtonElement>(".lang-menu__option"))?.focus();
  }, [open]);

  const moveFocus = (delta: number) => {
    const options = rootRef.current ? [...rootRef.current.querySelectorAll<HTMLButtonElement>(".lang-menu__option")] : [];
    if (options.length === 0) return;
    const activeIndex = options.findIndex((option) => option === document.activeElement);
    const next = options[(activeIndex + delta + options.length) % options.length];
    next?.focus();
  };

  const choose = (locale: AppLocale) => {
    setLanguage(locale);
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div ref={rootRef} className={["lang-menu", className].filter(Boolean).join(" ")}>
      <button
        ref={triggerRef}
        type="button"
        className="lang-menu__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`${t("language.control.label")}: ${active.nativeName}`}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name="globe" className="lang-menu__globe" />
        <span className="lang-menu__code" aria-hidden="true">
          {active.code}
        </span>
      </button>
      <ul
        id={menuId}
        role="listbox"
        aria-label={t("language.menu.label")}
        className="lang-menu__panel"
        data-open={open ? "true" : "false"}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            moveFocus(event.key === "ArrowDown" ? 1 : -1);
          }
        }}
      >
        {SUPPORTED_LOCALES.map((locale) => {
          const selected = locale.id === language;
          return (
            <li key={locale.id}>
              <button type="button" role="option" aria-selected={selected} className="lang-menu__option" onClick={() => choose(locale.id)}>
                <span className="lang-menu__option-code" aria-hidden="true">
                  {locale.code}
                </span>
                <span className="lang-menu__option-name" lang={locale.id}>
                  {locale.nativeName}
                </span>
                {selected ? <Icon name="check" className="lang-menu__option-check" /> : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
