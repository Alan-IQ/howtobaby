// SPDX-License-Identifier: AGPL-3.0-only
/** "Browse by age" block for a domain landing page: public stage chips, no profile required. */

import type { StageDomain } from "@howtobaby/core";
import { Card } from "@howtobaby/ui";

import { T } from "@/i18n/T";
import { StageNavigator } from "./StageNavigator";
import { STAGE_DESTINATIONS } from "./routes";

export function BrowseByAge({ domain }: { domain: StageDomain }) {
  return (
    <Card icon={STAGE_DESTINATIONS[domain].icon} accent={STAGE_DESTINATIONS[domain].accent} title={<T id="browse.byAge.title" />} titleAs="h2" className="browse-by-age">
      <p className="muted">
        <T id="browse.byAge.lede" />
      </p>
      <StageNavigator domain={domain} />
    </Card>
  );
}
