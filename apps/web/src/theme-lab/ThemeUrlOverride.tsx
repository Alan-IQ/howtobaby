// SPDX-License-Identifier: AGPL-3.0-only
"use client";

/**
 * Dev/QA URL override: `?theme=<id>&mode=<light|dark|system>` previews a theme/mode on any page without
 * touching the visitor's stored preference. Mounted only when the Theme Lab build flag is on; unknown values
 * are clamped by the registry. Reads location.search directly so static export needs no Suspense boundary.
 */

import { useEffect } from "react";

import { useTheme } from "@howtobaby/ui";

export function ThemeUrlOverride() {
  const { setPreview } = useTheme();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const themeId = params.get("theme") ?? undefined;
    const mode = params.get("mode") ?? undefined;
    if (!themeId && !mode) return;
    setPreview({
      ...(themeId ? { themeId } : {}),
      ...(mode === "light" || mode === "dark" || mode === "system" ? { colorMode: mode } : {}),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- apply once per page load
  }, []);
  return null;
}
