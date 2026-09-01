// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Shared sliding-selection mechanics for stateful controls whose active choice moves between
 * sibling options (segmented controls, navigation bars). One indicator element physically slides
 * to the active option instead of each option repainting its own state instantly.
 *
 * The hook measures the active element inside a positioned container (before paint, so hydration
 * never flashes a mis-placed indicator) and re-measures on container resize. Until it has
 * measured — SSR/static HTML and JS-off — `indicator` is null and the caller's CSS fallback
 * (static per-option active styling) applies, so keyboard/focus behavior and the visible state
 * never depend on the animation. All movement is driven by the semantic motion tokens, which
 * collapse to 0ms under `prefers-reduced-motion` and the project reduced-motion preference.
 */

import { useLayoutEffect, useRef, useState } from "react";

export interface SlidingSelectionIndicator {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Track the geometry of the active option (matched by `activeSelector`, offset-relative to the
 * container, which must be the options' `offsetParent`). `activeKey` is any value that changes
 * when the selection changes.
 */
export function useSlidingSelection<C extends HTMLElement>(
  activeKey: string | undefined,
  activeSelector: string,
): { containerRef: React.RefObject<C | null>; indicator: SlidingSelectionIndicator | null } {
  const containerRef = useRef<C | null>(null);
  const [indicator, setIndicator] = useState<SlidingSelectionIndicator | null>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (container === null || typeof ResizeObserver === "undefined") return undefined;
    const measure = () => {
      const active = container.querySelector<HTMLElement>(activeSelector);
      if (!active) {
        setIndicator(null);
        return;
      }
      setIndicator({ left: active.offsetLeft, top: active.offsetTop, width: active.offsetWidth, height: active.offsetHeight });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [activeKey, activeSelector]);

  return { containerRef, indicator };
}

/** Inline style placing a sliding indicator measured by {@link useSlidingSelection}. */
export function slidingIndicatorStyle(indicator: SlidingSelectionIndicator): React.CSSProperties {
  return { transform: `translate(${indicator.left}px, ${indicator.top}px)`, width: `${indicator.width}px`, height: `${indicator.height}px` };
}
