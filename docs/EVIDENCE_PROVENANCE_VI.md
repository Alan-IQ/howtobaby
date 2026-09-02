# EVIDENCE_PROVENANCE — HowToBaby — Bản tiếng Việt

> Contract để **chứng minh từng nội dung HowToBaby lấy từ đâu**. Doc này sở hữu claim-to-source mapping, locator, citation UI, link nguồn gốc, evidence detail, audit history và quy tắc lưu source material.

## 1. Nguyên tắc: chứng minh, không chỉ tuyên bố

Không đủ nếu website chỉ ghi “Based on CDC, AAP, WHO, FDA”. Với mỗi health/safety claim, hệ thống phải trả lời được:

1. Claim nào đang hiển thị?
2. Source gốc nào support?
3. Section/page nào của source support?
4. Source là primary, corroborating, contextual hay conflicting?
5. Verify lần cuối khi nào?
6. Source có vừa đổi/superseded không?
7. Phần nào là wording của HowToBaby?
8. User có mở được source gốc không?

```text
Original authority
  → SourceRecord
  → ClaimSourceRef + SourceLocator
  → Claim
  → Guidance/Action
  → Page/Now/Print/Tool
  → SourceChip/EvidenceDrawer/References
```

## 2. Source record và claim-source relation

Không nên chỉ lưu `sourceIds[]`. Cần biết source support claim theo kiểu nào.

```ts
type SourceRelationship =
  | "primary"
  | "direct-support"
  | "corroborating"
  | "contextual"
  | "conflicting";

interface SourceLocator {
  heading?: string;
  section?: string;
  anchor?: string;
  page?: number;
  paragraphHint?: string;
}

interface ClaimSourceRef {
  sourceId: string;
  relationship: SourceRelationship;
  locator?: SourceLocator;
  verifiedAt: string;
}
```

Locator giúp maintainer/user tìm đúng đoạn gốc mà không phải copy cả bài. `paragraphHint` là locator/context đã paraphrase ngắn gọn, không lưu quote verbatim dài (validation cảnh báo `verbatim-locator-hint`).

Source record còn mang ranh giới approval machine-checkable: `approvalLevel`
(`approved-primary` / `approved-supporting` / `unapproved`) và `approvedScopes` (các domain được
duyệt). Chỉ source `approved-primary` đúng scope mới được khai `relationship: primary`/
`direct-support` — blog, retailer/manufacturer, influencer không thể tự trở thành nguồn chính
chỉ bằng cách khai relationship.

## 3. Rule theo guidance class

- `official-guidance`: bắt buộc có ít nhất một source `primary`/`direct-support` từ authority phù hợp scope — máy kiểm tra: source phải `approved-primary`, `approvedScopes` phủ domain của claim, status còn dùng được (không superseded/retired).
- `evidence-synthesis`: phải ghi các source quan trọng đã dùng; disagreement không được giấu.
- `practical-interpretation`: phải truy về claim/source đang được diễn giải và phải rõ đây là wording HowToBaby.
- `typical-pattern`: không được biến thành official chỉ vì có citation.
- `example-plan`/`product-heuristic`: không cần citation trừ khi chứa health/safety claim.
- Tool thuần utility không cần medical citation; guidance-linked Tool kế thừa provenance từ claim IDs.

## 4. Citation UI nên có 3 lớp

### A. Source chip ngay trên card/claim

```text
Official guidance · CDC · WHO
```

### B. Evidence Drawer

Khi click, hiển thị:

organization, exact source title, relationship (role badge), rồi metadata **theo đúng thứ tự**:

