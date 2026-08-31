// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";

import { Card } from "@howtobaby/ui";

import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = { title: "Feeding" };

export default function Page() {
  return (
    <PageShell eyebrow="Feeding" icon="feeding" accent="feeding" title="Feeding" lede="Feeding guidance by stage and readiness, with the source behind every statement.">
      <Card title="What this section will hold" titleAs="h2">
        <div className="prose">
          <p>Milk feeding, starting solids, textures, responsive feeding, allergen introduction and feeding safety — organized by stage and readiness rather than by a single age cut-off, with each claim linked to its original source.</p>
          <p className="muted">This destination is part of the application shell. Its guidance is published only after the content, evidence and review pipeline for it is in place — never as unreviewed text.</p>
        </div>
      </Card>
    </PageShell>
  );
}
