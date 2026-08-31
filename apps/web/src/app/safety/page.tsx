// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";

import { Card } from "@howtobaby/ui";

import { PageShell } from "@/components/PageShell";
import { L } from "@/i18n/L";

export const metadata: Metadata = { title: "Safety" };

export default function Page() {
  return (
    <PageShell
      eyebrow={<L en="Safety" vi="An toàn" />}
      icon="safety"
      accent="safety"
      title={<L en="Safety" vi="An toàn" />}
      printTitle="Safety"
      lede={<L en="Age-relevant safety priorities, ranked by severity and kept visible in every theme." vi="Ưu tiên an toàn theo độ tuổi, xếp theo mức độ nghiêm trọng và luôn hiển thị ở mọi theme." />}
    >
      <Card icon="safety" title={<L en="What this section will hold" vi="Mục này sẽ có gì" />} titleAs="h2">
        <div className="prose">
          <p>
            <L en="Safety guidance for the actual child’s current stage. Browsing another stage never hides or unlocks safety guidance that applies to your child." vi="Hướng dẫn an toàn cho giai đoạn hiện tại thật của bé. Việc xem giai đoạn khác không bao giờ ẩn hay mở khóa hướng dẫn an toàn áp dụng cho con bạn." />
          </p>
          <p className="muted">
            <L en="This destination is part of the application shell. Its guidance is published only after the content, evidence and review pipeline for it is in place — never as unreviewed text." vi="Trang này thuộc khung ứng dụng. Hướng dẫn của nó chỉ được xuất bản sau khi quy trình nội dung, bằng chứng và rà soát sẵn sàng — không bao giờ là văn bản chưa duyệt." />
          </p>
        </div>
      </Card>
    </PageShell>
  );
}
