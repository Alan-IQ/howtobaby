// SPDX-License-Identifier: AGPL-3.0-only
import type { ElementType, HTMLAttributes, ReactNode } from "react";

import type { SurfaceTone } from "./Surface.tsx";

export type DomainAccent = "feeding" | "play" | "sleep" | "safety" | "tools" | "brand";

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  as?: ElementType;
  tone?: SurfaceTone;
  /** Domain accent strip; meaning is carried by the card title/eyebrow, never by colour alone. */
  accent?: DomainAccent | undefined;
  eyebrow?: ReactNode;
  title?: ReactNode;
  titleAs?: "h2" | "h3" | "h4" | undefined;
  interactive?: boolean;
  children?: ReactNode;
}

export function Card({ as: Tag = "section", tone = "glass", accent, eyebrow, title, titleAs: TitleTag = "h3", interactive = false, className, children, ...rest }: CardProps) {
  const classes = ["htb-surface", `htb-surface--${tone}`, "htb-surface--elevated", "htb-card", interactive ? "htb-card--interactive" : "", className]
    .filter(Boolean)
    .join(" ");
  return (
    <Tag className={classes} data-accent={accent} {...rest}>
      {eyebrow ? <p className="htb-card__eyebrow">{eyebrow}</p> : null}
      {title ? <TitleTag className="htb-card__title">{title}</TitleTag> : null}
      {children}
    </Tag>
  );
}
