// SPDX-License-Identifier: AGPL-3.0-only
"use client";

/**
 * Theme Lab showcase sections. One place to add a component for visual/theme regression review:
 * Phase 2+ appends entries here (SourceChip, EvidenceDrawer, SafetyCallout, FeedingCard, SleepSummaryBadge,
 * ToolCard, ...) without touching the lab shell. Keep entries presentation-only — no domain behaviour.
 */

import { useState, type ReactNode } from "react";

import {
  Badge,
  Button,
  Card,
  Dialog,
  Divider,
  Drawer,
  Icon,
  IconButton,
  Input,
  Navigation,
  Popover,
  PrintAction,
  Segmented,
  Select,
  Skeleton,
  Surface,
  Switch,
  Tabs,
  Tooltip,
  type DomainAccent,
  type StatusTone,
} from "@howtobaby/ui";

export interface LabSection {
  id: string;
  title: string;
  render: () => ReactNode;
}

const STATUS_TONES: readonly StatusTone[] = ["info", "caution", "clinician", "urgent", "emergency"];
const ACCENTS: readonly DomainAccent[] = ["brand", "feeding", "play", "sleep", "safety", "tools"];

function Row({ children }: { children: ReactNode }) {
  return <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--htb-space-sm)", alignItems: "center" }}>{children}</div>;
}

function ButtonsSection() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--htb-space-sm)" }}>
      <Row>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="subtle">Subtle</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="primary" disabled>
          Disabled
        </Button>
        <Button href="#buttons" variant="secondary">
          Link button
        </Button>
      </Row>
      <Row>
        <Button variant="primary" size="sm">
          Small
        </Button>
        <IconButton icon="print" label="Print (icon button)" variant="secondary" />
        <IconButton icon="palette" label="Theme (ghost icon button)" />
        <PrintAction />
      </Row>
    </div>
  );
}

function BadgesSection() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--htb-space-sm)" }}>
      <Row>
        {STATUS_TONES.map((tone) => (
          <Badge key={tone} status={tone}>
            {tone}
          </Badge>
        ))}
      </Row>
      <Row>
        {ACCENTS.map((accent) => (
          <Badge key={accent} accent={accent}>
            {accent}
          </Badge>
        ))}
        <Badge>neutral</Badge>
      </Row>
    </div>
  );
}

function CardsSection() {
  return (
    <div style={{ display: "grid", gap: "var(--htb-space-md)", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
      {ACCENTS.map((accent) => (
        <Card key={accent} accent={accent} eyebrow={accent} title="Card title" interactive>
          <p className="muted">Glass card with a domain accent strip, hover lift and eyebrow.</p>
        </Card>
      ))}
      <Card tone="1" title="Opaque tone 1">
        <p className="muted">surface.1 card.</p>
      </Card>
      <Card tone="2" title="Opaque tone 2">
        <p className="muted">surface.2 card.</p>
      </Card>
    </div>
  );
}

function FormsSection() {
  const [on, setOn] = useState(true);
  const [seg, setSeg] = useState("b");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--htb-space-md)", maxWidth: 420 }}>
      <Input label="Text input" placeholder="Type here…" hint="Hint text under the field." />
      <Input label="Invalid input" aria-invalid defaultValue="Broken value" />
      <Input label="Disabled input" disabled defaultValue="Read only" />
      <Select label="Select" options={[{ value: "a", label: "Option A" }, { value: "b", label: "Option B" }]} />
      <Switch checked={on} onCheckedChange={setOn} label={`Switch is ${on ? "on" : "off"}`} />
      <Segmented name="lab-seg" legend="Segmented" value={seg} onChange={setSeg} options={[{ value: "a", label: "One" }, { value: "b", label: "Two" }, { value: "c", label: "Three" }]} />
    </div>
  );
}

function OverlaysSection() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tab, setTab] = useState("tokens");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--htb-space-md)" }}>
      <Row>
        <Button variant="secondary" onClick={() => setDialogOpen(true)}>
          Open dialog
        </Button>
        <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
          Open drawer
        </Button>
        <Tooltip content="Supplemental hint shown on hover and focus.">
          <Button variant="subtle">Tooltip on hover/focus</Button>
        </Tooltip>
        <Popover trigger="Popover" label="Example popover">
          <p className="muted">Small floating panel. Esc or outside click closes it.</p>
        </Popover>
      </Row>
      <Tabs
        label="Example tabs"
        value={tab}
        onChange={setTab}
        items={[{ value: "tokens", label: "Tokens" }, { value: "states", label: "States" }, { value: "off", label: "Disabled", disabled: true }]}
      >
        <p className="muted">Active tab: {tab}. Arrow keys move between tabs.</p>
      </Tabs>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Example dialog">
        <p className="muted">Native dialog element: focus trap, Esc and backdrop click are built in.</p>
        <div>
          <Button variant="primary" onClick={() => setDialogOpen(false)}>
            Done
          </Button>
        </div>
      </Dialog>
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Example drawer">
        <p className="muted">End-side drawer used for progressive disclosure (evidence, adjustments).</p>
      </Drawer>
    </div>
  );
}

function NavigationSection() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--htb-space-md)" }}>
      <Navigation
        label="Lab sample navigation"
        currentHref="/play"
        items={[
          { href: "/", label: "Now", icon: "home", accent: "brand" },
          { href: "/feeding", label: "Feeding", icon: "feeding", accent: "feeding" },
          { href: "/play", label: "Play & Development", shortLabel: "Play", icon: "play", accent: "play" },
          { href: "/sleep", label: "Sleep", icon: "sleep", accent: "sleep" },
        ]}
      />
      <Surface tone="glass" elevated style={{ padding: "var(--htb-space-md)", maxWidth: 420 }}>
        <p className="muted">Glass surface over the canvas motifs — check translucency, border and inset highlight.</p>
      </Surface>
      <Row>
        <Skeleton width="180px" height="1em" />
        <Skeleton width="120px" height="2.5em" />
        <Icon name="safety" label="Safety icon" />
        <Icon name="tools" label="Tools icon" />
      </Row>
      <Divider />
      <p className="muted">
        Text styles: <a href="/theme-lab">link</a> · <strong>strong</strong> · body · <span className="muted">muted</span>
      </p>
    </div>
  );
}

/** Ordered showcase. Append Phase 2+ evidence/safety/domain components here. */
export const LAB_SECTIONS: readonly LabSection[] = [
  { id: "buttons", title: "Buttons", render: () => <ButtonsSection /> },
  { id: "badges", title: "Badges — status & accents", render: () => <BadgesSection /> },
  { id: "cards", title: "Cards & surfaces", render: () => <CardsSection /> },
  { id: "forms", title: "Form controls", render: () => <FormsSection /> },
  { id: "overlays", title: "Tabs, tooltip, popover, dialog, drawer", render: () => <OverlaysSection /> },
  { id: "navigation", title: "Navigation, glass, skeleton, text", render: () => <NavigationSection /> },
];
