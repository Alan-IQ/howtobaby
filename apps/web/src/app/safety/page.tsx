// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";

import { Card } from "@howtobaby/ui";

import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = { title: "Safety" };

export default function Page() {
  return (
    <PageShell eyebrow="Safety" icon="safety" accent="safety" title="Safety" lede="Age-relevant safety priorities, ranked by severity and kept visible in every theme.">
      <Card title="What this section will hold" titleAs="h2">
        <div className="prose">
          <p>Safety guidance for the actual child’s current stage. Browsing another stage never hides or unlocks safety guidance that applies to your child.</p>
          <p className="muted">This destination is part of the application shell. Its guidance is published only after the content, evidence and review pipeline for it is in place — never as unreviewed text.</p>
        </div>
      </Card>
    </PageShell>
  );
}
