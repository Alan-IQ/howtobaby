// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { THEME_LAB_ENABLED } from "@/theme-lab/config";
import { ThemeLab } from "@/theme-lab/ThemeLab";

export const metadata: Metadata = {
  title: "Theme Lab",
  robots: { index: false, follow: false },
};

/** Development/QA route: 404s unless the Theme Lab build flag is on (see src/theme-lab/config.ts). */
export default function ThemeLabPage() {
  if (!THEME_LAB_ENABLED) notFound();
  return <ThemeLab />;
}
