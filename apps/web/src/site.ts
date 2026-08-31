// SPDX-License-Identifier: AGPL-3.0-only
/** Site-level constants: canonical host, navigation semantics (docs/GUI_DESIGN.md §2), source-code link. */

import type { AppMessageKey } from "@/i18n/messages";
import type { DomainAccent, IconName } from "@howtobaby/ui";

export const SITE = {
  name: "HowToBaby",
  tagline: "Know what your child needs. Right now.",
  /** Canonical production origin. www.howtobaby.com redirects here (DEPLOYMENT_HAWKHOST.md). */
  url: "https://howtobaby.com",
  sourceCodeUrl: "https://github.com/Alan-IQ/HowToBaby",
  licenseUrl: "https://github.com/Alan-IQ/HowToBaby/blob/main/LICENSE.md",
} as const;

/**
 * Primary destinations, in the order the GUI contract fixes them. Semantics only (route, icon,
 * accent, message key): the localized labels live in the app message dictionary, keyed by
 * `nav.<key>.label`, so navigation needs no per-locale config of its own.
 */
export interface PrimaryDestination {
  readonly href: string;
  readonly key: "now" | "feeding" | "play" | "sleep" | "safety" | "tools";
  readonly icon: IconName;
  readonly accent: DomainAccent;
  readonly labelKey: AppMessageKey;
}

export const PRIMARY_NAV: readonly PrimaryDestination[] = [
  { href: "/", key: "now", icon: "home", accent: "brand", labelKey: "nav.now.label" },
  { href: "/feeding", key: "feeding", icon: "feeding", accent: "feeding", labelKey: "nav.feeding.label" },
  { href: "/play", key: "play", icon: "play", accent: "play", labelKey: "nav.play.label" },
  { href: "/sleep", key: "sleep", icon: "sleep", accent: "sleep", labelKey: "nav.sleep.label" },
  { href: "/safety", key: "safety", icon: "safety", accent: "safety", labelKey: "nav.safety.label" },
  { href: "/tools", key: "tools", icon: "tools", accent: "tools", labelKey: "nav.tools.label" },
];

/** Globally reachable legal/source surface (docs/GUI_DESIGN.md §2.1). Labels via the app dictionary. */
export const TRUST_LINKS: readonly { href: string; labelKey: AppMessageKey; external?: true }[] = [
  { href: "/sources", labelKey: "trust.sources.label" },
  { href: "/methodology", labelKey: "trust.methodology.label" },
  { href: "/editorial-policy", labelKey: "trust.editorialPolicy.label" },
  { href: "/disclaimer", labelKey: "trust.disclaimer.label" },
  { href: "/privacy", labelKey: "trust.privacy.label" },
  { href: "/license", labelKey: "trust.license.label" },
  { href: SITE.sourceCodeUrl, labelKey: "trust.sourceCode.label", external: true },
  { href: "/changelog", labelKey: "trust.changelog.label" },
];
