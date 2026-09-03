// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Phase 4 hardening regressions. Each block pins a defect the Phase 4 audit found in the authored
 * Play & Development graph, so the same class of mistake fails the build instead of shipping:
 *
 *   - source-date fidelity: an authority's calendar date is copied exactly as the authority prints
 *     it, never re-derived from UTC-shifted machine metadata (the CDC pages drifted by +1 day);
 *   - unsupported claim expansion: a recommendation may not travel further than the source that
 *     carries it (an AAP page about WHEELED baby walkers cannot prohibit jumpers or bouncers);
 *   - younger-checklist inference: resolving to the younger checklist chooses which list is the
 *     reference — it never licenses a conclusion that a skill on a later list is not yet due;
 *   - honest review states: AI-assisted authoring is recorded as such and never occupies a state
 *     that asserts a human clinician reviewed the claim.
 */

import { describe, expect, it } from "vitest";

import { CLINICIAN_ASSERTING_STATUSES, loadCanonicalKnowledge, validateKnowledge } from "../src/index.ts";

const knowledge = loadCanonicalKnowledge();
validateKnowledge(knowledge);
const en = knowledge.translations.en;
const vi = knowledge.translations.vi;
const sourcesById = new Map(knowledge.sources.map((s) => [s.id, s]));
const development = knowledge.claims.filter((c) => c.domain === "development");
const developmentText = development.flatMap(({ claim }) => [en[claim.textKey] ?? "", vi[claim.textKey] ?? ""]);

describe("source-date fidelity (EVIDENCE_PROVENANCE.md §2)", () => {
  /**
   * The date each authority PRINTS TO READERS, read from the page itself. CDC's "Learn the Signs.
   * Act Early." pages also expose the same instant shifted into UTC in `og:updated_time`,
   * `cdc:last_reviewed` and the desktop `<time datetime>` attribute — reading those instead is
   * what produced the original +1 day drift (2026-02-17 / 2026-05-16).
   */
  const AUTHORITY_DATES: Record<string, { field: "publishedAt" | "updatedAt"; date: string }> = {
    "cdc-developmental-milestones": { field: "updatedAt", date: "2026-02-16" },
    "cdc-milestones-2-months": { field: "updatedAt", date: "2026-05-15" },
    "cdc-milestones-4-months": { field: "updatedAt", date: "2026-05-15" },
    "cdc-milestones-6-months": { field: "updatedAt", date: "2026-05-15" },
    "cdc-milestones-9-months": { field: "updatedAt", date: "2026-05-15" },
    "cdc-milestones-1-year": { field: "updatedAt", date: "2026-05-15" },
    "cdc-milestones-15-months": { field: "updatedAt", date: "2026-05-15" },
    "cdc-milestones-18-months": { field: "updatedAt", date: "2026-05-15" },
    "cdc-milestones-2-years": { field: "updatedAt", date: "2026-05-15" },
    "cdc-milestones-30-months": { field: "updatedAt", date: "2026-05-15" },
    "cdc-milestones-3-years": { field: "updatedAt", date: "2026-05-15" },
    "cdc-milestones-4-years": { field: "updatedAt", date: "2026-05-15" },
    "cdc-milestones-5-years": { field: "updatedAt", date: "2026-05-15" },
    "cdc-positive-parenting-infants": { field: "updatedAt", date: "2026-02-20" },
    "cdc-positive-parenting-toddlers-1-2": { field: "updatedAt", date: "2026-02-20" },
    "cdc-positive-parenting-toddlers-2-3": { field: "updatedAt", date: "2026-01-29" },
    "cdc-positive-parenting-preschoolers": { field: "updatedAt", date: "2026-02-20" },
    "aap-corrected-age-for-preemies": { field: "updatedAt", date: "2018-12-10" },
    "aap-back-to-sleep-tummy-to-play": { field: "updatedAt", date: "2023-09-08" },
    "aap-baby-walkers-dangerous-choice": { field: "updatedAt", date: "2022-08-15" },
    "aap-power-of-play-2018": { field: "publishedAt", date: "2018-09-01" },
    "who-under-5-activity-sleep-guidelines-2019": { field: "publishedAt", date: "2019-04-02" },
  };

  it.each(Object.entries(AUTHORITY_DATES))("records %s exactly as the authority prints it", (id, { field, date }) => {
    const source = sourcesById.get(id);
    expect(source, id).toBeDefined();
    expect(source?.[field], `${id}.${field}`).toBe(date);
  });

  it("records who performed every source verification, so a date never implies a human sign-off", () => {
    for (const source of knowledge.sources) {
      expect(source.verifiedBy, source.id).toBeDefined();
      expect(["maintainer", "ai-assisted"]).toContain(source.verifiedBy);
    }
  });
});

