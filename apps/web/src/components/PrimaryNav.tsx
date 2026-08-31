// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import { usePathname } from "next/navigation";

import { Navigation, type NavigationItem } from "@howtobaby/ui";

import { useMessages } from "@/i18n/T";
import { PRIMARY_NAV } from "@/site";
import { NavLink } from "./NavLink";

export interface PrimaryNavProps {
  layout: "horizontal" | "tabs";
  className?: string;
}

/**
 * Primary destinations (docs/GUI_DESIGN.md §2, §6): horizontal on desktop, compact tab bar on
 * mobile. Route/icon/accent semantics come from PRIMARY_NAV; labels resolve from the app message
 * dictionary in the ONE global language — no per-locale nav config exists.
 */
export function PrimaryNav({ layout, className }: PrimaryNavProps) {
  const pathname = usePathname();
  const t = useMessages();
  const items: NavigationItem[] = PRIMARY_NAV.map((item) => ({
    href: item.href,
    label: t(item.labelKey),
    icon: item.icon,
    accent: item.accent,
  }));
  return <Navigation items={items} currentHref={pathname ?? undefined} label={t("nav.primary.label")} layout={layout} linkComponent={NavLink} className={className} />;
}
