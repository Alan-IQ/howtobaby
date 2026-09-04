# EVIDENCE_UPDATE_ENGINE — Bản tiếng Việt

> Detection, classification, scoping và review artifact đều **deterministic và không phụ thuộc AI**. AI Review Summary là thành phần first-class của review artifact, nhưng không bao giờ trở thành evidence và không có quyền approve, merge hay release.

Invariant trung tâm:

```text
Deterministic Evidence Watch detects and scopes the change.
AI explains and assists.
GitHub Draft PR carries the review.
A human retains approval authority.
Semantic medical changes never publish themselves.
```

## Mục tiêu

Workflow bắt buộc:

```text
official source
→ scheduled/manual fetch
→ deterministic fingerprint/diff
→ deterministic impact analysis
→ actionable change classification
→ Draft Pull Request
→ AI Review Summary
→ human/source verification
→ approved canonical change
→ CI validation
→ merge
→ deployment
```

Engine làm change detection + impact analysis + review routing, không phải autonomous medical author.

## Vì sao detection không cần AI

Detect được bằng ETag/Last-Modified, RSS/Atom, API response, metadata date, normalized section hash, PDF checksum/text diff và source→claim dependency graph.

Detection, classification, impact analysis và deterministic review artifact phải chạy đầy đủ ngay cả khi không có AI provider. AI chỉ hữu ích **sau** khi đã có deterministic diff: giải thích thay đổi về mặt ngữ nghĩa và giảm tải review. AI không detect, không quyết định một thay đổi có actionable hay không, và không quyết định kết quả review.

## Adapter priority

```text
api/syndication
→ rss/atom
→ structured-index
→ sitemap
→ html-section
→ pdf
→ manual
```

## Source hiện tại

- CDC: có Public Health Media Library/syndication API/feed cho content hỗ trợ; phải tách rõ syndication rule và HowToBaby interpretation.
- FDA: có RSS cho một số safety streams và structured recall/safety listing.
- AAP: public policy/index pages phù hợp để detect policy mới/revised; không bypass paywall/subscriber restriction.
- WHO: có RSS ở một số property/region; nơi không có thì dùng index/page/PDF monitoring.

## Pipeline

Scheduler → adapter.fetch → conditional request/cache → canonicalize → fingerprint → compare → CheckResult.

Canonicalization loại navigation/script/dynamic noise nhưng không được làm mất qualifier y khoa.

## Diff categories

`UNCHANGED`, `METADATA_CHANGED`, `CONTENT_CHANGED`, `SOURCE_MOVED`, `SOURCE_MISSING`, `NEW_EDITION_OR_POLICY`, `POSSIBLE_SUPERSESSION`, `FETCH_ERROR`, `PARSER_ERROR`.

Content change không đồng nghĩa recommendation change. Mỗi category phải quy về đúng một trong bốn operational outcome bên dưới.

## Bốn operational outcome

Outcome được quyết định deterministic, **trước** mọi lời gọi AI, và nó quyết định workflow tạo ra cái gì.

### `UNCHANGED`

Cập nhật watcher state nếu cần; không gọi AI; không tạo Pull Request; không tạo Issue; không tạo noise cho maintainer.

### Deterministic metadata-only change

Là `METADATA_CHANGED` mà một deterministic rule đã được duyệt chứng minh là không ảnh hưởng monitored content, medical meaning hay provenance (ví dụ publication timestamp đổi nhưng monitored section không đổi).

Xử lý deterministic; mặc định không gọi AI; watcher state có thể tự cập nhật; canonical source metadata chỉ được tự cập nhật khi có deterministic rule đã duyệt cho phép và vẫn đi qua validation gate; tuyệt đối không được đổi medical meaning. Còn nghi ngờ thì nâng thành actionable.

### Actionable evidence change

Tối thiểu gồm:

```text
CONTENT_CHANGED
SOURCE_MOVED
SOURCE_MISSING
NEW_EDITION_OR_POLICY
POSSIBLE_SUPERSESSION
material SourceLocator resolution failure
material provenance change
```

