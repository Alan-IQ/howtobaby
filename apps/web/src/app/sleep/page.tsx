// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";

import { Card } from "@howtobaby/ui";

import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = { title: "Sleep" };

export default function Page() {
  return (
    <PageShell eyebrow="Sleep" icon="sleep" accent="sleep" title="Sleep" lede="Typical sleep patterns, safe-sleep basics and editable example routines.">
      <Card icon="sleep" title="What this section will hold" titleAs="h2">
        <div className="prose">
          <p>Official duration guidance, safe-sleep guidance, responsive newborn mode, nap and wake-window heuristics labelled as heuristics, and example plans you can adjust.</p>
          <p className="muted">This destination is part of the application shell. Its guidance is published only after the content, evidence and review pipeline for it is in place — never as unreviewed text.</p>
        </div>
      </Card>
    </PageShell>
  );
}
