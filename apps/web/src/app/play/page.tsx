// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";

import { Card } from "@howtobaby/ui";

import { PageShell } from "@/components/PageShell";
import { L } from "@/i18n/L";

export const metadata: Metadata = { title: "Play & Development" };

export default function Page() {
  return (
    <PageShell
      eyebrow={<L en="Play & Development" vi="Chơi & Phát triển" />}
      icon="play"
      accent="play"
      title={<L en="Play & Development" vi="Chơi & Phát triển" />}
      printTitle="Play & Development"
      lede={<L en="Age-relevant play ideas and development context, without pass/fail milestones." vi="Ý tưởng chơi và bối cảnh phát triển theo độ tuổi, không có cột mốc đạt/trượt." />}
    >
      <Card icon="play" title={<L en="What this section will hold" vi="Mục này sẽ có gì" />} titleAs="h2">
        <div className="prose">
          <p>
            <L en="Stage maps, milestone context, activities and variations, and corrected-age handling, presented as context for play and connection — not as a screening test." vi="Bản đồ giai đoạn, bối cảnh cột mốc, hoạt động và biến thể, cùng xử lý tuổi hiệu chỉnh — trình bày như bối cảnh để chơi và gắn kết, không phải bài sàng lọc." />
          </p>
          <p className="muted">
            <L en="This destination is part of the application shell. Its guidance is published only after the content, evidence and review pipeline for it is in place — never as unreviewed text." vi="Trang này thuộc khung ứng dụng. Hướng dẫn của nó chỉ được xuất bản sau khi quy trình nội dung, bằng chứng và rà soát sẵn sàng — không bao giờ là văn bản chưa duyệt." />
          </p>
        </div>
      </Card>
    </PageShell>
  );
}
