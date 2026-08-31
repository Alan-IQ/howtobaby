// SPDX-License-Identifier: AGPL-3.0-only
/** Theme Contract gates (docs/THEME_SYSTEM.md §11, docs/IMPLEMENTATION_ROADMAP.md Phase 1 gate). */

import { describe, expect, it } from "vitest";

import { babyModernGlass } from "../baby-modern-glass/index.ts";
import { colorDeclarations, foundationDeclarations, registryToCss, themeToCss } from "../adapters/css-vars/css-vars.ts";
import { createThemeRegistry } from "../registry/registry.ts";
import { defaultThemeDefinitions, defaultThemeRegistry, vendorFixtureTheme } from "../registry/default-registry.ts";
import { parseThemePreference, serializeThemePreference } from "../preference.ts";
import type { ColorTokens, ThemeDefinition } from "./index.ts";
import { GEOMETRY_TOKEN_PATHS, SEMANTIC_COLOR_TOKENS, ThemeContractError, validateThemeDefinition } from "./index.ts";

const allThemes: ThemeDefinition[] = [...defaultThemeDefinitions];

describe("theme capability validation", () => {
  it.each(allThemes.map((t) => [t.manifest.id, t] as const))("%s resolves every required semantic token and foundation token", (_id, theme) => {
    expect(validateThemeDefinition(theme)).toEqual([]);
    for (const mode of theme.manifest.modes) {
      const tokens = theme.modes[mode]!;
      for (const token of SEMANTIC_COLOR_TOKENS) expect(tokens[token], `${_id}/${mode}/${token}`).toMatch(/\S/);
    }
  });

  it("refuses a theme that drops a required token", () => {
    const { "status.urgent": _dropped, ...rest } = babyModernGlass.modes.light!;
    const broken: ThemeDefinition = { ...babyModernGlass, manifest: { ...babyModernGlass.manifest, id: "broken" }, modes: { ...babyModernGlass.modes, light: rest as unknown as ColorTokens } };
    const issues = validateThemeDefinition(broken);
    expect(issues.map((i) => i.code)).toContain("token.missing");
    expect(() => createThemeRegistry([broken])).toThrow(ThemeContractError);
  });

  it("refuses a theme that declares a capability HowToBaby has no fallback for as false", () => {
    const broken: ThemeDefinition = {
      ...babyModernGlass,
      manifest: { ...babyModernGlass.manifest, capabilities: { ...babyModernGlass.manifest.capabilities, supportsSafetyStates: false } },
    };
    expect(validateThemeDefinition(broken).some((i) => i.code === "capability.required")).toBe(true);
  });

  it("refuses a third-party theme without a license record", () => {
    const broken: ThemeDefinition = { ...vendorFixtureTheme, manifest: { ...vendorFixtureTheme.manifest, licenseRef: undefined as unknown as string } };
    expect(validateThemeDefinition(broken).some((i) => i.code === "manifest.license")).toBe(true);
  });

  it("enforces accessibility minimums a vendor pack cannot lower", () => {
    const broken: ThemeDefinition = {
      ...babyModernGlass,
      foundation: { ...babyModernGlass.foundation, layout: { ...babyModernGlass.foundation.layout, touchTarget: "32px" } },
    };
    expect(validateThemeDefinition(broken).some((i) => i.code === "geometry.minimum")).toBe(true);
  });

  it("requires a documented limitation for a single-mode theme", () => {
    const single: ThemeDefinition = { ...babyModernGlass, manifest: { ...babyModernGlass.manifest, modes: ["light"] }, modes: { light: babyModernGlass.modes.light! } };
    expect(validateThemeDefinition(single).some((i) => i.code === "manifest.modes")).toBe(true);
    const documented: ThemeDefinition = { ...single, manifest: { ...single.manifest, modeLimitation: "Light only until the dark palette is reviewed." } };
    expect(validateThemeDefinition(documented)).toEqual([]);
  });
});

describe("primitive/shell adapter boundary (Level B/C)", () => {
  it("rejects overrides of product-owned components and mismatched integration levels", () => {
    const withBad: ThemeDefinition = {
      ...vendorFixtureTheme,
      manifest: { ...vendorFixtureTheme.manifest, integrationLevel: "primitives" },
      overrides: { primitives: { Button: {}, EvidenceDrawer: {} } as never },
    };
    const codes = validateThemeDefinition(withBad).map((i) => i.code);
    expect(codes).toContain("overrides.slot");
    const shellOnPrimitives: ThemeDefinition = { ...withBad, overrides: { primitives: { Button: {} }, shell: { HeaderFrame: {} } } };
    expect(validateThemeDefinition(shellOnPrimitives).some((i) => i.code === "overrides.level")).toBe(true);
    const tokensWithOverrides: ThemeDefinition = { ...vendorFixtureTheme, overrides: { primitives: { Card: {} } } };
    expect(validateThemeDefinition(tokensWithOverrides).some((i) => i.code === "overrides.level")).toBe(true);
  });

  it("accepts a well-formed shell adapter", () => {
    const shell: ThemeDefinition = {
      ...vendorFixtureTheme,
      manifest: { ...vendorFixtureTheme.manifest, integrationLevel: "shell" },
      overrides: { primitives: { Card: {} }, shell: { AppFrame: {}, FooterFrame: {} } },
    };
    expect(validateThemeDefinition(shell)).toEqual([]);
  });
});

