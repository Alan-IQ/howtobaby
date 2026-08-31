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
