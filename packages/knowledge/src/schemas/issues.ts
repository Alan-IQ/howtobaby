// SPDX-License-Identifier: AGPL-3.0-only
/** Structured validation findings shared by record validation, cross-graph validation and scripts. */

export type IssueSeverity = "error" | "warning";

/** Categories map 1:1 onto the CI gates in docs/IMPLEMENTATION_ROADMAP.md Phase 2 / SYSTEM_ARCHITECTURE.md §12. */
export type IssueCategory =
  | "schema"
  | "source"
  | "provenance"
  | "translation"
  | "coverage"
  | "tool";

export interface ValidationIssue {
  severity: IssueSeverity;
  category: IssueCategory;
  /** Stable machine-readable rule id, e.g. `official-guidance-direct-support`. */
  rule: string;
  message: string;
  /** Canonical record the issue is about (claim/source/block/tool id or translation key). */
  subject?: string;
  /** Authored file the record came from, repo-relative when known. */
  file?: string;
}

export class IssueCollector {
  readonly issues: ValidationIssue[] = [];

  error(category: IssueCategory, rule: string, message: string, subject?: string, file?: string): void {
    this.issues.push({ severity: "error", category, rule, message, ...(subject !== undefined ? { subject } : {}), ...(file !== undefined ? { file } : {}) });
  }

  warn(category: IssueCategory, rule: string, message: string, subject?: string, file?: string): void {
    this.issues.push({ severity: "warning", category, rule, message, ...(subject !== undefined ? { subject } : {}), ...(file !== undefined ? { file } : {}) });
  }

  get errors(): ValidationIssue[] {
    return this.issues.filter((i) => i.severity === "error");
  }

  get warnings(): ValidationIssue[] {
    return this.issues.filter((i) => i.severity === "warning");
  }

  byCategory(...categories: IssueCategory[]): ValidationIssue[] {
    return this.issues.filter((i) => categories.includes(i.category));
  }
}
