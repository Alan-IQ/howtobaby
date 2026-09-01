// SPDX-License-Identifier: AGPL-3.0-only
/**
 * SQLiteKnowledgeRepository — KnowledgeRepository over the derived `knowledge.sqlite`
 * (docs/SYSTEM_ARCHITECTURE.md §5.1/§5.2). Used by build scripts, validation, reports and
 * Evidence Watch impact analysis; the browser never ships this database.
 *
 * The source → claim → route/tool impact lookup here is the canonical reverse-dependency query
 * required by the Phase 2 gate — it resolves entirely inside SQL from normalized tables.
 */

import { DatabaseSync } from "node:sqlite";

import type { ClaimEvidenceEntry, CompiledClaim, PublicSourceEntry, RouteEvidenceEntry } from "../src/compile.ts";
import type { ClaimSourceRef, ContentVersionRecord, GuidanceBlock, Locale, SourceLocator, SourceRecord } from "../src/schemas/types.ts";
import type { ClaimId, GuidanceQuery, KnowledgeRepository, SourceId, SourceImpact } from "./types.ts";

type Row = Record<string, string | number | bigint | Uint8Array | null>;

function str(row: Row, key: string): string {
  return String(row[key]);
}

function optStr(row: Row, key: string): string | undefined {
  const value = row[key];
  return value === null || value === undefined ? undefined : String(value);
}

export class SQLiteKnowledgeRepository implements KnowledgeRepository {
  private readonly db: DatabaseSync;

  constructor(databasePath: string) {
    this.db = new DatabaseSync(databasePath, { readOnly: true });
  }

  close(): void {
    this.db.close();
  }

  private sourceRefs(claimId: string): ClaimSourceRef[] {
    const rows = this.db
      .prepare("SELECT * FROM claim_source_refs WHERE claim_id = ? ORDER BY position")
      .all(claimId) as Row[];
    return rows.map((row) => {
      const locator: SourceLocator = {};
      if (row["locator_heading"] !== null) locator.heading = str(row, "locator_heading");
      if (row["locator_section"] !== null) locator.section = str(row, "locator_section");
      if (row["locator_anchor"] !== null) locator.anchor = str(row, "locator_anchor");
      if (row["locator_page"] !== null) locator.page = Number(row["locator_page"]);
      if (row["locator_table"] !== null) locator.table = str(row, "locator_table");
      if (row["locator_figure"] !== null) locator.figure = str(row, "locator_figure");
      if (row["locator_paragraph_hint"] !== null) locator.paragraphHint = str(row, "locator_paragraph_hint");
      if (row["locator_source_version_hint"] !== null) locator.sourceVersionHint = str(row, "locator_source_version_hint");
      const supportNoteKey = optStr(row, "support_note_key");
      return {
        sourceId: str(row, "source_id"),
        relationship: str(row, "relationship") as ClaimSourceRef["relationship"],
        verifiedAt: str(row, "verified_at"),
        ...(Object.keys(locator).length > 0 ? { locator } : {}),
        ...(supportNoteKey !== undefined ? { supportNoteKey } : {}),
      };
    });
  }

  private claimFromRow(row: Row): CompiledClaim {
    const id = str(row, "id");
    const tags = this.db.prepare("SELECT kind, tag FROM claim_applicability WHERE claim_id = ? ORDER BY kind, tag").all(id) as Row[];
    const applicability = tags.filter((t) => t["kind"] === "applicability").map((t) => str(t, "tag"));
    const exclusions = tags.filter((t) => t["kind"] === "exclusion").map((t) => str(t, "tag"));
    const uncertaintyNoteKey = optStr(row, "uncertainty_note_key");
    return {
      id,
      domain: str(row, "domain") as CompiledClaim["domain"],
      textKey: str(row, "text_key"),
      publicSlug: str(row, "public_slug"),
      guidanceClass: str(row, "guidance_class") as CompiledClaim["guidanceClass"],
      precisionClass: str(row, "precision_class") as CompiledClaim["precisionClass"],
      safetyLevel: str(row, "safety_level") as CompiledClaim["safetyLevel"],
      sourceRefs: this.sourceRefs(id),
      reviewedAt: str(row, "reviewed_at"),
      reviewStatus: str(row, "review_status") as CompiledClaim["reviewStatus"],
      ...(applicability.length > 0 ? { applicability } : {}),
      ...(exclusions.length > 0 ? { exclusions } : {}),
      ...(uncertaintyNoteKey !== undefined ? { uncertaintyNoteKey } : {}),
    };
  }

