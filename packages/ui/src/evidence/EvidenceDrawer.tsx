// SPDX-License-Identifier: AGPL-3.0-only
/**
 * EvidenceDrawer — the default detailed provenance surface (docs/GUI_DESIGN.md §11.3,
 * docs/EVIDENCE_PROVENANCE.md §6 Layer B).
 *
 * The drawer presents HowToBaby guidance supported by original sources — it must never read as a
 * direct quote from CDC/WHO/AAP/FDA. The header attribution line and the "HowToBaby guidance"
 * label on the claim make that explicit, and the no-endorsement line is always rendered.
 *
 * Each supporting source shows organization and exact title, then a compact labeled metadata list
 * (role in this guidance, relevant section, applies-to/scope, source status including "Current",
 * last verified by HowToBaby, why the source is used) and a **View original source** action with
 * safe external-link attributes. Metadata rows arrive pre-localized from canonical data — this
 * component holds no medical prose and derives nothing itself.
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
  /**
   * Attribution line under the heading clarifying that what follows is HowToBaby guidance
   * supported by the listed original sources, not their verbatim wording. Always rendered.
   */
  attribution?: string;
  /** The HowToBaby claim/context being supported, shown so the mapping stays unambiguous. */
  claimText?: string;
  /** Localized label identifying the claim as HowToBaby's own wording. */
  claimLabel?: string;
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
  attribution = "HowToBaby guidance, supported by the original sources listed below. The wording is HowToBaby's — not a direct quote from these organizations.",
  claimText,
  claimLabel = "HowToBaby guidance",
  classLabel,
  sources,
  viewOriginalLabel = "View original source",
  disclaimer = "These organizations publish the original guidance. They have not reviewed or endorsed HowToBaby.",
  closeLabel,
}: EvidenceDrawerProps) {
  return (
    <Drawer open={open} onClose={onClose} title={title} {...(closeLabel !== undefined ? { closeLabel } : {})} className="htb-evidence-drawer">
      <p className="htb-evidence-drawer__attribution">{attribution}</p>
      {claimText ? (
        <div className="htb-evidence-drawer__claim">
          <p className="htb-evidence-drawer__claim-labels">
            <span className="htb-evidence-drawer__class">{claimLabel}</span>
            {classLabel ? <span className="htb-evidence-drawer__class htb-evidence-drawer__class--secondary">{classLabel}</span> : null}
          </p>
          <p>{claimText}</p>
        </div>
      ) : null}
      <ul className="htb-evidence-drawer__sources">
        {sources.map((source) => (
          <li key={source.sourceId} className="htb-evidence-source">
            <p className="htb-evidence-source__org">
              {source.organization}
              <span className="htb-evidence-source__relationship">{source.relationshipLabel}</span>
            </p>
            <p className="htb-evidence-source__title">{source.title}</p>
            {source.meta.length > 0 ? (
              <dl className="htb-evidence-source__meta-list">
                {source.meta.map((entry) => (
                  <div key={entry.label} className="htb-evidence-source__meta-row">
                    <dt>{entry.label}</dt>
                    <dd>{entry.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
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