1. **Phần liên quan** — section/page locator khi hữu ích;
2. **Phạm vi áp dụng** — jurisdiction/scope;
3. **metadata phát hành/phiên bản nguồn** — theo hợp đồng ngày nguồn (§10): chỉ `Ngày xuất bản`, `Phiên bản tài liệu hiện tại`, `Ngày xuất bản` + `Ngày cập nhật` (chỉ khi cập nhật muộn hơn), hoặc không có gì;
4. **HowToBaby kiểm chứng lần cuối** — `lastVerifiedAt`, luôn đứng sau ngày của nguồn;
5. **Vì sao HowToBaby sử dụng tài liệu này** — suy từ relationship canonical;
6. link **Xem tài liệu gốc**.

Badge trạng thái CHỈ render khi source không còn `current` (đang rà soát bản cập nhật / superseded / retired / tạm không truy cập được); source `current` lành mạnh không có status UI. Interpretation/conflict note đi sau khi cần.

### C. References cuối page

Mỗi guidance page có **Sources used on this page**, nhưng list này phải auto-generate từ claims đang render, không maintain riêng bằng tay.

### Quy ước thuật ngữ tiếng Việt public

Model kỹ thuật vẫn dùng `SourceRecord`, `ClaimSourceRef`, `SourceLocator`, source ID và route `/sources`. Khi hiển thị cho phụ huynh bằng tiếng Việt, dùng **tài liệu** thay cho một chữ **nguồn** đứng riêng:

- drawer title → **Tài liệu tham khảo cho hướng dẫn này**; References → **Tài liệu tham khảo trên trang này**
- `/sources` giữ nguyên route; title/heading VI → **Tài liệu tham khảo** / **Danh mục tài liệu tham khảo**
- relationship: `primary` → **Tài liệu chính**, `direct-support` → **Tài liệu hỗ trợ trực tiếp**, `corroborating` → **Tài liệu đối chiếu**, `contextual` → **Tài liệu bổ trợ**, `conflicting` → **Tài liệu có khuyến nghị khác**
- `Source status` → **Trạng thái tài liệu**; `Source temporarily unavailable` → **Tài liệu hiện tạm thời không truy cập được**
- `Why this source is used` → **Vì sao HowToBaby sử dụng tài liệu này**; `View original source` → **Xem tài liệu gốc**

Không global replace `nguồn` → `tài liệu` trong technical prose: `source of truth` (**nguồn chuẩn**), `data source` (**nguồn dữ liệu**), source index, canonical provenance graph giữ nguyên. Đây là thay đổi wording cho phụ huynh, không phải rename data model.

## 5. Có nên link source gốc? Có

User nên luôn có đường mở source gốc khi khả thi.

- dùng canonical URL;
- action rõ `View original source`;
- không đi qua affiliate/tracking redirect;
- nếu URL đổi thì update SourceRecord nhưng giữ history;
- nếu source unavailable thì hiện status thật, không âm thầm xóa citation.

Triết lý:

> HowToBaby không bắt user tin câu “evidence-based”; HowToBaby cho user cách tự kiểm tra.

## 6. Evidence detail page

Có thể support:

```text
/evidence/feeding-solids-start
```

Trang này hiển thị claim hiện tại, classification, applicability, source chính/phụ, locator, last reviewed, source status, revision history và link original.

Đây là audit surface, không phải nơi author content lần thứ hai.

## 7. Global trust pages

- `/sources`: toàn bộ source registry đang dùng, group theo authority/status/topic.
- `/methodology`: giải thích source hierarchy, claim selection, age/applicability, official vs interpretation/heuristic, monitoring/review và EN→VI.
- `/changelog`/`/corrections`: các thay đổi/correction có ý nghĩa với phụ huynh.

## 8. Git/audit history

Git history hữu ích nhưng không thay provenance schema. Meaningful recommendation change nên có structured changelog với `claimId`, ngày, loại thay đổi, lý do và source IDs.

## 9. Copyright/reuse

Mặc định là:

```text
interpret + cite + link
```

không phải:

```text
copy + host
```

Thông thường chỉ lưu metadata, URL, locator, fingerprint/hash và HowToBaby-authored interpretation. Full HTML/PDF tải để diff nên nằm temporary cache/gitignored trừ khi license/permission cho phép reuse.

