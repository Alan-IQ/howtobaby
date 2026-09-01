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

import { STATUS_LABELS, jurisdictionMeta, sourceStatusTone, sourceTypeLabel, verifiedLabel, type SourceStatusTone, type UiLocale } from "./labels";

export interface SourceRegistryEntryView {
  sourceId: string;
  organization: string;
  /** Exact original source title — never translated. */
  title: string;
  /** Localized "<jurisdiction> · <source type> · Last verified by HowToBaby: <date>". */
  metaLine: string;
  statusLabel: string;
  statusTone: SourceStatusTone;
  url: string;
  claimCount: number;
}

/** One /sources registry row, localized for `locale`. */
export function sourceRegistryEntryView(entry: PublicSourceEntry, locale: UiLocale): SourceRegistryEntryView {
  const jurisdiction = jurisdictionMeta(entry, locale);
  return {
    sourceId: entry.sourceId,
    organization: entry.organization,
    title: entry.title,
    metaLine: `${jurisdiction.value} · ${sourceTypeLabel(entry.sourceType, locale)} · ${verifiedLabel(entry.lastVerifiedAt, locale)}`,
    statusLabel: STATUS_LABELS[locale][entry.status],
    statusTone: sourceStatusTone(entry.status),
    url: entry.canonicalUrl,
    claimCount: entry.claimCount,
  };
}
