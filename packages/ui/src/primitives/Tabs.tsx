// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import { useCallback, useId, useRef, type KeyboardEvent, type ReactNode } from "react";

export interface TabItem<T extends string = string> {
  value: T;
  label: ReactNode;
  disabled?: boolean;
}

export interface TabsProps<T extends string = string> {
  label: string;
  value: T;
  items: readonly TabItem<T>[];
  onChange: (value: T) => void;
  /** Panel content for the active tab. */
  children?: ReactNode;
  className?: string | undefined;
}

/**
 * WAI-ARIA tabs: roving tabindex, arrow-key navigation (Left/Right/Home/End), automatic activation.
 * Presentation comes entirely from semantic tokens.
 */
export function Tabs<T extends string = string>({ label, value, items, onChange, children, className }: TabsProps<T>) {
  const baseId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const tabId = (v: string) => `${baseId}-tab-${v}`;
  const panelId = `${baseId}-panel`;

  const move = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const enabled = items.filter((i) => !i.disabled);
      const currentIndex = enabled.findIndex((i) => i.value === value);
      if (currentIndex < 0 || enabled.length === 0) return;
      let next: number | undefined;
      if (event.key === "ArrowRight") next = (currentIndex + 1) % enabled.length;
      else if (event.key === "ArrowLeft") next = (currentIndex - 1 + enabled.length) % enabled.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = enabled.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      const target = enabled[next]!;
      onChange(target.value);
      listRef.current?.querySelector<HTMLElement>(`#${CSS.escape(tabId(target.value))}`)?.focus();
    },
    [items, value, onChange, tabId],
  );

  return (
    <div className={className}>
      <div ref={listRef} role="tablist" aria-label={label} className="htb-tabs" onKeyDown={move}>
        {items.map((item) => {
          const selected = item.value === value;
          return (
            <button
              key={item.value}
              id={tabId(item.value)}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={panelId}
              disabled={item.disabled}
              tabIndex={selected ? 0 : -1}
              className="htb-tabs__tab"
              onClick={() => onChange(item.value)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div id={panelId} role="tabpanel" aria-labelledby={tabId(value)} tabIndex={0} className="htb-tabs__panel">
        {children}
      </div>
    </div>
  );
}
