// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";

import { Card } from "@howtobaby/ui";

import { PageShell } from "@/components/PageShell";
import { T } from "@/i18n/T";

export const metadata: Metadata = { title: "Changelog / Corrections" };

export default function Page() {
  return (
    <PageShell eyebrow={<T id="trust.eyebrow" />} title={<T id="trust.changelog.label" />} lede={<T id="page.changelog.lede" />} printable>
      <Card tone="2">
        <div className="prose">
          <p>
            <T id="changelog.p1" />
          </p>
          <p className="muted">
            <T id="changelog.status" />
          </p>
        </div>
      </Card>
    </PageShell>
  );
}
