# HowToBaby — Vietnamese translation review

## Scope reviewed

This pack rewrites the full Vietnamese copy that is currently user-facing in the Phase 2 site:

- app shell, navigation, footer and every currently shipped page string in `apps/web/src/i18n/messages.ts`;
- evidence/provenance vocabulary and metadata in `apps/web/src/features/evidence/labels.ts`;
- the currently published canonical Vietnamese guidance in `packages/knowledge/src/translations/vi/feeding.yaml`;
- the Vietnamese guidance-content companion contract, plus canonical-doc changes that prevent future literal/machine-like translations.

The English strings remain the source of truth. Exact original source titles, organization/proper names, URLs, license identifiers and canonical IDs are intentionally not translated.

## Translation approach

The Vietnamese was rewritten from the canonical English meaning rather than edited sentence-by-sentence from the previous Vietnamese. The goal is parent-facing Vietnamese that sounds authored in Vietnamese while preserving evidence and safety semantics.

Key principles:

- natural Vietnamese sentence structure takes priority over mirroring English word order;
- medical meaning, qualifiers, negation, age boundaries, quantities and urgency are immutable;
- terms are translated by context, not by a one-English-word → one-Vietnamese-word glossary;
- public copy favors familiar parent language; internal identifiers remain technical;
- evidence labels favor clarity over terseness when a short literal label would be ambiguous.

## Deliberate terminology choices

| Concept | Preferred public Vietnamese | Notes |
| --- | --- | --- |
| Now | `Hiện tại` | Kept as the established product/navigation label. |
| Trust | `Minh bạch` | More natural as a trust-area eyebrow than the literal `Tin cậy`. |
| Trust and legal | `Minh bạch & pháp lý` | Covers methodology/sources as well as legal pages. |
| Source | `nguồn` | Default; do not automatically translate as `nguồn gốc`. |
| Original source | `nguồn ban đầu` | Used when distinguishing upstream material from HowToBaby wording. |
| Sources | `Nguồn tham khảo` | Natural section/list label for parents. |
| Claim | `Nội dung` / contextual wording | Avoids forcing the technical term into the awkward public label `nhận định`. |
| Typical pattern | `Xu hướng thường gặp` | More idiomatic than the literal `Mô hình thường gặp` for parent-facing evidence labels. |
| Practical interpretation | `Cách áp dụng thực tế` | Natural parent-facing meaning. |
| Product heuristic | `Gợi ý của HowToBaby` | Transparent and easier to understand than a literal technical rendering. |
| Corroborating source | `Nguồn đối chiếu` | Clearer than `Nguồn củng cố`. |
| Developmental readiness | `sẵn sàng về mặt phát triển` | Avoids the calque `sẵn sàng về phát triển`. |
| Medical Disclaimer | `Miễn trừ trách nhiệm y tế` | Legal meaning is explicit; not shortened to an ambiguous label. |
| Published | `Ngày xuất bản` | Clearer than the bare verb/noun `Phát hành` in evidence metadata. |
| Updated | `Ngày cập nhật` | Clear metadata label. |
| Current source version | `Phiên bản nguồn hiện tại` | Kept because it describes an upstream version when no publication date is known. |
| Last verified by HowToBaby | `HowToBaby kiểm chứng lần cuối` | Distinguishes HowToBaby review from upstream source dates. |

## Canonical feeding guidance review

English source-of-truth:

> Introduce your baby to foods other than breast milk or infant formula at about 6 months, when they show signs of developmental readiness. Introducing solid foods before 4 months is not recommended.

Rewritten Vietnamese:

> Cho bé bắt đầu làm quen với thức ăn ngoài sữa mẹ hoặc sữa công thức vào khoảng 6 tháng tuổi, khi bé có các dấu hiệu cho thấy đã sẵn sàng về mặt phát triển. Không khuyến nghị bắt đầu cho bé ăn dặm trước 4 tháng tuổi.

Parity preserved:

- `about` → `khoảng`;
- `6 months` → `6 tháng tuổi`;
- developmental-readiness condition is preserved;
- `before 4 months` → `trước 4 tháng tuổi`;
- `not recommended` → `Không khuyến nghị`;
- no new medical threshold, reassurance or advice was added.

## Important integration note

`labels.test.ts` is included because several tests intentionally assert the exact public evidence wording. The test changes only follow the wording changes (`Ngày xuất bản`, `Ngày cập nhật`, `Phạm vi áp dụng`); evidence behavior and source-date logic are unchanged.

After applying the pack to the repository, run the repository's full `pnpm validate` under Node 24. This pack has been syntax/YAML checked independently, but it is not a substitute for the monorepo validation pipeline.
