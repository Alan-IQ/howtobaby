// SPDX-License-Identifier: AGPL-3.0-only
"use client";

/**
 * Imperative sliding-indicator mechanics for stateful controls whose active choice moves between
 * sibling options with VARIABLE widths (segmented controls, the desktop navigation row). One
 * always-mounted indicator element physically slides to the active option; equal-width tracks
 * (the mobile tab bar) do not need this hook — they position a pure-CSS indicator from the
 * active index at render time.
 *
 * Flicker-proofing rules this hook guarantees:
 * - the indicator element is rendered unconditionally and NEVER remounts; selection changes only
 *   ever mutate its inline transform/size and `data-visible`;
 * - when no option is active (e.g. a route outside the nav) it fades out IN PLACE via
 *   `data-visible="false"`, keeping its last geometry so the next selection slides from it;
 * - the first positioning after hydration, resize repositioning and font-load repositioning are
 *   applied WITHOUT animation (transition suppressed for that write), so the indicator never
 *   visibly jumps or slides for a non-selection reason;
 * - `data-slide` is set on the container in the same pre-paint pass as the first positioning, so
 *   the static no-JS/prerender fallback styling hands over pixel-identically, never double-shows;
 * - all movement runs on the semantic motion tokens, which collapse to 0ms under
 *   `prefers-reduced-motion` and the project reduced-motion preference.
 */

import { useLayoutEffect, useRef } from "react";

export interface SlidingIndicatorOptions {
  /** Selector for the active option inside the container (e.g. '[aria-checked="true"]'). */
  activeSelector: string;
  /** Any value that changes exactly when the selection changes (drives animated repositioning). */
  activeKey: string | undefined;
}

export function useSlidingIndicator<C extends HTMLElement, I extends HTMLElement>({ activeSelector, activeKey }: SlidingIndicatorOptions): {
  containerRef: React.RefObject<C | null>;
  indicatorRef: React.RefObject<I | null>;
} {
  const containerRef = useRef<C | null>(null);
  const indicatorRef = useRef<I | null>(null);
  const positionedRef = useRef(false);

  const positionRef = useRef<(animate: boolean) => void>(() => {});
  positionRef.current = (animate: boolean) => {
    const container = containerRef.current;
    const indicator = indicatorRef.current;
    if (container === null || indicator === null) return;
    const active = container.querySelector<HTMLElement>(activeSelector);
    if (active === null) {
      // Fade out in place; keep the last geometry so a later selection slides from it.
      indicator.dataset.visible = "false";
      return;
    }
    const instant = !animate || !positionedRef.current;
    if (instant) indicator.style.transitionDuration = "0s";
    indicator.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
    indicator.style.width = `${active.offsetWidth}px`;
    indicator.style.height = `${active.offsetHeight}px`;
    indicator.dataset.visible = "true";
    // From the first successful positioning on, the indicator owns the selection visuals and the
    // static fallback stays off — set in the same pre-paint pass, so the swap is invisible.
    container.dataset.slide = "true";
    if (instant) {
      void indicator.offsetWidth; // flush the un-animated write before restoring transitions
      indicator.style.transitionDuration = "";
    }
    positionedRef.current = true;
  };

  // Selection changes: animated slide (the very first positioning is applied instantly).
  useLayoutEffect(() => {
    positionRef.current(true);
  }, [activeKey, activeSelector]);

  // Geometry changes that are NOT selection changes reposition without animation. Every
  // ResizeObserver callback repositions — including the initial one: content can resize between
  // `observe()` and its first (async) delivery (e.g. the stored language swapping the labels
  // right after hydration), and a skipped first callback would leave the indicator on stale
  // pre-swap geometry. Repositioning is unanimated and idempotent, so extra calls are free.
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (container === null || typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(() => positionRef.current(false));
    observer.observe(container);
    document.fonts?.ready.then(() => positionRef.current(false)).catch(() => {});
    return () => observer.disconnect();
  }, []);

  return { containerRef, indicatorRef };
}
