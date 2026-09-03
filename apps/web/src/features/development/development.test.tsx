// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Phase 4 gate (docs/IMPLEMENTATION_ROADMAP.md) on the app side: the Play & Development stage
 * pages resolve the whole canonical stage graph in contract section order, present milestones as
 * reference lists (never checkboxes, scores or deadlines), state the CDC checklist resolution on
 * every stage page (younger checklist between checklist ages; none under 2 months), keep the
 * actual child's context out of prerendered HTML, and expose original-source provenance for every
 * shipped claim through the canonical evidence surfaces — on the stage routes and on the
 * all-stages print route.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { cdcChecklistForStage, stageById, stagesFor } from "@howtobaby/core";

import { formatChecklistAge } from "@/features/context/format";
import { ALL_STAGES_ROUTE, stageHref } from "@/features/context/routes";
import { WhyThisStage } from "@/features/context/WhyThisStage";
import { GuidanceEvidenceCardView } from "@/features/evidence/GuidanceEvidenceCard";
import { knowledgeRepository, loadGuidanceBlockViews, loadReferenceEntries, splitClaimText } from "@/features/evidence/load";
import { MESSAGES } from "@/i18n/messages";
import { DEVELOPMENT_SECTION_ORDER, orderGuidanceBlocks } from "./sections";

const DEVELOPMENT = stagesFor("development");

