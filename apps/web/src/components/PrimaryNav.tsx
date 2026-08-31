// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import { usePathname } from "next/navigation";

import { Navigation } from "@howtobaby/ui";

import { useLanguage } from "@/i18n/LanguageProvider";
import { PRIMARY_NAV, PRIMARY_NAV_VI } from "@/site";
import { NavLink } from "./NavLink";

export interface PrimaryNavProps {
  layout: "horizontal" | "tabs";
  className?: string;
}

/** Primary destinations (docs/GUI_DESIGN.md §2, §6): horizontal on desktop, compact tab bar on mobile. Labels follow the ONE global language preference. */
export function PrimaryNav({ layout, className }: PrimaryNavProps) {
  const pathname = usePathname();
  const { language } = useLanguage();
  const items =
    language === "vi"
      ? PRIMARY_NAV.map((item) => {
          const vi = PRIMARY_NAV_VI[item.href];
          return vi ? { ...item, label: vi.label, ...(vi.shortLabel !== undefined ? { shortLabel: vi.shortLabel } : { shortLabel: vi.label }) } : item;
        })
      : PRIMARY_NAV;
  return <Navigation items={items} currentHref={pathname ?? undefined} label={language === "vi" ? "Chính" : "Primary"} layout={layout} linkComponent={NavLink} className={className} />;
}
