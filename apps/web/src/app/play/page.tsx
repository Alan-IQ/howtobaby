// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";

import { Card } from "@howtobaby/ui";

import { PageShell } from "@/components/PageShell";
import { T } from "@/i18n/T";

// The PAGE title keeps the full domain name ("Play & Development" / "Chơi & Phát triển");
// only navigation labels shorten to "Play"/"Chơi" (domain.play.title vs nav.play.label).
export const metadata: Metadata = { title: "Play & Development" };

export default function Page() {
  return (
    <PageShell
      eyebrow={<T id="domain.play.title" />}
      icon="play"
      accent="play"
      title={<T id="domain.play.title" />}
      lede={<T id="page.play.lede" />}
    >
      <Card icon="play" title={<T id="section.placeholder.title" />} titleAs="h2">
        <div className="prose">
          <p>
            <T id="page.play.hold.p1" />
          </p>
          <p className="muted">
            <T id="section.placeholder.note" />
          </p>
        </div>
      </Card>
    </PageShell>
  );
}