  async getClaim(id: ClaimId): Promise<CompiledClaim | null> {
    const row = this.db.prepare("SELECT * FROM claims WHERE id = ?").get(id) as Row | undefined;
    return row ? this.claimFromRow(row) : null;
  }

  async getSource(id: SourceId): Promise<SourceRecord | null> {
    const row = this.db.prepare("SELECT * FROM sources WHERE id = ?").get(id) as Row | undefined;
    if (!row) return null;
    const publishedAt = optStr(row, "published_at");
    const updatedAt = optStr(row, "updated_at");
    const nextReviewAt = optStr(row, "next_review_at");
    const supersededBy = optStr(row, "superseded_by");
    const approvedScopesRaw = optStr(row, "approved_scopes");
    const approvedScopes = approvedScopesRaw !== undefined ? (JSON.parse(approvedScopesRaw) as SourceRecord["approvedScopes"]) : undefined;
    const notes = optStr(row, "notes");
    return {
      id: str(row, "id"),
      organization: str(row, "organization"),
      title: str(row, "title"),
      canonicalUrl: str(row, "canonical_url"),
      jurisdiction: str(row, "jurisdiction"),
      sourceType: str(row, "source_type"),
      lastVerifiedAt: str(row, "last_verified_at"),
      status: str(row, "status") as SourceRecord["status"],
      accessMode: str(row, "access_mode") as SourceRecord["accessMode"],
      approvalLevel: str(row, "approval_level") as SourceRecord["approvalLevel"],
      ...(approvedScopes !== undefined ? { approvedScopes } : {}),
      ...(publishedAt !== undefined ? { publishedAt } : {}),
      ...(updatedAt !== undefined ? { updatedAt } : {}),
      ...(nextReviewAt !== undefined ? { nextReviewAt } : {}),
      ...(supersededBy !== undefined ? { supersededBy } : {}),
      ...(notes !== undefined ? { notes } : {}),
    };
  }

  async findGuidance(query: GuidanceQuery): Promise<GuidanceBlock[]> {
    const rows = this.db.prepare("SELECT * FROM guidance_blocks ORDER BY id").all() as Row[];
    const blocks = rows.map((row) => {
      const id = str(row, "id");
      const claimIds = (this.db.prepare("SELECT claim_id FROM guidance_block_claims WHERE block_id = ? ORDER BY position").all(id) as Row[]).map((r) => str(r, "claim_id"));
      const routes = (this.db.prepare("SELECT route FROM guidance_block_routes WHERE block_id = ? ORDER BY route").all(id) as Row[]).map((r) => str(r, "route"));
      const stage = optStr(row, "stage");
      return {
        id,
        domain: str(row, "domain") as GuidanceBlock["domain"],
        titleKey: str(row, "title_key"),
        claimIds,
        routes,
        ...(stage !== undefined ? { stage } : {}),
      };
    });
    return blocks.filter(
      (block) =>
        (query.domain === undefined || block.domain === query.domain) &&
        (query.stage === undefined || block.stage === query.stage) &&
        (query.route === undefined || block.routes.includes(query.route)),
    );
  }

  async findClaimsBySource(sourceId: SourceId): Promise<CompiledClaim[]> {
    const rows = this.db
      .prepare("SELECT DISTINCT c.* FROM claims c JOIN claim_source_refs r ON r.claim_id = c.id WHERE r.source_id = ? ORDER BY c.id")
      .all(sourceId) as Row[];
    return rows.map((row) => this.claimFromRow(row));
  }

  async getClaimEvidence(id: ClaimId): Promise<ClaimEvidenceEntry | null> {
    const claim = await this.getClaim(id);
    if (!claim) return null;
    const pending = this.db
      .prepare("SELECT 1 AS hit FROM claim_source_refs r JOIN sources s ON s.id = r.source_id WHERE r.claim_id = ? AND s.status = 'changed-review-required' LIMIT 1")
      .get(id) as Row | undefined;
    return {
      claimId: claim.id,
      domain: claim.domain,
      publicSlug: claim.publicSlug,
      textKey: claim.textKey,
      guidanceClass: claim.guidanceClass,
      precisionClass: claim.precisionClass,
      safetyLevel: claim.safetyLevel,
      reviewStatus: claim.reviewStatus,
      reviewedAt: claim.reviewedAt,
      sourceReviewPending: pending !== undefined,
      ...(claim.uncertaintyNoteKey !== undefined ? { uncertaintyNoteKey: claim.uncertaintyNoteKey } : {}),
      sourceRefs: claim.sourceRefs,
    };
  }

