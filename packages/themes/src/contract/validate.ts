// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Theme capability validation (docs/THEME_SYSTEM.md §4 "installable only if", §11 gates).
 * A definition that fails here is refused by the registry, so an incomplete theme can never be selectable.
 */

import { unapprovedOverrideKeys } from "./adapters.ts";
import { COLOR_MODES, type ThemeDefinition } from "./manifest.ts";
import {
  FOUNDATION_MINIMUMS,
  GEOMETRY_TOKEN_PATHS,
  PRINT_TOKEN_KEYS,
  SEMANTIC_COLOR_TOKENS,
  getGeometryToken,
} from "./tokens.ts";

export interface ThemeValidationIssue {
  readonly code:
    | "manifest.id"
    | "manifest.label"
    | "manifest.source"
    | "manifest.level"
    | "manifest.modes"
    | "manifest.adapter"
    | "manifest.license"
    | "capability.required"
    | "capability.print"
    | "mode.missing"
    | "mode.undeclared"
    | "token.missing"
    | "token.empty"
    | "geometry.missing"
    | "geometry.minimum"
    | "print.missing"
    | "overrides.level"
    | "overrides.slot";
  readonly message: string;
  readonly path?: string;
}

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function pxValue(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const match = /^(\d+(?:\.\d+)?)px$/.exec(value.trim());
  return match ? Number(match[1]) : undefined;
}

