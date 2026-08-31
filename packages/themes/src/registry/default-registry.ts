// SPDX-License-Identifier: AGPL-3.0-only
/**
 * The registry the app ships with. Baby Modern Glass is the default and compatibility baseline; the vendor
 * fixture proves the adapter boundary and lets tests/dev switch themes. Both are validated at module load —
 * an incomplete pack fails the build, not the user.
 */

import { adaptVendorSampleKit, vendorSampleKit } from "../adapters/vendor-fixture/index.ts";
import { babyModernGlass, BABY_MODERN_GLASS_ID } from "../baby-modern-glass/index.ts";
import { createThemeRegistry } from "./registry.ts";

export const vendorFixtureTheme = adaptVendorSampleKit(vendorSampleKit, babyModernGlass.foundation);

export const defaultThemeRegistry = createThemeRegistry([babyModernGlass, vendorFixtureTheme], { defaultThemeId: BABY_MODERN_GLASS_ID });

export const defaultThemeDefinitions = [babyModernGlass, vendorFixtureTheme] as const;
