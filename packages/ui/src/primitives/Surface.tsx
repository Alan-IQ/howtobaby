// SPDX-License-Identifier: AGPL-3.0-only
import type { ElementType, HTMLAttributes, ReactNode } from "react";

export type SurfaceTone = "1" | "2" | "glass";

export interface SurfaceProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  tone?: SurfaceTone;
  elevated?: boolean;
  children?: ReactNode;
}

/** Semantic surface. `glass` is an enhancement: the theme CSS swaps it for an opaque surface when needed. */
export function Surface({ as: Tag = "div", tone = "1", elevated = false, className, children, ...rest }: SurfaceProps) {
  const classes = ["htb-surface", `htb-surface--${tone}`, elevated ? "htb-surface--elevated" : "", className].filter(Boolean).join(" ");
  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}
