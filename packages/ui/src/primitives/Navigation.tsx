// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import { useRef, type ComponentType, type CSSProperties, type ReactNode } from "react";

import type { DomainAccent } from "./Card.tsx";
import { Icon, type IconName } from "./Icon.tsx";
import { useSlidingIndicator } from "./useSlidingSelection.ts";

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
 * Active-selection indicators are persistent — they NEVER remount on a route change:
 *
 * - The TAB BAR (equal-width columns) positions one pure-CSS indicator (the `.htb-nav--tabs`
 *   ::after pseudo-element: soft tint pill + the short centred accent underline) from the active
 *   index, set as custom properties at render time. It exists in the prerendered HTML, needs no
 *   measurement or hydration, and slides between items with a transform-only transition. On a
 *   route outside the bar it fades out in place (the last index is kept, so returning slides in
 *   from where it left).
 * - The DESKTOP ROW (variable-width items) uses one always-mounted measured pill positioned by
 *   `useSlidingIndicator` (transform/size mutations only, never remounts; static `aria-current`
 *   styling stays as the pixel-identical no-JS fallback).
 *
 * The active link itself always keeps `aria-current`, its accent colour and heavier icon/label —
 * state never depends on the animation, and the motion tokens collapse every slide to instant
 * under reduced motion.
 */
export function Navigation({ items, currentHref, label, layout = "horizontal", linkComponent: Link = PlainLink, className }: NavigationProps) {
  const activeIndex = items.findIndex((item) => isCurrent(item.href, currentHref));
  const activeItem = activeIndex >= 0 ? items[activeIndex] : undefined;

  // Tab bar: remember the last active index so leaving the bar's routes fades the indicator out
  // in place instead of snapping it to a default column.
  const lastIndexRef = useRef(0);
  if (activeIndex >= 0) lastIndexRef.current = activeIndex;

  const { containerRef, indicatorRef } = useSlidingIndicator<HTMLElement, HTMLSpanElement>({
    activeSelector: '.htb-nav__link[aria-current="page"]',
    activeKey: activeItem?.href,
  });

  const tabs = layout === "tabs";
  // While inactive, keep the last item's index AND accent so the indicator fades out in place
  // without shifting position or colour.
  const displayItem = activeItem ?? items[lastIndexRef.current];
  const tabVars = tabs
    ? ({ "--htb-nav-count": items.length, "--htb-nav-index": activeIndex >= 0 ? activeIndex : lastIndexRef.current } as CSSProperties)
    : undefined;

  return (
    <nav aria-label={label} className={className} ref={tabs ? undefined : containerRef} data-layout={layout}>
      {tabs ? null : <span ref={indicatorRef} aria-hidden="true" className="htb-nav__indicator" />}
      <ul
        className={["htb-nav", tabs ? "htb-nav--tabs" : ""].filter(Boolean).join(" ")}
        style={tabVars}
        data-active={tabs ? String(activeIndex >= 0) : undefined}
        data-active-accent={tabs ? displayItem?.accent : undefined}
      >
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
