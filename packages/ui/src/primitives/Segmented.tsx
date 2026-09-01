// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import type { ReactNode } from "react";

import { useSlidingIndicator } from "./useSlidingSelection.ts";

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
  /** Text alternative when `label` is an icon. */
  ariaLabel?: string;
  disabled?: boolean;
}

export interface SegmentedProps<T extends string> {
  name: string;
  legend: string;
  value: T;
  options: readonly SegmentedOption<T>[];
  onChange: (value: T) => void;
  className?: string;
}

/**
 * Radio-group semantics rendered as a pill segmented control. Selection is shown by ONE shared
 * raised pill that slides between options — the pill element is always mounted and only ever
 * repositioned, so switching can never flicker or remount state. Before hydration the same pill
 * is painted statically on the checked option (identical geometry), and reduced motion collapses
 * the slide to an instant move via the motion tokens.
 */
export function Segmented<T extends string>({ name, legend, value, options, onChange, className }: SegmentedProps<T>) {
  const { containerRef, indicatorRef } = useSlidingIndicator<HTMLDivElement, HTMLSpanElement>({
    activeSelector: '.htb-segmented__option[aria-checked="true"]',
    activeKey: value,
  });
  return (
    <div ref={containerRef} role="radiogroup" aria-label={legend} className={["htb-segmented", className].filter(Boolean).join(" ")} data-name={name}>
      <span ref={indicatorRef} aria-hidden="true" className="htb-segmented__indicator" />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          aria-label={option.ariaLabel}
          title={option.ariaLabel}
          disabled={option.disabled}
          className="htb-segmented__option"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
