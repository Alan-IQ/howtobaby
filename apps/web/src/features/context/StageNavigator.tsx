// SPDX-License-Identifier: AGPL-3.0-only
/**
 * StageNavigator (docs/GUI_DESIGN.md §13): horizontal stage chips with a hidden scrollbar, arrow
 * buttons on pointer devices, keyboard-operable links. The browsed stage carries `aria-current`;
 * the actual child's current stage (from the local profile, client-only) carries a distinct
 * marker so browsing and "your child" never look alike. Links only — browsing is a route, and
 * it never mutates the profile.
 */

"use client";

import Link from "next/link";
import { useRef } from "react";

import { stagesFor, type StageDomain } from "@howtobaby/core";
import { Icon, VisuallyHidden } from "@howtobaby/ui";

import { useGuidanceContext } from "@/features/profile/ChildProfileProvider";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useMessages } from "@/i18n/T";
import { formatStageChip, formatStageRange } from "./format";
import { STAGE_DESTINATIONS, stageHref } from "./routes";

export interface StageNavigatorProps {
  domain: StageDomain;
  /** Slug of the stage being browsed (page context); omitted on the domain landing page. */
  currentSlug?: string | undefined;
}

export function StageNavigator({ domain, currentSlug }: StageNavigatorProps) {
  const { language } = useLanguage();
  const t = useMessages();
  const scroller = useRef<HTMLDivElement>(null);
  const context = useGuidanceContext();
  const actualStageId = context.actualChildContext?.domains[domain].stage?.id;
  const destination = STAGE_DESTINATIONS[domain];

  const scrollBy = (direction: -1 | 1) => {
    const element = scroller.current;
    if (element) element.scrollBy({ left: direction * Math.max(160, element.clientWidth * 0.6), behavior: "smooth" });
  };

  return (
    <nav className="stage-nav" aria-label={t("stage.nav.label")} data-accent={destination.accent}>
      <button type="button" className="stage-nav__arrow" onClick={() => scrollBy(-1)} aria-label={t("stage.nav.scrollBack")} tabIndex={-1}>
        <Icon name="chevronLeft" />
      </button>
      <div className="stage-nav__scroller" ref={scroller}>
        <ul className="stage-nav__list">
          {stagesFor(domain).map((stage) => {
            const isBrowsed = stage.slug === currentSlug;
            const isActual = stage.id === actualStageId;
            return (
              <li key={stage.id}>
                <Link
                  href={stageHref(stage)}
                  className="stage-nav__chip"
                  aria-current={isBrowsed ? "page" : undefined}
                  data-actual={isActual ? "true" : undefined}
                  title={formatStageRange(stage, language)}
                >
                  {formatStageChip(stage, language)}
                  {isActual ? (
                    <>
                      <span className="stage-nav__marker" aria-hidden="true" />
                      <VisuallyHidden> — {t("stage.nav.actualMarker")}</VisuallyHidden>
                    </>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <button type="button" className="stage-nav__arrow" onClick={() => scrollBy(1)} aria-label={t("stage.nav.scrollForward")} tabIndex={-1}>
        <Icon name="chevronRight" />
      </button>
    </nav>
  );
}
