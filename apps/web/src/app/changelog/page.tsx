// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";

import { Card } from "@howtobaby/ui";

import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = { title: "Changelog / Corrections" };

export default function Page() {
  return (
    <PageShell eyebrow="Trust" title="Changelog / Corrections" lede="Parent-facing changes and corrections, in one place." printable>
      <Card tone="2">
        <div className="prose">
          <p>When published guidance changes meaning, or a correction is made, it is recorded here with the date and the affected content. This page is generated from the content version history once guidance is published.</p>
          <p className="muted">Current release: application shell and theme engine (Phase 1). No guidance content is published yet.</p>
        </div>
      </Card>
    </PageShell>
  );
}