export function validateThemeDefinition(definition: ThemeDefinition): ThemeValidationIssue[] {
  const issues: ThemeValidationIssue[] = [];
  const { manifest, foundation, modes, print } = definition;

  if (!isNonEmptyString(manifest.id) || !ID_PATTERN.test(manifest.id)) {
    issues.push({ code: "manifest.id", message: "theme id must be a stable kebab-case identifier", path: "manifest.id" });
  }
  if (!isNonEmptyString(manifest.label)) issues.push({ code: "manifest.label", message: "theme label is required", path: "manifest.label" });
  if (manifest.source !== "first-party" && manifest.source !== "third-party") {
    issues.push({ code: "manifest.source", message: "source must be first-party or third-party", path: "manifest.source" });
  }
  if (!["tokens", "primitives", "shell"].includes(manifest.integrationLevel)) {
    issues.push({ code: "manifest.level", message: "integrationLevel must be tokens | primitives | shell", path: "manifest.integrationLevel" });
  }
  if (!isNonEmptyString(manifest.adapterId)) issues.push({ code: "manifest.adapter", message: "adapterId is required", path: "manifest.adapterId" });
  if (manifest.source === "third-party" && (!definition.license || !isNonEmptyString(manifest.licenseRef))) {
    issues.push({ code: "manifest.license", message: "third-party themes must carry a ThemeLicenseRecord and licenseRef", path: "manifest.licenseRef" });
  }

  const declaredModes = manifest.modes ?? [];
  if (declaredModes.length === 0) {
    issues.push({ code: "manifest.modes", message: "at least one colour mode must be declared", path: "manifest.modes" });
  } else if (declaredModes.length < COLOR_MODES.length && !isNonEmptyString(manifest.modeLimitation)) {
    issues.push({ code: "manifest.modes", message: "a single-mode theme must document its Light/Dark limitation (modeLimitation)", path: "manifest.modeLimitation" });
  }

  // Capabilities that have no product fallback must be true (docs/THEME_SYSTEM.md §11).
  const caps = manifest.capabilities;
  for (const key of ["reducedTransparencyFallback", "supportsEvidenceStates", "supportsSafetyStates", "supportsToolSurfaces"] as const) {
    if (caps?.[key] !== true) {
      issues.push({ code: "capability.required", message: `capability ${key} must be true; HowToBaby has no approved fallback`, path: `manifest.capabilities.${key}` });
    }
  }
  if (caps?.printProfile === true && !print) {
    issues.push({ code: "capability.print", message: "printProfile is declared but no print tokens are provided", path: "print" });
  }
  if (caps?.printProfile !== true) {
    issues.push({ code: "capability.required", message: "printProfile must be true (print fallback is a required product surface)", path: "manifest.capabilities.printProfile" });
  }

  for (const mode of declaredModes) {
    const tokens = modes[mode];
    if (!tokens) {
      issues.push({ code: "mode.missing", message: `declared mode "${mode}" has no token set`, path: `modes.${mode}` });
      continue;
    }
    for (const token of SEMANTIC_COLOR_TOKENS) {
      const value = (tokens as Record<string, unknown>)[token];
      if (value === undefined) issues.push({ code: "token.missing", message: `required semantic token "${token}" is missing`, path: `modes.${mode}.${token}` });
      else if (!isNonEmptyString(value)) issues.push({ code: "token.empty", message: `semantic token "${token}" is empty`, path: `modes.${mode}.${token}` });
    }
  }
  for (const mode of Object.keys(modes)) {
    if (!declaredModes.includes(mode as (typeof COLOR_MODES)[number])) {
      issues.push({ code: "mode.undeclared", message: `token set "${mode}" is not declared in manifest.modes`, path: `modes.${mode}` });
    }
  }

  for (const path of GEOMETRY_TOKEN_PATHS) {
    if (!isNonEmptyString(getGeometryToken(foundation, path))) {
      issues.push({ code: "geometry.missing", message: `foundation token "${path}" is missing`, path: `foundation.${path}` });
    }
  }
  const body = pxValue(getGeometryToken(foundation, "typography.size.md"));
  if (body !== undefined && body < FOUNDATION_MINIMUMS.bodyFontSizePx) {
    issues.push({ code: "geometry.minimum", message: `body font size must be >= ${FOUNDATION_MINIMUMS.bodyFontSizePx}px`, path: "foundation.typography.size.md" });
  }
  const target = pxValue(getGeometryToken(foundation, "layout.touchTarget"));
  if (target !== undefined && target < FOUNDATION_MINIMUMS.touchTargetPx) {
    issues.push({ code: "geometry.minimum", message: `touch target must be >= ${FOUNDATION_MINIMUMS.touchTargetPx}px`, path: "foundation.layout.touchTarget" });
  }

  // Level B/C adapters must only touch approved slots; a tokens-level theme carries no overrides at all.
  const overrides = definition.overrides;
  const hasOverrides = Boolean(overrides && (Object.keys(overrides.primitives ?? {}).length > 0 || Object.keys(overrides.shell ?? {}).length > 0));
  if (manifest.integrationLevel === "tokens" && hasOverrides) {
    issues.push({ code: "overrides.level", message: "a tokens-level theme must not provide primitive/shell overrides; declare integrationLevel primitives or shell", path: "overrides" });
  }
  if (manifest.integrationLevel !== "tokens" && !hasOverrides) {
    issues.push({ code: "overrides.level", message: `integrationLevel "${manifest.integrationLevel}" declared but no overrides are provided`, path: "overrides" });
  }
  if (manifest.integrationLevel === "primitives" && overrides?.shell && Object.keys(overrides.shell).length > 0) {
    issues.push({ code: "overrides.level", message: "shell overrides require integrationLevel shell", path: "overrides.shell" });
  }
  for (const key of unapprovedOverrideKeys(overrides)) {
    issues.push({ code: "overrides.slot", message: `"${key}" is not an approved adapter slot (product-owned or unknown component)`, path: `overrides.${key}` });
  }

  if (print) {
    for (const key of PRINT_TOKEN_KEYS) {
      if (!isNonEmptyString(print[key])) issues.push({ code: "print.missing", message: `print token "${key}" is missing`, path: `print.${key}` });
    }
  }

  return issues;
}

export class ThemeContractError extends Error {
  readonly issues: readonly ThemeValidationIssue[];
  constructor(themeId: string, issues: readonly ThemeValidationIssue[]) {
    super(`Theme "${themeId}" violates the Theme Contract:\n${issues.map((i) => `  - [${i.code}] ${i.path ? `${i.path}: ` : ""}${i.message}`).join("\n")}`);
    this.name = "ThemeContractError";
    this.issues = issues;
  }
}

/** Throws when the definition is not installable. */
export function assertThemeDefinition(definition: ThemeDefinition): void {
  const issues = validateThemeDefinition(definition);
  if (issues.length > 0) throw new ThemeContractError(definition.manifest?.id ?? "<unknown>", issues);
}
