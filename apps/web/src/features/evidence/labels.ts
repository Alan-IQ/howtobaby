// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Display-only EN/VI labels for evidence presentation (docs/GUI_DESIGN.md §11).
 *
 * These are UI labels, not medical prose: the parent-facing claim/guidance text itself always
 * comes from the canonical translation bundles via the KnowledgeRepository. Vietnamese UI labels
 * here mirror the canonical evidence vocabulary so both locales present the same meaning.
 *
 * Every drawer metadata line is labeled (e.g. "Applies to: United States", "Current source
 * version: …", "Last verified by HowToBaby: …") so parents never see bare values whose meaning they have to guess, and the
 * "why this source is used" line is derived from canonical relationship metadata — never
 * hard-coded medical prose in a component.
 */

import type { AppLocale } from "@howtobaby/i18n";
import type { GuidanceClass, SourceRecord, SourceRelationship, SourceStatus } from "@howtobaby/knowledge";

/** Locale for evidence-presentation labels — the app locale from the central registry. */
export type UiLocale = AppLocale;

export const GUIDANCE_CLASS_LABELS: Record<UiLocale, Record<GuidanceClass, string>> = {
  en: {
    "official-guidance": "Official guidance",
    "evidence-synthesis": "Evidence synthesis",
    "typical-pattern": "Typical pattern",
    "example-plan": "Example plan",
    "practical-interpretation": "Practical interpretation",
    "product-heuristic": "Product heuristic",
  },
  vi: {
    "official-guidance": "Hướng dẫn chính thức",
    "evidence-synthesis": "Tổng hợp bằng chứng",
    "typical-pattern": "Mô hình thường gặp",
    "example-plan": "Kế hoạch ví dụ",
    "practical-interpretation": "Diễn giải thực hành",
    "product-heuristic": "Gợi ý của sản phẩm",
  },
};

export const RELATIONSHIP_LABELS: Record<UiLocale, Record<SourceRelationship, string>> = {
  en: {
    primary: "Primary source",
    "direct-support": "Direct support",
    corroborating: "Corroborating source",
    contextual: "Context",
    conflicting: "Conflicting view",
  },
  vi: {
    primary: "Nguồn chính",
    "direct-support": "Hỗ trợ trực tiếp",
    corroborating: "Nguồn củng cố",
    contextual: "Bối cảnh",
    conflicting: "Quan điểm khác biệt",
  },
};

/**
 * "Why this source is used", derived from the canonical claim→source relationship
 * (EVIDENCE_PROVENANCE.md §3). Presentation copy about provenance roles, not medical prose.
 */
export const RELATIONSHIP_WHY_LABELS: Record<UiLocale, Record<SourceRelationship, string>> = {
  en: {
    primary: "This guidance is based on the official recommendation this organization publishes.",
    "direct-support": "This organization's published guidance directly supports this statement.",
    corroborating: "An independent authority whose published guidance agrees with the primary source.",
    contextual: "Provides background context for this guidance.",
    conflicting: "This organization's guidance differs; the meaningful difference is kept visible.",
  },
  vi: {
    primary: "Hướng dẫn này dựa trên khuyến nghị chính thức do tổ chức này công bố.",
    "direct-support": "Hướng dẫn đã công bố của tổ chức này hỗ trợ trực tiếp cho nội dung trên.",
    corroborating: "Một cơ quan độc lập có hướng dẫn đã công bố thống nhất với nguồn chính.",
    contextual: "Cung cấp bối cảnh nền cho hướng dẫn này.",
    conflicting: "Hướng dẫn của tổ chức này khác biệt; điểm khác biệt quan trọng được giữ hiển thị.",
  },
};

/**
 * Public status labels for NON-current lifecycle states (EVIDENCE_PROVENANCE.md §14). A healthy
 * `current` source is a machine lifecycle state and carries no public badge: its trust signal
 * is the source-version date plus HowToBaby's verification date (see `sourceVersionMeta`).
 * `current` stays in SourceStatus and the canonical model; only its presentation is silent.
 */
export type PublicSourceStatus = Exclude<SourceStatus, "current">;
export const STATUS_LABELS: Record<UiLocale, Record<PublicSourceStatus, string>> = {
  en: {
    "changed-review-required": "Reviewing an update",
    superseded: "Superseded",
    retired: "Retired",
    "temporarily-unreachable": "Source temporarily unavailable",
  },
  vi: {
    "changed-review-required": "Đang rà soát bản cập nhật",
    superseded: "Đã được thay thế",
    retired: "Đã ngừng sử dụng",
    "temporarily-unreachable": "Nguồn tạm thời không truy cập được",
  },
};

/** Localized public status label, or `undefined` for a healthy `current` source (no badge). */
export function publicStatusLabel(status: SourceStatus, locale: UiLocale): string | undefined {
  return status === "current" ? undefined : STATUS_LABELS[locale][status];
}

/**
 * Presentation tone for a source status, shared by EVERY surface that shows one (Evidence
 * Drawer badge, /sources registry badge, evidence detail, References): every non-current state
 * (changed-review-required, superseded, retired, temporarily-unreachable) warrants quiet
 * attention; `current` is calm and renders no badge at all. Honest, never alarming
 * (docs/GUI_DESIGN.md §11.8).
 */
export type SourceStatusTone = "calm" | "attention";
export function sourceStatusTone(status: SourceStatus): SourceStatusTone {
  return status === "current" ? "calm" : "attention";
}

/**
 * The source's current version date as the authority states it: `updatedAt` (current
 * revision/update date) first, then `publishedAt` (publication date); `undefined` when the
 * authority provides neither — the row is omitted, never invented (EVIDENCE_PROVENANCE.md §14).
 * Distinct from `lastVerifiedAt`, which is HowToBaby's own verification date.
 */
export function sourceVersionDate(source: Pick<SourceRecord, "publishedAt" | "updatedAt">): string | undefined {
  return source.updatedAt ?? source.publishedAt;
}

/** Labeled "Current source version: <date>" row, or `undefined` when there is no source date. */
export function sourceVersionMeta(source: Pick<SourceRecord, "publishedAt" | "updatedAt">, locale: UiLocale): { label: string; value: string } | undefined {
  const date = sourceVersionDate(source);
  return date === undefined ? undefined : { label: UI_STRINGS[locale].metaSourceVersion, value: formatDate(date, locale) };
}

/** "Current source version: <date>" as one line, or `undefined` when there is no source date. */
export function sourceVersionLabel(source: Pick<SourceRecord, "publishedAt" | "updatedAt">, locale: UiLocale): string | undefined {
  const meta = sourceVersionMeta(source, locale);
  return meta === undefined ? undefined : `${meta.label}: ${meta.value}`;
}

/** Review-status labels for the evidence detail trust surface (EVIDENCE_PROVENANCE.md §5). */
export const REVIEW_STATUS_LABELS: Record<UiLocale, Record<string, string>> = {
  en: {
    draft: "Draft — not published guidance",
    "source-verified": "Source-verified",
    "clinical-review-required": "Awaiting clinical review",
    "clinically-reviewed": "Clinically reviewed",
    "release-approved": "Release-approved",
    superseded: "Superseded",
  },
  vi: {
    draft: "Bản nháp — chưa phải hướng dẫn xuất bản",
    "source-verified": "Đã kiểm chứng nguồn",
    "clinical-review-required": "Chờ rà soát lâm sàng",
    "clinically-reviewed": "Đã rà soát lâm sàng",
    "release-approved": "Đã duyệt phát hành",
    superseded: "Đã được thay thế",
  },
};

/** Precision-class labels (evidence detail badges). */
export const PRECISION_CLASS_LABELS: Record<UiLocale, Record<string, string>> = {
  en: {
    "source-exact": "Source-exact",
    "source-approximate": "Source-approximate",
    "source-range": "Source range",
    "product-heuristic": "Product heuristic",
  },
  vi: {
    "source-exact": "Chính xác theo nguồn",
    "source-approximate": "Xấp xỉ theo nguồn",
    "source-range": "Khoảng theo nguồn",
    "product-heuristic": "Gợi ý của sản phẩm",
  },
};

/** Safety-level labels (evidence detail badges; the badge tone still comes from the level itself). */
export const SAFETY_LEVEL_LABELS: Record<UiLocale, Record<string, string>> = {
  en: {
    info: "Info",
    caution: "Caution",
    clinician: "Ask your clinician",
    urgent: "Urgent",
    emergency: "Emergency",
  },
  vi: {
    info: "Thông tin",
    caution: "Thận trọng",
    clinician: "Hỏi bác sĩ",
    urgent: "Khẩn",
    emergency: "Cấp cứu",
  },
};

/** Source-type labels for the /sources registry; unknown types fall back to the raw identifier. */
export const SOURCE_TYPE_LABELS: Record<UiLocale, Record<string, string>> = {
  en: {
    "fact-sheet": "Fact sheet",
    "public-health-guidance": "Public health guidance",
  },
  vi: {
    "fact-sheet": "Tờ thông tin",
    "public-health-guidance": "Hướng dẫn y tế công cộng",
  },
};

export function sourceTypeLabel(sourceType: string, locale: UiLocale): string {
  return SOURCE_TYPE_LABELS[locale][sourceType] ?? sourceType;
}

export const UI_STRINGS: Record<UiLocale, {
  languageLegend: string;
  sourcesDrawerTitle: string;
  /** Drawer attribution: HowToBaby guidance supported by sources, never a direct quote. */
  drawerAttribution: string;
  claimLabel: string;
  openSources: string;
  viewOriginal: string;
  disclaimer: string;
  close: string;
  referencesTitle: string;
  metaRole: string;
  metaRelevantSection: string;
  metaAppliesTo: string;
  metaScope: string;
  metaStatus: string;
  /** Label for the authority's current source-version date (`updatedAt ?? publishedAt`). */
  metaSourceVersion: string;
  metaLastVerified: string;
  metaWhy: string;
  jurisdictionUS: string;
  jurisdictionGlobal: string;
  reviewedOn: string;
  domainLabel: string;
  wordingNote: string;
}> = {
  en: {
    languageLegend: "Language",
    sourcesDrawerTitle: "Sources for this guidance",
    drawerAttribution: "HowToBaby guidance, supported by the original sources listed below. The wording is HowToBaby's — not a direct quote from these organizations.",
    claimLabel: "HowToBaby guidance",
    openSources: "Show the sources behind this guidance",
    viewOriginal: "View original source",
    disclaimer: "These organizations publish the original guidance. They have not reviewed or endorsed HowToBaby.",
    close: "Close",
    referencesTitle: "Sources used on this page",
    metaRole: "Role in this guidance",
    metaRelevantSection: "Relevant section",
    metaAppliesTo: "Applies to",
    metaScope: "Scope",
    metaStatus: "Source status",
    metaSourceVersion: "Current source version",
    metaLastVerified: "Last verified by HowToBaby",
    metaWhy: "Why this source is used",
    jurisdictionUS: "United States",
    jurisdictionGlobal: "Global",
    reviewedOn: "Reviewed",
    domainLabel: "Domain",
    wordingNote: "HowToBaby summarizes and interprets; the original wording belongs to the source.",
  },
  vi: {
    languageLegend: "Ngôn ngữ",
    sourcesDrawerTitle: "Nguồn của hướng dẫn này",
    drawerAttribution: "Hướng dẫn của HowToBaby, dựa trên các nguồn gốc liệt kê bên dưới. Câu chữ là của HowToBaby — không phải trích dẫn trực tiếp từ các tổ chức này.",
    claimLabel: "Hướng dẫn của HowToBaby",
    openSources: "Xem các nguồn đứng sau hướng dẫn này",
    viewOriginal: "Xem nguồn gốc",
    disclaimer: "Các tổ chức này công bố hướng dẫn gốc. Họ không rà soát hay bảo chứng cho HowToBaby.",
    close: "Đóng",
    referencesTitle: "Nguồn dùng trên trang này",
    metaRole: "Vai trò trong hướng dẫn này",
    metaRelevantSection: "Phần liên quan",
    metaAppliesTo: "Áp dụng cho",
    metaScope: "Phạm vi",
    metaStatus: "Trạng thái nguồn",
    metaSourceVersion: "Phiên bản nguồn hiện tại",
    metaLastVerified: "HowToBaby kiểm chứng lần cuối",
    metaWhy: "Vì sao dùng nguồn này",
    jurisdictionUS: "Hoa Kỳ",
    jurisdictionGlobal: "Toàn cầu",
    reviewedOn: "Rà soát",
    domainLabel: "Mảng nội dung",
    wordingNote: "HowToBaby tóm lược và diễn giải; câu chữ gốc thuộc về nguồn.",
  },
};

/** Deterministic calendar-date formatting (dates are authored as YYYY-MM-DD, never timestamps). */
export function formatDate(date: string, locale: UiLocale): string {
  const [y, m, d] = date.split("-").map(Number) as [number, number, number];
  if (locale === "vi") return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[m - 1]} ${d}, ${y}`;
}

/** "Last verified by HowToBaby: <date>" — HowToBaby's verification, never the source's own date. */
export function verifiedLabel(date: string, locale: UiLocale): string {
  return `${UI_STRINGS[locale].metaLastVerified}: ${formatDate(date, locale)}`;
}

/**
 * Labeled jurisdiction row: "Applies to: United States" for US sources, "Scope: Global" for
 * global normative sources — never a bare value like "United States" or "Global (WHO)".
 */
export function jurisdictionMeta(source: Pick<SourceRecord, "jurisdiction">, locale: UiLocale): { label: string; value: string } {
  const strings = UI_STRINGS[locale];
  if (source.jurisdiction === "US") return { label: strings.metaAppliesTo, value: strings.jurisdictionUS };
  if (source.jurisdiction === "global") return { label: strings.metaScope, value: strings.jurisdictionGlobal };
  return { label: strings.metaAppliesTo, value: source.jurisdiction };
}
