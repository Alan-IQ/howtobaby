// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Theme Contract (docs/THEME_SYSTEM.md §4, §9). Vendor-neutral: nothing here knows about child age, claims,
 * evidence, routes, or any vendor API.
 */

import type { ThemeOverrides } from "./adapters.ts";
import type { ColorTokens, FoundationTokens, PrintTokens } from "./tokens.ts";

export type ThemeSource = "first-party" | "third-party";
export type ThemeIntegrationLevel = "tokens" | "primitives" | "shell";
export type ColorMode = "light" | "dark";

export const COLOR_MODES: readonly ColorMode[] = ["light", "dark"];

export interface ThemeCapabilities {
  readonly glass?: boolean;
  readonly decorativeMotifs?: boolean;
  readonly reducedTransparencyFallback: boolean;
  readonly printProfile: boolean;
  readonly supportsEvidenceStates: boolean;
  readonly supportsSafetyStates: boolean;
  readonly supportsToolSurfaces: boolean;
}

/** Public record of where a theme's source lives and what may be redistributed (docs/THEME_SYSTEM.md §9). */
export interface ThemeLicenseRecord {
  readonly themeId: string;
  readonly vendor?: string;
  readonly version?: string;
  readonly licenseType: string;
  readonly redistribution: "allowed" | "restricted" | "unknown";
  readonly sourceLocation: string;
  readonly reviewedAt: string;
  readonly notes?: string;
}

export interface ThemeAssetManifest {
  /** Optional decorative assets a theme may provide, keyed by slot name; values are URL paths. */
  readonly decorative?: Readonly<Record<string, string>>;
}

export interface ThemeManifest {
  /** Stable id; never changes because files move or labels change. */
  readonly id: string;
  readonly label: string;
  readonly source: ThemeSource;
  readonly integrationLevel: ThemeIntegrationLevel;
  readonly modes: readonly ColorMode[];
  /** Adapter that produced this definition (e.g. "first-party", "vendor-fixture"). */
  readonly adapterId: string;
  readonly capabilities: ThemeCapabilities;
  readonly licenseRef?: string;
  readonly assets?: ThemeAssetManifest;
  /** Documented Light/Dark limitation when a theme declares fewer than two modes (docs/THEME_SYSTEM.md §14). */
  readonly modeLimitation?: string;
}

/**
 * A fully resolved theme: manifest + tokens. This is the only shape the registry, the css-vars adapter, and
 * the app ever see — first-party packs and third-party adapters both produce it.
 */
export interface ThemeDefinition {
  readonly manifest: ThemeManifest;
  readonly foundation: FoundationTokens;
  readonly modes: Readonly<Partial<Record<ColorMode, ColorTokens>>>;
  readonly print?: PrintTokens;
  readonly license?: ThemeLicenseRecord;
  /** Level B/C only: approved primitive/shell implementations (docs/THEME_SYSTEM.md §3). */
  readonly overrides?: ThemeOverrides;
}

/** Runtime preference (docs/THEME_SYSTEM.md §12): presentation only, stored locally. */
export type ColorModePreference = ColorMode | "system";

export interface ThemePreference {
  readonly themeId: string;
  readonly colorMode: ColorModePreference;
}
