// SPDX-License-Identifier: AGPL-3.0-only
/** Site-level constants: canonical host, navigation semantics (docs/GUI_DESIGN.md §2), source-code link. */

import type { NavigationItem } from "@howtobaby/ui";

export const SITE = {
  name: "HowToBaby",
  tagline: "Know what your child needs. Right now.",
  /** Canonical production origin. www.howtobaby.com redirects here (DEPLOYMENT_HAWKHOST.md). */
  url: "https://howtobaby.com",
  sourceCodeUrl: "https://github.com/Alan-IQ/HowToBaby",
  licenseUrl: "https://github.com/Alan-IQ/HowToBaby/blob/main/LICENSE.md",
} as const;

/** Primary destinations, in the order the GUI contract fixes them. */
export const PRIMARY_NAV: readonly NavigationItem[] = [
  { href: "/", label: "Now", icon: "home", accent: "brand" },
  { href: "/feeding", label: "Feeding", icon: "feeding", accent: "feeding" },
  { href: "/play", label: "Play & Development", shortLabel: "Play", icon: "play", accent: "play" },
  { href: "/sleep", label: "Sleep", icon: "sleep", accent: "sleep" },
  { href: "/safety", label: "Safety", icon: "safety", accent: "safety" },
  { href: "/tools", label: "Tools", icon: "tools", accent: "tools" },
];

/** Globally reachable legal/source surface (docs/GUI_DESIGN.md §2.1). */
export const TRUST_LINKS = [
  { href: "/sources", label: "Sources" },
  { href: "/methodology", label: "Methodology" },
  { href: "/editorial-policy", label: "Editorial Policy" },
  { href: "/disclaimer", label: "Medical Disclaimer" },
  { href: "/privacy", label: "Privacy" },
  { href: "/license", label: "License" },
  { href: SITE.sourceCodeUrl, label: "Source Code", external: true },
  { href: "/changelog", label: "Changelog / Corrections" },
] as const;
