// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Loads the canonical knowledge graph from Git-tracked YAML under packages/knowledge/src/**.
 *
 * This is the ONLY ingestion path: scripts, tests, the compiler and the derived read models all
 * start from this loader, so SQLite/JSON projections can never drift from a second parser.
 * Files are read in sorted order and every collection is sorted by stable ID, which is one half
 * of the deterministic-rebuild guarantee (the compiler is the other half).
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { parse as parseYaml } from "yaml";

import { IssueCollector } from "./schemas/issues.ts";
import {
  parseClaim,
  parseCoverageCell,
  parseGuidanceBlock,
  parseSourceRecord,
  parseToolEvidenceRecord,
  parseTranslationBundle,
} from "./schemas/records.ts";
import {
  KNOWLEDGE_DOMAINS,
  type Claim,
  type CoverageMatrix,
  type GuidanceBlock,
  type KnowledgeDomain,
  type Locale,
  type SourceRecord,
  type ToolEvidenceRecord,
} from "./schemas/types.ts";

/** A claim plus the authoring context the compiler and validators need. */
export interface LoadedClaim {
  claim: Claim;
  /** Domain derived from the authored file's `domain` field (claims/<domain>/*.yaml). */
  domain: KnowledgeDomain;
  /** Repo-relative authored file, for actionable validation messages. */
  file: string;
}

export interface CanonicalKnowledge {
  sources: SourceRecord[];
  claims: LoadedClaim[];
  guidance: GuidanceBlock[];
  /** locale → (key → text). `en` is canonical; other locales are parity-validated against it. */
  translations: Record<Locale, Record<string, string>>;
  tools: ToolEvidenceRecord[];
  coverage: CoverageMatrix;
  /** Structural issues found while loading (cross-record validation adds more in validate.ts). */
  issues: IssueCollector;
  /** Canonical root directory that was loaded (absolute). */
  rootDir: string;
  /** Sorted repo-relative file list with content hashes' input: path → raw bytes (for versioning). */
  files: Map<string, Buffer>;
}

/** Absolute path of the canonical authoring root (packages/knowledge/src). */
export function canonicalRootDir(): string {
  return fileURLToPath(new URL(".", import.meta.url));
}

function walkYamlFiles(dir: string): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }
  const files: string[] = [];
  for (const entry of entries.sort()) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) files.push(...walkYamlFiles(full));
    else if (entry.endsWith(".yaml") || entry.endsWith(".yml")) files.push(full);
  }
  return files;
}

function readDocs(rootDir: string, subdir: string, issues: IssueCollector, files: Map<string, Buffer>): Array<{ file: string; doc: unknown }> {
  const docs: Array<{ file: string; doc: unknown }> = [];
  for (const full of walkYamlFiles(join(rootDir, subdir))) {
    const rel = relative(rootDir, full).split(sep).join("/");
    const bytes = readFileSync(full);
    files.set(rel, bytes);
    const text = bytes.toString("utf8");
    if (text.trim() === "") continue; // placeholder files are allowed while a directory is empty
    try {
      docs.push({ file: rel, doc: parseYaml(text) });
    } catch (error) {
      issues.error("schema", "yaml-parse", `YAML parse failed: ${error instanceof Error ? error.message : String(error)}`, undefined, rel);
    }
  }
  return docs;
}

function listField(doc: unknown, field: string, issues: IssueCollector, file: string): unknown[] {
  if (typeof doc !== "object" || doc === null || Array.isArray(doc)) {
    issues.error("schema", "invalid-file", `file must be a YAML mapping with a \`${field}\` list`, undefined, file);
    return [];
  }
  const value = (doc as Record<string, unknown>)[field];
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) {
    issues.error("schema", "invalid-file", `\`${field}\` must be a list`, undefined, file);
    return [];
  }
  return value;
}

