// SPDX-License-Identifier: AGPL-3.0-only
import type { HTMLAttributes, ReactNode } from "react";

import type { DomainAccent } from "./Card.tsx";

/** Safety/evidence severity vocabulary (docs/GUI_DESIGN.md §12). The label text carries the meaning. */
export type StatusTone = "info" | "caution" | "clinician" | "urgent" | "emergency";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status?: StatusTone;
  accent?: DomainAccent;
  children: ReactNode;
}

export function Badge({ status, accent, className, children, ...rest }: BadgeProps) {
  const classes = ["htb-badge", status ? `htb-badge--status-${status}` : "", accent ? `htb-badge--accent-${accent}` : "", className].filter(Boolean).join(" ");
  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  );
}
