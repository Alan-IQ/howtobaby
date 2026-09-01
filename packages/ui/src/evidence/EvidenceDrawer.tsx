// SPDX-License-Identifier: AGPL-3.0-only
/**
 * EvidenceDrawer — the default detailed provenance surface (docs/GUI_DESIGN.md §11.3,
 * docs/EVIDENCE_PROVENANCE.md §6 Layer B).
 *
 * The drawer presents HowToBaby guidance supported by original sources — it must never read as a
 * direct quote from CDC/WHO/AAP/FDA. The header attribution line and the "HowToBaby guidance"
 * label on the claim make that explicit, and the no-endorsement line is always rendered.
 *
 * Each supporting source has a clear scan hierarchy: organization leads with compact role/status
 * badges beside it, the exact source title sits under it, and the metadata (relevant section,
 * applies-to/scope, last verified) is a grouped `<dl>` panel of icon + label + value rows — kept
 * as a definition list for assistive tech, never flattened into look-alike text lines. "Why this
 * source is used" is a distinct secondary block, and **View original source** is a clear action
 * with safe external-link attributes. All strings arrive pre-localized from canonical data; this
 * component holds no medical prose and derives nothing itself. Icons are decorative anchors only
 * (aria-hidden) — labels always carry the meaning.
 */

"use client";

import type { ReactNode } from "react";

import { Drawer } from "../primitives/Dialog.tsx";
import { Icon } from "../primitives/Icon.tsx";
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
  /**
   * BCP 47 tag of the drawer's content locale when it differs from `<html lang>` (e.g. a local
   * guidance-language override); assistive tech then announces the drawer correctly.
   */
  contentLang?: string | undefined;
  /**
   * The SAME local content-language control the host guidance card renders (shared state: a
   * switch here updates the card and vice versa). Slot only — the control's semantics live with
   * the host app's i18n layer.
   */
  languageControl?: ReactNode;
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
  contentLang,
  languageControl,
}: EvidenceDrawerProps) {
  return (
    <Drawer open={open} onClose={onClose} title={title} lang={contentLang} {...(closeLabel !== undefined ? { closeLabel } : {})} className="htb-evidence-drawer">
      {languageControl ? <div className="htb-evidence-drawer__lang">{languageControl}</div> : null}
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
            <div className="htb-evidence-source__head">
              <p className="htb-evidence-source__org">{source.organization}</p>
              <p className="htb-evidence-source__badges">
                <span className="htb-evidence-source__badge htb-evidence-source__badge--role">{source.relationshipLabel}</span>
                <span className={`htb-evidence-source__badge htb-evidence-source__badge--status${source.statusTone === "attention" ? " htb-evidence-source__badge--attention" : ""}`}>
                  {source.statusLabel}
                </span>
              </p>
            </div>
            <p className="htb-evidence-source__title">{source.title}</p>
            {source.meta.length > 0 ? (
              <dl className="htb-evidence-source__meta-list">
                {source.meta.map((entry) => (
                  <div key={entry.label} className="htb-evidence-source__meta-row">
                    <dt>
                      {entry.icon ? <Icon name={entry.icon} /> : null}
                      <span>{entry.label}</span>
                    </dt>
                    <dd>{entry.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {source.whyText ? (
              <div className="htb-evidence-source__why">
                <Icon name="info" />
                <div>
                  {source.whyLabel ? <p className="htb-evidence-source__why-label">{source.whyLabel}</p> : null}
                  <p className="htb-evidence-source__why-text">{source.whyText}</p>
                </div>
              </div>
            ) : null}
            {source.noteText ? <p className="htb-evidence-source__note">{source.noteText}</p> : null}
            <a className="htb-evidence-source__link" href={source.url} target="_blank" rel="noopener noreferrer">
              {viewOriginalLabel}
              <Icon name="external" />
            </a>
          </li>
        ))}
      </ul>
      <p className="htb-evidence-drawer__disclaimer">{disclaimer}</p>
    </Drawer>
  );
}
