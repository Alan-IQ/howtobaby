// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";

import { Card } from "@howtobaby/ui";

import { PageShell } from "@/components/PageShell";
import { T } from "@/i18n/T";

export const metadata: Metadata = { title: "Medical Disclaimer" };

export default function Page() {
  return (
    <PageShell eyebrow={<T id="trust.eyebrow" />} title={<T id="trust.disclaimer.label" />} lede={<T id="page.disclaimer.lede" />} printable>
      <Card tone="2">
        <div className="prose">
          <p>
            <strong>
              <T id="disclaimer.p1.lead" />
            </strong>{" "}
            <T id="disclaimer.p1.rest" />
          </p>
          <p>
            <T id="disclaimer.p2" />
          </p>
        </div>
      </Card>
    </PageShell>
  );
}
