// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";

import { Card } from "@howtobaby/ui";

import { PageShell } from "@/components/PageShell";
import { T } from "@/i18n/T";

export const metadata: Metadata = { title: "Privacy" };

export default function Page() {
  return (
    <PageShell eyebrow={<T id="trust.eyebrow" />} title={<T id="trust.privacy.label" />} lede={<T id="page.privacy.lede" />} printable>
      <Card tone="2">
        <div className="prose">
          <p>
            <T id="privacy.p1" />
          </p>
          <p>
            <T id="privacy.p2" />
          </p>
        </div>
      </Card>
    </PageShell>
  );
}
