// SPDX-License-Identifier: AGPL-3.0-only
/**
 * ChildSummary + AgeContextBadge (docs/GUI_DESIGN.md §17): the actual child's context today —
 * chronological age, the corrected-development note when the proxy applies, and the current
 * stage per domain with links into public browsing. Reads the resolved context only; no date math.
 */

"use client";

import Link from "next/link";

import { STAGE_DOMAINS, type ChildAgeContext, type StageDomain } from "@howtobaby/core";
import { Badge, Card } from "@howtobaby/ui";

import { fill, formatCorrectedAge, formatDayCount, formatElapsedAge, formatStageRange } from "@/features/context/format";
import { STAGE_DESTINATIONS, stageHref } from "@/features/context/routes";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useMessages } from "@/i18n/T";
import { useChildProfile, useGuidanceContext } from "./ChildProfileProvider";

/** Compact "age today" badge for headers and navigators. Renders nothing without a profile. */
export function AgeContextBadge() {
  const { language } = useLanguage();
  const t = useMessages();
  const context = useGuidanceContext();
  const actual = context.actualChildContext;
  if (!actual || actual.chronological.days < 0) return null;
  return (
    <Badge accent="brand" className="age-context-badge">
      {t("summary.age.label")}: {formatElapsedAge(actual.chronological, language)}
    </Badge>
  );
}

function StageRow({ domain, actual }: { domain: StageDomain; actual: ChildAgeContext }) {
  const { language } = useLanguage();
  const t = useMessages();
  const destination = STAGE_DESTINATIONS[domain];
  const stage = actual.domains[domain].stage;
  return (
    <div className="child-summary__stage" data-accent={destination.accent}>
      <dt>{t(destination.titleKey)}</dt>
      <dd>{stage ? <Link href={stageHref(stage)}>{formatStageRange(stage, language)}</Link> : <span className="muted">{t("summary.stage.unresolved")}</span>}</dd>
    </div>
  );
}

export function ChildSummary() {
  const { language } = useLanguage();
  const t = useMessages();
  const { profile } = useChildProfile();
  const context = useGuidanceContext();
  const actual = context.actualChildContext;
  if (!profile || !actual) return null;

  const corrected = actual.correctedDevelopment;
  const early = corrected.earlyByDays !== undefined && corrected.earlyByDays > 0 ? formatDayCount(corrected.earlyByDays, language) : undefined;

  return (
    <Card icon="info" accent="brand" title={profile.displayName ?? t("summary.child.generic")} titleAs="h2" className="child-summary">
      {actual.chronological.days < 0 ? (
        <p className="muted">{t("summary.beforeBirth")}</p>
      ) : (
        <>
          <dl className="child-summary__facts">
            <div>
              <dt>{t("summary.age.label")}</dt>
              <dd>{formatElapsedAge(actual.chronological, language)}</dd>
            </div>
            {corrected.useCorrectedDevelopmentAge && corrected.correctedDevelopmentAge ? (
              <div>
                <dt>{t("summary.correctedAge.label")}</dt>
                <dd>{formatCorrectedAge(corrected.correctedDevelopmentAge, language)}</dd>
              </div>
            ) : null}
          </dl>
          {early && corrected.eligibility === "eligible" ? <p className="supporting">{fill(t("summary.corrected.note"), { early })}</p> : null}
          {early && corrected.eligibility === "chronological-age-limit" ? <p className="supporting">{fill(t("summary.corrected.limit"), { early })}</p> : null}
          <h3 className="child-summary__heading">{t("summary.stage.label")}</h3>
          <dl className="child-summary__stages">
            {STAGE_DOMAINS.map((domain) => (
              <StageRow key={domain} domain={domain} actual={actual} />
            ))}
          </dl>
          {actual.infantSafeSleepScope ? <p className="muted">{t("summary.safeSleep.inScope")}</p> : null}
          {STAGE_DOMAINS.every((domain) => actual.domains[domain].stage === undefined) && actual.chronological.completedMonths >= 60 ? <p className="muted">{t("summary.outOfScope")}</p> : null}
        </>
      )}
    </Card>
  );
}
