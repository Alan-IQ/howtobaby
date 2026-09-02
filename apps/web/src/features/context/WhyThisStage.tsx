// SPDX-License-Identifier: AGPL-3.0-only
/**
 * WhyThisStage (docs/GUI_DESIGN.md §17): explains, for the stage being browsed, what the bin
 * covers, on which age basis the actual child resolves in this domain, how the browsed stage
 * relates to the child's current stage, and the standing "age selects, it does not prove"
 * limitation. All values come from the resolved @howtobaby/core context — no date math here,
 * and safety wording is fixed copy from the app dictionary, never derived from a browsed stage.
 */

"use client";

import { browsedStageRelation, formatCalendarDate, type StageDefinition } from "@howtobaby/core";
import { Card } from "@howtobaby/ui";

import { useGuidanceContext } from "@/features/profile/ChildProfileProvider";
import { formatDate } from "@/features/evidence/labels";
import { useLanguage } from "@/i18n/LanguageProvider";
import { T, useMessages } from "@/i18n/T";
import { fill, formatDayCount, formatElapsedAge, formatStageRange, formatTimeUntilDueDate } from "./format";

export function WhyThisStage({ stage }: { stage: StageDefinition }) {
  const { language } = useLanguage();
  const t = useMessages();
  const context = useGuidanceContext(stage);
  const actual = context.actualChildContext;
  const browsed = context.browsedContentContext;
  const relation = browsed ? browsedStageRelation(actual, browsed) : "no-profile";
  const resolution = actual?.domains[stage.domain];
  const currentStage = resolution?.stage;
  const preview = context.previewPlanDateContext?.context.domains[stage.domain].stage;

  return (
    <Card icon="info" title={t("why.title")} titleAs="h2" className="why-this-stage">
      <div className="prose">
        <p>{fill(t("why.range"), { range: formatStageRange(stage, language) })}</p>
        {stage.approximateLowerBound ? <p className="supporting">{fill(t("why.range.approx"), { min: stage.minMonths })}</p> : null}
        {relation === "no-profile" ? (
          <p className="supporting">
            <T id="why.noProfile" />
          </p>
        ) : null}
        {actual && resolution && actual.chronological.days >= 0 ? (
          <p>
            {resolution.basis === "corrected-development"
              ? resolution.age.days < 0
                ? fill(t("why.basis.correctedBeforeDue"), { time: formatTimeUntilDueDate(resolution.age, language) })
                : fill(t("why.basis.corrected"), { age: formatElapsedAge(resolution.age, language), early: formatDayCount(actual.correctedDevelopment.earlyByDays ?? 0, language) })
              : fill(t("why.basis.chronological"), { age: formatElapsedAge(resolution.age, language) })}
          </p>
        ) : null}
        {relation === "actual" ? <p data-relation="actual">{t("why.relation.actual")}</p> : null}
        {relation === "earlier" && currentStage ? <p data-relation="earlier">{fill(t("why.relation.earlier"), { stage: formatStageRange(currentStage, language) })}</p> : null}
        {relation === "later" && currentStage ? <p data-relation="later">{fill(t("why.relation.later"), { stage: formatStageRange(currentStage, language) })}</p> : null}
        {relation === "unresolved" ? <p data-relation="unresolved">{t("why.relation.unresolved")}</p> : null}
        {context.previewPlanDateContext ? (
          <p className="supporting" data-preview="true">
            {fill(t("why.preview"), {
              date: formatDate(formatCalendarDate(context.previewPlanDateContext.planDate), language),
              stage: preview ? formatStageRange(preview, language) : t("summary.stage.unresolved"),
            })}
          </p>
        ) : null}
        <p className="muted">{t("why.disclaimer")}</p>
      </div>
    </Card>
  );
}