/** Load and structurally validate the whole canonical graph. */
export function loadCanonicalKnowledge(rootDir: string = canonicalRootDir()): CanonicalKnowledge {
  const issues = new IssueCollector();
  const files = new Map<string, Buffer>();

  // Sources: sources/*.yaml, each `sources: [...]`, merged into one registry (REPOSITORY_STRUCTURE.md §8).
  const sources: SourceRecord[] = [];
  for (const { file, doc } of readDocs(rootDir, "sources", issues, files)) {
    for (const entry of listField(doc, "sources", issues, file)) {
      const record = parseSourceRecord(entry, issues, file);
      if (record) sources.push(record);
    }
  }

  // Claims: claims/<domain>/*.yaml, each `domain:` + `claims: [...]`.
  const claims: LoadedClaim[] = [];
  for (const { file, doc } of readDocs(rootDir, "claims", issues, files)) {
    const domainRaw = typeof doc === "object" && doc !== null && !Array.isArray(doc) ? (doc as Record<string, unknown>)["domain"] : undefined;
    const domain = KNOWLEDGE_DOMAINS.find((d) => d === domainRaw);
    if (!domain) {
      issues.error("schema", "invalid-file", `claim file must declare \`domain\` as one of: ${KNOWLEDGE_DOMAINS.join(", ")}`, undefined, file);
      continue;
    }
    const dirDomain = file.split("/")[1];
    if (dirDomain !== domain) {
      issues.error("schema", "domain-directory-mismatch", `file declares domain \`${domain}\` but lives under claims/${dirDomain}/`, undefined, file);
    }
    for (const entry of listField(doc, "claims", issues, file)) {
      const claim = parseClaim(entry, issues, file);
      if (claim) claims.push({ claim, domain, file });
    }
  }

  // Guidance blocks: guidance/**/*.yaml, each `blocks: [...]`.
  const guidance: GuidanceBlock[] = [];
  for (const { file, doc } of readDocs(rootDir, "guidance", issues, files)) {
    for (const entry of listField(doc, "blocks", issues, file)) {
      const block = parseGuidanceBlock(entry, issues, file);
      if (block) guidance.push(block);
    }
  }

  // Translations: translations/<locale>/*.yaml bundles, merged per locale with duplicate-key detection.
  const translations: Record<Locale, Record<string, string>> = { en: {}, vi: {} };
  for (const { file, doc } of readDocs(rootDir, "translations", issues, files)) {
    const bundle = parseTranslationBundle(doc, issues, file);
    if (!bundle) continue;
    const dirLocale = file.split("/")[1];
    if (dirLocale !== bundle.locale) {
      issues.error("translation", "locale-directory-mismatch", `bundle declares locale \`${bundle.locale}\` but lives under translations/${dirLocale}/`, undefined, file);
    }
    for (const [key, text] of Object.entries(bundle.strings)) {
      if (translations[bundle.locale][key] !== undefined) {
        issues.error("translation", "duplicate-key", `translation key \`${key}\` is defined more than once for locale \`${bundle.locale}\``, key, file);
        continue;
      }
      translations[bundle.locale][key] = text;
    }
  }

  // Tools: tools/*.yaml, each `tools: [...]` (knowledge-side claim links only).
  const tools: ToolEvidenceRecord[] = [];
  for (const { file, doc } of readDocs(rootDir, "tools", issues, files)) {
    for (const entry of listField(doc, "tools", issues, file)) {
      const tool = parseToolEvidenceRecord(entry, issues, file);
      if (tool) tools.push(tool);
    }
  }

  // Coverage matrix: coverage/*.yaml, each `cells: [...]`.
  const cells: CoverageMatrix["cells"] = [];
  for (const { file, doc } of readDocs(rootDir, "coverage", issues, files)) {
    for (const entry of listField(doc, "cells", issues, file)) {
      const cell = parseCoverageCell(entry, issues, file);
      if (cell) cells.push(cell);
    }
  }

  // Deterministic ordering by stable ID (ties on ID are duplicate-ID errors caught in validate.ts).
  sources.sort((a, b) => a.id.localeCompare(b.id));
  claims.sort((a, b) => a.claim.id.localeCompare(b.claim.id));
  guidance.sort((a, b) => a.id.localeCompare(b.id));
  tools.sort((a, b) => a.id.localeCompare(b.id));
  cells.sort((a, b) => `${a.domain}/${a.stage}`.localeCompare(`${b.domain}/${b.stage}`));

  return { sources, claims, guidance, translations, tools, coverage: { cells }, issues, rootDir, files };
}
