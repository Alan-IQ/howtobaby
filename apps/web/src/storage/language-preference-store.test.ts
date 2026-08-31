// SPDX-License-Identifier: AGPL-3.0-only
import { describe, expect, it } from "vitest";

import { createLanguagePreferenceStore, parseLanguage } from "./language-preference-store";

describe("language preference store", () => {
  it("parses only supported locales", () => {
    expect(parseLanguage("en")).toBe("en");
    expect(parseLanguage("vi")).toBe("vi");
    expect(parseLanguage("fr")).toBeUndefined();
    expect(parseLanguage(null)).toBeUndefined();
    expect(parseLanguage("")).toBeUndefined();
  });

  it("round-trips through storage and degrades silently without it", () => {
    const backing = new Map<string, string>();
    const store = createLanguagePreferenceStore(() => ({
      getItem: (k) => backing.get(k) ?? null,
      setItem: (k, v) => void backing.set(k, v),
    }));
    expect(store.read()).toBeUndefined();
    store.write("vi");
    expect(store.read()).toBe("vi");

    const broken = createLanguagePreferenceStore(() => {
      throw new Error("storage disabled");
    });
    expect(broken.read()).toBeUndefined();
    expect(() => broken.write("en")).not.toThrow();
  });
});
