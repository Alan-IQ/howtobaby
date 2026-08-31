// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { IconButton } from "./IconButton.tsx";

interface OverlayProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  closeLabel?: string;
  children?: ReactNode;
  className?: string;
  /** BCP 47 tag when the overlay's content locale differs from the document locale. */
  lang?: string | undefined;
}

function useNativeDialog(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleClose = () => onClose();
    const handleClick = (event: MouseEvent) => {
      if (event.target === el) onClose(); // backdrop click
    };
    el.addEventListener("close", handleClose);
    el.addEventListener("click", handleClick);
    return () => {
      el.removeEventListener("close", handleClose);
      el.removeEventListener("click", handleClick);
    };
  }, [onClose]);
  return ref;
}

/** Modal dialog on the native <dialog> element: focus trap, Esc, and backdrop are browser-provided. */
export function Dialog({ open, onClose, title, closeLabel = "Close", children, className }: OverlayProps) {
  const ref = useNativeDialog(open, onClose);
  return (
    <dialog ref={ref} className={["htb-dialog", className].filter(Boolean).join(" ")} aria-labelledby="htb-dialog-title">
      <div className="htb-dialog__body">
        <div className="htb-dialog__header">
          <h2 id="htb-dialog-title">{title}</h2>
          <IconButton icon="close" label={closeLabel} onClick={onClose} />
        </div>
        {children}
      </div>
    </dialog>
  );
}

export interface DrawerProps extends OverlayProps {
  side?: "end" | "bottom";
}

/** Side/bottom drawer for progressive disclosure (evidence, adjustments). Same native-dialog foundation. */
export function Drawer({ open, onClose, title, closeLabel = "Close", side = "end", children, className, lang }: DrawerProps) {
  const ref = useNativeDialog(open, onClose);
  return (
    <dialog ref={ref} lang={lang} className={["htb-drawer", side === "bottom" ? "htb-drawer--bottom" : "", className].filter(Boolean).join(" ")} aria-labelledby="htb-drawer-title">
      <div className="htb-drawer__body">
        <div className="htb-drawer__header">
          <h2 id="htb-drawer-title">{title}</h2>
          <IconButton icon="close" label={closeLabel} onClick={onClose} />
        </div>
        {children}
      </div>
    </dialog>
  );
}
