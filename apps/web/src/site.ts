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
 * accent, message keys): the localized strings live in the app message dictionary, so navigation
 * needs no per-locale config of its own.
 *
 * `labelKey` (`nav.*.label`) is the SHORT navigation label — top and bottom navigation only.
 * `titleKey` (`domain.*.title`) is the domain's full display title — destination cards on
 * Now/Home and page titles. They are distinct keys by contract, so "Play & Development" can
 * never regress to the shortened nav label "Play" on a content surface (docs/GUI_DESIGN.md §2).
 */
export interface PrimaryDestination {
  readonly href: string;
  readonly key: "now" | "feeding" | "play" | "sleep" | "safety" | "tools";
  readonly icon: IconName;
  readonly accent: DomainAccent;
  /** SHORT navigation label key (`nav.*.label`) — never a content/destination title. */
  readonly labelKey: AppMessageKey;
  /** Full domain display-title key (`domain.*.title`) — destination cards and page titles. */
  readonly titleKey: AppMessageKey;
}

export const PRIMARY_NAV: readonly PrimaryDestination[] = [
  { href: "/", key: "now", icon: "home", accent: "brand", labelKey: "nav.now.label", titleKey: "domain.now.title" },
  { href: "/feeding", key: "feeding", icon: "feeding", accent: "feeding", labelKey: "nav.feeding.label", titleKey: "domain.feeding.title" },
  { href: "/play", key: "play", icon: "play", accent: "play", labelKey: "nav.play.label", titleKey: "domain.play.title" },
  { href: "/sleep", key: "sleep", icon: "sleep", accent: "sleep", labelKey: "nav.sleep.label", titleKey: "domain.sleep.title" },
  { href: "/safety", key: "safety", icon: "safety", accent: "safety", labelKey: "nav.safety.label", titleKey: "domain.safety.title" },
  { href: "/tools", key: "tools", icon: "tools", accent: "tools", labelKey: "nav.tools.label", titleKey: "domain.tools.title" },
];

/** Globally reachable legal/source surface (docs/GUI_DESIGN.md §2.1). Labels via the app dictionary. */
export interface TrustLink {
  readonly href: string;
  readonly key: "sources" | "methodology" | "editorialPolicy" | "disclaimer" | "privacy" | "license" | "sourceCode" | "changelog";
  readonly labelKey: AppMessageKey;
  readonly external?: true;
}

export const TRUST_LINKS: readonly TrustLink[] = [
  { href: "/sources", key: "sources", labelKey: "trust.sources.label" },
  { href: "/methodology", key: "methodology", labelKey: "trust.methodology.label" },
  { href: "/editorial-policy", key: "editorialPolicy", labelKey: "trust.editorialPolicy.label" },
  { href: "/disclaimer", key: "disclaimer", labelKey: "trust.disclaimer.label" },
  { href: "/privacy", key: "privacy", labelKey: "trust.privacy.label" },
  { href: "/license", key: "license", labelKey: "trust.license.label" },
  { href: SITE.sourceCodeUrl, key: "sourceCode", labelKey: "trust.sourceCode.label", external: true },
  { href: "/changelog", key: "changelog", labelKey: "trust.changelog.label" },
];

/**
 * Destinations that app copy may name inline through a `{link:<key>}` token (docs/GUI_DESIGN.md
 * §6 "Page and site references in copy"). A page or site named in a sentence is always rendered
 * as a link to that destination, never as plain text: internal destinations open in the same
 * tab, external ones in a new tab with safe attributes. The anchor text is the destination's
 * own localized name — the full domain title for primary destinations (`domain.*.title`, so
 * "Play & Development" never degrades to the nav label "Play" inside prose) and the trust-link
 * label for trust/legal pages — so copy never carries a second, drifting spelling of a page name.
 */
export interface MessageLinkTarget {
  readonly href: string;
  readonly labelKey: AppMessageKey;
  readonly external?: true;
}

export type MessageLinkKey = PrimaryDestination["key"] | TrustLink["key"];

export const MESSAGE_LINKS: Readonly<Record<MessageLinkKey, MessageLinkTarget>> = Object.fromEntries([
  ...PRIMARY_NAV.map((item) => [item.key, { href: item.href, labelKey: item.titleKey }]),
  ...TRUST_LINKS.map((link) => [link.key, { href: link.href, labelKey: link.labelKey, ...(link.external ? { external: true as const } : {}) }]),
]) as Record<MessageLinkKey, MessageLinkTarget>;
