// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";

import { Card } from "@howtobaby/ui";

import { PageShell } from "@/components/PageShell";
import { T } from "@/i18n/T";

export const metadata: Metadata = { title: "Sleep" };

export default function Page() {
  return (
    <PageShell
      eyebrow={<T id="page.sleep.title" />}
      icon="sleep"
      accent="sleep"
      title={<T id="page.sleep.title" />}
      printTitle="Sleep"
      lede={<T id="page.sleep.lede" />}
    >
      <Card icon="sleep" title={<T id="section.placeholder.title" />} titleAs="h2">
        <div className="prose">
          <p>
            <T id="page.sleep.hold.p1" />
          </p>
          <p className="muted">
            <T id="section.placeholder.note" />
          </p>
        </div>
      </Card>
    </PageShell>
  );
}
