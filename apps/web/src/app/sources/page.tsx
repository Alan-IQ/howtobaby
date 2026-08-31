// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";

import { Card } from "@howtobaby/ui";

import { PageShell } from "@/components/PageShell";
import { SITE } from "@/site";

export const metadata: Metadata = { title: "Sources" };

export default function Page() {
  return (
    <PageShell eyebrow="Trust" title="Sources" lede="The registry of original authorities HowToBaby guidance is built from." printable>
      <Card tone="2">
        <div className="prose">
          <p>This page will list every source record the product actually uses — organization, exact title, jurisdiction, verification date and a link to the original — generated from the same provenance graph that powers inline source chips and page references.</p>
          <p className="muted">No guidance has been published yet, so the registry view is empty in this release. The source registry itself is maintained in the public repository.</p>
          <p><a href={SITE.sourceCodeUrl} rel="noopener">Browse the repository</a></p>
        </div>
      </Card>
    </PageShell>
  );
}
