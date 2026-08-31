// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import { usePathname } from "next/navigation";

import { Navigation } from "@howtobaby/ui";

import { PRIMARY_NAV } from "@/site";
import { NavLink } from "./NavLink";

export interface PrimaryNavProps {
  layout: "horizontal" | "tabs";
  className?: string;
}

/** Primary destinations (docs/GUI_DESIGN.md §2, §6): horizontal on desktop, compact tab bar on mobile. */
export function PrimaryNav({ layout, className }: PrimaryNavProps) {
  const pathname = usePathname();
  return <Navigation items={PRIMARY_NAV} currentHref={pathname ?? undefined} label="Primary" layout={layout} linkComponent={NavLink} className={className} />;
}
