// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";

import { Card } from "@howtobaby/ui";

import { PageShell } from "@/components/PageShell";
import { SITE } from "@/site";

export const metadata: Metadata = { title: "License" };

export default function Page() {
  return (
    <PageShell eyebrow="Trust" title="License" lede="Software, content and brand are licensed separately." printable>
      <Card tone="2">
        <div className="prose">
          <p><strong>Software</strong> is licensed under AGPL-3.0-only. <strong>Original HowToBaby knowledge, documentation and translations</strong> are licensed under CC BY-NC-SA 4.0 where the project holds the rights.</p>
          <p>Cited guidance from public-health authorities remains under its original rights — provenance is not relicensing. The {SITE.name} name and logo are not covered by either license.</p>
          <p><a href={SITE.licenseUrl} rel="noopener">Read the full license map</a> · <a href={SITE.sourceCodeUrl} rel="noopener">Source code</a></p>
        </div>
      </Card>
    </PageShell>
  );
}
