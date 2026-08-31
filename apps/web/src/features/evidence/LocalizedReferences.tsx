// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Page-references section following the ONE global language preference. Pages prerender both
 * locales' entries from the same route-evidence index; this client leaf only picks which set to
 * show — it resolves nothing itself.
 */

"use client";

import { ReferenceList, type ReferenceEntry } from "@howtobaby/ui";

import { UI_STRINGS } from "@/features/evidence/labels";
import { useLanguage } from "@/i18n/LanguageProvider";

export function LocalizedReferences({ entries }: { entries: { en: ReferenceEntry[]; vi: ReferenceEntry[] } }) {
  const { language } = useLanguage();
  return <ReferenceList title={UI_STRINGS[language].referencesTitle} viewOriginalLabel={UI_STRINGS[language].viewOriginal} entries={entries[language]} />;
}
