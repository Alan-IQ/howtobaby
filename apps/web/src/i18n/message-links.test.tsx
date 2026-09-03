// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Page/site references in app copy (docs/GUI_DESIGN.md §6 "Page and site references in copy"):
 * a page or site named in a sentence renders as a link to that destination — internal in the
 * same tab, external in a new tab with safe attributes — whose anchor text is the destination's
 * own localized name; EN and VI name the same destinations; and no tokenised message is ever
 * rendered through the plain string translator (which would leak the raw token).
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SUPPORTED_LOCALES, type AppLocale } from "@howtobaby/i18n";

import { ExternalLink } from "@/components/ExternalLink";
import { MESSAGE_LINKS, SITE } from "@/site";
import { T } from "./T";
import { isMessageLinkKey, messageLinkKeys, splitMessageLinks } from "./message-links";
import { MESSAGES, type AppMessageKey } from "./messages";

let language: AppLocale = "en";
vi.mock("./LanguageProvider", () => ({
  useLanguage: () => ({ language, setLanguage: (next: AppLocale) => (language = next) }),
}));

const KEYS = Object.keys(MESSAGES.en) as AppMessageKey[];
const LINKED_KEYS = KEYS.filter((key) => messageLinkKeys(MESSAGES.en[key]).length > 0);

beforeEach(() => {
  language = "en";
});

describe("link tokens in the app dictionary", () => {
  it("names only registered destinations, with the same destinations in every locale", () => {
    expect(LINKED_KEYS.length).toBeGreaterThan(0);
    for (const key of KEYS) {
      const expected = messageLinkKeys(MESSAGES.en[key]).sort();
      for (const { id } of SUPPORTED_LOCALES) {
        const found = messageLinkKeys(MESSAGES[id][key]);
        expect(found.sort(), `${id}: ${key}`).toEqual(expected);
        for (const linkKey of found) expect(isMessageLinkKey(linkKey), `${id}: ${key} → {link:${linkKey}}`).toBe(true);
      }
    }
  });

  it("splits a message into text runs and link segments, keeping an unknown token as literal text", () => {
    expect(splitMessageLinks("Add it on {link:now} today.")).toEqual([
      { kind: "text", text: "Add it on " },
      { kind: "link", key: "now" },
      { kind: "text", text: " today." },
    ]);
    expect(splitMessageLinks("No links here.")).toEqual([{ kind: "text", text: "No links here." }]);
    expect(splitMessageLinks("Bad {link:nowhere}.")).toEqual([
      { kind: "text", text: "Bad " },
      { kind: "text", text: "{link:nowhere}" },
      { kind: "text", text: "." },
    ]);
  });

  it("never treats a value placeholder as a link token", () => {
    expect(messageLinkKeys("Used in {count} statements")).toEqual([]);
  });

  it("is never rendered through the plain string translator (t(...) / createTranslator)", () => {
    const sources: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) walk(path);
        else if (/\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)) sources.push(path);
      }
    };
    walk(join(__dirname, ".."));
    for (const file of sources) {
      const source = readFileSync(file, "utf8");
      for (const key of LINKED_KEYS) {
        expect(source, `${file} renders "${key}" as a string; use <T id="${key}" /> so its links render`).not.toMatch(new RegExp(`\\bt\\(["']${key.replace(/\./g, "\\.")}["']\\)`));
      }
    }
  });
});

