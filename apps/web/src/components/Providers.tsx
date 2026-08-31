// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import type { ReactNode } from "react";

import { ThemeProvider } from "@howtobaby/ui";

import { localThemePreferenceStore } from "@/storage/theme-preference-store";
import { THEME_LAB_ENABLED } from "@/theme-lab/config";
import { ThemeUrlOverride } from "@/theme-lab/ThemeUrlOverride";
import { appThemeRegistry } from "@/theme-registry";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider registry={appThemeRegistry} store={localThemePreferenceStore}>
      {/* Build-time flag: production bundles contain no override code. */}
      {THEME_LAB_ENABLED ? <ThemeUrlOverride /> : null}
      {children}
    </ThemeProvider>
  );
}
