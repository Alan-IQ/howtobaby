// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";

import { Card } from "@howtobaby/ui";

import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = { title: "Play & Development" };

export default function Page() {
  return (
    <PageShell eyebrow="Play & Development" icon="play" accent="play" title="Play & Development" lede="Age-relevant play ideas and development context, without pass/fail milestones.">
      <Card title="What this section will hold" titleAs="h2">
        <div className="prose">
          <p>Stage maps, milestone context, activities and variations, and corrected-age handling, presented as context for play and connection — not as a screening test.</p>
          <p className="muted">This destination is part of the application shell. Its guidance is published only after the content, evidence and review pipeline for it is in place — never as unreviewed text.</p>
        </div>
      </Card>
    </PageShell>
  );
}
