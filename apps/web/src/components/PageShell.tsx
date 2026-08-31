// SPDX-License-Identifier: AGPL-3.0-only
import type { ReactNode } from "react";

import { Icon, PrintAction, type DomainAccent, type IconName } from "@howtobaby/ui";

import { SITE } from "@/site";

export interface PageShellProps {
  title: ReactNode;
  /** Canonical (EN) title for the printed context strip; pass when `title` is not a plain string. */
  printTitle?: string;
  /** Section label shown above the title (e.g. destination name). */
  eyebrow?: ReactNode;
  icon?: IconName;
  accent?: DomainAccent;
  lede?: ReactNode;
  /** Show the print control (docs/GUI_DESIGN.md §6 "print where contextually relevant"). */
  printable?: boolean;
  children?: ReactNode;
}

/** Common page anatomy scaffold (docs/GUI_DESIGN.md §8): title + context header, body, printed context strip. */
export function PageShell({ title, printTitle, eyebrow, icon, accent, lede, printable = false, children }: PageShellProps) {
  return (
    <article className="page-shell">
      <div className="print-context" aria-hidden="true">
        <span>{SITE.name}</span>
        <span>{printTitle ?? (typeof title === "string" ? title : SITE.name)}</span>
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
          {printable ? <PrintAction /> : null}
        </div>
        <h1>{title}</h1>
        {lede ? <p className="page-shell__lede">{lede}</p> : null}
      </header>
      <div className="page-shell__body">{children}</div>
    </article>
  );
}
