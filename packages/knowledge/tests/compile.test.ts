// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Deterministic-rebuild and reverse-index proofs (Phase 2 gates): rebuilding every derived
 * artifact from the same canonical bytes is byte-identical (knowledge.sqlite included), the four
 * evidence indexes carry the expected graph, and the content version moves when canonical
 * content changes.
 */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { DETERMINISTIC_ARTIFACTS, compileKnowledge, generatedJsonArtifacts, writeGeneratedArtifacts } from "../src/index.ts";
import { DATED_REGISTRY, VALID_FIXTURE, cleanupFixture, loadFixture } from "./helpers.ts";

function hash(buffer: Buffer | string): string {
  return createHash("sha256").update(buffer).digest("hex");
}

/**
 * Two full from-scratch builds including two `knowledge.sqlite` files: an integration test, not a
 * unit test. On a shared CI runner with the workspace test suites running in parallel it has been
 * observed to take just over vitest's 5 s default, so it carries an explicit budget of its own —
 * the byte-identity assertion is the gate, wall-clock is not.
 */
const FROM_SCRATCH_BUILD_TIMEOUT_MS = 60_000;

describe("deterministic rebuild", () => {
  it("produces byte-identical artifacts across two independent from-scratch builds", { timeout: FROM_SCRATCH_BUILD_TIMEOUT_MS }, () => {
    const a = loadFixture();
    const b = loadFixture();
    writeGeneratedArtifacts(compileKnowledge(a.knowledge), join(a.dir, "out"), "all");
    writeGeneratedArtifacts(compileKnowledge(b.knowledge), join(b.dir, "out"), "all");
    for (const name of DETERMINISTIC_ARTIFACTS) {
      expect(hash(readFileSync(join(a.dir, "out", name))), name).toBe(hash(readFileSync(join(b.dir, "out", name))));
    }
    cleanupFixture(a.dir);
    cleanupFixture(b.dir);
  });

  it("changes the content version when canonical content changes", () => {
    const a = loadFixture();
    const b = loadFixture({
      "translations/en/feeding.yaml": VALID_FIXTURE["translations/en/feeding.yaml"]!.replace("Starting solid foods", "Beginning solid foods"),
    });
    const versionA = compileKnowledge(a.knowledge).contentVersion;
    const versionB = compileKnowledge(b.knowledge).contentVersion;
    expect(versionA.contentVersion).not.toBe(versionB.contentVersion);
    expect(versionA.sourceRegistryVersion).toBe(versionB.sourceRegistryVersion); // registry unchanged
    expect(versionA.localeVersions["vi"]).toBe(versionB.localeVersions["vi"]); // vi unchanged
    expect(versionA.localeVersions["en"]).not.toBe(versionB.localeVersions["en"]);
    cleanupFixture(a.dir);
    cleanupFixture(b.dir);
  });
});

