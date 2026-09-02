// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Display-only EN/VI labels for evidence presentation (docs/GUI_DESIGN.md §11).
 *
 * These are UI labels, not medical prose: the parent-facing claim/guidance text itself always
 * comes from the canonical translation bundles via the KnowledgeRepository. Vietnamese UI labels
 * here mirror the canonical evidence vocabulary so both locales present the same meaning.
 *
 * Every drawer metadata line is labeled (e.g. "Applies to: United States", "Published: …",
 * "Updated: …", "Last verified by HowToBaby: …") so parents never see bare values whose meaning
 * they have to guess, and the "why this source is used" line is derived from canonical
 * relationship metadata — never hard-coded medical prose in a component.
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
    "typical-pattern": "Xu hướng thường gặp",
    "example-plan": "Kế hoạch mẫu",
    "practical-interpretation": "Cách áp dụng thực tế",
    "product-heuristic": "Gợi ý của HowToBaby",
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
    primary: "Tài liệu chính",
    "direct-support": "Tài liệu hỗ trợ trực tiếp",
    corroborating: "Tài liệu đối chiếu",
    contextual: "Tài liệu bổ trợ",
    conflicting: "Tài liệu có khuyến nghị khác",
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
    primary: "Khuyến nghị này dựa trên hướng dẫn chính thức do tổ chức này công bố.",
    "direct-support": "Hướng dẫn do tổ chức này công bố hỗ trợ trực tiếp cho nội dung này.",
    corroborating: "Đây là một cơ quan độc lập có hướng dẫn nhất quán với tài liệu chính.",
    contextual: "Tài liệu này cung cấp thông tin nền cần thiết để hiểu hướng dẫn.",
    conflicting: "Hướng dẫn của tổ chức này có điểm khác với tài liệu chính; HowToBaby giữ phần khác biệt đó hiển thị rõ.",
  },
};

/**
 * Public status labels for NON-current lifecycle states (EVIDENCE_PROVENANCE.md §14). A healthy
 * `current` source is a machine lifecycle state and carries no public badge: its trust signal
 * is the source-date metadata plus HowToBaby's verification date (see `sourceDateMeta`).
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
    "temporarily-unreachable": "Tài liệu hiện tạm thời không truy cập được",
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

/** One labeled source-date row ("Published", "Updated" or "Current source version"). */
export interface SourceDateMeta {
  label: string;
  value: string;
}

/**
 * Source publication/version metadata as the authority states it (EVIDENCE_PROVENANCE.md §14).
 * `publishedAt` and `updatedAt` are DIFFERENT upstream facts and are never inferred from each
 * other; this is the single presentation source for every surface (Evidence Drawer, /sources,
 * /evidence/[slug], References) — consumers never re-branch on the raw dates. The matrix is:
 *
 * - A. publishedAt only                    → `Published: <publishedAt>`
 * - B. updatedAt only                      → `Current source version: <updatedAt>`
 * - C. both, updatedAt === publishedAt     → `Published: <publishedAt>` only (no duplicate row)
 * - D. both, updatedAt > publishedAt       → `Published: <publishedAt>` + `Updated: <updatedAt>`
 * - E. neither                             → no rows at all (a date is never invented)
 *
 * `updatedAt < publishedAt` is invalid canonical metadata and is rejected by knowledge validation
 * (`source-date-order`); the UI never masks it. Every row is distinct from `lastVerifiedAt`, which
 * is HowToBaby's own verification date and always renders AFTER these rows (see `verifiedLabel`).
 */
export function sourceDateMeta(source: Pick<SourceRecord, "publishedAt" | "updatedAt">, locale: UiLocale): SourceDateMeta[] {
  const strings = UI_STRINGS[locale];
  const { publishedAt, updatedAt } = source;
  if (publishedAt !== undefined) {
    const rows: SourceDateMeta[] = [{ label: strings.metaPublished, value: formatDate(publishedAt, locale) }];
    // ISO YYYY-MM-DD strings compare lexically; an equal date is the same source version, not an update.
    if (updatedAt !== undefined && updatedAt > publishedAt) rows.push({ label: strings.metaUpdated, value: formatDate(updatedAt, locale) });
    return rows;
  }
  if (updatedAt !== undefined) return [{ label: strings.metaSourceVersion, value: formatDate(updatedAt, locale) }];
  return [];
}

