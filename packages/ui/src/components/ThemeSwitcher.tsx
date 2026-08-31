// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import type { ColorModePreference } from "@howtobaby/themes";

import { Icon } from "../primitives/Icon.tsx";
import { Segmented } from "../primitives/Segmented.tsx";
import { Select } from "../primitives/Input.tsx";
import { useTheme } from "./ThemeProvider.tsx";

export interface ThemeSwitcherLabels {
  colorMode: string;
  light: string;
  dark: string;
  system: string;
  themeFamily: string;
}

export const defaultThemeSwitcherLabels: ThemeSwitcherLabels = {
  colorMode: "Colour mode",
  light: "Light",
  dark: "Dark",
  system: "Match device",
  themeFamily: "Theme",
};

export interface ThemeSwitcherProps {
  labels?: ThemeSwitcherLabels;
  /** Show the theme-family selector (hidden when only one theme is registered). */
  showThemeFamily?: boolean;
  className?: string | undefined;
}

/** Colour-mode segmented control (+ optional theme-family select). Presentation preference only. */
export function ThemeSwitcher({ labels = defaultThemeSwitcherLabels, showThemeFamily = true, className }: ThemeSwitcherProps) {
  const { themes, preference, setColorMode, setThemeId } = useTheme();
  return (
    <div className={className} style={{ display: "flex", alignItems: "center", gap: "var(--htb-space-sm)", flexWrap: "wrap" }}>
      <Segmented<ColorModePreference>
        name="color-mode"
        legend={labels.colorMode}
        value={preference.colorMode}
        onChange={setColorMode}
        options={[
          { value: "light", label: <Icon name="sun" />, ariaLabel: labels.light },
          { value: "dark", label: <Icon name="moon" />, ariaLabel: labels.dark },
          { value: "system", label: <Icon name="system" />, ariaLabel: labels.system },
        ]}
      />
      {showThemeFamily && themes.length > 1 ? (
        <Select
          label={<span className="htb-visually-hidden">{labels.themeFamily}</span>}
          value={preference.themeId}
          onChange={(event) => setThemeId(event.target.value)}
          options={themes.map((t) => ({ value: t.id, label: t.label }))}
        />
      ) : null}
    </div>
  );
}
