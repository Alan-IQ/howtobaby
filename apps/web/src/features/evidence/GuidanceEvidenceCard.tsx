// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Renders one canonical guidance block with its evidence surfaces (docs/GUI_DESIGN.md §11):
 * claim text + inline SourceChip (Layer A) opening the EvidenceDrawer (Layer B). Shared by every
 * domain (Feeding, Play & Development, Sleep, Safety): the block's domain picks the card accent
 * and icon, and the eyebrow is either the domain's topic eyebrow or, for a stage block, the
 * stage range in ordinary language.
 *
 * Claim text authored as a lead line plus `- item` lines renders as a real list — never as
 * checkboxes: milestone lists are references, not a pass/fail checklist.
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

import type { StageDefinition } from "@howtobaby/core";
import { contentLocaleOverride, resolveContentLocale, type AppLocale, type ContentLocaleOverride } from "@howtobaby/i18n";
import type { KnowledgeDomain } from "@howtobaby/knowledge";
import { Card, EvidenceDrawer, SourceChip, type DomainAccent, type IconName } from "@howtobaby/ui";

import { formatStageRange } from "@/features/context/format";
import { splitClaimText } from "@/features/evidence/claim-text";
import type { GuidanceBlockView } from "@/features/evidence/load";
import { ContentLanguageToggle } from "@/i18n/ContentLanguageToggle";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useMessages } from "@/i18n/T";
import type { AppMessageKey } from "@/i18n/messages";

/** Card presentation per knowledge domain: accent/icon plus the default (topic) eyebrow key. */
export const GUIDANCE_CARD_PRESENTATION: Readonly<Record<KnowledgeDomain, { accent: DomainAccent; icon: IconName; eyebrowKey: AppMessageKey }>> = {
  feeding: { accent: "feeding", icon: "feeding", eyebrowKey: "guidance.feeding.eyebrow" },
  development: { accent: "play", icon: "play", eyebrowKey: "domain.play.title" },
  sleep: { accent: "sleep", icon: "sleep", eyebrowKey: "domain.sleep.title" },
  safety: { accent: "safety", icon: "safety", eyebrowKey: "domain.safety.title" },
};

export interface GuidanceEvidenceCardProps {
  /** The same guidance block localized per supported locale. */
  variants: Record<AppLocale, GuidanceBlockView>;
  /** Stage the block belongs to; when given, the eyebrow is the stage range instead of the topic eyebrow. */
  stage?: StageDefinition | undefined;
  /** Card title heading level; h3 when the card sits under a stage heading (all-stages page). */
  headingLevel?: "h2" | "h3";
}

export function GuidanceEvidenceCard({ variants, stage, headingLevel = "h2" }: GuidanceEvidenceCardProps) {
  const { language } = useLanguage();
  const t = useMessages();
  // Local content-language override: keyed to the global locale it was made under, so a global
  // language change invalidates it and the card follows the new global locale again.
  const [override, setOverride] = useState<ContentLocaleOverride | undefined>(undefined);
  const [openClaimId, setOpenClaimId] = useState<string | null>(null);
  const contentLocale = resolveContentLocale(language, override);
  const presentation = GUIDANCE_CARD_PRESENTATION[variants.en.domain];

  return (
    <GuidanceEvidenceCardView
      variants={variants}
      globalLocale={language}
      contentLocale={contentLocale}
      contentLanguageLabel={t("guidance.contentLanguage.label")}
      eyebrow={stage ? formatStageRange(stage, language) : t(presentation.eyebrowKey)}
      onSelectContentLocale={(locale) => setOverride(contentLocaleOverride(language, locale))}
      openClaimId={openClaimId}
      onOpenClaim={setOpenClaimId}
      headingLevel={headingLevel}
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
  /** Eyebrow, in the GLOBAL language (card chrome, not canonical content). */
  eyebrow: string;
  onSelectContentLocale: (locale: AppLocale) => void;
  openClaimId: string | null;
  onOpenClaim: (claimId: string | null) => void;
  headingLevel?: "h2" | "h3";
}

/** Lead paragraph(s), optional list of items, trailing paragraph(s) — from one canonical claim text. */
function ClaimText({ text }: { text: string }) {
  const { lead, items, trailing } = splitClaimText(text);
  return (
    <>
      {lead.map((paragraph, index) => (
        <p key={`lead-${index}`}>{paragraph}</p>
      ))}
      {items.length > 0 ? (
        <ul className="guidance-evidence-card__list">
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      ) : null}
      {trailing.map((paragraph, index) => (
        <p key={`trailing-${index}`} className="supporting">
          {paragraph}
        </p>
      ))}
    </>
  );
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
  headingLevel = "h2",
}: GuidanceEvidenceCardViewProps) {
  const view = variants[contentLocale];
  const presentation = GUIDANCE_CARD_PRESENTATION[view.domain];
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
      accent={presentation.accent}
      icon={presentation.icon}
      eyebrow={eyebrow}
      title={contentLang ? <span lang={contentLang}>{view.title}</span> : view.title}
      titleAs={headingLevel}
      className="guidance-card--localizable"
      data-section={view.section}
    >
      <div className="guidance-card__lang-row">{languageToggle}</div>
      <div className="guidance-evidence-card">
        {view.claims.map((claim) => (
          <div key={claim.claimId} className="guidance-evidence-card__claim" lang={contentLang}>
            <ClaimText text={claim.text} />
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
