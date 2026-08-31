// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";

import { Card } from "@howtobaby/ui";

import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = { title: "Privacy" };

export default function Page() {
  return (
    <PageShell eyebrow="Trust" title="Privacy" lede="Local-first by design." printable>
      <Card tone="2">
        <div className="prose">
          <p>Personalization in HowToBaby is local-first: a child profile, when that feature exists, stays on your device and is never sent to a server, placed in a URL, or included in analytics or logs.</p>
          <p>Today the site stores exactly one thing in your browser: your theme and colour-mode preference. There are no analytics or tracking scripts.</p>
        </div>
      </Card>
    </PageShell>
  );
}
