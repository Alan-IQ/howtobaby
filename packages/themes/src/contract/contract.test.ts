// SPDX-License-Identifier: AGPL-3.0-only
/** Theme Contract gates (docs/THEME_SYSTEM.md §11, docs/IMPLEMENTATION_ROADMAP.md Phase 1 gate). */

import { describe, expect, it } from "vitest";

import { babyModernGlass } from "../baby-modern-glass/index.ts";
import { colorDeclarations, foundationDeclarations, registryToCss, themeToCss } from "../adapters/css-vars/css-vars.ts";
import { createThemeRegistry } from "../registry/registry.ts";
import { defaultThemeDefinitions, defaultThemeRegistry, vendorFixtureTheme } from "../registry/default-registry.ts";
import { parseThemePreference, serializeThemePreference } from "../preference.ts";
import type { ColorTokens, SemanticColorToken, ThemeDefinition } from "./index.ts";
import {
  CONTRAST_REQUIREMENTS,
  contrastFindings,
  contrastRatio,
  GEOMETRY_TOKEN_PATHS,
  parseGradientStops,
  SEMANTIC_COLOR_TOKENS,
  ThemeContractError,
  validateThemeDefinition,
  VISUAL_ACCENT_SURFACES,
  WCAG,
  worstCaseContrastRatio,
} from "./index.ts";

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

