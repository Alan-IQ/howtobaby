// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Evidence detail body following the ONE global language preference. The route prerenders the
 * view model for every registered locale (loadEvidenceDetailViews); this client leaf only picks
 * the active locale's view — nothing here hard-codes an `"en"` presentation.
 *
 * The claim's canonical text is shown in every registered locale at once (this is the audit
 * surface for translation parity); each text carries an explicit `lang` when it deviates from
 * the active global language / `<html lang>`.
 */

"use client";

import { SUPPORTED_LOCALES, type AppLocale } from "@howtobaby/i18n";
import { Badge, Card, ReferenceList } from "@howtobaby/ui";

import { useLanguage } from "@/i18n/LanguageProvider";
import { T } from "@/i18n/T";
import { UI_STRINGS } from "./labels";
import type { EvidenceDetailView } from "./load";
import type { StatusTone } from "@howtobaby/ui";

export interface LocalizedEvidenceDetailProps {
  /** The claim's canonical text per registered locale (null when a translation is absent). */
  texts: Record<AppLocale, string | null>;
  views: Record<AppLocale, EvidenceDetailView>;
}

export function LocalizedEvidenceDetail({ texts, views }: LocalizedEvidenceDetailProps) {
  const { language } = useLanguage();
  const view = views[language];
  return (
    <>
      <Card icon="document" title={<T id="page.evidence.claim.title" />} titleAs="h2">
        <div className="prose">
          {[...SUPPORTED_LOCALES]
            // Active-locale text leads; the other registered locales follow as muted parity copies.
            .sort((a, b) => (a.id === language ? -1 : 0) - (b.id === language ? -1 : 0))
            .map(({ id }) => {
              const text = texts[id];
              if (text === null) return null;
              return (
                <p key={id} {...(id === language ? {} : { lang: id, className: "muted" })}>
                  {text}
                </p>
              );
            })}
          <p>
            <Badge>{view.classLabel}</Badge> <Badge>{view.precisionLabel}</Badge> <Badge status={view.safetyLevel as StatusTone}>{view.safetyLabel}</Badge>
          </p>
          <p className="muted">{view.reviewLine}</p>
        </div>
      </Card>
      <Card icon="globe" title={<T id="page.evidence.sources.title" />} titleAs="h2">
        <div className="prose">
          {view.sources.map((source) => (
            <p key={source.sourceId}>
              <strong>{source.organization}</strong> — {source.title}
              <br />
              {source.roleStatusLine}
              <br />
              <span className="muted">{source.metaLine}</span>
            </p>
          ))}
          <p className="muted">{view.disclaimerLine}</p>
        </div>
      </Card>
      <ReferenceList title={<T id="page.evidence.original.title" />} viewOriginalLabel={UI_STRINGS[language].viewOriginal} entries={view.references} />
    </>
  );
}
