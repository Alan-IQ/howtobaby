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

/** Vietnamese navigation labels, keyed by href (global language preference, app chrome only). */
export const PRIMARY_NAV_VI: Record<string, { label: string; shortLabel?: string }> = {
  "/": { label: "Hiện tại" },
  "/feeding": { label: "Ăn uống" },
  "/play": { label: "Chơi & Phát triển", shortLabel: "Chơi" },
  "/sleep": { label: "Ngủ" },
  "/safety": { label: "An toàn" },
  "/tools": { label: "Công cụ" },
};

/** Globally reachable legal/source surface (docs/GUI_DESIGN.md §2.1). */
export const TRUST_LINKS = [
  { href: "/sources", label: "Sources", viLabel: "Nguồn" },
  { href: "/methodology", label: "Methodology", viLabel: "Phương pháp" },
  { href: "/editorial-policy", label: "Editorial Policy", viLabel: "Chính sách biên tập" },
  { href: "/disclaimer", label: "Medical Disclaimer", viLabel: "Miễn trừ y khoa" },
  { href: "/privacy", label: "Privacy", viLabel: "Quyền riêng tư" },
  { href: "/license", label: "License", viLabel: "Giấy phép" },
  { href: SITE.sourceCodeUrl, label: "Source Code", viLabel: "Mã nguồn", external: true },
  { href: "/changelog", label: "Changelog / Corrections", viLabel: "Thay đổi / Đính chính" },
] as const;
