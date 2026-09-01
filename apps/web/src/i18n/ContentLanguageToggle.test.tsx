// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Local guidance-language control: ONE button, ONE tap flips active-global ↔ canonical, visible
 * text = full native name of the language currently displayed, hidden while global is canonical.
 */

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { ReactElement } from "react";

import { ContentLanguageToggle, type ContentLanguageToggleProps } from "./ContentLanguageToggle";

function markup(props: ContentLanguageToggleProps): string {
  return renderToStaticMarkup(<ContentLanguageToggle {...props} />);
}

/** Resolve the component's element tree and return the toggle button's props (no DOM needed). */
function buttonProps(props: ContentLanguageToggleProps): { onClick: () => void; "aria-label": string } | null {
  const element = ContentLanguageToggle(props) as ReactElement<{ onClick: () => void; "aria-label": string }> | null;
  return element === null ? null : element.props;
}

describe("ContentLanguageToggle", () => {
  it("renders nothing while the global locale is canonical", () => {
    expect(markup({ globalLocale: "en", contentLocale: "en", label: "Guidance language", onToggle: () => {} })).toBe("");
  });

  it("shows the FULL native name of the displayed language with its lang attribute — never a code", () => {
    const html = markup({ globalLocale: "vi", contentLocale: "vi", label: "Ngôn ngữ hướng dẫn", onToggle: () => {} });
    expect(html).toContain('lang="vi">Tiếng Việt</span>');
    expect(html).not.toContain(">VI<");
    expect(html).toContain('aria-label="Ngôn ngữ hướng dẫn: Tiếng Việt"');
    const flipped = markup({ globalLocale: "vi", contentLocale: "en", label: "Ngôn ngữ hướng dẫn", onToggle: () => {} });
    expect(flipped).toContain('lang="en">English</span>');
    expect(flipped).not.toContain(">EN<");
  });

  it("a single activation flips active global ↔ canonical (no option picking)", () => {
    const received: string[] = [];
    buttonProps({ globalLocale: "vi", contentLocale: "vi", label: "x", onToggle: (l) => received.push(l) })?.onClick();
    buttonProps({ globalLocale: "vi", contentLocale: "en", label: "x", onToggle: (l) => received.push(l) })?.onClick();
    expect(received).toEqual(["en", "vi"]);
  });

  it("stays registry-generic: only one button regardless of how many locales are registered", () => {
    const html = markup({ globalLocale: "vi", contentLocale: "vi", label: "x", onToggle: () => {} });
    expect(html.match(/<button/g)?.length).toBe(1);
  });

  it("slider anatomy: both full native names visible, ONE persistent thumb on the displayed one", () => {
    const html = markup({ globalLocale: "vi", contentLocale: "vi", label: "x", onToggle: () => {} });
    // Both names visible (active global locale first, canonical second), never as two buttons.
    expect(html.indexOf("Tiếng Việt")).toBeGreaterThan(-1);
    expect(html.indexOf("English")).toBeGreaterThan(html.indexOf("Tiếng Việt"));
    expect(html.match(/content-lang-toggle__thumb/g)?.length).toBe(1);
    // The thumb rests on the DISPLAYED language via the index custom property…
    expect(html).toContain("--htb-toggle-index:0");
    expect(html).toMatch(/data-displayed="true"[^>]*lang="vi"/);
    // …and slides to the canonical side when the surface is flipped.
    const flipped = markup({ globalLocale: "vi", contentLocale: "en", label: "x", onToggle: () => {} });
    expect(flipped).toContain("--htb-toggle-index:1");
    expect(flipped).toMatch(/data-displayed="true"[^>]*lang="en"/);
  });
});
