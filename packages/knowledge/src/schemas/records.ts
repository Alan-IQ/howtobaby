// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Structural (per-record) validation for canonical YAML records.
 *
 * Each `parseX` function takes an untyped value from a YAML document and either returns the typed
 * record or records issues. Cross-record rules (referential integrity, provenance requirements,
 * EN/VI parity, coverage) live in ../validate.ts — this module only decides whether one record is
 * shaped correctly.
 */

import type { IssueCategory } from "./issues.ts";
import { IssueCollector } from "./issues.ts";
import {
  GUIDANCE_CLASSES,
  KNOWLEDGE_DOMAINS,
  LOCALES,
  PRECISION_CLASSES,
  REVIEW_STATUSES,
  SAFETY_LEVELS,
  SOURCE_ACCESS_MODES,
  SOURCE_RELATIONSHIPS,
  SOURCE_STATUSES,
  TOOL_CLASSES,
  TOOL_LIFECYCLES,
  type Claim,
  type ClaimSourceRef,
  type CoverageCell,
  type GuidanceBlock,
  type KnowledgeDomain,
  type Locale,
  type SourceLocator,
  type SourceRecord,
  type ToolEvidenceRecord,
  type TranslationBundle,
} from "./types.ts";

// --- ID grammars (REPOSITORY_STRUCTURE.md §7: stable IDs independent of files/titles) ----------

/** Source IDs: kebab-case, e.g. `cdc-introduction-solid-foods`. */
export const SOURCE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)+$/;
/** Claim IDs: dot-separated segments, e.g. `feeding.solids.start`, `sleep.safe.back_to_sleep`. */
export const CLAIM_ID_PATTERN = /^[a-z0-9][a-z0-9_-]*(?:\.[a-z0-9][a-z0-9_-]*)+$/;
/** Guidance block IDs: `guidance.` + dot path. */
export const GUIDANCE_ID_PATTERN = /^guidance\.[a-z0-9][a-z0-9_-]*(?:\.[a-z0-9][a-z0-9_-]*)+$/;
/** Tool IDs: `tool.` + dot path. */
export const TOOL_ID_PATTERN = /^tool\.[a-z0-9][a-z0-9_-]*(?:\.[a-z0-9][a-z0-9_-]*)*$/;
/** Translation keys share the claim-ID grammar (dot paths). */
export const TEXT_KEY_PATTERN = CLAIM_ID_PATTERN;
/** Public evidence slugs: kebab-case, URL-safe. */
export const PUBLIC_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** Calendar dates are authored as YYYY-MM-DD strings, never timestamps (GUIDANCE_CONTENT_CONTRACT.md §2). */
export const CALENDAR_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isValidCalendarDate(value: string): boolean {
  if (!CALENDAR_DATE_PATTERN.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number) as [number, number, number];
  if (m < 1 || m > 12 || d < 1) return false;
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return d <= daysInMonth;
}

// --- helpers -----------------------------------------------------------------------------------

type Raw = Record<string, unknown>;

class RecordReader {
  private readonly raw: Raw;
  private readonly issues: IssueCollector;
  private readonly category: IssueCategory;
  private readonly subject: string;
  private readonly file: string | undefined;
  failed = false;

  constructor(raw: Raw, issues: IssueCollector, category: IssueCategory, subject: string, file?: string) {
    this.raw = raw;
    this.issues = issues;
    this.category = category;
    this.subject = subject;
    this.file = file;
  }

  fail(rule: string, message: string): void {
    this.failed = true;
    this.issues.error(this.category, rule, message, this.subject, this.file);
  }

  requireString(key: string, pattern?: RegExp, patternHint?: string): string | undefined {
    const value = this.raw[key];
    if (typeof value !== "string" || value.trim() === "") {
      this.fail("missing-field", `\`${key}\` must be a non-empty string`);
      return undefined;
    }
    if (pattern && !pattern.test(value)) {
      this.fail("invalid-format", `\`${key}\` value \`${value}\` ${patternHint ?? `does not match ${pattern}`}`);
      return undefined;
    }
    return value;
  }

  optionalString(key: string): string | undefined {
    const value = this.raw[key];
    if (value === undefined || value === null) return undefined;
    if (typeof value !== "string" || value.trim() === "") {
      this.fail("invalid-format", `\`${key}\` must be a non-empty string when present`);
      return undefined;
    }
    return value;
  }

