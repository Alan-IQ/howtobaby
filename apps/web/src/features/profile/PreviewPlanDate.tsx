// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Preview plan-date control + PreviewBanner (GUIDANCE_CONTENT_CONTRACT §7). The preview date is
 * session state only: never persisted, never in the URL, and it resolves into its own
 * `previewPlanDateContext` — the actual child's safety context is untouched.
 */

"use client";

import { formatCalendarDate, parseCalendarDate, STAGE_DOMAINS } from "@howtobaby/core";
import { Button, Card, Input } from "@howtobaby/ui";

import { fill, formatCorrectedAge, formatElapsedAge, formatStageRange } from "@/features/context/format";
import { STAGE_DESTINATIONS } from "@/features/context/routes";
import { formatDate } from "@/features/evidence/labels";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useMessages } from "@/i18n/T";
import { useChildProfile, useGuidanceContext } from "./ChildProfileProvider";

export function PreviewBanner() {
  const { language } = useLanguage();
  const t = useMessages();
  const context = useGuidanceContext();
  const preview = context.previewPlanDateContext;
  if (!preview) return null;
  return (
    <p className="preview-banner" role="status">
      {fill(t("preview.banner"), { date: formatDate(formatCalendarDate(preview.planDate), language) })}
    </p>
  );
}

export function PreviewPlanDate() {
  const { language } = useLanguage();
  const t = useMessages();
  const { loaded, profile, previewPlanDate, setPreviewPlanDate } = useChildProfile();
  const context = useGuidanceContext();
  const preview = context.previewPlanDateContext;

  return (
    <Card icon="calendar" title={t("preview.title")} titleAs="h2" className="preview-plan-date">
      <p className="muted">{t("preview.lede")}</p>
      {loaded && !profile ? <p className="muted">{t("preview.needsProfile")}</p> : null}
      {loaded && profile ? (
        <div className="preview-plan-date__controls">
          <Input
            label={t("preview.date.label")}
            type="date"
            name="previewPlanDate"
            autoComplete="off"
            value={previewPlanDate ? formatCalendarDate(previewPlanDate) : ""}
            onChange={(event) => setPreviewPlanDate(parseCalendarDate(event.currentTarget.value))}
          />
          {previewPlanDate ? (
            <Button variant="subtle" size="sm" onClick={() => setPreviewPlanDate(undefined)}>
              {t("preview.clear")}
            </Button>
          ) : null}
        </div>
      ) : null}
      {preview ? (
        <>
          <PreviewBanner />
          <dl className="child-summary__stages">
            <div>
              <dt>{t("preview.age.label")}</dt>
              <dd>{preview.context.chronological.days < 0 ? t("preview.beforeBirth") : formatElapsedAge(preview.context.chronological, language)}</dd>
            </div>
            {preview.context.correctedDevelopment.useCorrectedDevelopmentAge && preview.context.correctedDevelopment.correctedDevelopmentAge ? (
              <div>
                <dt>{t("summary.correctedAge.label")}</dt>
                <dd>{formatCorrectedAge(preview.context.correctedDevelopment.correctedDevelopmentAge, language)}</dd>
              </div>
            ) : null}
            {STAGE_DOMAINS.map((domain) => {
              const stage = preview.context.domains[domain].stage;
              return (
                <div key={domain} className="child-summary__stage" data-accent={STAGE_DESTINATIONS[domain].accent}>
                  <dt>{t(STAGE_DESTINATIONS[domain].titleKey)}</dt>
                  <dd>{stage ? formatStageRange(stage, language) : <span className="muted">{t("summary.stage.unresolved")}</span>}</dd>
                </div>
              );
            })}
          </dl>
        </>
      ) : null}
    </Card>
  );
}