Nếu authority có official syndication, treat thành `approved-syndication`; giữ attribution/link và không trộn wording syndicated với HowToBaby interpretation.

## 10. Freshness status

Ba trường ngày trong `SourceRecord` mang ba nghĩa khác nhau, không được trộn:

- `publishedAt` = ngày xuất bản, chỉ khi authority cung cấp và xác định được;
- `updatedAt` = ngày revision/cập nhật hiện tại của nguồn, chỉ khi authority cung cấp (CDC "last reviewed/updated", ngày revision fact sheet WHO, …) — mỗi authority gọi tên ngày khác nhau nên không gọi mọi ngày là "Published";
- `lastVerifiedAt` = ngày maintainer/review workflow của HowToBaby thực sự mở, kiểm tra và xác nhận nguồn — hoàn toàn khác với ngày của nguồn; **không phải** thời điểm crawl/fetch (snapshot Evidence Watch có `fetchedAt` riêng) và **không phải** thời điểm deploy/build.

`publishedAt` và `updatedAt` là **hai metadata upstream khác nhau**, không bao giờ suy đoán từ nhau: thiếu `publishedAt` không lấy `updatedAt` bù, thiếu `updatedAt` không lấy `publishedAt` bù, và không đoán từ crawl, dòng copyright hay ngày deploy. Cả hai được sao đúng từ trang nguồn gốc vào YAML canonical và đi nguyên vẹn qua mọi read model dẫn xuất (`knowledge.sqlite`, `source-public-index.json`, `PublicSourceEntry`) tới evidence presenters — không UI layer nào giữ bản sao ngày nguồn riêng.

### Hợp đồng provenance ngày nguồn

Mọi surface hiện ngày nguồn (Evidence Drawer, `/sources`, `/evidence/[slug]`, References) render cùng một ma trận từ cùng trường canonical:

| Trường canonical | EN | VI |
| --- | --- | --- |
| A. chỉ `publishedAt` | `Published: <publishedAt>` | `Ngày xuất bản: <publishedAt>` |
| B. chỉ `updatedAt` | `Current source version: <updatedAt>` | `Phiên bản tài liệu hiện tại: <updatedAt>` |
| C. có cả hai, `updatedAt === publishedAt` | chỉ `Published: <publishedAt>` | chỉ `Ngày xuất bản: <publishedAt>` |
| D. có cả hai, `updatedAt > publishedAt` | `Published: <publishedAt>` rồi `Updated: <updatedAt>` | `Ngày xuất bản: <publishedAt>` rồi `Ngày cập nhật: <updatedAt>` |
| E. không có cả hai | bỏ hẳn metadata ngày nguồn | bỏ hẳn metadata ngày nguồn |

Quy tắc:

- case B không bao giờ trình bày `updatedAt` như ngày phát hành; case A không trình bày `publishedAt` như ngày cập nhật;
- case C là một phiên bản nguồn duy nhất: không lặp cùng một ngày thành `Ngày cập nhật`/thông tin phiên bản;
- case E tuyệt đối không infer/guess/thay thế ngày (không crawl time, không năm copyright, không ngày deploy);
- `sourceDateMeta()` (`apps/web/src/features/evidence/labels.ts`) là nguồn trình bày duy nhất của ma trận này; consumer chỉ render các hàng nó trả về, không branch lại trên trường thô;
- validation canonical (`packages/knowledge/src/validate.ts`, `pnpm validate:knowledge`) fail khi `publishedAt`/`updatedAt` không phải calendar date hợp lệ, nằm trong tương lai, hoặc `updatedAt < publishedAt` (`source-date-order`); hai ngày bằng nhau là hợp lệ. UI không bao giờ che metadata canonical sai — phải sửa ở source registry;
- `publishedAt`/`updatedAt` vẫn là metadata của authority; `lastVerifiedAt` vẫn là ngày HowToBaby thực sự kiểm chứng và được validate riêng (không được ở tương lai);
- sau metadata ngày nguồn — và chỉ sau đó — mới tới **Last verified by HowToBaby: <lastVerifiedAt>** / VI **HowToBaby kiểm chứng lần cuối: <lastVerifiedAt>**: ngày maintainer/review workflow HowToBaby thực sự xác nhận nguồn (không phải crawl/fetch time, không phải deploy time);
- ngày là calendar date (`YYYY-MM-DD` trong YAML), hiển thị `Apr 14, 2026` (EN) và `14/04/2026` (VI);
- surface dạng list (`/sources`, References) nối các hàng trên một dòng (`Phát hành: 10/01/2025 · Cập nhật: 14/04/2026 · HowToBaby kiểm chứng lần cuối: 31/08/2026`), không bịa biến thể ngắn hơn.

