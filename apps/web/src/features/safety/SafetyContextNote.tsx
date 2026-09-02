// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Safety context (GUIDANCE_CONTENT_CONTRACT §6/§7): safety reads the ACTUAL child only, via
 * `safetyContextOf` — there is no browsed stage and no preview here by construction.
 */

"use client";

import { safetyContextOf } from "@howtobaby/core";
import { Card } from "@howtobaby/ui";

import { fill, formatElapsedAge } from "@/features/context/format";
import { useGuidanceContext } from "@/features/profile/ChildProfileProvider";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useMessages } from "@/i18n/T";

export function SafetyContextNote() {
  const { language } = useLanguage();
  const t = useMessages();
  const actual = safetyContextOf(useGuidanceContext());
  return (
    <Card icon="safety" accent="safety" title={t("safety.context.title")} titleAs="h2" className="safety-context">
      <p className="prose">
        {actual && actual.chronological.days >= 0 ? fill(t("safety.context.actual"), { age: formatElapsedAge(actual.chronological, language) }) : t("safety.context.noProfile")}
      </p>
    </Card>
  );
}