Bắt buộc: tạo hoặc cập nhật **đúng một** Draft Pull Request cho thay đổi chưa resolve đó; đưa source và các claim phụ thuộc vào trạng thái review-required chưa resolve; giữ nguyên provenance, citation và review history cũ cho đến khi con người xử lý xong.

GitHub Issue không bao giờ thay thế được Draft Pull Request cho actionable evidence change.

### Operational failure

`FETCH_ERROR`, `PARSER_ERROR`, authentication/access failure, persistent adapter failure.

Đây không phải evidence change. Có thể fail workflow và/hoặc tạo/cập nhật GitHub Issue theo retry/escalation policy, nhưng **không được** tạo evidence-change Pull Request nếu chưa xác định có evidence/provenance change thật. Phải phân biệt deterministic giữa lỗi transport/parser và `SOURCE_MISSING`/`SOURCE_MOVED` thật trước khi chọn outcome.

## Draft Pull Request contract

Draft PR là canonical human review surface; machine-readable report (JSON) và bản Markdown render deterministic là payload nó mang theo.

Draft PR phải có: source ID + title; canonical official-source URL; deterministic change classification; fingerprint/metadata cũ và mới khi phù hợp; deterministic diff summary; changed sections/locators; impacted claim IDs; impacted guidance blocks; impacted public routes; impacted Tools; deterministic policy risk; source/review state hiện tại; recommended review action; official-source link để verify; AI Review Summary hoặc trạng thái AI unavailable/failed.

Label ổn định nên dùng:

```text
evidence-watch
review-required
risk-low | risk-medium | risk-high | risk-critical
```

Idempotent + concurrency: một unresolved change ↔ một branch ↔ một Draft PR; run sau cập nhật PR đã có thay vì mở PR mới; run scheduled/manual chồng nhau không được tạo trùng branch/PR; workflow phải có concurrency control.

Body PR do deterministic renderer sinh ra, không phải do model. Mọi field deterministic bắt buộc phải có kể cả khi không có AI. Credential của Evidence Watch không được phép bypass review path hay publish semantic medical change thẳng lên `main`.

## Review workflow và provenance state

```text
current → changed-review-required
```

Claim phụ thuộc bị flag nhưng provenance/history cũ vẫn giữ cho đến khi review xong. Detected change không được âm thầm xóa citation, thay source hay vô hiệu hóa provenance. Sau review: source không đổi nghĩa → `current` + refresh verification; source đổi nghĩa → sửa claim liên quan + `current`; source bị thay thế → `superseded` + map replacement.

Metadata-only rủi ro thấp có thể tự cập nhật sau validation theo deterministic rule. Content change không có mapping đã duyệt → claim `review-required`, không tự viết lại prose. Structured exact-source data chỉ được mirror field non-interpretive theo rule đã duyệt và vẫn đi qua Draft PR + validation gate. Safety-critical/urgent/contraindication luôn cần human review và clinician review khi content contract yêu cầu.

## AI Review Summary

AI Review Summary là capability first-class của Phase 9, không phải tính năng optional/cosmetic. Khi AI khả dụng, mọi actionable evidence change đều có một bản.

AI chỉ chạy **sau** deterministic diff/classification/impact analysis, trên một review context đã bounded (diff, changed sections, `SourceRecord` metadata, affected claims, locators, canonical guidance liên quan, source đối chiếu/hỗ trợ nếu có).

AI được phép: summarize semantic change; giải thích meaning impact; đánh giá từng affected claim; phát hiện thay đổi qualifier/age boundary/quantity/urgency/contraindication/applicability; phát hiện possible contradiction; chỉ ra claim mà dependency list thuần cấu trúc thể hiện yếu; đề xuất claim cần verify/revise/supersede; đề xuất next action cho maintainer.

AI không được: đóng vai evidence; bịa evidence/quote/threshold/date; âm thầm mở rộng scope ngoài thay đổi đã detect; quyết định canonical approval state; hạ deterministic safety/risk requirement; tự đánh dấu `maintainer`; khẳng định `clinically-reviewed` hoặc `release-approved`; approve PR; merge PR; publish semantic medical change; bỏ qua source verification.

