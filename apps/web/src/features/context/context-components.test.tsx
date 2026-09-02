// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Prerender contract for the context components: with no client snapshot (SSR/static export)
 * they render the public, profile-free state — every stage link, no "actual child" marker and
 * the no-profile explanation — so no child data can be baked into static HTML.
 */

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { stageById, stagesFor } from "@howtobaby/core";

import { MESSAGES } from "@/i18n/messages";
import { StageNavigator } from "./StageNavigator";
import { WhyThisStage } from "./WhyThisStage";
import { stageHref } from "./routes";

describe("StageNavigator (prerender)", () => {
  it("links every stage of the domain, marks only the browsed one, never an actual-child marker", () => {
    const html = renderToStaticMarkup(<StageNavigator domain="development" currentSlug="6-9-months" />);
    for (const stage of stagesFor("development")) expect(html).toContain(`href="${stageHref(stage)}"`);
    expect(html.match(/aria-current="page"/g)?.length).toBe(1);
    expect(html).not.toContain('data-actual="true"');
    expect(html).toContain('aria-label="Stages"');
  });

  it("renders without any browsed stage on a landing page", () => {
    const html = renderToStaticMarkup(<StageNavigator domain="feeding" />);
    expect(html).not.toContain('aria-current="page"');
    expect(html).toContain('href="/feeding/6-8-months"');
    expect(html).toContain("~6–&lt;8 mo");
  });
});

describe("WhyThisStage (prerender)", () => {
  it("explains the bin, the no-profile state and the age-selects limitation", () => {
    const html = renderToStaticMarkup(<WhyThisStage stage={stageById("feed-06-08m")!} />);
    expect(html).toContain("This stage covers about 6–&lt;8 months.");
    expect(html).toContain("The source uses “about 6 months” as the starting point. This age range is used to organize content, not as a readiness threshold.");
    expect(html).toContain(MESSAGES.en["why.noProfile"].replace(/'/g, "&#x27;"));
    expect(html).toContain(MESSAGES.en["why.disclaimer"]);
    expect(html).not.toMatch(/data-relation=/);
  });
});

describe("ChildSummary / WhyThisStage never show a signed corrected age", () => {
  it("WhyThisStage phrases a pre-due-date corrected age as a countdown when given such a context", async () => {
    // Drive the client state directly: a profile 50 days early, plan date 9 days before the due date.
    const { createProfileState } = await import("@/features/profile/profile-state");
    const { createChildProfileStore } = await import("@/storage/child-profile-store");
    const { calendarDate, resolveGuidanceContext } = await import("@howtobaby/core");
    const map = new Map<string, string>();
    const store = createChildProfileStore(() => ({ getItem: (k) => map.get(k) ?? null, setItem: (k, v) => void map.set(k, v), removeItem: (k) => void map.delete(k) }));
    const state = createProfileState({ store, now: () => new Date(2026, 1, 20) });
    state.saveProfile({ dateOfBirth: calendarDate(2026, 1, 10), estimatedDueDate: calendarDate(2026, 3, 1) });
    const snapshot = state.getSnapshot();
    const context = resolveGuidanceContext({ profile: snapshot.profile, today: snapshot.today! });
    const development = context.actualChildContext!.domains.development;
    expect(development.basis).toBe("corrected-development");
    expect(development.age.days).toBe(-9);
    const { formatCorrectedAge } = await import("./format");
    expect(formatCorrectedAge(development.age, "en")).toBe("9 days until the due date");
    expect(formatCorrectedAge(development.age, "vi")).toBe("còn 9 ngày nữa đến ngày dự sinh");
  });
});
