// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import Link from "next/link";

import { Icon } from "@howtobaby/ui";

import { L } from "@/i18n/L";
import { useLanguage } from "@/i18n/LanguageProvider";
import { SITE, TRUST_LINKS } from "@/site";

/**
 * Global legal/source footer (docs/GUI_DESIGN.md §2.1). Must survive every theme; a vendor shell
 * cannot remove it. Compact by design: one trust-link band plus two lines of fine print. All
 * presentation preferences (theme, language) live in the header — the footer carries none.
 */
export function SiteFooter() {
  const { language } = useLanguage();
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <nav aria-label={language === "vi" ? "Tin cậy và pháp lý" : "Trust and legal"}>
          <ul className="site-footer__links">
            {TRUST_LINKS.map((link) => {
              const label = language === "vi" ? link.viLabel : link.label;
              return "external" in link && link.external ? (
                <li key={link.href}>
                  <a href={link.href} rel="noopener">
                    {label}
                    <Icon name="external" label={language === "vi" ? "mở trang ngoài" : "opens external site"} />
                  </a>
                </li>
              ) : (
                <li key={link.href}>
                  <Link href={link.href}>{label}</Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <p>
          <L
            en={`${SITE.name} is a practical parent reference, not a medical record, diagnosis engine, developmental screening test, emergency service, or substitute for pediatric care.`}
            vi={`${SITE.name} là một tài liệu tham khảo thực hành cho cha mẹ — không phải hồ sơ y tế, công cụ chẩn đoán, bài sàng lọc phát triển, dịch vụ cấp cứu hay sự thay thế cho chăm sóc nhi khoa.`}
          />
        </p>
        <p className="muted">
          <L
            en={`Software AGPL-3.0-only · Original content CC BY-NC-SA 4.0 · ${SITE.name} name and logo are not covered by those licenses.`}
            vi={`Phần mềm AGPL-3.0-only · Nội dung gốc CC BY-NC-SA 4.0 · Tên và logo ${SITE.name} không thuộc các giấy phép này.`}
          />
        </p>
      </div>
    </footer>
  );
}
