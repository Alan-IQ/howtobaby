// SPDX-License-Identifier: AGPL-3.0-only
import Link from "next/link";
import type { Metadata } from "next";

import { Card, Icon } from "@howtobaby/ui";

import { PageShell } from "@/components/PageShell";
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
 * Now (docs/GUI_DESIGN.md §7). Phase 1 ships the shell and destination overview only; the child/context
 * summary, "What matters now" and focus cards arrive with the age/context and domain phases.
 */
export default function NowPage() {
  return (
    <PageShell
      eyebrow={<T id="nav.now.label" />}
      icon="home"
      accent="brand"
      title={<T id="page.home.title" />}
      printTitle={SITE.tagline}
      lede={<T id="page.home.lede" />}
    >
      <div className="card-grid card-grid--3">
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
                    <T id={item.labelKey} />
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