describe("<T> renders page and site names as links", () => {
  it("the Privacy page links the Now page — anchor text is the page's own name in each locale, same tab", async () => {
    const { default: PrivacyPage } = await import("@/app/privacy/page");
    language = "vi";
    const vi = renderToStaticMarkup(<PrivacyPage />);
    expect(vi).toContain('ở trang <a href="/">Hiện tại</a>.');
    expect(vi).not.toContain("{link:");
    expect(vi).not.toMatch(/<a href="\/"[^>]*target=/);

    language = "en";
    const en = renderToStaticMarkup(<PrivacyPage />);
    expect(en).toContain('from <a href="/">Now</a>.');
    expect(en).not.toContain("{link:");
    expect(en).not.toMatch(/<a href="\/"[^>]*target=/);
  });

  it("links other internal page references the same way (Feeding on the home page, Now in WhyThisStage)", () => {
    expect(renderToStaticMarkup(<T id="page.home.how.p2" />)).toContain('beginning with <a href="/feeding">Feeding</a>,');
    expect(renderToStaticMarkup(<T id="why.noProfile" />)).toContain('on <a href="/">Now</a> and');
    language = "vi";
    expect(renderToStaticMarkup(<T id="page.home.how.p2" />)).toContain('ở mục <a href="/feeding">Ăn uống</a>;');
    expect(renderToStaticMarkup(<T id="why.noProfile" />)).toContain('ở trang <a href="/">Hiện tại</a>,');
  });

  it("never links the page the reader is already on — the home page says “this page” instead of linking Now", () => {
    expect(MESSAGES.en["page.home.how.p2"]).not.toContain("{link:now}");
    expect(MESSAGES.vi["page.home.how.p2"]).not.toContain("{link:now}");
    expect(renderToStaticMarkup(<T id="page.home.how.p2" />)).toContain("More personalization on this page and");
    expect(renderToStaticMarkup(<T id="page.home.how.p2" />)).not.toContain('href="/"');
    language = "vi";
    expect(renderToStaticMarkup(<T id="page.home.how.p2" />)).toContain("Các phần cá nhân hóa khác trên trang này và");
    expect(renderToStaticMarkup(<T id="page.home.how.p2" />)).not.toContain('href="/"');
  });

  it("uses the full domain title as the anchor text for a primary destination, never the short nav label", () => {
    expect(MESSAGE_LINKS.play.labelKey).toBe("domain.play.title");
    expect(MESSAGE_LINKS.now.href).toBe("/");
    expect(MESSAGE_LINKS.privacy.href).toBe("/privacy");
    expect(MESSAGE_LINKS.sourceCode).toEqual({ href: SITE.sourceCodeUrl, labelKey: "trust.sourceCode.label", external: true });
  });

  it("renders a message without tokens unchanged", () => {
    expect(renderToStaticMarkup(<T id="page.privacy.lede" />)).toBe(MESSAGES.en["page.privacy.lede"]);
  });
});

describe("external page/site references", () => {
  it("open in a new tab with safe attributes on the License page, footer and Sources page", async () => {
    const { default: LicensePage } = await import("@/app/license/page");
    const license = renderToStaticMarkup(<LicensePage />);
    expect(license).toMatch(/<a href="https:\/\/github\.com\/[^"]+\/LICENSE\.md" target="_blank" rel="noopener noreferrer">Read the full license map<\/a>/);
    expect(license).toMatch(/<a href="https:\/\/github\.com\/[^"]+" target="_blank" rel="noopener noreferrer">Source code<\/a>/);

    const { SiteFooter } = await import("@/components/SiteFooter");
    const footer = renderToStaticMarkup(<SiteFooter />);
    expect(footer).toMatch(/<a href="https:\/\/github\.com\/[^"]+" target="_blank" rel="noopener noreferrer">Source Code/);
    expect(footer).toContain('<a href="/privacy">Privacy</a>');

    const sourcesPage = readFileSync(join(__dirname, "..", "app", "sources", "page.tsx"), "utf8");
    expect(sourcesPage).toContain("<ExternalLink href={SITE.sourceCodeUrl}>");
    expect(sourcesPage).not.toMatch(/<a href=/);
  });

  it("an external destination in copy renders through the same ExternalLink", () => {
    expect(renderToStaticMarkup(<ExternalLink href="https://example.org/">Example</ExternalLink>)).toBe('<a href="https://example.org/" target="_blank" rel="noopener noreferrer">Example</a>');
  });
});
