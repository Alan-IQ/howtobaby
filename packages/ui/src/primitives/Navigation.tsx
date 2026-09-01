// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import type { ComponentType, ReactNode } from "react";

import type { DomainAccent } from "./Card.tsx";
import { Icon, type IconName } from "./Icon.tsx";
import { slidingIndicatorStyle, useSlidingSelection } from "./useSlidingSelection.ts";

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

/**
 * Primary navigation primitive: semantics fixed by HowToBaby, presentation by the theme.
 *
 * Both layouts share ONE active-selection indicator that slides between items on route change
 * (motion tokens only; reduced motion collapses it to an instant move): the tab bar's short
 * accent underline and the desktop row's soft active pill are that indicator. Static per-link
 * active styling remains the pre-hydration/no-JS fallback with identical geometry, and the
 * active link itself keeps its tint, heavier icon/label and `aria-current` regardless of the
 * animation — state never depends on motion.
 */
export function Navigation({ items, currentHref, label, layout = "horizontal", linkComponent: Link = PlainLink, className }: NavigationProps) {
  const activeItem = items.find((item) => isCurrent(item.href, currentHref));
  const { containerRef, indicator } = useSlidingSelection<HTMLElement>(activeItem?.href, '.htb-nav__link[aria-current="page"]');
  const sliding = indicator !== null && activeItem !== undefined;
  return (
    <nav aria-label={label} className={className} ref={containerRef} data-slide={sliding ? "true" : undefined} data-layout={layout}>
      {sliding ? <span aria-hidden="true" className="htb-nav__indicator" data-accent={activeItem.accent} style={slidingIndicatorStyle(indicator)} /> : null}
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
