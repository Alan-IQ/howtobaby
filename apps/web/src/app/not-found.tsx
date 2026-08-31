// SPDX-License-Identifier: AGPL-3.0-only
import { Button } from "@howtobaby/ui";

import { PageShell } from "@/components/PageShell";

export default function NotFound() {
  return (
    <PageShell title="Page not found" lede="That address does not exist here. It may have moved, or the link may be incomplete.">
      <div>
        <Button href="/" variant="primary">
          Back to Now
        </Button>
      </div>
    </PageShell>
  );
}
