// SPDX-License-Identifier: AGPL-3.0-only
import Link from "next/link";
import type { Metadata } from "next";

import { Card, Icon } from "@howtobaby/ui";

import { PageShell } from "@/components/PageShell";
import { PRIMARY_NAV, SITE } from "@/site";

export const metadata: Metadata = { title: { absolute: `${SITE.name} — ${SITE.tagline}` } };

const DESTINATION_BLURBS: Record<string, string> = {
  "/feeding": "What, how and when to feed, by stage and readiness.",
  "/play": "Play ideas and development context for the current stage.",
  "/sleep": "Sleep patterns, safe-sleep basics and example routines.",
  "/safety": "Age-relevant safety priorities, clearly ranked.",
  "/tools": "Practical utilities: calculators, routines, soothing sounds.",
};

/**
 * Now (docs/GUI_DESIGN.md §7). Phase 1 ships the shell and destination overview only; the child/context
 * summary, "What matters now" and focus cards arrive with the age/context and domain phases.
 */
export default function NowPage() {
  return (
    <PageShell eyebrow="Now" icon="home" accent="brand" title={SITE.tagline} lede="Evidence-to-action guidance and practical tools for parents — organized around your child’s current stage.">
      <div className="card-grid card-grid--3">
        {PRIMARY_NAV.filter((item) => item.href !== "/").map((item) => (
          <Link key={item.href} href={item.href} className="card-link">
            <Card as="div" accent={item.accent} interactive title={<span style={{ display: "inline-flex", alignItems: "center", gap: "var(--htb-space-xs)" }}>{item.icon ? <Icon name={item.icon} /> : null}{item.label}</span>}>
              <p className="muted">{DESTINATION_BLURBS[item.href]}</p>
            </Card>
          </Link>
        ))}
      </div>
      <Card icon="info" title="How HowToBaby works" titleAs="h2">
        <div className="prose">
          <p>
            HowToBaby organizes approved guidance from public-health authorities by age and context, keeps each statement linked to its source,
            and turns it into practical actions — without inventing precision the source does not have.
          </p>
          <p>
            Guidance content, age-aware browsing and the personalized Now view are being added phase by phase. Everything you see today is the
            application shell; no health guidance is published here yet.
          </p>
        </div>
      </Card>
    </PageShell>
  );
}
