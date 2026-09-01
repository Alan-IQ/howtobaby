// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import Link from "next/link";

import { useMessages } from "@/i18n/T";
import { SITE } from "@/site";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { LocalizedThemeSwitcher } from "./LocalizedThemeSwitcher";
import { PrimaryNav } from "./PrimaryNav";

/**
 * Header (docs/GUI_DESIGN.md §6): brand/home, primary navigation on desktop, then the presentation
 * controls — theme mode, and the global language trigger outermost right. Child/age context and
 * profile controls attach here in the phases that introduce them; the slots are intentionally
 * absent rather than rendered inert.
 */
export function AppHeader() {
  const t = useMessages();
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link href="/" className="app-header__brand" aria-label={`${SITE.name} — ${t("app.brandHome.label")}`}>
          <span className="app-header__brand-mark" aria-hidden="true">
            hb
          </span>
          <span className="app-header__brand-text">{SITE.name}</span>
        </Link>
        <PrimaryNav layout="horizontal" className="app-header__nav" />
        <div className="app-header__controls">
          <LocalizedThemeSwitcher className="app-header__theme" showThemeFamily={false} />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
