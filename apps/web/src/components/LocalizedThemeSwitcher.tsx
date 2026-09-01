// SPDX-License-Identifier: AGPL-3.0-only
/** ThemeSwitcher with its control labels following the ONE global language preference. */

"use client";

import { ThemeSwitcher } from "@howtobaby/ui";

import { useMessages } from "@/i18n/T";

export function LocalizedThemeSwitcher({ className, showThemeFamily = true }: { className?: string; showThemeFamily?: boolean }) {
  const t = useMessages();
  return (
    <ThemeSwitcher
      labels={{
        colorMode: t("theme.colorMode.label"),
        light: t("theme.colorMode.light"),
        dark: t("theme.colorMode.dark"),
        system: t("theme.colorMode.system"),
        themeFamily: t("theme.family.label"),
      }}
      showThemeFamily={showThemeFamily}
      className={className}
    />
  );
}