  requireEnum<T extends string>(key: string, allowed: readonly T[]): T | undefined {
    const value = this.raw[key];
    if (typeof value !== "string" || !(allowed as readonly string[]).includes(value)) {
      this.fail("invalid-enum", `\`${key}\` must be one of: ${allowed.join(", ")} (got ${JSON.stringify(value)})`);
      return undefined;
    }
    return value as T;
  }

  requireDate(key: string): string | undefined {
    const value = this.requireString(key);
    if (value === undefined) return undefined;
    if (!isValidCalendarDate(value)) {
      this.fail("invalid-date", `\`${key}\` value \`${value}\` is not a valid YYYY-MM-DD calendar date`);
      return undefined;
    }
    return value;
  }

  optionalDate(key: string): string | undefined {
    const value = this.optionalString(key);
    if (value === undefined) return undefined;
    if (!isValidCalendarDate(value)) {
      this.fail("invalid-date", `\`${key}\` value \`${value}\` is not a valid YYYY-MM-DD calendar date`);
      return undefined;
    }
    return value;
  }

  optionalStringArray(key: string): string[] | undefined {
    const value = this.raw[key];
    if (value === undefined || value === null) return undefined;
    if (!Array.isArray(value) || value.some((v) => typeof v !== "string" || v.trim() === "")) {
      this.fail("invalid-format", `\`${key}\` must be an array of non-empty strings when present`);
      return undefined;
    }
    return value as string[];
  }

  requireStringArray(key: string, minLength = 0): string[] | undefined {
    const value = this.raw[key];
    if (!Array.isArray(value) || value.some((v) => typeof v !== "string" || v.trim() === "")) {
      this.fail("invalid-format", `\`${key}\` must be an array of non-empty strings`);
      return undefined;
    }
    if (value.length < minLength) {
      this.fail("invalid-format", `\`${key}\` must contain at least ${minLength} entr${minLength === 1 ? "y" : "ies"}`);
      return undefined;
    }
    return value as string[];
  }

  unknownKeys(allowed: readonly string[]): void {
    for (const key of Object.keys(this.raw)) {
      if (!allowed.includes(key)) this.fail("unknown-field", `unknown field \`${key}\` (canonical schema rejects unrecognized fields)`);
    }
  }
}

function asRaw(value: unknown, issues: IssueCollector, category: IssueCategory, subject: string, file?: string): Raw | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    issues.error(category, "invalid-record", "record must be a YAML mapping", subject, file);
    return undefined;
  }
  return value as Raw;
}

// --- SourceRecord ------------------------------------------------------------------------------

const SOURCE_KEYS = [
  "id", "organization", "title", "canonicalUrl", "jurisdiction", "sourceType",
  "publishedAt", "updatedAt", "lastVerifiedAt", "nextReviewAt", "status", "supersededBy", "accessMode", "notes",
] as const;

export function parseSourceRecord(value: unknown, issues: IssueCollector, file?: string): SourceRecord | undefined {
  const raw = asRaw(value, issues, "source", "(source)", file);
  if (!raw) return undefined;
  const subject = typeof raw["id"] === "string" ? raw["id"] : "(source without id)";
  const r = new RecordReader(raw, issues, "source", subject, file);
  r.unknownKeys(SOURCE_KEYS);

  const id = r.requireString("id", SOURCE_ID_PATTERN, "is not a kebab-case source ID");
  const organization = r.requireString("organization");
  const title = r.requireString("title");
  const canonicalUrl = r.requireString("canonicalUrl");
  if (canonicalUrl !== undefined && !/^https:\/\/[^\s]+$/.test(canonicalUrl)) {
    r.fail("invalid-url", `\`canonicalUrl\` must be an https URL (got \`${canonicalUrl}\`)`);
  }
  const jurisdiction = r.requireString("jurisdiction");
  const sourceType = r.requireString("sourceType");
  const publishedAt = r.optionalDate("publishedAt");
  const updatedAt = r.optionalDate("updatedAt");
  const lastVerifiedAt = r.requireDate("lastVerifiedAt");
  const nextReviewAt = r.optionalDate("nextReviewAt");
  const status = r.requireEnum("status", SOURCE_STATUSES);
  const supersededBy = r.optionalString("supersededBy");
  const accessMode = r.requireEnum("accessMode", SOURCE_ACCESS_MODES);
  const notes = r.optionalString("notes");

  if (status === "superseded" && supersededBy === undefined) {
    r.fail("superseded-without-successor", "a superseded source must name its successor in `supersededBy`");
  }
  if (status !== undefined && status !== "superseded" && supersededBy !== undefined) {
    r.fail("successor-without-superseded", "`supersededBy` is only valid on a source whose status is `superseded`");
  }

  if (r.failed || !id || !organization || !title || !canonicalUrl || !jurisdiction || !sourceType || !lastVerifiedAt || !status || !accessMode) return undefined;
  return {
    id, organization, title, canonicalUrl, jurisdiction, sourceType, lastVerifiedAt, status, accessMode,
    ...(publishedAt !== undefined ? { publishedAt } : {}),
    ...(updatedAt !== undefined ? { updatedAt } : {}),
    ...(nextReviewAt !== undefined ? { nextReviewAt } : {}),
    ...(supersededBy !== undefined ? { supersededBy } : {}),
    ...(notes !== undefined ? { notes } : {}),
  };
}

