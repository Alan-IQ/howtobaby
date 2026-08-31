// SPDX-License-Identifier: AGPL-3.0-only
import Link from "next/link";

import { ThemeSwitcher } from "@howtobaby/ui";

import { SITE } from "@/site";
import { PrimaryNav } from "./PrimaryNav";

/**
 * Header (docs/GUI_DESIGN.md §6): brand/home, primary navigation on desktop, theme control. Child/age context,
 * language switch and profile controls attach here in the phases that introduce them (2–3); the slots are
 * intentionally absent rather than rendered inert.
 */
export function AppHeader() {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link href="/" className="app-header__brand" aria-label={`${SITE.name} — home`}>
          <span className="app-header__brand-mark" aria-hidden="true">
            hb
          </span>
          <span>{SITE.name}</span>
        </Link>
        <PrimaryNav layout="horizontal" className="app-header__nav" />
        <div className="app-header__controls">
          <ThemeSwitcher className="app-header__theme" showThemeFamily={false} />
        </div>
      </div>
    </header>
  );
}
