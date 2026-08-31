// SPDX-License-Identifier: AGPL-3.0-only
import Link from "next/link";

import { Icon, ThemeSwitcher } from "@howtobaby/ui";

import { SITE, TRUST_LINKS } from "@/site";

/** Global legal/source footer (docs/GUI_DESIGN.md §2.1). Must survive every theme; a vendor shell cannot remove it. */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <nav aria-label="Trust and legal">
          <ul className="site-footer__links">
            {TRUST_LINKS.map((link) =>
              "external" in link && link.external ? (
                <li key={link.href}>
                  <a href={link.href} rel="noopener">
                    {link.label}
                    <Icon name="external" label="opens external site" />
                  </a>
                </li>
              ) : (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ),
            )}
          </ul>
        </nav>
        <div className="site-footer__theme">
          {/* Colour mode only; switching theme family is a Theme Lab affordance, not production UI. */}
          <ThemeSwitcher showThemeFamily={false} />
        </div>
        <p>
          {SITE.name} is a practical parent reference, not a medical record, diagnosis engine, developmental screening test, emergency
          service, or substitute for pediatric care.
        </p>
        <p className="muted">
          Software AGPL-3.0-only · Original content CC BY-NC-SA 4.0 · {SITE.name} name and logo are not covered by those licenses.
        </p>
      </div>
    </footer>
  );
}
