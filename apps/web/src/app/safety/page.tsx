// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";

import { Card } from "@howtobaby/ui";

import { PageShell } from "@/components/PageShell";
import { T } from "@/i18n/T";

export const metadata: Metadata = { title: "Safety" };

export default function Page() {
  return (
    <PageShell
      eyebrow={<T id="domain.safety.title" />}
      icon="safety"
      accent="safety"
      title={<T id="domain.safety.title" />}
      lede={<T id="page.safety.lede" />}
    >
      <Card icon="safety" title={<T id="section.placeholder.title" />} titleAs="h2">
        <div className="prose">
          <p>
            <T id="page.safety.hold.p1" />
          </p>
          <p className="muted">
            <T id="section.placeholder.note" />
          </p>
        </div>
      </Card>
    </PageShell>
  );
}
