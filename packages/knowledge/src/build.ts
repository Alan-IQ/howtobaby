// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Writes the derived read models into a generated directory (normally
 * packages/knowledge/generated — gitignored, rebuilt locally/CI, cacheable as a CI artifact).
 *
 * Split matches the two build scripts:
 *   - "knowledge": knowledge.sqlite + content/source/evidence manifests + content-version.json;
 *   - "evidence": the reverse evidence indexes from docs/EVIDENCE_PROVENANCE.md §17.
 *
 * Every artifact except build-info.json is a pure function of the canonical YAML bytes;
 * build-info.json carries the volatile ContentRelease fields (builtAt/gitSha) and is excluded
 * from the deterministic-rebuild comparison.
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { generatedJsonArtifacts, stableStringify, type CompiledKnowledge } from "./compile.ts";
import { writeKnowledgeSqlite } from "./sqlite.ts";

export type GeneratedSubset = "knowledge" | "evidence" | "all";

const KNOWLEDGE_FILES = ["content-manifest.json", "source-manifest.json", "evidence-manifest.json", "content-version.json"] as const;
const EVIDENCE_FILES = [
  "claim-evidence-index.json",
  "source-claim-index.json",
  "route-evidence-index.json",
  "tool-evidence-index.json",
  "source-public-index.json",
] as const;

/** Files whose bytes must be identical across rebuilds (build-info.json is deliberately absent). */
export const DETERMINISTIC_ARTIFACTS: readonly string[] = ["knowledge.sqlite", ...KNOWLEDGE_FILES, ...EVIDENCE_FILES];

function gitSha(): string {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

/** Write the selected derived artifacts; returns the repo-relative names written. */
export function writeGeneratedArtifacts(compiled: CompiledKnowledge, outDir: string, subset: GeneratedSubset): string[] {
  mkdirSync(outDir, { recursive: true });
  const artifacts = generatedJsonArtifacts(compiled);
  const written: string[] = [];

  if (subset === "knowledge" || subset === "all") {
    writeKnowledgeSqlite(compiled, join(outDir, "knowledge.sqlite"));
    written.push("knowledge.sqlite");
    for (const name of KNOWLEDGE_FILES) {
      writeFileSync(join(outDir, name), artifacts.get(name)!);
      written.push(name);
    }
    // Volatile release metadata (SYSTEM_ARCHITECTURE.md §11) — never part of determinism checks.
    writeFileSync(
      join(outDir, "build-info.json"),
      stableStringify({ builtAt: new Date().toISOString(), gitSha: gitSha(), contentVersion: compiled.contentVersion.contentVersion }),
    );
    written.push("build-info.json");
  }

  if (subset === "evidence" || subset === "all") {
    for (const name of EVIDENCE_FILES) {
      writeFileSync(join(outDir, name), artifacts.get(name)!);
      written.push(name);
    }
  }

  return written;
}
