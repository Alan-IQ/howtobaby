// SPDX-License-Identifier: AGPL-3.0-only
/**
 * /sources registry rows following the ONE global language preference. The page passes the raw
 * generated read-model rows; this client leaf localizes them through the shared presenter for
 * the active locale — no hard-coded `"en"` presentation, no per-locale page config.
 *
 * Source status renders with its semantic tone (docs/GUI_DESIGN.md §11.8): `current` as a calm
 * neutral badge, every non-current state as quiet caution — the same tone mapping the Evidence
 * Drawer uses.
 */

"use client";

import type { PublicSourceEntry } from "@howtobaby/knowledge/repository";
import { Badge, Card } from "@howtobaby/ui";

import { useLanguage } from "@/i18n/LanguageProvider";
import { useMessages } from "@/i18n/T";
import { UI_STRINGS } from "./labels";
import { sourceRegistryEntryView } from "./presenters";

export function LocalizedSourceRegistry({ sources }: { sources: PublicSourceEntry[] }) {
  const { language } = useLanguage();
  const t = useMessages();
  const usedBy = (count: number) => (count === 1 ? t("sources.usedByClaims.one") : t("sources.usedByClaims.many").replace("{count}", String(count)));
  return (
    <>
      {sources.map((source) => {
        const view = sourceRegistryEntryView(source, language);
        return (
          <Card key={view.sourceId} title={view.title} titleAs="h2" eyebrow={view.organization}>
            <div className="prose">
              <p className="muted">
                {view.metaLine} · <Badge {...(view.statusTone === "attention" ? { status: "caution" as const } : {})}>{view.statusLabel}</Badge>
              </p>
              <p className="muted">{usedBy(view.claimCount)}</p>
              <p>
                <a href={view.url} target="_blank" rel="noopener noreferrer">
                  {UI_STRINGS[language].viewOriginal}
                  <span aria-hidden="true"> ↗</span>
                </a>
              </p>
            </div>
          </Card>
        );
      })}
    </>
  );
}
