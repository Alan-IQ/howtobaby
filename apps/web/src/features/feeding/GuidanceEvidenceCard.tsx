// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Renders one canonical guidance block with its evidence surfaces (docs/GUI_DESIGN.md §11):
 * claim text + inline SourceChip (Layer A) opening the EvidenceDrawer (Layer B).
 *
 * Language semantics: the card defaults to the ONE global language preference. While the global
 * language is not the canonical locale, a quiet LOCAL single-tap binary toggle (active locale ↔
 * canonical, visible text = the displayed language's full native name) lets a parent flip just
 * this card's canonical guidance without touching the global preference. The card and its
 * Evidence Drawer render the SAME control over the SAME state — switching in either updates
 * both. The override semantics live in @howtobaby/i18n (contentLocale*), are generic over the
 * registry, and reset automatically when the global language changes. Content whose locale
 * differs from `<html lang>` carries an explicit `lang`.
 *
 * The component only presents pre-localized view models built server-side from the
 * KnowledgeRepository; it holds no medical prose and no source URLs of its own.
 */

"use client";

import { useState } from "react";

import { contentLocaleOverride, resolveContentLocale, type AppLocale, type ContentLocaleOverride } from "@howtobaby/i18n";
import { Card, EvidenceDrawer, SourceChip } from "@howtobaby/ui";

import type { GuidanceBlockView } from "@/features/evidence/load";
import { ContentLanguageToggle } from "@/i18n/ContentLanguageToggle";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useMessages } from "@/i18n/T";

export interface GuidanceEvidenceCardProps {
  /** The same guidance block localized per supported locale. */
  variants: Record<AppLocale, GuidanceBlockView>;
}

export function GuidanceEvidenceCard({ variants }: GuidanceEvidenceCardProps) {
  const { language } = useLanguage();
  const t = useMessages();
  // Local content-language override: keyed to the global locale it was made under, so a global
  // language change invalidates it and the card follows the new global locale again.
  const [override, setOverride] = useState<ContentLocaleOverride | undefined>(undefined);
  const [openClaimId, setOpenClaimId] = useState<string | null>(null);
  const contentLocale = resolveContentLocale(language, override);

  return (
    <GuidanceEvidenceCardView
      variants={variants}
      globalLocale={language}
      contentLocale={contentLocale}
      contentLanguageLabel={t("guidance.contentLanguage.label")}
      eyebrow={t("guidance.feeding.eyebrow")}
      onSelectContentLocale={(locale) => setOverride(contentLocaleOverride(language, locale))}
      openClaimId={openClaimId}
      onOpenClaim={setOpenClaimId}
    />
  );
}

export interface GuidanceEvidenceCardViewProps {
  variants: Record<AppLocale, GuidanceBlockView>;
  globalLocale: AppLocale;
  /** The locale the canonical guidance content renders in (global unless locally overridden). */
  contentLocale: AppLocale;
  /** Accessible name of the local toggle group, in the GLOBAL language (it is card chrome). */
  contentLanguageLabel: string;
  /** Domain eyebrow, in the GLOBAL language (card chrome, not canonical content). */
  eyebrow: string;
  onSelectContentLocale: (locale: AppLocale) => void;
  openClaimId: string | null;
  onOpenClaim: (claimId: string | null) => void;
}

/** Presentational half (exported for tests): all language state arrives resolved via props. */
export function GuidanceEvidenceCardView({
  variants,
  globalLocale,
  contentLocale,
  contentLanguageLabel,
  eyebrow,
  onSelectContentLocale,
  openClaimId,
  onOpenClaim,
}: GuidanceEvidenceCardViewProps) {
  const view = variants[contentLocale];
  const openClaim = view.claims.find((claim) => claim.claimId === openClaimId);
  // `<html lang>` follows the global language; mark content only when it deviates from it.
  const contentLang = contentLocale === globalLocale ? undefined : contentLocale;
  // ONE local control, rendered in BOTH the card and its Evidence Drawer, driving ONE shared
  // content-locale state: switching in either place updates the other, and neither touches the
  // global preference. Hidden entirely while the global language is the canonical locale.
  const languageToggle = (
    <ContentLanguageToggle globalLocale={globalLocale} contentLocale={contentLocale} label={contentLanguageLabel} onToggle={onSelectContentLocale} />
  );

  return (
    <Card
      accent="feeding"
      icon="feeding"
      eyebrow={eyebrow}
      title={contentLang ? <span lang={contentLang}>{view.title}</span> : view.title}
      titleAs="h2"
      className="guidance-card--localizable"
    >
      <div className="guidance-card__lang-row">{languageToggle}</div>
      <div className="guidance-evidence-card">
        {view.claims.map((claim) => (
          <div key={claim.claimId} className="guidance-evidence-card__claim" lang={contentLang}>
            <p>{claim.text}</p>
            {claim.uncertaintyNote ? <p className="muted">{claim.uncertaintyNote}</p> : null}
            <SourceChip
              classLabel={claim.classLabel}
              organizations={claim.organizations}
              openLabel={view.strings.openSources}
              onOpen={() => onOpenClaim(claim.claimId)}
            />
          </div>
        ))}
        {openClaim ? (
          <EvidenceDrawer
            open
            onClose={() => onOpenClaim(null)}
            title={view.strings.sourcesDrawerTitle}
            attribution={view.strings.drawerAttribution}
            claimText={openClaim.text}
            claimLabel={view.strings.claimLabel}
            classLabel={openClaim.classLabel}
            sources={openClaim.sources}
            viewOriginalLabel={view.strings.viewOriginal}
            disclaimer={view.strings.disclaimer}
            closeLabel={view.strings.close}
            contentLang={contentLang}
            languageControl={languageToggle}
          />
        ) : null}
      </div>
    </Card>
  );
}
