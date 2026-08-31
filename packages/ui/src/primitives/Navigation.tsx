// SPDX-License-Identifier: AGPL-3.0-only
import type { ComponentType, ReactNode } from "react";

import type { DomainAccent } from "./Card.tsx";
import { Icon, type IconName } from "./Icon.tsx";

export interface NavigationItem {
  href: string;
  label: string;
  /** Compact label for the mobile tab bar; falls back to `label`. */
  shortLabel?: string;
  icon?: IconName;
  accent?: DomainAccent;
}

export interface NavigationLinkProps {
  href: string;
  className?: string | undefined;
  "aria-current"?: "page" | undefined;
  "data-accent"?: string | undefined;
  children?: ReactNode;
}

export interface NavigationProps {
  items: readonly NavigationItem[];
  currentHref?: string | undefined;
  label: string;
  /** `tabs` = compact mobile tab bar; `horizontal` = desktop row. */
  layout?: "horizontal" | "tabs";
  /** Router-aware link component (e.g. next/link). Defaults to a plain anchor. */
  linkComponent?: ComponentType<NavigationLinkProps> | undefined;
  className?: string | undefined;
}

function isCurrent(href: string, currentHref: string | undefined): boolean {
  if (!currentHref) return false;
  const norm = (s: string) => (s.length > 1 ? s.replace(/\/+$/, "") : s);
  const a = norm(href);
  const b = norm(currentHref);
  return a === "/" ? b === "/" : b === a || b.startsWith(`${a}/`);
}

const PlainLink = ({ href, children, ...rest }: NavigationLinkProps) => (
  <a href={href} {...rest}>
    {children}
  </a>
);

/** Primary navigation primitive: semantics fixed by HowToBaby, presentation by the theme. */
export function Navigation({ items, currentHref, label, layout = "horizontal", linkComponent: Link = PlainLink, className }: NavigationProps) {
  return (
    <nav aria-label={label} className={className}>
      <ul className={["htb-nav", layout === "tabs" ? "htb-nav--tabs" : ""].filter(Boolean).join(" ")}>
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="htb-nav__link" aria-current={isCurrent(item.href, currentHref) ? "page" : undefined} data-accent={item.accent}>
              {item.icon ? <Icon name={item.icon} /> : null}
              <span className="htb-nav__label">{layout === "tabs" && item.shortLabel ? item.shortLabel : item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
