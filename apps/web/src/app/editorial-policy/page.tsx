// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";

import { Card } from "@howtobaby/ui";

import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = { title: "Editorial Policy" };

export default function Page() {
  return (
    <PageShell eyebrow="Trust" title="Editorial Policy" lede="Who writes and reviews HowToBaby content, and what may not be published." printable>
      <Card tone="2">
        <div className="prose">
          <p>English content is authored and reviewed first; Vietnamese must preserve the same meaning, quantities, negations, urgency and age boundaries. Official-guidance statements require direct support from an approved primary source. Disagreement between sources stays visible; it is never averaged away.</p>
          <p>AI assistance may help with retrieval, drafting or translation, but nothing becomes canonical without the required source verification and human review.</p>
        </div>
      </Card>
    </PageShell>
  );
}