/**
 * The same matrix joined as one compact line ("Published: Jan 10, 2025 · Updated: Apr 14, 2026")
 * for list surfaces (/sources rows, page References); `undefined` when there is no source date.
 */
export function sourceDateLabel(source: Pick<SourceRecord, "publishedAt" | "updatedAt">, locale: UiLocale): string | undefined {
  const rows = sourceDateMeta(source, locale);
  return rows.length === 0 ? undefined : rows.map((row) => `${row.label}: ${row.value}`).join(" · ");
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
    draft: "Bản nháp — chưa xuất bản",
    "source-verified": "Đã kiểm chứng tài liệu",
    "clinical-review-required": "Chờ rà soát chuyên môn y tế",
    "clinically-reviewed": "Đã qua rà soát chuyên môn y tế",
    "release-approved": "Đã duyệt để xuất bản",
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
    "source-exact": "Chính xác theo tài liệu gốc",
    "source-approximate": "Xấp xỉ theo tài liệu gốc",
    "source-range": "Khoảng giá trị theo tài liệu gốc",
    "product-heuristic": "Gợi ý của HowToBaby",
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
    clinician: "Trao đổi với bác sĩ",
    urgent: "Cần xử lý sớm",
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
  /** Authority's publication date (`publishedAt`). */
  metaPublished: string;
  /** Authority's update/revision date (`updatedAt`) — shown alongside `metaPublished`. */
  metaUpdated: string;
  /** `updatedAt` when the authority provides NO publication date (never derived from publishedAt). */
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
    metaPublished: "Published",
    metaUpdated: "Updated",
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
    sourcesDrawerTitle: "Tài liệu tham khảo cho hướng dẫn này",
    drawerAttribution: "Hướng dẫn này do HowToBaby biên soạn dựa trên các tài liệu gốc được liệt kê bên dưới. Cách diễn đạt là của HowToBaby, không phải trích dẫn nguyên văn từ các tổ chức này.",
    claimLabel: "Hướng dẫn của HowToBaby",
    openSources: "Xem tài liệu tham khảo của hướng dẫn này",
    viewOriginal: "Xem tài liệu gốc",
    disclaimer: "Các tổ chức dưới đây là đơn vị công bố tài liệu gốc; họ không tham gia rà soát và không xác nhận hay chứng thực nội dung của HowToBaby.",
    close: "Đóng",
    referencesTitle: "Tài liệu tham khảo trên trang này",
    metaRole: "Vai trò của tài liệu",
    metaRelevantSection: "Phần liên quan",
    metaAppliesTo: "Phạm vi áp dụng",
    metaScope: "Phạm vi",
    metaStatus: "Trạng thái tài liệu",
    metaPublished: "Ngày xuất bản",
    metaUpdated: "Ngày cập nhật",
    metaSourceVersion: "Phiên bản tài liệu hiện tại",
    metaLastVerified: "HowToBaby kiểm chứng lần cuối",
    metaWhy: "Vì sao HowToBaby sử dụng tài liệu này",
    jurisdictionUS: "Hoa Kỳ",
    jurisdictionGlobal: "Toàn cầu",
    reviewedOn: "Ngày rà soát",
    domainLabel: "Chủ đề",
    wordingNote: "HowToBaby tóm tắt và diễn giải; nội dung nguyên văn thuộc về tài liệu gốc.",
  },
};

/** Deterministic calendar-date formatting (dates are authored as YYYY-MM-DD, never timestamps). */
export function formatDate(date: string, locale: UiLocale): string {
  const [y, m, d] = date.split("-").map(Number) as [number, number, number];
  if (locale === "vi") return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[m - 1]} ${d}, ${y}`;
}

/**
 * "Last verified by HowToBaby: <date>" — the date HowToBaby's maintainer/review workflow actually
 * confirmed the source (`lastVerifiedAt`): never the source's own date, never a crawl/fetch time
 * and never a deploy time.
 */
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
