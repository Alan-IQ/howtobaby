// SPDX-License-Identifier: AGPL-3.0-only
/**
 * SourceChip — the compact inline source affordance (docs/GUI_DESIGN.md §11.2,
 * docs/EVIDENCE_PROVENANCE.md §6 Layer A): `Official guidance · CDC · WHO`. Visually this is
 * quiet provenance metadata that happens to open the Evidence Drawer — a secondary metadata
 * action, never styled like a primary control.
 *
 * Shows organization names, never raw URLs, and opens evidence detail (the EvidenceDrawer) rather
 * than a generic organization homepage. Renders as a static label when no `onOpen` is provided so
 * provenance stays visible even without the drawer interaction.
 */

import type { ReactNode } from "react";

import { Icon } from "../primitives/Icon.tsx";

export interface SourceChipProps {
  /** Localized content-class label, e.g. "Official guidance" (GUI_DESIGN.md §11.1). */
  classLabel: string;
  /** Organization abbreviations/names in citation order, e.g. ["CDC", "WHO"]. */
  organizations: string[];
  /** Opens the evidence detail surface (EvidenceDrawer). */
  onOpen?: (() => void) | undefined;
  /** Accessible action description, e.g. "Show the sources behind this guidance". */
  openLabel?: string;
  className?: string;
}

function ChipContent({ classLabel, organizations }: Pick<SourceChipProps, "classLabel" | "organizations">): ReactNode {
  return (
    <>
      <Icon name="document" className="htb-source-chip__icon" />
      <span className="htb-source-chip__class">{classLabel}</span>
      {organizations.map((org) => (
        <span key={org} className="htb-source-chip__org">
          <span aria-hidden="true" className="htb-source-chip__sep">
            ·
          </span>
          {org}
        </span>
      ))}
    </>
  );
}

export function SourceChip({ classLabel, organizations, onOpen, openLabel, className }: SourceChipProps) {
  const classes = ["htb-source-chip", className].filter(Boolean).join(" ");
  if (!onOpen) {
    return (
      <span className={classes}>
        <ChipContent classLabel={classLabel} organizations={organizations} />
      </span>
    );
  }
  return (
    <button type="button" className={`${classes} htb-source-chip--interactive`} onClick={onOpen} aria-label={openLabel ?? `${classLabel} — ${organizations.join(", ")}`}>
      <ChipContent classLabel={classLabel} organizations={organizations} />
    </button>
  );
}
