// SPDX-License-Identifier: AGPL-3.0-only
import Link from "next/link";
import type { Metadata } from "next";

import { Card, Icon } from "@howtobaby/ui";

import { PageShell } from "@/components/PageShell";
import { ChildSummary } from "@/features/profile/ChildSummary";
import { PreviewPlanDate } from "@/features/profile/PreviewPlanDate";
import { ProfileEditor } from "@/features/profile/ProfileEditor";
import { T } from "@/i18n/T";
import type { AppMessageKey } from "@/i18n/messages";
import { PRIMARY_NAV, SITE } from "@/site";

export const metadata: Metadata = { title: { absolute: `${SITE.name} — ${SITE.tagline}` } };

/** One-line destination blurbs, keyed into the app message dictionary per destination. */
const DESTINATION_BLURB_KEYS: Partial<Record<string, AppMessageKey>> = {
  "/feeding": "page.home.blurb.feeding",
  "/play": "page.home.blurb.play",
  "/sleep": "page.home.blurb.sleep",
  "/safety": "page.home.blurb.safety",
  "/tools": "page.home.blurb.tools",
};

/**
 * Now (docs/GUI_DESIGN.md §7). Phase 3 adds the child/context summary — the optional local profile,
 * today's resolved context and a session-only plan-date preview — above the destination overview;
 * "What matters now", focus cards and the routine timeline belong to the Now composer phase.
 */
export default function NowPage() {
  return (
    <PageShell
      eyebrow={<T id="nav.now.label" />}
      icon="home"
      accent="brand"
      title={<T id="page.home.title" />}
      lede={<T id="page.home.lede" />}
    >
      <div className="card-grid">
        <ProfileEditor />
        <ChildSummary />
      </div>
      <PreviewPlanDate />
      <div className="card-grid card-grid--3">
        {/* Destination cards use the FULL domain display title (titleKey) — never the short nav label. */}
        {PRIMARY_NAV.filter((item) => item.href !== "/").map((item) => {
          const blurbKey = DESTINATION_BLURB_KEYS[item.href];
          return (
            <Link key={item.href} href={item.href} className="card-link">
              <Card
                as="div"
                accent={item.accent}
                interactive
                title={
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--htb-space-xs)" }}>
                    <Icon name={item.icon} />
                    <T id={item.titleKey} />
                  </span>
                }
              >
                {blurbKey ? (
                  <p className="muted">
                    <T id={blurbKey} />
                  </p>
                ) : null}
              </Card>
            </Link>
          );
        })}
      </div>
      <Card icon="info" title={<T id="page.home.how.title" />} titleAs="h2">
        <div className="prose">
          <p>
            <T id="page.home.how.p1" />
          </p>
          <p>
            <T id="page.home.how.p2" />
          </p>
        </div>
      </Card>
    </PageShell>
  );
}
