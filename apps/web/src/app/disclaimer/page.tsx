// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";

import { Card } from "@howtobaby/ui";

import { PageShell } from "@/components/PageShell";
import { SITE } from "@/site";

export const metadata: Metadata = { title: "Medical Disclaimer" };

export default function Page() {
  return (
    <PageShell eyebrow="Trust" title="Medical Disclaimer" lede="What HowToBaby is — and is not." printable>
      <Card tone="2">
        <div className="prose">
          <p><strong>{SITE.name} is a practical parent reference.</strong> It is not a medical record, a diagnosis engine, a developmental screening test, an emergency service, or a substitute for pediatric care.</p>
          <p>Age selects candidate guidance; it does not prove readiness, suitability or developmental status. Always follow the advice of your child’s clinician, and contact local emergency services in an emergency.</p>
        </div>
      </Card>
    </PageShell>
  );
}