Review requirement do project policy quyết định, không do model confidence.

## Structured AI output

AI phải trả structured data có version và pass schema validation trước khi render Markdown:

```ts
interface EvidenceAIReview {
  schemaVersion: string;
  status: "completed" | "unavailable" | "failed";

  semanticAssessment:
    | "no_meaning_change"
    | "possible_meaning_change"
    | "meaning_change"
    | "uncertain";

  summary: string;

  changedMeaning?: string[];
  affectedClaimAssessments?: Array<{
    claimId: string;
    assessment: string;
    recommendedAction:
      | "no_change"
      | "verify"
      | "revise"
      | "supersede"
      | "uncertain";
  }>;

  qualifierChanges?: string[];
  contradictions?: string[];
  recommendedActions?: string[];

  aiRiskAssessment?:
    | "low"
    | "medium"
    | "high"
    | "critical";
}
```

`affectedClaimAssessments` map theo `claimId` canonical; assessment không map được chỉ có giá trị tham khảo. Policy risk và required review state được tính **ngoài** AI response. AI có thể đề xuất risk cao hơn, nhưng không được hạ deterministic policy risk hay bỏ yêu cầu human/clinical review. Một deterministic renderer chuyển kết quả đã validate thành phần Review Summary trong Draft PR.

## AI failure fallback

Nếu AI timeout, hết quota, thiếu credential, trả JSON/schema sai hoặc output không dùng được: vẫn phải tạo/cập nhật Draft PR từ deterministic report, và PR phải hiển thị rõ `AI Review: unavailable` hoặc `AI Review: failed` kèm đủ deterministic evidence để maintainer tự review.

AI failure không được: suppress detected change; đánh dấu source là unchanged; đóng/kết thúc review; auto-approve; chặn việc tạo deterministic review artifact.

## Ranh giới approval của con người

```text
AI review
≠ source verification
≠ human approval
≠ clinical review
≠ release approval
```

Maintainer review Draft PR đối chiếu official source và có thể approve, request changes, close vì không có semantic impact, sửa canonical content, yêu cầu review mạnh hơn/clinical review, hoặc merge sau khi mọi gate bắt buộc pass. Content safety-critical/urgent/contraindication/emergency luôn cần human review và clinician review theo `GUIDANCE_CONTENT_CONTRACT.md`. Bot Evidence Watch và AI reviewer không bao giờ thỏa mãn được required human reviewer gate.

## Canonical mutation boundary

Phase 9 v1:

```text
deterministic detection
→ Draft PR
→ AI Review Summary
→ human decides/edits
```

Phase 9 v1 yêu cầu AI Review Summary nhưng **không** yêu cầu AI tự sinh canonical content patch. Khả năng AI draft canonical EN/VI/guidance/test/provenance ngay trên Evidence Watch review PR branch để dành cho phase sau; những thay đổi đó vẫn chỉ là draft, và CI pass không tạo ra review authority.

## Merge và deployment

```text
Draft PR
→ required human/source review
→ canonical English changes completed
→ EN/VI parity khi cần
→ CI validation
→ required approval
→ merge to main
→ existing production pipeline
→ deploy
```

Merge vào `main` — chứ không phải bản thân Evidence Watch — mới là sự kiện đi vào deployment pipeline.

## GitHub Actions: implementation + security

Workflow scheduled/manual có thể chạy adapters, cache fingerprint, tạo/cập nhật Evidence Watch branch, tạo/cập nhật đúng một Draft PR cho mỗi actionable evidence change, tạo/cập nhật Issue **chỉ** cho operational failure, và không cần inbound web service. Phải có concurrency control để run chồng nhau không tạo trùng branch/PR/report.

Security: khai báo `permissions` least-privilege; chỉ cấp quyền đọc repo, tạo/cập nhật Evidence Watch branch, tạo/cập nhật Draft PR và optional operational Issue; AI credential nằm trong GitHub Secrets hoặc secret store đã duyệt; không để secret lọt vào log/report/PR body/committed file; identity của Evidence Watch không được có quyền bypass branch/ruleset review requirement.

