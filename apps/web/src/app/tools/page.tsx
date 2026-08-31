// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";

import { Card } from "@howtobaby/ui";

import { PageShell } from "@/components/PageShell";
import { L } from "@/i18n/L";

export const metadata: Metadata = { title: "Tools" };

export default function Page() {
  return (
    <PageShell
      eyebrow={<L en="Tools" vi="Công cụ" />}
      icon="tools"
      accent="tools"
      title={<L en="Tools" vi="Công cụ" />}
      printTitle="Tools"
      lede={<L en="Practical utilities for parents. A tool is a utility first; it carries no health claim just for living here." vi="Tiện ích thực hành cho cha mẹ. Công cụ trước hết là tiện ích; không mang tuyên bố sức khỏe chỉ vì nằm ở đây." />}
    >
      <Card icon="tools" title={<L en="What this section will hold" vi="Mục này sẽ có gì" />} titleAs="h2">
        <div className="prose">
          <p>
            <L en="Grouped by purpose — Soothe & Sound, Plan & Routine, Calculate, Print & Share — with clear labels showing whether a tool is purely utility or linked to guidance." vi="Nhóm theo mục đích — Ru dịu & Âm thanh, Kế hoạch & Lịch sinh hoạt, Tính toán, In & Chia sẻ — với nhãn rõ ràng cho biết công cụ là tiện ích thuần túy hay gắn với hướng dẫn." />
          </p>
          <p className="muted">
            <L en="This destination is part of the application shell. Its guidance is published only after the content, evidence and review pipeline for it is in place — never as unreviewed text." vi="Trang này thuộc khung ứng dụng. Hướng dẫn của nó chỉ được xuất bản sau khi quy trình nội dung, bằng chứng và rà soát sẵn sàng — không bao giờ là văn bản chưa duyệt." />
          </p>
        </div>
      </Card>
    </PageShell>
  );
}
