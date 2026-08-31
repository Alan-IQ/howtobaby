// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Adapter boundary for integration levels B (primitives) and C (shell) — docs/THEME_SYSTEM.md §3, §6, §7.
 *
 * Level A (tokens) needs no adapter code beyond a ThemeDefinition. A Level B/C theme additionally supplies
 * implementations for approved slots only. The slot vocabularies below are the complete list a vendor may
 * touch; everything else (evidence, safety, domain cards, routing, age logic) stays HowToBaby-owned. The
 * contract is framework-agnostic: `TImpl` is whatever the host UI layer binds (a React component in
 * @howtobaby/ui), so this package never imports React.
 */

/** Presentation primitives a theme adapter may re-implement (docs/THEME_SYSTEM.md §6). */
export const PRIMITIVE_SLOTS = [
  "Button",
  "IconButton",
  "Card",
  "Surface",
  "Badge",
  "Tabs",
  "Drawer",
  "Dialog",
  "Input",
  "Select",
  "Switch",
  "Tooltip",
  "Popover",
  "Navigation",
  "Skeleton",
  "Divider",
] as const;

export type PrimitiveSlot = (typeof PRIMITIVE_SLOTS)[number];

/** Shell frames a template-level theme may provide (docs/THEME_SYSTEM.md §3 Level C). */
export const SHELL_SLOTS = ["AppFrame", "HeaderFrame", "PrimaryNavFrame", "PageFrame", "SectionFrame", "FooterFrame"] as const;

export type ShellSlot = (typeof SHELL_SLOTS)[number];

/**
 * Components a theme adapter must never own. Listed so validation and reviews have a single source; a
 * vendor adapter offering any of these is rejected.
 */
export const PRODUCT_OWNED_COMPONENTS = [
  "GuidanceLabel",
  "SourceChip",
  "EvidenceDrawer",
  "ReferenceList",
  "SafetyCallout",
  "WhyThisStage",
  "FeedingCard",
  "ActivityCard",
  "SleepSummaryBadge",
  "ToolCard",
  "ToolShell",
] as const;

export type PrimitiveOverrides<TImpl> = Readonly<Partial<Record<PrimitiveSlot, TImpl>>>;
export type ShellOverrides<TImpl> = Readonly<Partial<Record<ShellSlot, TImpl>>>;

/**
 * What a Level B/C adapter contributes on top of tokens. `TImpl` is bound by the consumer (React component
 * type in the UI layer). Overrides change implementation, never semantic intent: props stay the
 * @howtobaby/ui props, required ARIA/keyboard behaviour stays mandatory.
 */
export interface ThemeOverrides<TImpl = unknown> {
  readonly primitives?: PrimitiveOverrides<TImpl>;
  readonly shell?: ShellOverrides<TImpl>;
}

export function isPrimitiveSlot(name: string): name is PrimitiveSlot {
  return (PRIMITIVE_SLOTS as readonly string[]).includes(name);
}

export function isShellSlot(name: string): name is ShellSlot {
  return (SHELL_SLOTS as readonly string[]).includes(name);
}

/** Names in an override map that are not approved slots (product-owned or unknown). */
export function unapprovedOverrideKeys(overrides: ThemeOverrides<unknown> | undefined): string[] {
  if (!overrides) return [];
  const bad: string[] = [];
  for (const key of Object.keys(overrides.primitives ?? {})) if (!isPrimitiveSlot(key)) bad.push(`primitives.${key}`);
  for (const key of Object.keys(overrides.shell ?? {})) if (!isShellSlot(key)) bad.push(`shell.${key}`);
  return bad;
}
