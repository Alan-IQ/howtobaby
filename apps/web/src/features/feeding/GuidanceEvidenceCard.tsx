// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Renders one canonical guidance block with its evidence surfaces (docs/GUI_DESIGN.md §11):
 * claim text + inline SourceChip (Layer A) opening the EvidenceDrawer (Layer B). Both locales
 * resolve from the same canonical claim IDs; which one renders follows the app-level language
 * preference — there is deliberately no per-card toggle.
 *
 * The component only presents pre-localized view models built server-side from the
 * KnowledgeRepository; it holds no medical prose and no source URLs of its own.
 */

"use client";

import { useState } from "react";

import { Card, EvidenceDrawer, SourceChip } from "@howtobaby/ui";

import type { GuidanceBlockView } from "@/features/evidence/load";
import { useLanguage } from "@/i18n/LanguageProvider";

export interface GuidanceEvidenceCardProps {
  /** The same guidance block localized per supported locale. */
  variants: { en: GuidanceBlockView; vi: GuidanceBlockView };
}

export function GuidanceEvidenceCard({ variants }: GuidanceEvidenceCardProps) {
  // Language comes from the ONE global preference (header control) — no per-card toggle.
  const { language } = useLanguage();
  const [openClaimId, setOpenClaimId] = useState<string | null>(null);
  const view = variants[language];
  const openClaim = view.claims.find((claim) => claim.claimId === openClaimId);

  return (
    <Card accent="feeding" icon="feeding" eyebrow={view.locale === "vi" ? "Ăn dặm" : "Starting solids"} title={view.title} titleAs="h2">
      <div className="guidance-evidence-card">
        {view.claims.map((claim) => (
          <div key={claim.claimId} className="guidance-evidence-card__claim">
            <p>{claim.text}</p>
            {claim.uncertaintyNote ? <p className="muted">{claim.uncertaintyNote}</p> : null}
            <SourceChip
              classLabel={claim.classLabel}
              organizations={claim.organizations}
              openLabel={view.strings.openSources}
              onOpen={() => setOpenClaimId(claim.claimId)}
            />
          </div>
        ))}
        {openClaim ? (
          <EvidenceDrawer
            open
            onClose={() => setOpenClaimId(null)}
            title={view.strings.sourcesDrawerTitle}
            attribution={view.strings.drawerAttribution}
            claimText={openClaim.text}
            claimLabel={view.strings.claimLabel}
            classLabel={openClaim.classLabel}
            sources={openClaim.sources}
            viewOriginalLabel={view.strings.viewOriginal}
            disclaimer={view.strings.disclaimer}
            closeLabel={view.strings.close}
          />
        ) : null}
      </div>
    </Card>
  );
}
