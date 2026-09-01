// SPDX-License-Identifier: AGPL-3.0-only
/**
 * ReferenceList — the page-level "Sources used on this page" section
 * (docs/GUI_DESIGN.md §11.4, docs/EVIDENCE_PROVENANCE.md §6 Layer C).
 *
 * Entries are generated from the claims actually rendered on the page (route-evidence index) and
 * deduplicated by source ID here as a final guard — pages never maintain a manual references
 * array. The list stays in print output with enough provenance to be useful offline
 * (EVIDENCE_PROVENANCE.md §18).
 */

import type { ReactNode } from "react";

import { Icon } from "../primitives/Icon.tsx";
import type { ReferenceEntry } from "./types.ts";

export interface ReferenceListProps {
  /** Localized section heading; defaults to English. */
  title?: ReactNode;
  entries: ReferenceEntry[];
  /** Localized external-link action label. */
  viewOriginalLabel?: string;
  headingId?: string;
  className?: string;
}

export function ReferenceList({ title = "Sources used on this page", entries, viewOriginalLabel = "View original source", headingId = "htb-references", className }: ReferenceListProps) {
  const deduped: ReferenceEntry[] = [];
  const seen = new Set<string>();
  for (const entry of entries) {
    if (seen.has(entry.sourceId)) continue;
    seen.add(entry.sourceId);
    deduped.push(entry);
  }
  if (deduped.length === 0) return null;
  return (
    <section className={["htb-reference-list", className].filter(Boolean).join(" ")} aria-labelledby={headingId}>
      <h2 id={headingId} className="htb-reference-list__title">
        <Icon name="document" className="htb-reference-list__title-icon" />
        {title}
      </h2>
      <ul>
        {deduped.map((entry) => (
          <li key={entry.sourceId} className="htb-reference-list__entry">
            <span className="htb-reference-list__heading">
              <span className="htb-reference-list__org">{entry.organization}</span>
              <span className="htb-reference-list__source-title">{entry.title}</span>
            </span>
            <span className="htb-reference-list__meta">
              {entry.versionLabel ? <span className="htb-reference-list__version">{entry.versionLabel} · </span> : null}
              {entry.verifiedLabel}
              {entry.statusLabel ? <span className="htb-reference-list__status"> · {entry.statusLabel}</span> : null}
              {" · "}
              <a href={entry.url} target="_blank" rel="noopener noreferrer">
                {viewOriginalLabel}
                <Icon name="external" className="htb-reference-list__external-icon" />
              </a>
              <span className="htb-reference-list__print-url" aria-hidden="true">
                {entry.url}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
