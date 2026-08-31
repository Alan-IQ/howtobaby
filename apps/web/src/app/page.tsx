// SPDX-License-Identifier: AGPL-3.0-only
import Link from "next/link";
import type { Metadata } from "next";

import { Card, Icon } from "@howtobaby/ui";

import { PageShell } from "@/components/PageShell";
import { L } from "@/i18n/L";
import { PRIMARY_NAV, PRIMARY_NAV_VI, SITE } from "@/site";

export const metadata: Metadata = { title: { absolute: `${SITE.name} — ${SITE.tagline}` } };

const DESTINATION_BLURBS: Record<string, { en: string; vi: string }> = {
  "/feeding": { en: "What, how and when to feed, by stage and readiness.", vi: "Cho bé ăn gì, thế nào và khi nào — theo giai đoạn và mức sẵn sàng." },
  "/play": { en: "Play ideas and development context for the current stage.", vi: "Ý tưởng chơi và bối cảnh phát triển cho giai đoạn hiện tại." },
  "/sleep": { en: "Sleep patterns, safe-sleep basics and example routines.", vi: "Nếp ngủ, nguyên tắc ngủ an toàn và lịch sinh hoạt mẫu." },
  "/safety": { en: "Age-relevant safety priorities, clearly ranked.", vi: "Ưu tiên an toàn theo độ tuổi, xếp hạng rõ ràng." },
  "/tools": { en: "Practical utilities: calculators, routines, soothing sounds.", vi: "Tiện ích thực hành: công cụ tính, lịch sinh hoạt, âm thanh ru dịu." },
};

/**
 * Now (docs/GUI_DESIGN.md §7). Phase 1 ships the shell and destination overview only; the child/context
 * summary, "What matters now" and focus cards arrive with the age/context and domain phases.
 */
export default function NowPage() {
  return (
    <PageShell
      eyebrow={<L en="Now" vi="Hiện tại" />}
      icon="home"
      accent="brand"
      title={<L en={SITE.tagline} vi="Biết bé cần gì. Ngay lúc này." />}
      printTitle={SITE.tagline}
      lede={<L en="Evidence-to-action guidance and practical tools for parents — organized around your child’s current stage." vi="Hướng dẫn dựa trên bằng chứng và công cụ thực hành cho cha mẹ — tổ chức quanh giai đoạn hiện tại của bé." />}
    >
      <div className="card-grid card-grid--3">
        {PRIMARY_NAV.filter((item) => item.href !== "/").map((item) => {
          const blurb = DESTINATION_BLURBS[item.href];
          return (
            <Link key={item.href} href={item.href} className="card-link">
              <Card
                as="div"
                accent={item.accent}
                interactive
                title={
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--htb-space-xs)" }}>
                    {item.icon ? <Icon name={item.icon} /> : null}
                    <L en={item.label} vi={PRIMARY_NAV_VI[item.href]?.label ?? item.label} />
                  </span>
                }
              >
                {blurb ? (
                  <p className="muted">
                    <L en={blurb.en} vi={blurb.vi} />
                  </p>
                ) : null}
              </Card>
            </Link>
          );
        })}
      </div>
      <Card icon="info" title={<L en="How HowToBaby works" vi="HowToBaby hoạt động thế nào" />} titleAs="h2">
        <div className="prose">
          <p>
            <L
              en="HowToBaby organizes approved guidance from public-health authorities by age and context, keeps each statement linked to its source, and turns it into practical actions — without inventing precision the source does not have."
              vi="HowToBaby tổ chức hướng dẫn đã được phê duyệt từ các cơ quan y tế công cộng theo độ tuổi và bối cảnh, giữ mỗi nội dung gắn với nguồn gốc của nó, và biến chúng thành hành động thực tế — không tự tạo độ chính xác mà nguồn không có."
            />
          </p>
          <p>
            <L
              en="Guidance content, age-aware browsing and the personalized Now view are being added phase by phase. Everything you see today is the application shell; no health guidance is published here yet."
              vi="Nội dung hướng dẫn, duyệt theo độ tuổi và trang Hiện tại cá nhân hóa đang được bổ sung theo từng giai đoạn. Những gì bạn thấy hôm nay là khung ứng dụng; chưa có hướng dẫn sức khỏe nào được xuất bản tại đây."
            />
          </p>
        </div>
      </Card>
    </PageShell>
  );
}
