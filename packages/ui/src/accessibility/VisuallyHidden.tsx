// SPDX-License-Identifier: AGPL-3.0-only
import type { ElementType, HTMLAttributes, ReactNode } from "react";

export interface VisuallyHiddenProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  children: ReactNode;
}

export function VisuallyHidden({ as: Tag = "span", className, children, ...rest }: VisuallyHiddenProps) {
  return (
    <Tag className={["htb-visually-hidden", className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </Tag>
  );
}