Regression tests phủ cả năm case trình bày cộng các trạng thái non-current (`apps/web/src/features/evidence/labels.test.ts`, `load.test.ts`, `presenters.test.ts`, `packages/ui/src/evidence/evidence.test.tsx`) và các kết quả validation — chỉ published, chỉ updated, bằng nhau, updated sau, updated trước (fail), ngày tương lai (fail), không có cả hai (`packages/knowledge/tests/validate.test.ts`).

Public UI:

- source `current` lành mạnh — **không có badge trạng thái**; thông tin tin cậy là metadata ngày nguồn (hợp đồng trên) cộng **Last verified by HowToBaby: [date]** / VI **HowToBaby kiểm chứng lần cuối: [date]**;
- **Reviewing an update** / VI **Đang rà soát bản cập nhật**;
- **Superseded**, **Retired**, **Source temporarily unavailable** — hiện thật, không âm thầm xóa citation.

Mọi trạng thái non-current dùng cùng attention treatment và cùng bộ nhãn trên Evidence Drawer, `/sources`, trang evidence detail và References. `current` vẫn nằm trong `SourceStatus` và canonical model cho validation/lifecycle; chỉ phần presentation là im lặng.

Source thay đổi không đồng nghĩa recommendation cũ sai; wording không nên gây hoảng.

## 11. CI provenance rules

CI fail nếu:

- official guidance không có direct/primary approved source;
- source ID không tồn tại;
- superseded source là support duy nhất cho release-approved claim;
- guidance-linked Tool có health claim không truy về canonical claim;
- page tự khai source không được claim nào dùng;
- source link bắt buộc bị thiếu;
- EN/VI lệch qualifier quan trọng.

## 12. Generated indexes

```text
claim-evidence-index.json
source-claim-index.json
route-evidence-index.json
tool-evidence-index.json
source-public-index.json
```

Cùng index phục vụ Evidence Drawer, References, Evidence Watch, print và future Ask HowToBaby.

## 13. Definition of done

Health/safety claim chưa release-ready nếu chưa có stable ID, classification, source support/locator phù hợp, source đã verify, wording giữ qualifier, original link hoạt động, review state/date hiện hành, VI parity hoàn tất và claim đã tham gia dependency graph cho Evidence Watch.

## Storage invariant — v0.6.0

Guidance/provenance canonical vẫn nằm trong YAML/structured text được Git track theo `REPOSITORY_STRUCTURE.md`. SQLite/JSON index chỉ là projection để validate/query/render, phải rebuild được và không được trở thành nguồn edit độc lập.


## Repository storage — v0.7.0

Claim/provenance canonical vẫn là authored Git text; generated SQLite/index và full third-party source body không phải canonical và tuân theo `REPOSITORY_HEALTH.md`.


## Licensing boundary — v0.8.0

Provenance chứng minh attribution/support, không chuyển copyright. HowToBaby interpretation có thể CC-BY-NC-SA nhưng body nguồn gốc vẫn theo quyền upstream. Chi tiết: `LICENSING_POLICY.md`.
