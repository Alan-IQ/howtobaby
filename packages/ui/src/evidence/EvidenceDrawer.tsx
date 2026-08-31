// SPDX-License-Identifier: AGPL-3.0-only
/**
 * EvidenceDrawer — the default detailed provenance surface (docs/GUI_DESIGN.md §11.3,
 * docs/EVIDENCE_PROVENANCE.md §6 Layer B).
 *
 * For each supporting source it shows organization, exact title, relationship, locator,
 * jurisdiction, verification/status signal and a **View original source** action with safe
 * external-link attributes. The no-endorsement line is always rendered: the drawer must never
 * imply that CDC/AAP/WHO/FDA reviewed or endorsed HowToBaby.
 */

"use client";

import type { ReactNode } from "react";

import { Drawer } from "../primitives/Dialog.tsx";
import type { EvidenceSourceView } from "./types.ts";

export interface EvidenceDrawerProps {
  open: boolean;
  onClose: () => void;
  /** Drawer heading, e.g. localized "Sources for this guidance". */
  title: ReactNode;
  /** The HowToBaby claim/context being supported, quoted so the mapping stays unambiguous. */
  claimText?: string;
  /** Localized content-class label for the claim, e.g. "Official guidance". */
  classLabel?: string;
  sources: EvidenceSourceView[];
  /** Localized action label; defaults to English per GUI_DESIGN.md §11.7. */
  viewOriginalLabel?: string;
  /** Localized no-endorsement disclaimer; a default is always rendered. */
  disclaimer?: string;
  closeLabel?: string;
}

export function EvidenceDrawer({
  open,
  onClose,
  title,
  claimText,
  classLabel,
  sources,
  viewOriginalLabel = "View original source",
  disclaimer = "These organizations publish the original guidance. They have not reviewed or endorsed HowToBaby.",
  closeLabel,
}: EvidenceDrawerProps) {
  return (
    <Drawer open={open} onClose={onClose} title={title} {...(closeLabel !== undefined ? { closeLabel } : {})} className="htb-evidence-drawer">
      {claimText ? (
        <blockquote className="htb-evidence-drawer__claim">
          {classLabel ? <span className="htb-evidence-drawer__class">{classLabel}</span> : null}
          <p>{claimText}</p>
        </blockquote>
      ) : null}
      <ul className="htb-evidence-drawer__sources">
        {sources.map((source) => (
          <li key={source.sourceId} className="htb-evidence-source">
            <p className="htb-evidence-source__org">
              {source.organization}
              <span className="htb-evidence-source__relationship">{source.relationshipLabel}</span>
            </p>
            <p className="htb-evidence-source__title">{source.title}</p>
            {source.locatorLabel ? <p className="htb-evidence-source__meta">{source.locatorLabel}</p> : null}
            {source.jurisdictionLabel ? <p className="htb-evidence-source__meta">{source.jurisdictionLabel}</p> : null}
            <p className="htb-evidence-source__meta">
              {source.verifiedLabel}
              {source.statusLabel ? <span className="htb-evidence-source__status">{source.statusLabel}</span> : null}
            </p>
            {source.noteText ? <p className="htb-evidence-source__note">{source.noteText}</p> : null}
            <a className="htb-evidence-source__link" href={source.url} target="_blank" rel="noopener noreferrer">
              {viewOriginalLabel}
              <span aria-hidden="true"> ↗</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="htb-evidence-drawer__disclaimer">{disclaimer}</p>
    </Drawer>
  );
}
