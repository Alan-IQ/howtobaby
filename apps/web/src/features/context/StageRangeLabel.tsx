// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import type { StageDefinition } from "@howtobaby/core";

import { useLanguage } from "@/i18n/LanguageProvider";
import { formatStageRange } from "./format";

/** Localized stage range leaf (`6 to under 9 months` / `từ 6 đến dưới 9 tháng`) following the global language. */
export function StageRangeLabel({ stage }: { stage: StageDefinition }) {
  const { language } = useLanguage();
  return <>{formatStageRange(stage, language)}</>;
}
