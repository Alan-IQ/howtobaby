// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata } from "next";

import { Card } from "@howtobaby/ui";

import { PageShell } from "@/components/PageShell";
import { LocalizedReferences } from "@/features/evidence/LocalizedReferences";
import { loadGuidanceBlockViews, loadReferenceEntries } from "@/features/evidence/load";
import { GuidanceEvidenceCard } from "@/features/feeding/GuidanceEvidenceCard";
import { L } from "@/i18n/L";

export const metadata: Metadata = { title: "Feeding" };

const ROUTE = "/feeding";

export default async function Page() {
  // Canonical data only: guidance blocks, claim text, chips, drawer and the page references all
  // resolve from the knowledge read model (docs/EVIDENCE_PROVENANCE.md §6) — nothing is authored here.
  // Both locales are prerendered; the global language preference picks which one renders.
  const [enBlocks, viBlocks, enReferences, viReferences] = await Promise.all([
    loadGuidanceBlockViews(ROUTE, "en"),
    loadGuidanceBlockViews(ROUTE, "vi"),
    loadReferenceEntries(ROUTE, "en"),
    loadReferenceEntries(ROUTE, "vi"),
  ]);

  return (
    <PageShell
      eyebrow={<L en="Feeding" vi="Ăn uống" />}
      icon="feeding"
      accent="feeding"
      title={<L en="Feeding" vi="Ăn uống" />}
      printTitle="Feeding"
      lede={<L en="Feeding guidance by stage and readiness, with the source behind every statement." vi="Hướng dẫn ăn uống theo giai đoạn và mức sẵn sàng, với nguồn gốc đứng sau mỗi nội dung." />}
      printable
    >
      {enBlocks.map((enBlock) => {
        const viBlock = viBlocks.find((b) => b.blockId === enBlock.blockId);
        return viBlock ? <GuidanceEvidenceCard key={enBlock.blockId} variants={{ en: enBlock, vi: viBlock }} /> : null;
      })}
      <Card icon="feeding" title={<L en="What this section will hold" vi="Mục này sẽ có gì" />} titleAs="h2">
        <div className="prose">
          <p>
            <L
              en="Milk feeding, starting solids, textures, responsive feeding, allergen introduction and feeding safety — organized by stage and readiness rather than by a single age cut-off, with each claim linked to its original source."
              vi="Bú sữa, ăn dặm, kết cấu thức ăn, cho ăn theo tín hiệu, làm quen chất gây dị ứng và an toàn ăn uống — tổ chức theo giai đoạn và mức sẵn sàng thay vì một mốc tuổi duy nhất, mỗi nội dung gắn với nguồn gốc của nó."
            />
          </p>
          <p className="muted">
            <L
              en="Guidance appears here only after it has passed the content, evidence and review pipeline — never as unreviewed text. The full feeding domain migrates in a later phase."
              vi="Hướng dẫn chỉ xuất hiện tại đây sau khi đã qua quy trình nội dung, bằng chứng và rà soát — không bao giờ là văn bản chưa duyệt. Toàn bộ mảng ăn uống sẽ chuyển sang ở giai đoạn sau."
            />
          </p>
        </div>
      </Card>
      <LocalizedReferences entries={{ en: enReferences, vi: viReferences }} />
    </PageShell>
  );
}