  async listClaimEvidence(): Promise<ClaimEvidenceEntry[]> {
    const rows = this.db.prepare("SELECT id FROM claims ORDER BY id").all() as Row[];
    const entries: ClaimEvidenceEntry[] = [];
    for (const row of rows) {
      const entry = await this.getClaimEvidence(str(row, "id"));
      if (entry) entries.push(entry);
    }
    return entries;
  }

  async getRouteEvidence(route: string): Promise<RouteEvidenceEntry | null> {
    const claimRows = this.db
      .prepare(
        "SELECT DISTINCT bc.claim_id AS claim_id FROM guidance_block_routes br JOIN guidance_block_claims bc ON bc.block_id = br.block_id WHERE br.route = ? ORDER BY bc.claim_id",
      )
      .all(route) as Row[];
    if (claimRows.length === 0) return null;
    const claimIds = claimRows.map((r) => str(r, "claim_id"));
    const sourceRows = this.db
      .prepare(
        "SELECT DISTINCT r.source_id AS source_id FROM guidance_block_routes br JOIN guidance_block_claims bc ON bc.block_id = br.block_id JOIN claim_source_refs r ON r.claim_id = bc.claim_id WHERE br.route = ? ORDER BY r.source_id",
      )
      .all(route) as Row[];
    return { route, claimIds, sourceIds: sourceRows.map((r) => str(r, "source_id")) };
  }

  /** The Phase 2 gate query: one source → dependent claims → affected routes and tools. */
  async getSourceImpact(sourceId: SourceId): Promise<SourceImpact> {
    const claimIds = (this.db.prepare("SELECT DISTINCT claim_id FROM claim_source_refs WHERE source_id = ? ORDER BY claim_id").all(sourceId) as Row[]).map((r) => str(r, "claim_id"));
    const routes = (this.db
      .prepare(
        "SELECT DISTINCT br.route AS route FROM claim_source_refs r JOIN guidance_block_claims bc ON bc.claim_id = r.claim_id JOIN guidance_block_routes br ON br.block_id = bc.block_id WHERE r.source_id = ? ORDER BY br.route",
      )
      .all(sourceId) as Row[]).map((r) => str(r, "route"));
    const toolIds = (this.db
      .prepare(
        "SELECT DISTINCT tc.tool_id AS tool_id FROM claim_source_refs r JOIN tool_claims tc ON tc.claim_id = r.claim_id WHERE r.source_id = ? ORDER BY tc.tool_id",
      )
      .all(sourceId) as Row[]).map((r) => str(r, "tool_id"));
    return { sourceId, claimIds, routes, toolIds };
  }

  async listPublicSources(): Promise<PublicSourceEntry[]> {
    const rows = this.db
      .prepare(
        "SELECT s.*, (SELECT COUNT(DISTINCT r.claim_id) FROM claim_source_refs r WHERE r.source_id = s.id) AS claim_count FROM sources s ORDER BY s.id",
      )
      .all() as Row[];
    return rows.map((row) => {
      const publishedAt = optStr(row, "published_at");
      const updatedAt = optStr(row, "updated_at");
      return {
        sourceId: str(row, "id"),
        organization: str(row, "organization"),
        title: str(row, "title"),
        canonicalUrl: str(row, "canonical_url"),
        jurisdiction: str(row, "jurisdiction"),
        sourceType: str(row, "source_type"),
        status: str(row, "status") as PublicSourceEntry["status"],
        ...(publishedAt !== undefined ? { publishedAt } : {}),
        ...(updatedAt !== undefined ? { updatedAt } : {}),
        lastVerifiedAt: str(row, "last_verified_at"),
        claimCount: Number(row["claim_count"]),
      };
    });
  }

  async getText(locale: Locale, key: string): Promise<string | null> {
    const row = this.db.prepare("SELECT value FROM translations WHERE locale = ? AND key = ?").get(locale, key) as Row | undefined;
    return row ? str(row, "value") : null;
  }

  async getContentVersion(): Promise<ContentVersionRecord> {
    const rows = this.db.prepare("SELECT key, value FROM meta ORDER BY key").all() as Row[];
    const meta = new Map(rows.map((r) => [str(r, "key"), str(r, "value")]));
    const localeVersions: Record<string, string> = {};
    for (const [key, value] of meta) {
      if (key.startsWith("locale_version_")) localeVersions[key.slice("locale_version_".length)] = value;
    }
    return {
      contentVersion: meta.get("content_version") ?? "",
      sourceRegistryVersion: meta.get("source_registry_version") ?? "",
      localeVersions,
    };
  }
}