## Initial corpus review policy

Giai đoạn dựng corpus ban đầu được phép AI-first:

```text
AI/Claude authors grounded canonical content
→ independent AI review
→ corrections
→ source-verified / ai-assisted
```

Chỉ áp dụng cho việc dựng corpus ban đầu, không làm yếu review path của Evidence Watch. Metadata phải ghi trung thực là `ai-assisted`; AI không được giả human/clinical sign-off; trước public-v1 vẫn phải qua maintainer source audit và mọi safety-critical review gate.

## Noise/cost invariant

Cron chạy không đồng nghĩa gọi AI.

```text
100 monitored sources
  ├─ 97 unchanged        → no AI, no PR
  ├─ 2 metadata-only     → deterministic, thường no AI
  └─ 1 actionable change → impact analysis → Draft PR → AI Review Summary → human review
```

## Model independence

Không hard-code provider/model vào architecture. Provider, model, reasoning level là deployment configuration. Đổi model không được thay đổi evidence authority, canonical data ownership, review-state semantics, human approval requirement hay deployment gate.

## Legal/operational

Respect robots/terms/license/rate limit/auth; không bypass paywall/anti-bot; ưu tiên official feed/API; chỉ lưu dữ liệu cần thiết; source HTML/PDF là untrusted input (kể cả khi tài liệu tải về có nội dung chỉ dẫn reviewer hoặc model làm gì).

## Observability

Theo dõi: last successful check, consecutive failures, changed/unchanged counts, parser failures, Draft PR đang mở và tuổi của chúng, số AI Review completed/unavailable/failed, source quá hạn review, claim đang bị chặn bởi source changed/superseded, thời gian từ lúc detect đến lúc release.

## Evidence Watch v1

Registry + adapters + fetch/fingerprint + diff và actionable classification + locator move detection + source→claim impact + deterministic structured payload/Markdown renderer + Draft PR idempotent kèm AI Review Summary (hoặc trạng thái unavailable/failed) + Issue chỉ cho operational failure. **Không** tự viết lại canonical content.

## Later evolution

Adapter library theo authority, PDF section extraction, supersession clues, reviewer UI/dashboard, AI draft canonical EN/VI patch trên Evidence Watch review PR branch có sẵn (vẫn là draft, vẫn không có approval authority), translation-assisted update, controlled exact-data ingestion cho recall/alert.


## Provenance integration v0.6.0

Evidence Watch dùng cùng `SourceRecord`/`ClaimSourceRef` với public citation, không tạo model riêng. Adapter nên kiểm tra cả `SourceLocator` (heading/section/page) khi có; locator biến mất/move là review signal.

Mặc định chỉ persist metadata + canonical URL + locator + ETag/hash/fingerprint; full HTML/PDF nằm `evidence/cache/` temporary/gitignored. Chỉ retain/republish full source khi quyền reuse/syndication cho phép rõ ràng.

Watcher phải reuse canonical `source-claim-index`/`route-evidence-index` để impact report và public provenance không lệch nhau.

## SQLite / backend boundary — v0.6.0

Evidence Watch có thể query `packages/knowledge/generated/knowledge.sqlite` để tìm source→claim→route/tool impact nhanh hơn. SQLite chỉ là derived read model, phải rebuild được từ YAML/Git. Watcher/backend không được sửa knowledge canonical chỉ trong database rồi coi đó là publishable content.


## Repository health — v0.7.0

Watcher được phép tải HTML/PDF/source body vào ephemeral workspace/cache để parse/diff nhưng mặc định không commit các body này vào Git. Persistent Git state chỉ giữ metadata/URL/locator/hash/timestamp/parser version/change record cần thiết. CI phải bắt accidental source/cache commit theo `REPOSITORY_HEALTH.md`.

## Invariant cuối

> **Deterministic Evidence Watch detects and scopes the change.
> AI explains and assists.
> GitHub Draft PR carries the review.
> A human retains approval authority.
> Semantic medical changes never publish themselves.**
