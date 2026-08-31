// SPDX-License-Identifier: AGPL-3.0-only
/** Baby Modern Glass — first-party baseline theme pack (docs/THEME_SYSTEM.md §10). */

import type { ThemeDefinition } from "../contract/index.ts";
import { babyModernGlassDark } from "./dark.ts";
import { babyModernGlassLight } from "./light.ts";
import { BABY_MODERN_GLASS_ID, babyModernGlassCapabilities, babyModernGlassFoundation, babyModernGlassPrint } from "./shared.ts";

export { BABY_MODERN_GLASS_ID };

export const babyModernGlass: ThemeDefinition = {
  manifest: {
    id: BABY_MODERN_GLASS_ID,
    label: "Baby Modern Glass",
    source: "first-party",
    integrationLevel: "tokens",
    modes: ["light", "dark"],
    adapterId: "first-party",
    capabilities: babyModernGlassCapabilities,
    licenseRef: "AGPL-3.0-only",
  },
  foundation: babyModernGlassFoundation,
  modes: { light: babyModernGlassLight, dark: babyModernGlassDark },
  print: babyModernGlassPrint,
  license: {
    themeId: BABY_MODERN_GLASS_ID,
    vendor: "HowToBaby",
    licenseType: "AGPL-3.0-only",
    redistribution: "allowed",
    sourceLocation: "packages/themes/src/baby-modern-glass",
    reviewedAt: "2026-08-30",
  },
};
