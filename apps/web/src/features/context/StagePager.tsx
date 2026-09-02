// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import Link from "next/link";

import { adjacentStages, type StageDefinition } from "@howtobaby/core";
import { Icon } from "@howtobaby/ui";

import { useLanguage } from "@/i18n/LanguageProvider";
import { useMessages } from "@/i18n/T";
import { formatStageRange } from "./format";
import { stageHref } from "./routes";

/** Previous/next stage links (docs/GUI_DESIGN.md §8 "previous/next age navigation"). */
export function StagePager({ stage }: { stage: StageDefinition }) {
  const { language } = useLanguage();
  const t = useMessages();
  const { previous, next } = adjacentStages(stage);
  const link = (target: StageDefinition, direction: "prev" | "next") => (
    <Link href={stageHref(target)} className="stage-pager__link" data-direction={direction}>
      {direction === "prev" ? <Icon name="chevronLeft" /> : null}
      <span>
        <span className="stage-pager__label">{t(direction === "prev" ? "stage.prev" : "stage.next")}</span>
        {formatStageRange(target, language)}
      </span>
      {direction === "next" ? <Icon name="chevronRight" /> : null}
    </Link>
  );
  return (
    <nav className="stage-pager" aria-label={t("stage.nav.label")}>
      {previous ? link(previous, "prev") : <span />}
      {next ? link(next, "next") : <span />}
    </nav>
  );
}
