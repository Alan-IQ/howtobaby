// SPDX-License-Identifier: AGPL-3.0-only
import { describe, expect, it } from "vitest";

import {
  CANONICAL_LOCALE,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  contentLocaleOverride,
  contentLocaleToggleOptions,
  createTranslator,
  defineMessages,
  getMessage,
  isAppLocale,
  localeDefinition,
  parseLocale,
  resolveContentLocale,
} from "./index.ts";

describe("supported-locale registry", () => {
  it("registers en and vi with complete display metadata", () => {
    const ids = SUPPORTED_LOCALES.map((locale) => locale.id);
    expect(ids).toEqual(["en", "vi"]);
    for (const locale of SUPPORTED_LOCALES) {
      expect(locale.code).toMatch(/^[A-Z]{2,3}$/);
      expect(locale.nativeName.length).toBeGreaterThan(0);
      expect(locale.englishName.length).toBeGreaterThan(0);
    }
  });

  it("keeps the canonical locale registered and first (menu order + parity reference)", () => {
    expect(isAppLocale(CANONICAL_LOCALE)).toBe(true);
    expect(SUPPORTED_LOCALES[0]?.id).toBe(CANONICAL_LOCALE);
    expect(DEFAULT_LOCALE).toBe(CANONICAL_LOCALE);
  });

  it("parses only registered locales from untrusted values", () => {
    expect(parseLocale("en")).toBe("en");
    expect(parseLocale("vi")).toBe("vi");
    expect(parseLocale("fr")).toBeUndefined();
    expect(parseLocale("")).toBeUndefined();
    expect(parseLocale(null)).toBeUndefined();
    expect(parseLocale(undefined)).toBeUndefined();
  });

  it("resolves locale definitions by id", () => {
    expect(localeDefinition("vi").nativeName).toBe("Tiếng Việt");
    expect(localeDefinition("en").code).toBe("EN");
  });
});

describe("message dictionaries", () => {
  const MESSAGES = defineMessages({
    en: { greeting: "Hello", farewell: "Goodbye" },
    vi: { greeting: "Xin chào", farewell: "Tạm biệt" },
  });

  it("resolves messages per locale", () => {
    expect(getMessage(MESSAGES, "en", "greeting")).toBe("Hello");
    expect(getMessage(MESSAGES, "vi", "greeting")).toBe("Xin chào");
  });

  it("binds a translator to one locale", () => {
    const t = createTranslator(MESSAGES, "vi");
    expect(t("farewell")).toBe("Tạm biệt");
  });

  it("keeps key parity across every registered locale (runtime guard behind the type guard)", () => {
    const keySets = SUPPORTED_LOCALES.map((locale) => Object.keys(MESSAGES[locale.id]).sort());
    for (const keys of keySets) expect(keys).toEqual(keySets[0]);
  });
});

describe("local content-locale override (guidance card + Evidence Drawer)", () => {
  it("offers no local toggle while the global locale is canonical (global EN → hidden)", () => {
    expect(contentLocaleToggleOptions("en")).toBeUndefined();
  });

  it("offers active-global ↔ canonical while the global locale is non-canonical (global VI → VI/EN)", () => {
    expect(contentLocaleToggleOptions("vi")).toEqual(["vi", "en"]);
  });

  it("keeps working for a future third locale without redesign", () => {
    expect(contentLocaleToggleOptions("es", "en")).toEqual(["es", "en"]);
    expect(contentLocaleToggleOptions("en", "en")).toBeUndefined();
  });

  it("renders the global locale by default (no override)", () => {
    expect(resolveContentLocale("vi", undefined)).toBe("vi");
  });

  it("applies a local EN override under global VI without touching the global preference", () => {
    const globalLocale = "vi" as const;
    const override = contentLocaleOverride(globalLocale, "en");
    expect(resolveContentLocale(globalLocale, override)).toBe("en");
    // The override is local state; the global locale value it was derived from is unchanged.
    expect(globalLocale).toBe("vi");
    expect(override.base).toBe("vi");
  });

  it("resets/syncs the local override when the global locale changes", () => {
    const override = contentLocaleOverride("vi", "en");
    // Global switched vi → en: the stale override no longer applies.
    expect(resolveContentLocale("en", override)).toBe("en");
    // Global switched to a different non-canonical locale: follow it, not the stale override.
    expect(resolveContentLocale("es", contentLocaleOverride("vi", "en"))).toBe("es");
  });

  it("round-trips back to the global locale when the user toggles home", () => {
    const backHome = contentLocaleOverride("vi", "vi");
    expect(resolveContentLocale("vi", backHome)).toBe("vi");
  });
});
