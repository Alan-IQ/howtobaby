// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";

import { Card } from "@howtobaby/ui";

import { ExternalLink } from "@/components/ExternalLink";
import { PageShell } from "@/components/PageShell";
import { T } from "@/i18n/T";
import { SITE } from "@/site";

export const metadata: Metadata = { title: "License" };

// License identifiers (AGPL-3.0-only, CC BY-NC-SA 4.0) stay verbatim inside the localized copy.
export default function Page() {
  return (
    <PageShell eyebrow={<T id="trust.eyebrow" />} title={<T id="trust.license.label" />} lede={<T id="page.license.lede" />} printable>
      <Card tone="2">
        <div className="prose">
          <p>
            <strong>
              <T id="license.software.term" />
            </strong>{" "}
            <T id="license.software.rest" />{" "}
            <strong>
              <T id="license.content.term" />
            </strong>{" "}
            <T id="license.content.rest" />
          </p>
          <p>
            <T id="license.p2" />
          </p>
          <p>
            <ExternalLink href={SITE.licenseUrl}>
              <T id="license.readMap" />
            </ExternalLink>{" "}
            ·{" "}
            <ExternalLink href={SITE.sourceCodeUrl}>
              <T id="license.sourceCode" />
            </ExternalLink>
          </p>
        </div>
      </Card>
    </PageShell>
  );
}
