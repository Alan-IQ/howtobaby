// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";

import { Card } from "@howtobaby/ui";

import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = { title: "Tools" };

export default function Page() {
  return (
    <PageShell eyebrow="Tools" icon="tools" accent="tools" title="Tools" lede="Practical utilities for parents. A tool is a utility first; it carries no health claim just for living here.">
      <Card tone="2" title="What this section will hold" titleAs="h2">
        <div className="prose">
          <p>Grouped by purpose — Soothe & Sound, Plan & Routine, Calculate, Print & Share — with clear labels showing whether a tool is purely utility or linked to guidance.</p>
          <p className="muted">This destination is part of the application shell. Its guidance is published only after the content, evidence and review pipeline for it is in place — never as unreviewed text.</p>
        </div>
      </Card>
    </PageShell>
  );
}
