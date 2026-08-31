// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { buttonClassName, type ButtonSize, type ButtonVariant } from "./Button.tsx";

export interface PopoverProps {
  /** Trigger label (button content). */
  trigger: ReactNode;
  triggerVariant?: ButtonVariant | undefined;
  triggerSize?: ButtonSize | undefined;
  /** Accessible name for the popover panel. */
  label: string;
  side?: "bottom" | "top";
  align?: "start" | "end";
  children?: ReactNode;
  className?: string | undefined;
}

/**
 * Lightweight disclosure popover: toggle button + floating panel. Closes on Escape and on pointer/focus
 * leaving the component; state is announced via aria-expanded/aria-haspopup.
 */
export function Popover({ trigger, triggerVariant = "secondary", triggerSize = "md", label, side = "bottom", align = "start", children, className }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && event.target instanceof Node && !rootRef.current.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={["htb-popover-anchor", className].filter(Boolean).join(" ")} data-side={side} data-align={align}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? panelId : undefined}
        className={buttonClassName({ variant: triggerVariant, size: triggerSize })}
        onClick={() => setOpen((v) => !v)}
      >
        {trigger}
      </button>
      {open ? (
        <div id={panelId} role="dialog" aria-label={label} className="htb-popover">
          {children}
        </div>
      ) : null}
    </div>
  );
}
