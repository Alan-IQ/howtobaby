// SPDX-License-Identifier: AGPL-3.0-only
/**
 * KnowledgeRepository proofs: the SQLite and Generated (JSON) read models answer the same
 * questions from the same canonical build — including the Phase 2 gate query
 * source → claim → route/tool impact — and no canonical data exists only in a derived store
 * (every projection row round-trips back to the loaded canonical records).
 */

import { join } from "node:path";

import { afterAll, describe, expect, it } from "vitest";

import { GeneratedKnowledgeRepository } from "../repository/generated.ts";
import { SQLiteKnowledgeRepository } from "../repository/sqlite.ts";
import type { KnowledgeRepository } from "../repository/types.ts";
import { compileKnowledge, writeGeneratedArtifacts } from "../src/index.ts";
import { cleanupFixture, loadFixture } from "./helpers.ts";

const { knowledge, dir } = loadFixture();
const outDir = join(dir, "generated");
const compiled = compileKnowledge(knowledge);
writeGeneratedArtifacts(compiled, outDir, "all");

const sqliteRepo = new SQLiteKnowledgeRepository(join(outDir, "knowledge.sqlite"));
const generatedRepo = new GeneratedKnowledgeRepository(outDir);

afterAll(() => {
  sqliteRepo.close();
  cleanupFixture(dir);
});

const implementations: Array<[string, KnowledgeRepository]> = [
  ["SQLiteKnowledgeRepository", sqliteRepo],
  ["GeneratedKnowledgeRepository", generatedRepo],
];

describe.each(implementations)("%s", (_name, repo) => {
  it("resolves a claim with full provenance", async () => {
    const claim = await repo.getClaim("feeding.solids.start");
    expect(claim).not.toBeNull();
    expect(claim!.guidanceClass).toBe("official-guidance");
    expect(claim!.sourceRefs.map((r) => [r.sourceId, r.relationship])).toEqual([
      ["cdc-introduction-solid-foods", "primary"],
      ["who-complementary-feeding", "corroborating"],
    ]);
    expect(await repo.getClaim("feeding.unknown")).toBeNull();
  });

  it("resolves sources and finds claims by source", async () => {
    const source = await repo.getSource("who-complementary-feeding");
    expect(source?.organization).toBe("WHO");
    const claims = await repo.findClaimsBySource("who-complementary-feeding");
    expect(claims.map((c) => c.id)).toEqual(["feeding.solids.start"]);
  });

  it("finds guidance by domain/stage/route", async () => {
    expect((await repo.findGuidance({ route: "/feeding" })).map((b) => b.id)).toEqual(["guidance.feeding.solids-start"]);
    expect((await repo.findGuidance({ domain: "feeding", stage: "feed-06-08m" })).map((b) => b.id)).toEqual(["guidance.feeding.solids-start"]);
    expect(await repo.findGuidance({ route: "/sleep" })).toEqual([]);
  });

  it("answers the gate query: source → claim → route/tool impact", async () => {
    const impact = await repo.getSourceImpact("cdc-introduction-solid-foods");
    expect(impact).toEqual({
      sourceId: "cdc-introduction-solid-foods",
      claimIds: ["feeding.solids.start"],
      routes: ["/feeding"],
      toolIds: ["tool.fixture.evidence-pipeline"],
    });
    const noImpact = await repo.getSourceImpact("unknown-source");
    expect(noImpact.claimIds).toEqual([]);
    expect(noImpact.routes).toEqual([]);
    expect(noImpact.toolIds).toEqual([]);
  });

  it("serves route evidence, translations and the content version", async () => {
    const route = await repo.getRouteEvidence("/feeding");
    expect(route?.sourceIds).toEqual(["cdc-introduction-solid-foods", "who-complementary-feeding"]);
    expect(await repo.getText("vi", "feeding.solids.start")).toContain("khoảng 6 tháng");
    expect(await repo.getText("en", "guidance.feeding.solids-start.title")).toBe("Starting solid foods");
    expect((await repo.getContentVersion()).contentVersion).toBe(compiled.contentVersion.contentVersion);
  });
});

describe("canonical-vs-derived invariant", () => {
  it("both read models agree with each other and with the canonical projection", async () => {
    const [sqliteClaim, generatedClaim] = await Promise.all([
      sqliteRepo.getClaim("feeding.solids.start"),
      generatedRepo.getClaim("feeding.solids.start"),
    ]);
    expect(sqliteClaim).toEqual(generatedClaim);
    expect(sqliteClaim).toEqual(compiled.claims[0]);
    expect(await sqliteRepo.listClaimEvidence()).toEqual(await generatedRepo.listClaimEvidence());
    expect(await sqliteRepo.listPublicSources()).toEqual(await generatedRepo.listPublicSources());
  });
});