describe("Light/Dark geometry parity", () => {
  it.each(allThemes.map((t) => [t.manifest.id, t] as const))("%s: light and dark share one foundation and differ only in colour tokens", (_id, theme) => {
    expect(theme.manifest.modes).toEqual(["light", "dark"]);
    const css = themeToCss(theme);
    // Foundation declarations appear once, on the mode-less theme selector.
    const geometryVars = foundationDeclarations(theme.foundation).map(([name]) => name);
    expect(geometryVars).toHaveLength(GEOMETRY_TOKEN_PATHS.length);
    const lightBlock = css.split(`[data-color-mode="light"]`)[1]!.split("}")[0]!;
    const darkBlock = css.split(`[data-color-mode="dark"]`)[1]!.split("}")[0]!;
    for (const name of geometryVars) {
      expect(lightBlock).not.toContain(`${name}:`);
      expect(darkBlock).not.toContain(`${name}:`);
    }
    const lightVars = colorDeclarations(theme, "light").map(([n]) => n);
    const darkVars = colorDeclarations(theme, "dark").map(([n]) => n);
    expect(lightVars).toEqual(darkVars);
  });
});

describe("baseline ↔ adapter fixture switching changes presentation only", () => {
  it("both themes expose the identical CSS variable surface", () => {
    const names = (t: ThemeDefinition) => [...colorDeclarations(t, "light").map(([n]) => n), ...foundationDeclarations(t.foundation).map(([n]) => n)].sort();
    expect(names(vendorFixtureTheme)).toEqual(names(babyModernGlass));
  });

  it("the fixture is a third-party tokens-level theme with a license record and no glass dependency", () => {
    expect(vendorFixtureTheme.manifest.source).toBe("third-party");
    expect(vendorFixtureTheme.manifest.integrationLevel).toBe("tokens");
    expect(vendorFixtureTheme.manifest.adapterId).toBe("vendor-fixture");
    expect(vendorFixtureTheme.license?.redistribution).toBeDefined();
    expect(vendorFixtureTheme.manifest.capabilities.reducedTransparencyFallback).toBe(true);
  });

  it("the registry clamps unknown ids and foreign colour modes", () => {
    expect(defaultThemeRegistry.defaultThemeId).toBe("baby-modern-glass");
    expect(defaultThemeRegistry.resolve("not-installed").manifest.id).toBe("baby-modern-glass");
    expect(defaultThemeRegistry.normalizePreference({ themeId: "nope", colorMode: "purple" as never })).toEqual({ themeId: "baby-modern-glass", colorMode: "system" });
    expect(defaultThemeRegistry.resolveColorMode("vendor-fixture-paper-soft", "system", "dark")).toBe("dark");
    expect(defaultThemeRegistry.resolveColorMode("baby-modern-glass", "light", "dark")).toBe("light");
  });
});

describe("css-vars adapter", () => {
  it("emits theme-scoped selectors, fallbacks and a :root baseline", () => {
    const css = registryToCss(allThemes, "baby-modern-glass");
    expect(css).toContain(":root {");
    expect(css).toContain('[data-theme="baby-modern-glass"][data-color-mode="dark"]');
    expect(css).toContain("@media (prefers-reduced-transparency: reduce)");
    expect(css).toContain("@supports not ((backdrop-filter: blur(1px))");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("@media print");
    expect(css).toContain("--htb-surface-glass: var(--htb-surface-glass-solid)");
    // Fallback/print blocks must not lose to the per-mode block on specificity.
    expect(css).toMatch(/@media \(prefers-reduced-transparency: reduce\) \{\n\[data-theme="baby-modern-glass"]\[data-color-mode] \{/);
    expect(css).toMatch(/@media print \{\n\[data-theme="baby-modern-glass"]\[data-color-mode] \{/);
    expect(css).toContain("--htb-status-urgent-bg:");
    expect(css).toContain("--htb-font-size-md: 16px");
  });

  it("is deterministic", () => {
    expect(registryToCss(allThemes, "baby-modern-glass")).toBe(registryToCss(allThemes, "baby-modern-glass"));
  });
});

describe("preference codec", () => {
  it("round-trips and rejects garbage", () => {
    const raw = serializeThemePreference({ themeId: "baby-modern-glass", colorMode: "dark" });
    expect(parseThemePreference(raw)).toEqual({ themeId: "baby-modern-glass", colorMode: "dark" });
    expect(parseThemePreference("{not json")).toBeUndefined();
    expect(parseThemePreference(JSON.stringify({ colorMode: "neon" }))).toEqual({});
    expect(parseThemePreference(null)).toBeUndefined();
  });
});
