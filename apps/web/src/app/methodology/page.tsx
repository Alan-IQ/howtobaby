// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";

import { Card } from "@howtobaby/ui";

import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = { title: "Methodology" };

export default function Page() {
  return (
    <PageShell eyebrow="Trust" title="Methodology" lede="How an original source becomes a HowToBaby claim, and how freshness and review work." printable>
      <Card tone="2">
        <div className="prose">
          <p>HowToBaby interprets, cites and links. Each statement is classed (official guidance, evidence synthesis, typical pattern, example plan, practical interpretation or product heuristic), tied to one or more source records with a locator, and reviewed before it ships. Qualifiers such as “about”, “may” or “when ready” are preserved rather than sharpened into invented precision.</p>
          <p>Sources are monitored for change. A detected change marks the dependent claims for review; it never rewrites guidance automatically.</p>
          <p className="muted">The full methodology is documented alongside the evidence pipeline as it is implemented.</p>
        </div>
      </Card>
    </PageShell>
  );
}
