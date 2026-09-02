// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Regression gates on the app dictionary's SEMANTICS:
 * - navigation labels vs destination/page titles are distinct keys (short "Play" may never leak
 *   into a content surface, and "Play & Development" may never be reduced in navigation);
 * - public trust copy stays truthful (privacy storage claim, home guidance status, methodology
 *   does not imply automated monitoring is live).
 */

import { describe, expect, it } from "vitest";

import { SUPPORTED_LOCALES } from "@howtobaby/i18n";

import { PRIMARY_NAV } from "@/site";
import { MESSAGES } from "./messages";

describe("navigation label vs destination title", () => {
  it("keeps nav labels short and destination titles full for Play & Development", () => {
    expect(MESSAGES.en["nav.play.label"]).toBe("Play");
    expect(MESSAGES.vi["nav.play.label"]).toBe("Chơi");
    expect(MESSAGES.en["domain.play.title"]).toBe("Play & Development");
    expect(MESSAGES.vi["domain.play.title"]).toBe("Chơi & Phát triển");
  });

  it("gives every primary destination a nav.* label key AND a distinct domain.* title key", () => {
    for (const item of PRIMARY_NAV) {
      expect(item.labelKey).toMatch(/^nav\./);
      expect(item.titleKey).toMatch(/^domain\./);
      expect(item.labelKey).not.toBe(item.titleKey);
    }
  });

  it("never renders a shortened nav label as a domain title in any locale", () => {
    for (const { id } of SUPPORTED_LOCALES) {
      const messages = MESSAGES[id];
      for (const item of PRIMARY_NAV) {
        // The domain title is at least as complete as the nav label (equal for short domains,
        // strictly longer where navigation shortens, e.g. Play & Development).
        expect(messages[item.titleKey].length).toBeGreaterThanOrEqual(messages[item.labelKey].length);
      }
      expect(messages["domain.play.title"].length).toBeGreaterThan(messages["nav.play.label"].length);
    }
  });
});

describe("public trust copy stays truthful", () => {
  it("privacy no longer claims the browser stores exactly one thing, and names both preferences", () => {
    expect(MESSAGES.en["privacy.p2"]).not.toMatch(/exactly one/i);
    expect(MESSAGES.vi["privacy.p2"]).not.toMatch(/đúng một/i);
    expect(MESSAGES.en["privacy.p2"]).toMatch(/theme/i);
    expect(MESSAGES.en["privacy.p2"]).toMatch(/language/i);
    expect(MESSAGES.vi["privacy.p2"]).toMatch(/ngôn ngữ/i);
  });

  it("home no longer claims no health guidance is published", () => {
    expect(MESSAGES.en["page.home.how.p2"]).not.toMatch(/no health guidance/i);
    expect(MESSAGES.vi["page.home.how.p2"]).not.toMatch(/chưa có hướng dẫn sức khỏe/i);
    expect(MESSAGES.en["page.home.how.p2"]).toMatch(/evidence-backed/i);
  });

  it("methodology does not imply automated source monitoring is live", () => {
    expect(MESSAGES.en["methodology.p2"]).not.toMatch(/sources are monitored/i);
    expect(MESSAGES.en["methodology.p2"]).toMatch(/planned for a future release/i);
    expect(MESSAGES.en["methodology.p2"]).toMatch(/flagged for review/i);
  });

  it("changelog no longer claims no guidance content is published", () => {
    expect(MESSAGES.en["changelog.status"]).not.toMatch(/no guidance content/i);
    expect(MESSAGES.vi["changelog.status"]).not.toMatch(/chưa có nội dung hướng dẫn/i);
  });
});
