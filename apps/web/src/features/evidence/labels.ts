// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Display-only EN/VI labels for evidence presentation (docs/GUI_DESIGN.md §11).
 *
 * These are UI labels, not medical prose: the parent-facing claim/guidance text itself always
 * comes from the canonical translation bundles via the KnowledgeRepository. Vietnamese UI labels
 * here mirror the canonical evidence vocabulary so both locales present the same meaning.
 */

import type { GuidanceClass, SourceRecord, SourceRelationship, SourceStatus } from "@howtobaby/knowledge";

export type UiLocale = "en" | "vi";

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
    corroborating: "Corroborating",
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

/** Calm public freshness signals (EVIDENCE_PROVENANCE.md §14); superseded/unreachable stay honest. */
export const STATUS_LABELS: Record<UiLocale, Partial<Record<SourceStatus, string>>> = {
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

export const UI_STRINGS: Record<UiLocale, {
  languageLegend: string;
  sourcesDrawerTitle: string;
  openSources: string;
  viewOriginal: string;
  disclaimer: string;
  close: string;
  referencesTitle: string;
  verifiedPrefix: string;
  jurisdictionUS: string;
  jurisdictionGlobal: string;
}> = {
  en: {
    languageLegend: "Language",
    sourcesDrawerTitle: "Sources for this guidance",
    openSources: "Show the sources behind this guidance",
    viewOriginal: "View original source",
    disclaimer: "These organizations publish the original guidance. They have not reviewed or endorsed HowToBaby.",
    close: "Close",
    referencesTitle: "Sources used on this page",
    verifiedPrefix: "Verified",
    jurisdictionUS: "United States",
    jurisdictionGlobal: "Global",
  },
  vi: {
    languageLegend: "Ngôn ngữ",
    sourcesDrawerTitle: "Nguồn của hướng dẫn này",
    openSources: "Xem các nguồn đứng sau hướng dẫn này",
    viewOriginal: "Xem nguồn gốc",
    disclaimer: "Các tổ chức này công bố hướng dẫn gốc. Họ không rà soát hay bảo chứng cho HowToBaby.",
    close: "Đóng",
    referencesTitle: "Nguồn dùng trên trang này",
    verifiedPrefix: "Đã kiểm chứng",
    jurisdictionUS: "Hoa Kỳ",
    jurisdictionGlobal: "Toàn cầu",
  },
};

/** Deterministic calendar-date formatting (dates are authored as YYYY-MM-DD, never timestamps). */
export function formatDate(date: string, locale: UiLocale): string {
  const [y, m, d] = date.split("-").map(Number) as [number, number, number];
  if (locale === "vi") return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[m - 1]} ${d}, ${y}`;
}

export function verifiedLabel(date: string, locale: UiLocale): string {
  return `${UI_STRINGS[locale].verifiedPrefix} ${formatDate(date, locale)}`;
}

export function jurisdictionLabel(source: SourceRecord, locale: UiLocale): string {
  if (source.jurisdiction === "US") return UI_STRINGS[locale].jurisdictionUS;
  if (source.jurisdiction === "global") return `${UI_STRINGS[locale].jurisdictionGlobal} (${source.organization})`;
  return source.jurisdiction;
}
