// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Generates packages/ui/src/theme-tokens.generated.css — the css-vars adapter output for the default theme
 * registry, written to a real (gitignored) file so editors can resolve and autocomplete the `--htb-*` custom
 * properties that are otherwise only inlined into <head> at render time by apps/web.
 *
 * This file is developer tooling only: nothing imports it, the runtime/inlined CSS in ThemeStyles.tsx stays
 * the single source of truth, and the content is deterministic (same generator, same output). It is refreshed
 * automatically by the root `postinstall` hook; run manually with:
 *
 *   node scripts/generate-theme-reference-css.ts
 *
 * Runs on plain Node >= 24 (type stripping) — theme sources use explicit .ts import specifiers for this.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { registryToCss } from "../packages/themes/src/adapters/css-vars/css-vars.ts";
import { defaultThemeDefinitions, defaultThemeRegistry } from "../packages/themes/src/registry/default-registry.ts";
import { repoRoot } from "./lib/git.ts";

const OUTPUT = "packages/ui/src/theme-tokens.generated.css";

const header = `/* SPDX-License-Identifier: AGPL-3.0-only */
/*
 * GENERATED FILE — DO NOT EDIT, DO NOT IMPORT, DO NOT COMMIT (gitignored).
 * Editor reference for the --htb-* custom properties; the runtime CSS is inlined by
 * apps/web/src/components/ThemeStyles.tsx from the same registry. Regenerate with:
 *   node scripts/generate-theme-reference-css.ts
 */

`;

const target = join(repoRoot(), OUTPUT);
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, header + registryToCss(defaultThemeDefinitions, defaultThemeRegistry.defaultThemeId) + "\n");
console.log(`Wrote ${OUTPUT} (${defaultThemeDefinitions.length} theme(s), default "${defaultThemeRegistry.defaultThemeId}").`);
