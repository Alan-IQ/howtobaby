// SPDX-License-Identifier: AGPL-3.0-only
import { THEME_PREFERENCE_STORAGE_KEY } from "@howtobaby/themes";
import { describe, expect, it } from "vitest";

import { createThemePreferenceStore, type KeyValueStorage } from "./theme-preference-store.ts";

function memoryStorage(): KeyValueStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) };
}

describe("theme preference store", () => {
  it("persists and reads back the preference under the versioned key", () => {
    const storage = memoryStorage();
    const store = createThemePreferenceStore(() => storage);
    store.write({ themeId: "baby-modern-glass", colorMode: "dark" });
    expect(storage.data.get(THEME_PREFERENCE_STORAGE_KEY)).toBe('{"themeId":"baby-modern-glass","colorMode":"dark"}');
    expect(store.read()).toEqual({ themeId: "baby-modern-glass", colorMode: "dark" });
  });

  it("degrades silently when storage is unavailable or throws", () => {
    expect(createThemePreferenceStore(() => undefined).read()).toBeUndefined();
    const throwing: KeyValueStorage = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("quota");
      },
    };
    const store = createThemePreferenceStore(() => throwing);
    expect(store.read()).toBeUndefined();
    expect(() => store.write({ themeId: "baby-modern-glass", colorMode: "light" })).not.toThrow();
  });

  it("stores only presentation fields", () => {
    const storage = memoryStorage();
    const store = createThemePreferenceStore(() => storage);
    store.write({ themeId: "baby-modern-glass", colorMode: "system", childName: "x" } as never);
    expect(JSON.parse(storage.data.get(THEME_PREFERENCE_STORAGE_KEY)!)).toEqual({ themeId: "baby-modern-glass", colorMode: "system" });
  });
});
