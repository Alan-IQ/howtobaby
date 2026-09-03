// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Phase 3 gate (docs/IMPLEMENTATION_ROADMAP.md): static public age routes cover every stage bin,
 * and exact child data never enters a URL or document metadata.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { allStages, STAGE_DOMAINS, stagesFor } from "@howtobaby/core";

import { STAGE_DESTINATIONS, stageForRoute, stageHref, stageStaticParams } from "./routes";
import { stageMetadata } from "./StagePage";

const BROAD_STAGE_HREF = /^\/(play|feeding|sleep)\/\d{1,2}-\d{1,2}-(months|years)$/;

describe("static stage routes", () => {
  it("generate exactly one static param per stage bin in every destination", () => {
    for (const domain of STAGE_DOMAINS) {
      const params = stageStaticParams(domain);
      expect(params.map((p) => p.stage)).toEqual(stagesFor(domain).map((s) => s.slug));
      for (const { stage } of params) expect(stageForRoute(domain, stage)?.domain).toBe(domain);
    }
    expect(stageStaticParams("development")).toHaveLength(12);
    expect(stageStaticParams("feeding")).toHaveLength(7);
    expect(stageStaticParams("sleep")).toHaveLength(14);
  });

  it("hrefs encode broad age state only", () => {
    for (const stage of allStages()) expect(stageHref(stage)).toMatch(BROAD_STAGE_HREF);
    expect(stageHref(stagesFor("development")[3]!)).toBe("/play/6-9-months");
    expect(stageHref(stagesFor("feeding")[2]!)).toBe("/feeding/6-8-months");
    expect(stageForRoute("feeding", "2025-01-01")).toBeUndefined();
    expect(stageForRoute("feeding", "6-9-months")).toBeUndefined(); // slugs are per-domain bins, not free-form ages
  });

  it("route segments are declared with dynamicParams off (no request-time slugs)", () => {
    for (const domain of STAGE_DOMAINS) {
      const source = readFileSync(join(__dirname, "..", "..", "app", STAGE_DESTINATIONS[domain].base.slice(1), "[stage]", "page.tsx"), "utf8");
      expect(source).toContain("export const dynamicParams = false");
      expect(source).toContain("generateStaticParams");
    }
  });

  it("document metadata derives from the stage bin alone, in the canonical locale", async () => {
    const metadata = await stageMetadata("development", { params: Promise.resolve({ stage: "6-9-months" }) });
    expect(metadata).toEqual({ title: "Play & Development · 6 to under 9 months" });
    const feeding = await stageMetadata("feeding", { params: Promise.resolve({ stage: "6-8-months" }) });
    expect(feeding.title).toBe("Feeding · about 6 to under 8 months");
    expect(await stageMetadata("sleep", { params: Promise.resolve({ stage: "unknown" }) })).toEqual({});
    for (const domain of STAGE_DOMAINS) {
      for (const stage of stagesFor(domain)) {
        const { title } = await stageMetadata(domain, { params: Promise.resolve({ stage: stage.slug }) });
        expect(String(title)).not.toMatch(/\d{4}-\d{2}-\d{2}/);
      }
    }
  });
});

describe("exact child data stays out of URLs, metadata and server rendering", () => {
  const srcDir = join(__dirname, "..", "..");
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (/\.tsx?$/.test(entry.name) && !entry.name.includes(".test.")) files.push(path);
    }
  };
  walk(srcDir);

  it("only client components (and the storage module itself) read the child profile", () => {
    const readers = files.filter((file) => {
      const source = readFileSync(file, "utf8");
      return /child-profile-store|useChildProfile|useGuidanceContext/.test(source);
    });
    expect(readers.length).toBeGreaterThan(0);
    // Framework-free modules (the store and the client state machine) hold no React; everything
    // that imports them must itself be a client component.
    const frameworkFree = [join("storage", "child-profile-store.ts"), join("features", "profile", "profile-state.ts")];
    for (const file of readers) {
      if (frameworkFree.some((suffix) => file.endsWith(suffix))) continue;
      expect(readFileSync(file, "utf8"), `${file} reads the profile and must be a client component`).toMatch(/^"use client";/m);
    }
    const stateImporters = files.filter((file) => /profile-state["']/.test(readFileSync(file, "utf8")));
    expect(stateImporters.length).toBeGreaterThan(0);
    for (const file of stateImporters) expect(readFileSync(file, "utf8"), file).toMatch(/^"use client";/m);
  });

  it("no route reads search params or serializes the profile into a query string", () => {
    for (const file of files) {
      if (file.includes("theme-lab")) continue; // dev-only theme preview override, never profile data
      const source = readFileSync(file, "utf8");
      expect(source, file).not.toMatch(/useSearchParams|searchParams|URLSearchParams/);
    }
  });

  it("the profile store never writes a URL, cookie or network request", () => {
    const source = readFileSync(join(srcDir, "storage", "child-profile-store.ts"), "utf8");
    expect(source).not.toMatch(/document\.cookie|fetch\(|navigator\.sendBeacon|location\./);
  });
});
