// SPDX-License-Identifier: AGPL-3.0-only
import type { ReactNode } from "react";

import { Icon, type DomainAccent, type IconName } from "@howtobaby/ui";

import { SITE } from "@/site";
import { LocalizedPrintAction } from "./LocalizedPrintAction";

export interface PageShellProps {
  title: ReactNode;
  /** Section label shown above the title (e.g. destination name). */
  eyebrow?: ReactNode;
  icon?: IconName;
  accent?: DomainAccent;
  lede?: ReactNode;
  /** Show the print control (docs/GUI_DESIGN.md §6 "print where contextually relevant"). */
  printable?: boolean;
  children?: ReactNode;
}

/**
 * Common page anatomy scaffold (docs/GUI_DESIGN.md §8): title + context header, body, printed
 * context strip. The printed context reuses the page title node, so it follows the active global
 * language exactly like the on-screen title (brand name and canonical URL stay verbatim).
 */
export function PageShell({ title, eyebrow, icon, accent, lede, printable = false, children }: PageShellProps) {
  return (
    <article className="page-shell">
      <div className="print-context" aria-hidden="true">
        <span>{SITE.name}</span>
        <span>{title}</span>
        <span>{SITE.url}</span>
      </div>
      <header className="page-shell__header">
        <div className="page-shell__toolbar">
          {eyebrow ? (
            <p className="page-shell__eyebrow" data-accent={accent}>
              {icon ? <Icon name={icon} /> : null}
              {eyebrow}
            </p>
          ) : (
            <span />
          )}
          {printable ? <LocalizedPrintAction /> : null}
        </div>
        <h1>{title}</h1>
        {lede ? <p className="page-shell__lede">{lede}</p> : null}
      </header>
      <div className="page-shell__body">{children}</div>
    </article>
  );
}
