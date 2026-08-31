// SPDX-License-Identifier: AGPL-3.0-only
"use client";

/**
 * Theme Lab (development/QA only): switch installed themes and colour modes, preview via URL parameters,
 * and review every primitive/state in one place for visual/theme regression checks.
 */

import type { ColorModePreference } from "@howtobaby/themes";
import { Badge, Card, Segmented, useTheme } from "@howtobaby/ui";

import { PageShell } from "@/components/PageShell";
import { LAB_SECTIONS } from "./sections";

function LabControls() {
  const { themes, preference, colorMode, isPreview, setThemeId, setColorMode } = useTheme();
  return (
    <Card tone="glass" title="Theme controls" titleAs="h2">
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--htb-space-md)", alignItems: "center" }}>
        <Segmented<string>
          name="lab-theme"
          legend="Theme family"
          value={preference.themeId}
          onChange={setThemeId}
          options={themes.map((t) => ({ value: t.id, label: t.label }))}
        />
        <Segmented<ColorModePreference>
          name="lab-mode"
          legend="Colour mode"
          value={preference.colorMode}
          onChange={setColorMode}
          options={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
            { value: "system", label: "System" },
          ]}
        />
        <Badge status={isPreview ? "caution" : "info"}>{isPreview ? "URL preview active (not saved)" : `resolved: ${colorMode}`}</Badge>
      </div>
      <p className="muted">
        URL override for any page: append <code>?theme=&lt;id&gt;&amp;mode=light|dark|system</code>. Previews are never written to the stored
        preference; picking a control above ends the preview and persists normally.
      </p>
      <p className="muted">Installed: {themes.map((t) => `${t.label} (${t.id}, ${t.source})`).join(" · ")}</p>
    </Card>
  );
}

export function ThemeLab() {
  return (
    <PageShell
      eyebrow="Theme Lab"
      icon="palette"
      accent="brand"
      title="Theme Lab"
      lede="Development-only surface: verify every primitive and state across installed themes and colour modes. Not linked from production navigation; not indexed."
    >
      <LabControls />
      <nav aria-label="Lab sections" className="muted">
        {LAB_SECTIONS.map((s, i) => (
          <span key={s.id}>
            {i > 0 ? " · " : ""}
            <a href={`#${s.id}`}>{s.title}</a>
          </span>
        ))}
      </nav>
      {LAB_SECTIONS.map((section) => (
        <Card key={section.id} tone="1" title={<span id={section.id}>{section.title}</span>} titleAs="h2">
          {section.render()}
        </Card>
      ))}
    </PageShell>
  );
}
