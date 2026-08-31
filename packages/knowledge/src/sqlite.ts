// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Writes the compiled knowledge projection into the derived `knowledge.sqlite` read model
 * (docs/SYSTEM_ARCHITECTURE.md §5.2). Uses node:sqlite so the projection needs no native
 * dependency on any platform.
 *
 * The database is intentionally disposable: it is generated into a temporary file inside one
 * transaction and only replaces the previous database after the build succeeds, so a failed
 * compile never leaves a partially valid index. Canonical string IDs are the only durable
 * references; SQLite rowids never leak out of this file.
 *
 * Determinism: fixed schema DDL, ID-sorted inserts, no timestamps or random state — the same
 * canonical input bytes produce a byte-identical database file.
 */

import { renameSync, rmSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

import type { CompiledKnowledge } from "./compile.ts";

const SCHEMA = `
CREATE TABLE meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
) WITHOUT ROWID;

CREATE TABLE sources (
  id TEXT PRIMARY KEY,
  organization TEXT NOT NULL,
  title TEXT NOT NULL,
  canonical_url TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  source_type TEXT NOT NULL,
  published_at TEXT,
  updated_at TEXT,
  last_verified_at TEXT NOT NULL,
  next_review_at TEXT,
  status TEXT NOT NULL,
  superseded_by TEXT,
  access_mode TEXT NOT NULL,
  notes TEXT
) WITHOUT ROWID;

CREATE TABLE claims (
  id TEXT PRIMARY KEY,
  domain TEXT NOT NULL,
  text_key TEXT NOT NULL,
  public_slug TEXT NOT NULL UNIQUE,
  guidance_class TEXT NOT NULL,
  precision_class TEXT NOT NULL,
  safety_level TEXT NOT NULL,
  uncertainty_note_key TEXT,
  reviewed_at TEXT NOT NULL,
  review_status TEXT NOT NULL
) WITHOUT ROWID;

CREATE TABLE claim_applicability (
  claim_id TEXT NOT NULL REFERENCES claims(id),
  kind TEXT NOT NULL CHECK (kind IN ('applicability','exclusion')),
  tag TEXT NOT NULL,
  PRIMARY KEY (claim_id, kind, tag)
) WITHOUT ROWID;

CREATE TABLE claim_source_refs (
  claim_id TEXT NOT NULL REFERENCES claims(id),
  position INTEGER NOT NULL,
  source_id TEXT NOT NULL REFERENCES sources(id),
  relationship TEXT NOT NULL,
  verified_at TEXT NOT NULL,
  support_note_key TEXT,
  locator_heading TEXT,
  locator_section TEXT,
  locator_anchor TEXT,
  locator_page INTEGER,
  locator_table TEXT,
  locator_figure TEXT,
  locator_paragraph_hint TEXT,
  locator_source_version_hint TEXT,
  PRIMARY KEY (claim_id, position)
) WITHOUT ROWID;

CREATE TABLE guidance_blocks (
  id TEXT PRIMARY KEY,
  domain TEXT NOT NULL,
  stage TEXT,
  title_key TEXT NOT NULL
) WITHOUT ROWID;

CREATE TABLE guidance_block_claims (
  block_id TEXT NOT NULL REFERENCES guidance_blocks(id),
  position INTEGER NOT NULL,
  claim_id TEXT NOT NULL REFERENCES claims(id),
  PRIMARY KEY (block_id, position)
) WITHOUT ROWID;

CREATE TABLE guidance_block_routes (
  block_id TEXT NOT NULL REFERENCES guidance_blocks(id),
  route TEXT NOT NULL,
  PRIMARY KEY (block_id, route)
) WITHOUT ROWID;

CREATE TABLE translations (
  locale TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  PRIMARY KEY (locale, key)
) WITHOUT ROWID;

CREATE TABLE tools (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  tool_class TEXT NOT NULL,
  lifecycle TEXT NOT NULL
) WITHOUT ROWID;

CREATE TABLE tool_claims (
  tool_id TEXT NOT NULL REFERENCES tools(id),
  kind TEXT NOT NULL CHECK (kind IN ('guidance','safety')),
  claim_id TEXT NOT NULL REFERENCES claims(id),
  PRIMARY KEY (tool_id, kind, claim_id)
) WITHOUT ROWID;

CREATE INDEX idx_claim_source_refs_source ON claim_source_refs(source_id);
CREATE INDEX idx_guidance_block_claims_claim ON guidance_block_claims(claim_id);
CREATE INDEX idx_tool_claims_claim ON tool_claims(claim_id);
`;

function populate(db: DatabaseSync, compiled: CompiledKnowledge): void {
  db.exec(SCHEMA);
  db.exec("BEGIN");

  const meta = db.prepare("INSERT INTO meta (key, value) VALUES (?, ?)");
  meta.run("content_version", compiled.contentVersion.contentVersion);
  meta.run("source_registry_version", compiled.contentVersion.sourceRegistryVersion);
  for (const locale of Object.keys(compiled.contentVersion.localeVersions).sort()) {
    meta.run(`locale_version_${locale}`, compiled.contentVersion.localeVersions[locale]!);
  }

  const insertSource = db.prepare(
    "INSERT INTO sources (id, organization, title, canonical_url, jurisdiction, source_type, published_at, updated_at, last_verified_at, next_review_at, status, superseded_by, access_mode, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
  );
  for (const s of compiled.sources) {
    insertSource.run(s.id, s.organization, s.title, s.canonicalUrl, s.jurisdiction, s.sourceType, s.publishedAt ?? null, s.updatedAt ?? null, s.lastVerifiedAt, s.nextReviewAt ?? null, s.status, s.supersededBy ?? null, s.accessMode, s.notes ?? null);
  }

  const insertClaim = db.prepare(
    "INSERT INTO claims (id, domain, text_key, public_slug, guidance_class, precision_class, safety_level, uncertainty_note_key, reviewed_at, review_status) VALUES (?,?,?,?,?,?,?,?,?,?)",
  );
  const insertApplicability = db.prepare("INSERT INTO claim_applicability (claim_id, kind, tag) VALUES (?,?,?)");
  const insertRef = db.prepare(
    "INSERT INTO claim_source_refs (claim_id, position, source_id, relationship, verified_at, support_note_key, locator_heading, locator_section, locator_anchor, locator_page, locator_table, locator_figure, locator_paragraph_hint, locator_source_version_hint) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
  );
  for (const c of compiled.claims) {
    insertClaim.run(c.id, c.domain, c.textKey, c.publicSlug, c.guidanceClass, c.precisionClass, c.safetyLevel, c.uncertaintyNoteKey ?? null, c.reviewedAt, c.reviewStatus);
    for (const tag of [...(c.applicability ?? [])].sort()) insertApplicability.run(c.id, "applicability", tag);
    for (const tag of [...(c.exclusions ?? [])].sort()) insertApplicability.run(c.id, "exclusion", tag);
    c.sourceRefs.forEach((ref, position) => {
      const l = ref.locator ?? {};
      insertRef.run(c.id, position, ref.sourceId, ref.relationship, ref.verifiedAt, ref.supportNoteKey ?? null, l.heading ?? null, l.section ?? null, l.anchor ?? null, l.page ?? null, l.table ?? null, l.figure ?? null, l.paragraphHint ?? null, l.sourceVersionHint ?? null);
    });
  }

  const insertBlock = db.prepare("INSERT INTO guidance_blocks (id, domain, stage, title_key) VALUES (?,?,?,?)");
  const insertBlockClaim = db.prepare("INSERT INTO guidance_block_claims (block_id, position, claim_id) VALUES (?,?,?)");
  const insertBlockRoute = db.prepare("INSERT INTO guidance_block_routes (block_id, route) VALUES (?,?)");
  for (const b of compiled.guidance) {
    insertBlock.run(b.id, b.domain, b.stage ?? null, b.titleKey);
    b.claimIds.forEach((claimId, position) => insertBlockClaim.run(b.id, position, claimId));
    for (const route of [...b.routes].sort()) insertBlockRoute.run(b.id, route);
  }

  const insertTranslation = db.prepare("INSERT INTO translations (locale, key, value) VALUES (?,?,?)");
  for (const locale of Object.keys(compiled.translations).sort()) {
    const strings = compiled.translations[locale]!;
    for (const key of Object.keys(strings).sort()) insertTranslation.run(locale, key, strings[key]!);
  }

  const insertTool = db.prepare("INSERT INTO tools (id, title, tool_class, lifecycle) VALUES (?,?,?,?)");
  const insertToolClaim = db.prepare("INSERT INTO tool_claims (tool_id, kind, claim_id) VALUES (?,?,?)");
  for (const t of compiled.tools) {
    insertTool.run(t.id, t.title, t.toolClass, t.lifecycle);
    for (const claimId of [...(t.guidanceClaimIds ?? [])].sort()) insertToolClaim.run(t.id, "guidance", claimId);
    for (const claimId of [...(t.safetyClaimIds ?? [])].sort()) insertToolClaim.run(t.id, "safety", claimId);
  }

  db.exec("COMMIT");
}

/** Build `knowledge.sqlite` at `outPath`, replacing any previous database only on success. */
export function writeKnowledgeSqlite(compiled: CompiledKnowledge, outPath: string): void {
  const tmpPath = `${outPath}.building`;
  rmSync(tmpPath, { force: true });
  const db = new DatabaseSync(tmpPath);
  try {
    populate(db, compiled);
  } catch (error) {
    db.close();
    rmSync(tmpPath, { force: true });
    throw error;
  }
  db.close();
  rmSync(outPath, { force: true });
  renameSync(tmpPath, outPath);
}
