// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";

import { Card } from "@howtobaby/ui";

import { PageShell } from "@/components/PageShell";
import { L } from "@/i18n/L";

export const metadata: Metadata = { title: "Sleep" };

export default function Page() {
  return (
    <PageShell
      eyebrow={<L en="Sleep" vi="Ngủ" />}
      icon="sleep"
      accent="sleep"
      title={<L en="Sleep" vi="Ngủ" />}
      printTitle="Sleep"
      lede={<L en="Typical sleep patterns, safe-sleep basics and editable example routines." vi="Nếp ngủ thường gặp, nguyên tắc ngủ an toàn và lịch sinh hoạt mẫu có thể điều chỉnh." />}
    >
      <Card icon="sleep" title={<L en="What this section will hold" vi="Mục này sẽ có gì" />} titleAs="h2">
        <div className="prose">
          <p>
            <L en="Official duration guidance, safe-sleep guidance, responsive newborn mode, nap and wake-window heuristics labelled as heuristics, and example plans you can adjust." vi="Hướng dẫn chính thức về thời lượng ngủ, hướng dẫn ngủ an toàn, chế độ sơ sinh linh hoạt, gợi ý giấc ngày và cửa sổ thức được ghi rõ là gợi ý, cùng kế hoạch mẫu bạn có thể điều chỉnh." />
          </p>
          <p className="muted">
            <L en="This destination is part of the application shell. Its guidance is published only after the content, evidence and review pipeline for it is in place — never as unreviewed text." vi="Trang này thuộc khung ứng dụng. Hướng dẫn của nó chỉ được xuất bản sau khi quy trình nội dung, bằng chứng và rà soát sẵn sàng — không bao giờ là văn bản chưa duyệt." />
          </p>
        </div>
      </Card>
    </PageShell>
  );
}