describe("accessibility contrast gate (docs/GUI_DESIGN.md §16)", () => {
  it.each(allThemes.map((t) => [t.manifest.id, t] as const))("%s passes every required contrast pair in every mode", (_id, theme) => {
    const failures = contrastFindings(theme).map((f) => `[${f.mode}] ${f.fg} on ${f.bg} = ${f.ratio?.toFixed(2)} < ${f.min} (${f.note})`);
    expect(failures).toEqual([]);
  });

  it("the contrast math matches WCAG reference values", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
    expect(contrastRatio("#777777", "#ffffff")!).toBeCloseTo(4.48, 2);
    // Alpha composites over the backdrop before measuring.
    expect(contrastRatio("rgba(0, 0, 0, 0.5)", "#ffffff")!).toBeLessThan(21);
    expect(contrastRatio("#000000", "linear-gradient(#fff, #000)")).toBeUndefined();
  });

  it("measures gradients at their worst stop, composited over the backdrop", () => {
    expect(parseGradientStops("linear-gradient(180deg, rgba(255, 255, 255, 0.8), #000000)")).toHaveLength(2);
    expect(parseGradientStops("radial-gradient(circle at 10% 20%, #ffffff, transparent 40%)")).toHaveLength(2);
    // Layered backgrounds and unsupported syntaxes are refused, not approximated.
    expect(parseGradientStops("linear-gradient(#fff, #000), radial-gradient(#fff, #000)")).toBeUndefined();
    expect(parseGradientStops("conic-gradient(#fff, #000)")).toBeUndefined();
    expect(parseGradientStops("linear-gradient(180deg, oklch(0.7 0.1 200), #000)")).toBeUndefined();
    // Worst case: black text vs a white→black gradient is decided by the black stop (ratio 1).
    expect(worstCaseContrastRatio("#000000", "linear-gradient(180deg, #ffffff, #000000)")!).toBeCloseTo(1, 5);
    // Solid backgrounds behave exactly like contrastRatio.
    expect(worstCaseContrastRatio("#777777", "#ffffff")!).toBeCloseTo(contrastRatio("#777777", "#ffffff")!, 10);
    // Alpha stops composite over the supplied backdrop: transparent stop over white == white.
    expect(worstCaseContrastRatio("#000000", "linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.5))", "#ffffff")!).toBeCloseTo(21, 5);
  });

  it("gates every accent.*.visual marker at the non-text floor on every neutral surface it is drawn on", () => {
    // Real consumers: card icon/strip (canvas, surface.1), stage-chip ring/dot (surface.2), tab underline
    // over the glass pill (surface.glass) and its reduced-transparency swap (surface.glass.solid).
    const drawnOn: readonly SemanticColorToken[] = ["canvas", "surface.1", "surface.2", "surface.glass", "surface.glass.solid"];
    expect([...VISUAL_ACCENT_SURFACES]).toEqual(drawnOn);
    for (const a of ["brand", "feeding", "play", "sleep", "safety", "tools"] as const) {
      const fg = `accent.${a}.visual` as SemanticColorToken;
      const gatedOn = CONTRAST_REQUIREMENTS.filter((r) => r.fg === fg);
      for (const bg of [...drawnOn, `accent.${a}.glass`, `accent.${a}.soft`]) {
        const req = gatedOn.find((r) => r.bg === bg);
        expect(req, `${fg} must be gated on ${bg}`).toBeDefined();
        expect(req!.min, `${fg} on ${bg} is a non-text marker`).toBe(WCAG.nonText);
      }
    }
  });

  it("catches a visual marker that fades against the stage-chip, glass-pill or solid-glass surfaces", () => {
    const light = babyModernGlass.modes.light!;
    // A pale tint that still reads on the domain's own coral card tint fixture would not be enough: the same
    // marker also sits on surface.2 chips and the neutral glass pill, and must fail there.
    const broken: ThemeDefinition = {
      ...babyModernGlass,
      manifest: { ...babyModernGlass.manifest, modes: ["light"], modeLimitation: "test fixture" },
      modes: { light: { ...light, "accent.feeding.visual": "#e6b8a3" } },
    };
    const findings = contrastFindings(broken).filter((f) => f.fg === "accent.feeding.visual");
    for (const bg of ["surface.2", "surface.glass", "surface.glass.solid"]) {
      const f = findings.find((x) => x.bg === bg);
      expect(f, `expected a finding for accent.feeding.visual on ${bg}`).toBeDefined();
      expect(f!.ratio).toBeDefined(); // measured, not skipped
      expect(f!.ratio!).toBeLessThan(WCAG.nonText);
    }
  });

  it("the gate catches a regression", () => {
    const broken: ThemeDefinition = {
      ...babyModernGlass,
      modes: { ...babyModernGlass.modes, light: { ...babyModernGlass.modes.light!, "text.muted": "#aabbcc" } },
    };
    expect(contrastFindings(broken).length).toBeGreaterThan(0);
  });

  it("catches a gradient with one failing stop even when the .soft fallback passes (the old proxy gate's blind spot)", () => {
    const light = babyModernGlass.modes.light!;
    const broken: ThemeDefinition = {
      ...babyModernGlass,
      manifest: { ...babyModernGlass.manifest, modes: ["light"], modeLimitation: "test fixture" },
      modes: {
        light: {
          ...light,
          // Bottom stop is the shipped (passing) tint; top stop is a mid-grey wash no gated text colour
          // survives on. `.soft` is untouched and still passes — only per-stop measurement can catch this.
          "accent.feeding.glass": "linear-gradient(180deg, rgba(128, 128, 128, 0.9), rgba(247, 224, 207, 0.56))",
        },
      },
    };
    const findings = contrastFindings(broken);
    const glassFindings = findings.filter((f) => f.bg === "accent.feeding.glass");
    expect(glassFindings.length).toBeGreaterThan(0);
    for (const f of glassFindings) expect(f.ratio).toBeLessThan(f.min); // measured, not skipped
    // The opaque fallback still passes on its own — proving the old .soft proxy would have missed this.
    expect(findings.filter((f) => f.bg === "accent.feeding.soft")).toEqual([]);
  });

  it("fails loudly on a required background the parser cannot measure instead of skipping it", () => {
    const light = babyModernGlass.modes.light!;
    const broken: ThemeDefinition = {
      ...babyModernGlass,
      manifest: { ...babyModernGlass.manifest, modes: ["light"], modeLimitation: "test fixture" },
      modes: { light: { ...light, "surface.glass": "conic-gradient(from 0deg, #ffffff, #000000)" } },
    };
    const unmeasurable = contrastFindings(broken).filter((f) => f.bg === "surface.glass");
    expect(unmeasurable.length).toBeGreaterThan(0);
    for (const f of unmeasurable) {
      expect(f.ratio).toBeUndefined();
      expect(f.note).toContain("UNMEASURABLE");
    }
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
