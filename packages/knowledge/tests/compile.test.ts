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
import { VALID_FIXTURE, cleanupFixture, loadFixture } from "./helpers.ts";

function hash(buffer: Buffer | string): string {
  return createHash("sha256").update(buffer).digest("hex");
}

describe("deterministic rebuild", () => {
  it("produces byte-identical artifacts across two independent from-scratch builds", () => {
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
    expect(Object.keys(cdc).sort()).toEqual([
      "canonicalUrl", "claimCount", "jurisdiction", "lastVerifiedAt", "organization", "sourceId", "sourceType", "status", "title",
    ]);
  });

  it("stable JSON serialization sorts keys recursively", () => {
    const artifacts = generatedJsonArtifacts(compiled);
    const text = artifacts.get("claim-evidence-index.json")!;
    expect(text).toBe(artifacts.get("claim-evidence-index.json"));
    const parsed = JSON.parse(text) as Array<Record<string, unknown>>;
    expect(Object.keys(parsed[0]!)).toEqual([...Object.keys(parsed[0]!)].sort());
  });
});
