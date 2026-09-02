// SPDX-License-Identifier: AGPL-3.0-only
import type { AnchorHTMLAttributes, ReactNode } from "react";

/**
 * Link to a page or site outside HowToBaby (docs/GUI_DESIGN.md §6 "Page and site references in
 * copy"): always a new tab with `rel="noopener noreferrer"`, so every external reference — footer,
 * trust pages, inline copy — behaves the same way. Server-safe (no client boundary).
 */
export function ExternalLink({ href, children, ...rest }: { href: string; children: ReactNode } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "target" | "rel">) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  );
}
