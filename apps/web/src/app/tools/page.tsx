// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";

import { Card } from "@howtobaby/ui";

import { PageShell } from "@/components/PageShell";
import { T } from "@/i18n/T";

export const metadata: Metadata = { title: "Tools" };

export default function Page() {
  return (
    <PageShell
      eyebrow={<T id="page.tools.title" />}
      icon="tools"
      accent="tools"
      title={<T id="page.tools.title" />}
      printTitle="Tools"
      lede={<T id="page.tools.lede" />}
    >
      <Card icon="tools" title={<T id="section.placeholder.title" />} titleAs="h2">
        <div className="prose">
          <p>
            <T id="page.tools.hold.p1" />
          </p>
          <p className="muted">
            <T id="section.placeholder.note" />
          </p>
        </div>
      </Card>
    </PageShell>
  );
}
