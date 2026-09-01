// SPDX-License-Identifier: AGPL-3.0-only
import { Button } from "@howtobaby/ui";

import { PageShell } from "@/components/PageShell";
import { T } from "@/i18n/T";

export default function NotFound() {
  return (
    <PageShell title={<T id="notFound.title" />} lede={<T id="notFound.lede" />}>
      <div>
        <Button href="/" variant="primary">
          <T id="notFound.backHome" />
        </Button>
      </div>
    </PageShell>
  );
}
