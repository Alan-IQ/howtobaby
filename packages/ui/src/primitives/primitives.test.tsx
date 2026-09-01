// SPDX-License-Identifier: AGPL-3.0-only
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Badge, Button, Card, IconButton, Navigation, Segmented, Switch } from "./index.ts";

const RAW_COLOR = /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(/i;

describe("primitives render semantic, accessible markup", () => {
  it("Navigation marks the current destination and nested routes", () => {
    const items = [
      { href: "/", label: "Now", icon: "home" as const },
      { href: "/feeding", label: "Feeding", icon: "feeding" as const, accent: "feeding" as const },
    ];
    const html = renderToStaticMarkup(<Navigation items={items} currentHref="/feeding/0-6m" label="Primary" layout="tabs" />);
    expect(html).toContain('aria-label="Primary"');
    expect(html).toContain("htb-nav--tabs");
    expect(html.match(/aria-current="page"/g)).toHaveLength(1);
    expect(html).toContain('href="/feeding" class="htb-nav__link" aria-current="page" data-accent="feeding"');
  });

  it("IconButton always exposes an accessible name", () => {
    const html = renderToStaticMarkup(<IconButton icon="print" label="Print this page" />);
    expect(html).toContain('aria-label="Print this page"');
    expect(html).toContain('aria-hidden="true"'); // decorative svg
  });

  it("Button becomes a link when given href", () => {
    expect(renderToStaticMarkup(<Button href="/tools">Tools</Button>)).toMatch(/^<a /);
    expect(renderToStaticMarkup(<Button variant="primary">Go</Button>)).toContain('type="button"');
  });

  it("status Badge carries meaning in text, tone in class", () => {
    const html = renderToStaticMarkup(<Badge status="urgent">Urgent</Badge>);
    expect(html).toContain("htb-badge--status-urgent");
    expect(html).toContain(">Urgent<");
  });

  it("Card exposes accent as a data attribute and headings semantically", () => {
    const html = renderToStaticMarkup(
      <Card accent="sleep" eyebrow="Sleep" title="Title" titleAs="h2">
        body
      </Card>,
    );
    expect(html).toContain('data-accent="sleep"');
    expect(html).toContain('<h2 class="htb-card__title">Title</h2>');
  });

  it("Switch and Segmented use ARIA roles", () => {
    expect(renderToStaticMarkup(<Switch checked label="Reduce motion" onCheckedChange={() => {}} />)).toContain('role="switch" aria-checked="true"');
    const seg = renderToStaticMarkup(<Segmented name="m" legend="Mode" value="a" options={[{ value: "a", label: "A" }, { value: "b", label: "B" }]} onChange={() => {}} />);
    expect(seg).toContain('role="radiogroup"');
    expect(seg.match(/aria-checked="true"/g)).toHaveLength(1);
  });

  it("no primitive emits raw palette values inline", () => {
    const html = renderToStaticMarkup(
      <>
        <Card accent="feeding" title="x">
          y
        </Card>
        <Badge status="emergency">z</Badge>
        <Button variant="primary">p</Button>
      </>,
    );
    expect(html).not.toMatch(RAW_COLOR);
  });
});

describe("Tabs / Tooltip / Popover", () => {
  it("Tabs render ARIA tab semantics with roving tabindex", async () => {
    const { Tabs } = await import("./Tabs.tsx");
    const html = renderToStaticMarkup(
      <Tabs label="Modes" value="b" items={[{ value: "a", label: "A" }, { value: "b", label: "B" }, { value: "c", label: "C", disabled: true }]} onChange={() => {}}>
        panel
      </Tabs>,
    );
    expect(html).toContain('role="tablist" aria-label="Modes"');
    expect(html.match(/role="tab"/g)).toHaveLength(3);
    expect(html.match(/aria-selected="true"/g)).toHaveLength(1);
    expect(html).toContain('tabindex="0"');
    expect(html).toContain('tabindex="-1"');
    expect(html).toContain('role="tabpanel"');
  });

  it("Tooltip attaches its content to the trigger via aria-describedby", async () => {
    const { Tooltip } = await import("./Tooltip.tsx");
    const html = renderToStaticMarkup(
      <Tooltip content="More detail">
        <button type="button">Info</button>
      </Tooltip>,
    );
    const id = /role="tooltip" id="([^"]+)"/.exec(html)?.[1];
    expect(id).toBeTruthy();
    expect(html).toContain(`aria-describedby="${id}"`);
  });

  it("Popover trigger exposes expanded state", async () => {
    const { Popover } = await import("./Popover.tsx");
    const html = renderToStaticMarkup(
      <Popover trigger="Open" label="Details">
        body
      </Popover>,
    );
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).not.toContain('role="dialog"');
  });
});

describe("sliding selection (motion state semantics)", () => {
  it("Segmented always mounts ONE indicator; static aria-checked styling carries state pre-hydration", () => {
    const html = renderToStaticMarkup(
      <Segmented name="m" legend="Mode" value="a" options={[{ value: "a", label: "A" }, { value: "b", label: "B" }]} onChange={() => {}} />,
    );
    // State never depends on the animation: aria-checked is present pre-hydration…
    expect(html).toContain('aria-checked="true"');
    // …and exactly ONE persistent indicator element exists from the first render on (hidden via
    // opacity until the hook positions it — it is repositioned, never remounted).
    expect(html.match(/htb-segmented__indicator/g)).toHaveLength(1);
    expect(html).not.toContain('data-slide');
    expect(html).not.toContain('data-visible');
  });

  it("tab-bar Navigation positions its persistent CSS indicator from the active index at render time", () => {
    const items = [
      { href: "/", label: "Now" },
      { href: "/feeding", label: "Feeding", accent: "feeding" as const },
      { href: "/play", label: "Play", accent: "play" as const },
    ];
    const html = renderToStaticMarkup(<Navigation items={items} currentHref="/feeding" label="Primary" layout="tabs" />);
    expect(html).toContain('aria-current="page"');
    // The indicator is the bar's ::after pseudo-element driven by custom properties present in
    // the prerendered HTML — no measured span, no hydration dependency, nothing to remount.
    expect(html).not.toContain("htb-nav__indicator");
    expect(html).toContain("--htb-nav-count:3");
    expect(html).toContain("--htb-nav-index:1");
    expect(html).toContain('data-active="true"');
    expect(html).toContain('data-active-accent="feeding"');
  });

  it("tab-bar Navigation keeps the indicator mounted but inactive on routes outside the bar", () => {
    const items = [
      { href: "/", label: "Now" },
      { href: "/feeding", label: "Feeding", accent: "feeding" as const },
    ];
    const html = renderToStaticMarkup(<Navigation items={items} currentHref="/privacy" label="Primary" layout="tabs" />);
    expect(html).not.toContain('aria-current="page"');
    // data-active="false" fades the indicator out in place — it is never removed.
    expect(html).toContain('data-active="false"');
    expect(html).toContain("--htb-nav-count:2");
  });

  it("desktop Navigation always mounts ONE measured indicator; aria-current carries state", () => {
    const items = [
      { href: "/", label: "Now" },
      { href: "/feeding", label: "Feeding", accent: "feeding" as const },
    ];
    const html = renderToStaticMarkup(<Navigation items={items} currentHref="/feeding" label="Primary" layout="horizontal" />);
    expect(html).toContain('aria-current="page"');
    expect(html.match(/htb-nav__indicator/g)).toHaveLength(1);
    expect(html).not.toContain('data-slide');
  });
});
