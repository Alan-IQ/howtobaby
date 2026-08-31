// SPDX-License-Identifier: AGPL-3.0-only
/** Global language selector: registry-driven menu (no hard-coded locale pair in the component). */

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SUPPORTED_LOCALES } from "@howtobaby/i18n";

import { LanguageSwitcher } from "./LanguageSwitcher";

describe("LanguageSwitcher", () => {
  it("renders a compact trigger: globe icon above the active locale code", () => {
    const html = renderToStaticMarkup(<LanguageSwitcher />);
    expect(html).toContain("lang-menu__globe");
    expect(html).toContain('aria-haspopup="listbox"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain(">EN</span>"); // default global language is the canonical locale
    expect(html).toContain('aria-label="Language: English"');
  });

  it("lists every registered locale in the menu and marks the active one", () => {
    const html = renderToStaticMarkup(<LanguageSwitcher initialOpen />);
    expect(html).toContain('role="listbox"');
    for (const locale of SUPPORTED_LOCALES) {
      expect(html).toContain(`>${locale.code}</span>`);
      expect(html).toContain(`lang="${locale.id}">${locale.nativeName}</span>`);
    }
    // Exactly one selected option — the active language — carrying the check mark.
    expect(html.match(/aria-selected="true"/g)?.length).toBe(1);
    expect(html).toContain("lang-menu__option-check");
  });
});
