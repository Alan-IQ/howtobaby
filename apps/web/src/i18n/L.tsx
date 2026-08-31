// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Bilingual leaf: renders the EN or VI variant of a piece of page-level copy from the ONE global
 * language preference. Server components stay server components and drop `<L en=… vi=…/>` where
 * user-facing text lives; only this leaf is a client boundary. `<html lang>` is kept in sync by
 * the LanguageProvider, so no per-element lang attribute is needed.
 *
 * This is for app/page chrome copy. Canonical guidance/claim text always comes from the knowledge
 * translations via the KnowledgeRepository — never inline strings here.
 */

"use client";

import type { ReactNode } from "react";

import { useLanguage } from "./LanguageProvider";

export function L({ en, vi }: { en: ReactNode; vi: ReactNode }) {
  const { language } = useLanguage();
  return <>{language === "vi" ? vi : en}</>;
}
