// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Pure localized presenters for evidence trust surfaces (/sources registry rows). They turn
 * canonical read-model rows into fully localized view models for ANY registered locale — no
 * surface hard-codes an `"en"` presentation and no component branches on a locale pair.
 *
 * Never localized: exact original source titles, organization names, URLs and canonical
 * identifiers. Everything AROUND them (labels, statuses, dates) follows the requested locale.
 */

import type { PublicSourceEntry } from "@howtobaby/knowledge/repository";

import { jurisdictionMeta, publicStatusLabel, sourceStatusTone, sourceTypeLabel, sourceVersionLabel, verifiedLabel, type SourceStatusTone, type UiLocale } from "./labels";

export interface SourceRegistryEntryView {
  sourceId: string;
  organization: string;
  /** Exact original source title — never translated. */
  title: string;
  /**
   * Localized "<jurisdiction> · <source type> · Current source version: <date> · Last verified by
   * HowToBaby: <date>" — the source-version segment is omitted when the authority gives no date.
   */
  metaLine: string;
  /** Public status label for a NON-current source; absent for a healthy `current` source (no badge). */
  statusLabel?: string;
  statusTone: SourceStatusTone;
  url: string;
  claimCount: number;
}

/** One /sources registry row, localized for `locale`. */
export function sourceRegistryEntryView(entry: PublicSourceEntry, locale: UiLocale): SourceRegistryEntryView {
  const jurisdiction = jurisdictionMeta(entry, locale);
  const statusLabel = publicStatusLabel(entry.status, locale);
  const segments = [jurisdiction.value, sourceTypeLabel(entry.sourceType, locale), sourceVersionLabel(entry, locale), verifiedLabel(entry.lastVerifiedAt, locale)];
  return {
    sourceId: entry.sourceId,
    organization: entry.organization,
    title: entry.title,
    metaLine: segments.filter((segment) => segment !== undefined).join(" · "),
    ...(statusLabel !== undefined ? { statusLabel } : {}),
    statusTone: sourceStatusTone(entry.status),
    url: entry.canonicalUrl,
    claimCount: entry.claimCount,
  };
}
