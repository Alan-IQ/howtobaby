// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import Link from "next/link";

import { Icon } from "@howtobaby/ui";

import { T, useMessages } from "@/i18n/T";
import { TRUST_LINKS } from "@/site";

/**
 * Global legal/source footer (docs/GUI_DESIGN.md §2.1). Must survive every theme; a vendor shell
 * cannot remove it. Compact by design: one trust-link band plus two lines of fine print. All
 * presentation preferences (theme, language) live in the header — the footer carries none.
 */
export function SiteFooter() {
  const t = useMessages();
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <nav aria-label={t("footer.trust.label")}>
          <ul className="site-footer__links">
            {TRUST_LINKS.map((link) =>
              link.external ? (
                <li key={link.href}>
                  <a href={link.href} rel="noopener">
                    {t(link.labelKey)}
                    <Icon name="external" label={t("footer.external.icon")} />
                  </a>
                </li>
              ) : (
                <li key={link.href}>
                  <Link href={link.href}>{t(link.labelKey)}</Link>
                </li>
              ),
            )}
          </ul>
        </nav>
        <p>
          <T id="footer.disclaimer" />
        </p>
        <p className="muted">
          <T id="footer.licenses" />
        </p>
      </div>
    </footer>
  );
}