describe("stage pages resolve the full Development graph in contract order", () => {
  it("loads all 14 sections plus the cross-stage reading block for every stage route, EN and VI", async () => {
    for (const stage of DEVELOPMENT) {
      const [en, vi] = await Promise.all([loadGuidanceBlockViews(stageHref(stage), "en"), loadGuidanceBlockViews(stageHref(stage), "vi")]);
      const ordered = orderGuidanceBlocks(en);
      expect(ordered.filter((b) => b.stage === stage.id).map((b) => b.section), stage.id).toEqual([...DEVELOPMENT_SECTION_ORDER]);
      expect(ordered.at(-1)?.blockId).toBe("guidance.development.reading-milestones");
      expect(vi.map((b) => b.blockId).sort()).toEqual(en.map((b) => b.blockId).sort());
      for (const block of [...en, ...vi]) {
        expect(block.domain).toBe("development");
        for (const claim of block.claims) {
          expect(claim.text.length, claim.claimId).toBeGreaterThan(0);
          expect(claim.sources.length, claim.claimId).toBeGreaterThan(0);
          for (const source of claim.sources) expect(source.url).toMatch(/^https:\/\//);
        }
      }
    }
  });

  it("derives page References for every stage route and the all-stages route from the provenance graph", async () => {
    for (const stage of DEVELOPMENT) {
      const entries = await loadReferenceEntries(stageHref(stage), "en");
      expect(entries.map((e) => e.sourceId), stage.id).toContain("cdc-developmental-milestones");
      expect(entries.some((e) => /^cdc-milestones-/.test(e.sourceId)), stage.id).toBe(true);
    }
    const all = await loadReferenceEntries(ALL_STAGES_ROUTE, "en");
    expect(all.map((e) => e.sourceId)).toEqual(expect.arrayContaining(["cdc-milestones-2-months", "cdc-milestones-4-years", "aap-corrected-age-for-preemies", "aap-baby-walkers-dangerous-choice"]));
    const allBlocks = await loadGuidanceBlockViews(ALL_STAGES_ROUTE, "en");
    expect(allBlocks.filter((b) => b.stage !== undefined)).toHaveLength(12 * DEVELOPMENT_SECTION_ORDER.length);
  });
});

describe("milestones render as reference lists, never as a pass/fail checklist", () => {
  it("splits a lead line + items + trailing note claim into its parts", () => {
    expect(splitClaimText("Lead.\n- one\n- two\nAfter.")).toEqual({ lead: ["Lead."], items: ["one", "two"], trailing: ["After."] });
    expect(splitClaimText("Only a paragraph.")).toEqual({ lead: ["Only a paragraph."], items: [], trailing: [] });
  });

  it("renders milestone items as <li> with no checkbox inputs, in both locales", async () => {
    const stage = stageById("dev-06-09m")!;
    const [en, vi] = await Promise.all([loadGuidanceBlockViews(stageHref(stage), "en"), loadGuidanceBlockViews(stageHref(stage), "vi")]);
    const enBlock = en.find((b) => b.section === "gross-motor")!;
    const viBlock = vi.find((b) => b.blockId === enBlock.blockId)!;
    const html = renderToStaticMarkup(
      <GuidanceEvidenceCardView
        variants={{ en: enBlock, vi: viBlock }}
        globalLocale="en"
        contentLocale="en"
        contentLanguageLabel="Guidance language"
        eyebrow="6 to under 9 months"
        onSelectContentLocale={() => {}}
        openClaimId={null}
        onOpenClaim={() => {}}
      />,
    );
    expect(html).toContain('<ul class="guidance-evidence-card__list">');
    expect(html).toContain("<li>rolls from tummy to back</li>");
    expect(html).not.toMatch(/type="checkbox"/);
    expect(html).not.toMatch(/\b(pass|fail|score|deadline)\b/i);
    expect(html).toContain("Official guidance");
    expect(html).toContain("6 to under 9 months");
  });
});

describe("CDC checklist resolution on the stage page (prerender, no profile)", () => {
  it("states the reference checklist for every stage, and 'none yet' under 2 months", () => {
    for (const stage of DEVELOPMENT) {
      const html = renderToStaticMarkup(<WhyThisStage stage={stage} />);
      const resolution = cdcChecklistForStage(stage);
      if (resolution.checklistMonths === undefined) {
        expect(html, stage.id).toContain(MESSAGES.en["why.checklist.stageNone"]);
      } else {
        expect(html, stage.id).toContain(MESSAGES.en["why.checklist.stage"].replace("{age}", formatChecklistAge(resolution.checklistMonths, "en")));
      }
      // No actual-child checklist line, relation or due-date note can exist in prerendered HTML.
      expect(html).not.toMatch(/data-checklist="actual"|data-relation=|data-development=/);
    }
  });

  it("names checklist ages the way CDC does", () => {
    expect(formatChecklistAge(2, "en")).toBe("2 months");
    expect(formatChecklistAge(12, "en")).toBe("1 year");
    expect(formatChecklistAge(15, "en")).toBe("15 months");
    expect(formatChecklistAge(24, "en")).toBe("2 years");
    expect(formatChecklistAge(30, "en")).toBe("30 months");
    expect(formatChecklistAge(48, "vi")).toBe("4 tuổi");
    expect(formatChecklistAge(9, "vi")).toBe("9 tháng");
  });

  it("does not render feeding/sleep stages with a checklist line", () => {
    const html = renderToStaticMarkup(<WhyThisStage stage={stageById("feed-06-08m")!} />);
    expect(html).not.toMatch(/data-checklist=/);
  });
});

describe("static browsing and print routes", () => {
  const appDir = join(__dirname, "..", "..", "app");

  it("serves /play/all-stages as a static route beside the stage segment, printable", () => {
    const source = readFileSync(join(appDir, "play", "all-stages", "page.tsx"), "utf8");
    expect(ALL_STAGES_ROUTE).toBe("/play/all-stages");
    expect(source).toContain("printable");
    expect(source).not.toMatch(/useSearchParams|searchParams|"use client"/);
    expect(source).toContain('stagesFor("development")');
  });

  it("keeps stage pages printable and hides navigation chrome in print", () => {
    const stagePage = readFileSync(join(__dirname, "..", "context", "StagePage.tsx"), "utf8");
    expect(stagePage).toContain("printable");
    const shellCss = readFileSync(join(__dirname, "..", "..", "components", "app-shell.css"), "utf8");
    expect(shellCss).toMatch(/@media print \{[^}]*\.stage-nav,[^}]*\.stage-pager/);
    expect(shellCss).toMatch(/\.all-stages__stage \{\s*break-before: page;/);
    const printCss = readFileSync(join(__dirname, "..", "..", "print", "print.css"), "utf8");
    expect(printCss).toMatch(/\.app-header,[\s\S]*display: none !important/);
    expect(printCss).toContain(".guidance-evidence-card__claim");
  });

  it("publishes every development claim on a public evidence detail slug", async () => {
    const evidence = await knowledgeRepository().listClaimEvidence();
    const development = evidence.filter((e) => e.domain === "development");
    expect(development.length).toBeGreaterThanOrEqual(12 * DEVELOPMENT_SECTION_ORDER.length);
    for (const entry of development) expect(entry.publicSlug).toMatch(/^development-/);
  });
});
