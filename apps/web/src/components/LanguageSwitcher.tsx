// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Compact global language control (GUI_DESIGN.md §6): globe + EN/VI pair in the header — the ONE
 * language switch in the app. Both options stay visible so the current language is obvious and
 * switching is a single tap; `aria-pressed` carries the state, never colour alone.
 */

"use client";

import { Icon } from "@howtobaby/ui";

import { useLanguage } from "@/i18n/LanguageProvider";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();
  return (
    <div className={["lang-switch", className].filter(Boolean).join(" ")} role="group" aria-label="Language / Ngôn ngữ">
      <Icon name="globe" className="lang-switch__icon" />
      <button type="button" className="lang-switch__option" aria-pressed={language === "en"} onClick={() => setLanguage("en")} aria-label="English">
        EN
      </button>
      <button type="button" className="lang-switch__option" aria-pressed={language === "vi"} onClick={() => setLanguage("vi")} aria-label="Tiếng Việt">
        VI
      </button>
    </div>
  );
}
