// SPDX-License-Identifier: AGPL-3.0-only
import type { ReactNode } from "react";

import { SkipLink } from "@howtobaby/ui";

import { T } from "@/i18n/T";

import { AppHeader } from "./AppHeader";
import { PrimaryNav } from "./PrimaryNav";
import { SiteFooter } from "./SiteFooter";

export const MAIN_CONTENT_ID = "main-content";

/** AppShell: skip link → header → main → footer, plus the mobile tab bar. Vendor shells map into these slots. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <SkipLink targetId={MAIN_CONTENT_ID}>
        <T id="app.skipToContent" />
      </SkipLink>
      <AppHeader />
      <main id={MAIN_CONTENT_ID} className="app-main" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
      <div className="app-tabbar">
        <PrimaryNav layout="tabs" />
      </div>
    </div>
  );
}