describe("reverse evidence indexes", () => {
  const { knowledge, dir } = loadFixture();
  cleanupFixture(dir);
  const compiled = compileKnowledge(knowledge);

  it("claim-evidence carries provenance for the claim", () => {
    expect(compiled.claimEvidence).toHaveLength(1);
    const entry = compiled.claimEvidence[0]!;
    expect(entry.claimId).toBe("feeding.solids.start");
    expect(entry.sourceReviewPending).toBe(false);
    expect(entry.sourceRefs.map((r) => r.sourceId)).toEqual(["cdc-introduction-solid-foods", "who-complementary-feeding"]);
  });

  it("source-claim maps both sources back to the claim", () => {
    expect(compiled.sourceClaims).toEqual([
      { sourceId: "cdc-introduction-solid-foods", claimIds: ["feeding.solids.start"] },
      { sourceId: "who-complementary-feeding", claimIds: ["feeding.solids.start"] },
    ]);
  });

  it("route-evidence derives /feeding from guidance blocks", () => {
    expect(compiled.routeEvidence).toEqual([
      { route: "/feeding", claimIds: ["feeding.solids.start"], sourceIds: ["cdc-introduction-solid-foods", "who-complementary-feeding"] },
    ]);
  });

  it("tool-evidence resolves the fixture tool's claims and sources", () => {
    expect(compiled.toolEvidence).toEqual([
      {
        toolId: "tool.fixture.evidence-pipeline",
        toolClass: "guidance-linked",
        lifecycle: "fixture",
        claimIds: ["feeding.solids.start"],
        sourceIds: ["cdc-introduction-solid-foods", "who-complementary-feeding"],
      },
    ]);
  });

  it("public source index exposes only trust metadata with claim counts", () => {
    const cdc = compiled.publicSources.find((s) => s.sourceId === "cdc-introduction-solid-foods")!;
    expect(cdc.claimCount).toBe(1);
    // No source-version dates in the fixture → the keys are omitted, never emitted as null/invented.
    expect(Object.keys(cdc).sort()).toEqual([
      "canonicalUrl", "claimCount", "jurisdiction", "lastVerifiedAt", "organization", "sourceId", "sourceType", "status", "title",
    ]);
  });

  it("public source index carries the authority's publishedAt/updatedAt exactly as authored", () => {
    const { knowledge, dir } = loadFixture({ "sources/registry.yaml": DATED_REGISTRY });
    cleanupFixture(dir);
    const { publicSources } = compileKnowledge(knowledge);
    const cdc = publicSources.find((s) => s.sourceId === "cdc-introduction-solid-foods")!;
    const who = publicSources.find((s) => s.sourceId === "who-complementary-feeding")!;
    expect(cdc.updatedAt).toBe("2026-04-14");
    expect(cdc.publishedAt).toBeUndefined();
    expect(who.publishedAt).toBe("2026-08-04");
    expect(who.updatedAt).toBeUndefined();
    const json = JSON.parse(generatedJsonArtifacts(compileKnowledge(knowledge)).get("source-public-index.json")!) as Array<Record<string, unknown>>;
    expect(json.find((s) => s["sourceId"] === "cdc-introduction-solid-foods")!["updatedAt"]).toBe("2026-04-14");
    expect(json.find((s) => s["sourceId"] === "who-complementary-feeding")!["publishedAt"]).toBe("2026-08-04");
  });

  it("keeps publishedAt and updatedAt both when the authority states both — even when equal — never deriving one from the other", () => {
    const registry = DATED_REGISTRY.replace("    updatedAt: 2026-04-14\n", "    publishedAt: 2026-04-14\n    updatedAt: 2026-04-14\n");
    const { knowledge, dir } = loadFixture({ "sources/registry.yaml": registry });
    cleanupFixture(dir);
    const cdc = compileKnowledge(knowledge).publicSources.find((s) => s.sourceId === "cdc-introduction-solid-foods")!;
    expect(cdc.publishedAt).toBe("2026-04-14");
    expect(cdc.updatedAt).toBe("2026-04-14");
    const who = compileKnowledge(knowledge).publicSources.find((s) => s.sourceId === "who-complementary-feeding")!;
    expect(who.updatedAt).toBeUndefined(); // publishedAt only: updatedAt is not invented from it
  });

  it("stable JSON serialization sorts keys recursively", () => {
    const artifacts = generatedJsonArtifacts(compiled);
    const text = artifacts.get("claim-evidence-index.json")!;
    expect(text).toBe(artifacts.get("claim-evidence-index.json"));
    const parsed = JSON.parse(text) as Array<Record<string, unknown>>;
    expect(Object.keys(parsed[0]!)).toEqual([...Object.keys(parsed[0]!)].sort());
  });
});

describe("source lifecycle propagation into the read model", () => {
  it("flags claim evidence as review-pending when a supporting source is changed-review-required", () => {
    const { knowledge, dir } = loadFixture({
      "sources/registry.yaml": VALID_FIXTURE["sources/registry.yaml"]!.replace(
        `    lastVerifiedAt: 2026-08-30
    verifiedBy: maintainer
    status: current
    accessMode: link-only
    approvalLevel: approved-primary
    approvedScopes: [feeding]
  - id: who-complementary-feeding`,
        `    lastVerifiedAt: 2026-08-30
    verifiedBy: maintainer
    status: changed-review-required
    accessMode: link-only
    approvalLevel: approved-primary
    approvedScopes: [feeding]
  - id: who-complementary-feeding`,
      ),
    });
    cleanupFixture(dir);
    const entry = compileKnowledge(knowledge).claimEvidence[0]!;
    expect(entry.sourceReviewPending).toBe(true);
  });
});