describe("recommendations stay inside the source that carries them", () => {
  /**
   * healthychildren.org "Baby Walkers: A Dangerous Choice" is about WHEELED walkers. It recommends
   * stationary activity centers — "seats that rotate, tip, and bounce" — as the safer alternative,
   * so it can never support a prohibition on jumpers, bouncers or activity centers. (CDC's 4-month
   * tips even suggest bouncing a baby on your lap.) The sourced limit on those seats is CDC's
   * "try not to keep your baby in swings, strollers, bouncer seats, and exercise saucers for too
   * long" — a limit on time spent, not a ban.
   */
  const WALKER_SOURCE = "aap-baby-walkers-dangerous-choice";
  const BOUNCER_EN = /\b(jumper|jumpers|bouncer|bouncy seat|activity center|exercise saucer)\b/i;
  const BOUNCER_VI = /(ghế nhún|ghế nhảy|ghế rung|ghế xoay tập vận động|ghế hoạt động cố định)/i;
  const PROHIBITION_EN = /\b(never|do not|don't|not recommended|avoid)\b/i;
  const PROHIBITION_VI = /(đừng|không dùng|không được|tránh|chớ)/i;
  /** CDC's actual wording for the seats: a limit on how long, not a ban. */
  const TIME_LIMIT_EN = /too long/i;
  const TIME_LIMIT_VI = /(ở lâu|quá lâu)/i;

  const walkerClaims = development.filter(({ claim }) => claim.sourceRefs.some((ref) => ref.sourceId === WALKER_SOURCE));

  it("cites the walker source somewhere (the guard below is not vacuous)", () => {
    expect(walkerClaims.length).toBeGreaterThan(0);
  });

  it.each(walkerClaims.map(({ claim }) => claim.id))(
    "%s never turns the wheeled-walker guidance into a jumper/bouncer prohibition",
    (claimId) => {
      const claim = development.find((c) => c.claim.id === claimId)!.claim;
      for (const [locale, text, bouncer, prohibition, timeLimit] of [
        ["en", en[claim.textKey] ?? "", BOUNCER_EN, PROHIBITION_EN, TIME_LIMIT_EN],
        ["vi", vi[claim.textKey] ?? "", BOUNCER_VI, PROHIBITION_VI, TIME_LIMIT_VI],
      ] as const) {
        for (const sentence of text.split(/(?<=[.!?;])\s+/)) {
          if (!bouncer.test(sentence) || !prohibition.test(sentence)) continue;
          // A sentence may mention both only when it states CDC's time limit, not a ban.
          expect(timeLimit.test(sentence), `${claimId} [${locale}]: ${sentence}`).toBe(true);
        }
      }
    },
  );

  // "jumper" was HowToBaby's own word; CDC and the AAP never use it. ("ghế nhún" is the repo's
  // translation of CDC's "bouncer seats", so it stays legal — the sentence-level guard above is
  // what stops it becoming a prohibition.)
  it("never uses the invented English term `jumper` in Play & Development", () => {
    for (const { claim } of development) {
      expect(en[claim.textKey] ?? "", `${claim.id} [en]`).not.toMatch(/\bjumpers?\b/i);
    }
  });

  it("never attributes a pillow-propping instruction to CDC, which does not give one", () => {
    for (const { claim } of development) {
      expect(en[claim.textKey] ?? "", `${claim.id} [en]`).not.toMatch(/\bpillows?\b/i);
      expect(vi[claim.textKey] ?? "", `${claim.id} [vi]`).not.toMatch(/(?:kê|chèn|chặn|lót)\s+gối/i);
    }
  });
});

describe("younger-checklist resolution never becomes a developmental conclusion", () => {
  /**
   * `resolveCdcChecklist` picks WHICH checklist is the reference for an age between checklist
   * ages. It says nothing about the child. The original 6–9m copy inferred that "sitting without
   * support and crawling belong to later checklists, so not doing them yet at 6 to 8 months is
   * expected" — doubly wrong: sitting without support IS on the 9-month checklist, crawling is on
   * no CDC checklist at all, and neither fact licenses a conclusion about an individual child.
   */
  const INFERENCE_EN = /(later checklists?|next checklist|checklists? that come later|a later list)[^.]*\b(expected|normal|nothing to worry|no cause for concern)\b|\b(expected|normal)\b[^.]*(later checklists?|next checklist)/i;
  const INFERENCE_VI = /(danh sách sau|danh sách kế tiếp|các danh sách sau)[^.]*(bình thường|đương nhiên|không đáng lo|không cần lo)|(bình thường|đương nhiên)[^.]*(danh sách sau|danh sách kế tiếp)/i;

  it("never reasons from checklist membership to what a child should or should not be doing", () => {
    for (const { claim } of development) {
      expect(en[claim.textKey] ?? "", `${claim.id} [en]`).not.toMatch(INFERENCE_EN);
      expect(vi[claim.textKey] ?? "", `${claim.id} [vi]`).not.toMatch(INFERENCE_VI);
    }
  });

  it("states the checklist facts correctly: sitting without support is a 9-month item", () => {
    const text = en["development.06-09m.what-not-to-force"] ?? "";
    expect(text).toMatch(/sitting without support is on the 9-month checklist/i);
    expect(vi["development.06-09m.what-not-to-force"] ?? "").toMatch(/danh sách 9 tháng/);
  });

  it("never places crawling on a CDC checklist, because no CDC checklist lists it", () => {
    const crawlingOnAList = /crawling[^.]*\bon (?:the|a) [^.]*checklist\b/i;
    for (const { claim } of development) {
      const text = en[claim.textKey] ?? "";
      for (const sentence of text.split(/(?<=[.!?;])\s+/)) {
        if (!crawlingOnAList.test(sentence)) continue;
        expect(sentence, `${claim.id}: ${sentence}`).toMatch(/crawling is (?:not|on no)\b/i);
      }
    }
  });

  it("keeps the cross-stage rule framed as HowToBaby's own resolution rule", () => {
    expect(en["development.milestones.younger-checklist"]).toMatch(/HowToBaby uses the younger checklist as the reference/);
    expect(en["development.milestones.younger-checklist"]).not.toMatch(INFERENCE_EN);
  });
});

describe("honest review states across the authored graph", () => {
  it("records `reviewedBy` on every claim", () => {
    for (const { claim } of knowledge.claims) {
      expect(["maintainer", "ai-assisted"], claim.id).toContain(claim.reviewedBy);
    }
  });

  it("keeps every ai-assisted claim out of the states that assert a human clinical review", () => {
    for (const { claim } of knowledge.claims) {
      if (claim.reviewedBy !== "ai-assisted") continue;
      expect(CLINICIAN_ASSERTING_STATUSES as readonly string[], claim.id).not.toContain(claim.reviewStatus);
    }
  });

  it("never rests urgent or emergency wording on an ai-assisted review", () => {
    for (const { claim } of knowledge.claims) {
      if (claim.safetyLevel !== "urgent" && claim.safetyLevel !== "emergency") continue;
      expect(claim.reviewedBy, claim.id).toBe("maintainer");
    }
  });

  it("gives every safety-bearing prohibition a primary or direct-support reference", () => {
    const PROHIBITION = /\b(never|do not|don't|not recommended|avoid|must not|should not)\b/i;
    for (const { claim } of knowledge.claims) {
      if (claim.safetyLevel === "info") continue;
      if (!PROHIBITION.test(en[claim.textKey] ?? "")) continue;
      const direct = claim.sourceRefs.filter((ref) => ref.relationship === "primary" || ref.relationship === "direct-support");
      expect(direct.length, claim.id).toBeGreaterThan(0);
    }
  });
});

describe("Play & Development text carries no un-sourced expansion", () => {
  it("does not invent developmental sequencing or pacing language", () => {
    // "comes first", "at their own pace" and friends are claims about how development unfolds.
    // CDC checklists describe what most children do BY an age; they order nothing.
    const SEQUENCING = /\b(comes? first|come at their own pace|in this order|the next step is always|always precedes)\b/i;
    for (const { claim } of development) {
      expect(en[claim.textKey] ?? "", `${claim.id} [en]`).not.toMatch(SEQUENCING);
    }
  });

  it("does not tell parents when a social skill arrives relative to the checklists", () => {
    const UNSOURCED_TIMING = /\b(sharing|cooperative play) (?:comes|arrives|develops) (?:much )?(?:later|only later)\b/i;
    for (const text of developmentText) expect(text).not.toMatch(UNSOURCED_TIMING);
  });
});
