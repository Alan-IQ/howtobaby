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

- organization;
- title source;
- relationship;
- section/page locator;
- jurisdiction;
- last verified;
- source status;
- **View original source**;
- interpretation/conflict note khi cần.

### C. References cuối page

Mỗi guidance page có **Sources used on this page**, nhưng list này phải auto-generate từ claims đang render, không maintain riêng bằng tay.

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

Public UI có thể dùng:

- **Verified [date]**
- **Reviewing an update**
- **Superseded** chỉ trong history khi phù hợp.

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