// --- SourceLocator / ClaimSourceRef ------------------------------------------------------------

const LOCATOR_KEYS = ["heading", "section", "anchor", "page", "table", "figure", "paragraphHint", "sourceVersionHint"] as const;

function parseLocator(value: unknown, issues: IssueCollector, subject: string, file?: string): SourceLocator | undefined {
  const raw = asRaw(value, issues, "provenance", subject, file);
  if (!raw) return undefined;
  const r = new RecordReader(raw, issues, "provenance", subject, file);
  r.unknownKeys(LOCATOR_KEYS);
  const locator: SourceLocator = {};
  for (const key of ["heading", "section", "anchor", "table", "figure", "paragraphHint", "sourceVersionHint"] as const) {
    const v = r.optionalString(key);
    if (v !== undefined) locator[key] = v;
  }
  const page = raw["page"];
  if (page !== undefined && page !== null) {
    if (typeof page !== "number" || !Number.isInteger(page) || page < 1) {
      r.fail("invalid-format", "`page` must be a positive integer when present");
    } else {
      locator.page = page;
    }
  }
  if (r.failed) return undefined;
  if (Object.keys(locator).length === 0) {
    issues.error("provenance", "empty-locator", "locator must contain at least one field when present", subject, file);
    return undefined;
  }
  return locator;
}

const SOURCE_REF_KEYS = ["sourceId", "relationship", "locator", "supportNoteKey", "verifiedAt"] as const;

export function parseClaimSourceRef(value: unknown, issues: IssueCollector, claimId: string, file?: string): ClaimSourceRef | undefined {
  const raw = asRaw(value, issues, "provenance", claimId, file);
  if (!raw) return undefined;
  const r = new RecordReader(raw, issues, "provenance", claimId, file);
  r.unknownKeys(SOURCE_REF_KEYS);
  const sourceId = r.requireString("sourceId", SOURCE_ID_PATTERN, "is not a kebab-case source ID");
  const relationship = r.requireEnum("relationship", SOURCE_RELATIONSHIPS);
  const verifiedAt = r.requireDate("verifiedAt");
  const supportNoteKey = r.optionalString("supportNoteKey");
  let locator: SourceLocator | undefined;
  if (raw["locator"] !== undefined) {
    locator = parseLocator(raw["locator"], issues, claimId, file);
    if (locator === undefined) return undefined;
  }
  if (r.failed || !sourceId || !relationship || !verifiedAt) return undefined;
  return {
    sourceId, relationship, verifiedAt,
    ...(locator !== undefined ? { locator } : {}),
    ...(supportNoteKey !== undefined ? { supportNoteKey } : {}),
  };
}

// --- Claim -------------------------------------------------------------------------------------

const CLAIM_KEYS = [
  "id", "textKey", "publicSlug", "guidanceClass", "precisionClass", "safetyLevel",
  "sourceRefs", "applicability", "exclusions", "uncertaintyNoteKey", "reviewedAt", "reviewStatus",
] as const;

