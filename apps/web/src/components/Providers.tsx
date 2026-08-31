// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import type { ReactNode } from "react";

import { defaultThemeRegistry } from "@howtobaby/themes";
import { ThemeProvider } from "@howtobaby/ui";

import { localThemePreferenceStore } from "@/storage/theme-preference-store";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider registry={defaultThemeRegistry} store={localThemePreferenceStore}>
      {children}
    </ThemeProvider>
  );
}