export function parseClaim(value: unknown, issues: IssueCollector, file?: string): Claim | undefined {
  const raw = asRaw(value, issues, "schema", "(claim)", file);
  if (!raw) return undefined;
  const subject = typeof raw["id"] === "string" ? raw["id"] : "(claim without id)";
  const r = new RecordReader(raw, issues, "schema", subject, file);
  r.unknownKeys(CLAIM_KEYS);

  const id = r.requireString("id", CLAIM_ID_PATTERN, "is not a dot-path claim ID (e.g. feeding.solids.start)");
  const textKey = r.requireString("textKey", TEXT_KEY_PATTERN, "is not a dot-path translation key");
  const publicSlug = r.requireString("publicSlug", PUBLIC_SLUG_PATTERN, "is not a kebab-case public slug");
  const guidanceClass = r.requireEnum("guidanceClass", GUIDANCE_CLASSES);
  const precisionClass = r.requireEnum("precisionClass", PRECISION_CLASSES);
  const safetyLevel = r.requireEnum("safetyLevel", SAFETY_LEVELS);
  const reviewedAt = r.requireDate("reviewedAt");
  const reviewStatus = r.requireEnum("reviewStatus", REVIEW_STATUSES);
  const applicability = r.optionalStringArray("applicability");
  const exclusions = r.optionalStringArray("exclusions");
  const uncertaintyNoteKey = r.optionalString("uncertaintyNoteKey");

  const refsRaw = raw["sourceRefs"];
  let sourceRefs: ClaimSourceRef[] | undefined;
  if (!Array.isArray(refsRaw)) {
    r.fail("missing-field", "`sourceRefs` must be an array (it may be empty only for classes that do not require citation)");
  } else {
    sourceRefs = [];
    for (const entry of refsRaw) {
      const ref = parseClaimSourceRef(entry, issues, subject, file);
      if (ref === undefined) r.failed = true;
      else sourceRefs.push(ref);
    }
    const seen = new Set<string>();
    for (const ref of sourceRefs) {
      if (seen.has(ref.sourceId)) r.fail("duplicate-source-ref", `source \`${ref.sourceId}\` is referenced more than once`);
      seen.add(ref.sourceId);
    }
  }

  if (r.failed || !id || !textKey || !publicSlug || !guidanceClass || !precisionClass || !safetyLevel || !reviewedAt || !reviewStatus || sourceRefs === undefined) return undefined;
  return {
    id, textKey, publicSlug, guidanceClass, precisionClass, safetyLevel, sourceRefs, reviewedAt, reviewStatus,
    ...(applicability !== undefined ? { applicability } : {}),
    ...(exclusions !== undefined ? { exclusions } : {}),
    ...(uncertaintyNoteKey !== undefined ? { uncertaintyNoteKey } : {}),
  };
}

// --- GuidanceBlock -----------------------------------------------------------------------------

const GUIDANCE_KEYS = ["id", "domain", "stage", "titleKey", "claimIds", "routes"] as const;

export function parseGuidanceBlock(value: unknown, issues: IssueCollector, file?: string): GuidanceBlock | undefined {
  const raw = asRaw(value, issues, "schema", "(guidance block)", file);
  if (!raw) return undefined;
  const subject = typeof raw["id"] === "string" ? raw["id"] : "(guidance block without id)";
  const r = new RecordReader(raw, issues, "schema", subject, file);
  r.unknownKeys(GUIDANCE_KEYS);

  const id = r.requireString("id", GUIDANCE_ID_PATTERN, "is not a `guidance.` dot-path ID");
  const domain = r.requireEnum("domain", KNOWLEDGE_DOMAINS);
  const stage = r.optionalString("stage");
  const titleKey = r.requireString("titleKey", TEXT_KEY_PATTERN, "is not a dot-path translation key");
  const claimIds = r.requireStringArray("claimIds", 1);
  const routes = r.requireStringArray("routes", 1);
  if (routes) {
    for (const route of routes) {
      if (!/^\/[a-z0-9\-/]*$/.test(route) || (route.length > 1 && route.endsWith("/"))) {
        r.fail("invalid-route", `route \`${route}\` must be an absolute lowercase path without a trailing slash`);
      }
    }
  }
  if (claimIds) {
    for (const claimId of claimIds) {
      if (!CLAIM_ID_PATTERN.test(claimId)) r.fail("invalid-format", `claim ID \`${claimId}\` is not a dot-path claim ID`);
    }
  }

  if (r.failed || !id || !domain || !titleKey || !claimIds || !routes) return undefined;
  return { id, domain, titleKey, claimIds, routes, ...(stage !== undefined ? { stage } : {}) };
}

// --- TranslationBundle -------------------------------------------------------------------------

const TRANSLATION_KEYS = ["locale", "strings"] as const;

export function parseTranslationBundle(value: unknown, issues: IssueCollector, file?: string): TranslationBundle | undefined {
  const raw = asRaw(value, issues, "translation", "(translation bundle)", file);
  if (!raw) return undefined;
  const subject = typeof raw["locale"] === "string" ? `locale:${raw["locale"]}` : "(bundle without locale)";
  const r = new RecordReader(raw, issues, "translation", subject, file);
  r.unknownKeys(TRANSLATION_KEYS);
  const locale = r.requireEnum("locale", LOCALES) as Locale | undefined;
  const stringsRaw = raw["strings"];
  const strings: Record<string, string> = {};
  if (typeof stringsRaw !== "object" || stringsRaw === null || Array.isArray(stringsRaw)) {
    r.fail("missing-field", "`strings` must be a mapping of translation key → text");
  } else {
    for (const [key, text] of Object.entries(stringsRaw as Raw)) {
      if (!TEXT_KEY_PATTERN.test(key)) {
        r.fail("invalid-format", `translation key \`${key}\` is not a dot-path key`);
        continue;
      }
      if (typeof text !== "string" || text.trim() === "") {
        r.fail("invalid-format", `translation key \`${key}\` must map to a non-empty string`);
        continue;
      }
      strings[key] = text.trim();
    }
  }
  if (r.failed || !locale) return undefined;
  return { locale, strings };
}

// --- ToolEvidenceRecord ------------------------------------------------------------------------

const TOOL_KEYS = ["id", "title", "toolClass", "lifecycle", "guidanceClaimIds", "safetyClaimIds"] as const;

export function parseToolEvidenceRecord(value: unknown, issues: IssueCollector, file?: string): ToolEvidenceRecord | undefined {
  const raw = asRaw(value, issues, "tool", "(tool)", file);
  if (!raw) return undefined;
  const subject = typeof raw["id"] === "string" ? raw["id"] : "(tool without id)";
  const r = new RecordReader(raw, issues, "tool", subject, file);
  r.unknownKeys(TOOL_KEYS);
  const id = r.requireString("id", TOOL_ID_PATTERN, "is not a `tool.` dot-path ID");
  const title = r.requireString("title");
  const toolClass = r.requireEnum("toolClass", TOOL_CLASSES);
  const lifecycle = r.requireEnum("lifecycle", TOOL_LIFECYCLES);
  const guidanceClaimIds = r.optionalStringArray("guidanceClaimIds");
  const safetyClaimIds = r.optionalStringArray("safetyClaimIds");
  if (toolClass === "guidance-linked" && (guidanceClaimIds === undefined || guidanceClaimIds.length === 0)) {
    r.fail("guidance-linked-without-claims", "a guidance-linked tool must reference at least one canonical claim ID");
  }
  if (toolClass === "safety-sensitive" && (safetyClaimIds === undefined || safetyClaimIds.length === 0)) {
    r.fail("safety-sensitive-without-claims", "a safety-sensitive tool must reference at least one canonical safety claim ID");
  }
  if (r.failed || !id || !title || !toolClass || !lifecycle) return undefined;
  return {
    id, title, toolClass, lifecycle,
    ...(guidanceClaimIds !== undefined ? { guidanceClaimIds } : {}),
    ...(safetyClaimIds !== undefined ? { safetyClaimIds } : {}),
  };
}

// --- CoverageCell ------------------------------------------------------------------------------

const COVERAGE_KEYS = ["domain", "stage", "requiredClaimIds"] as const;

export function parseCoverageCell(value: unknown, issues: IssueCollector, file?: string): CoverageCell | undefined {
  const raw = asRaw(value, issues, "coverage", "(coverage cell)", file);
  if (!raw) return undefined;
  const subject = typeof raw["domain"] === "string" && typeof raw["stage"] === "string" ? `${raw["domain"]}/${raw["stage"]}` : "(coverage cell)";
  const r = new RecordReader(raw, issues, "coverage", subject, file);
  r.unknownKeys(COVERAGE_KEYS);
  const domain = r.requireEnum("domain", KNOWLEDGE_DOMAINS) as KnowledgeDomain | undefined;
  const stage = r.requireString("stage");
  const requiredClaimIds = r.requireStringArray("requiredClaimIds", 1);
  if (r.failed || !domain || !stage || !requiredClaimIds) return undefined;
  return { domain, stage, requiredClaimIds };
}
