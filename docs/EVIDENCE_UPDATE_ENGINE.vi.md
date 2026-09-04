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

```text
scheduler
→ adapter.fetch()
→ HTTP cache/conditional request
→ validate response/source identity
→ canonicalize monitored material
→ fingerprint
→ so observed comparisonDigest với comparisonBaseline
→ classify deterministic
→ persist CheckResult / operational state theo state machine
```

Pipeline này không so với `"previous fingerprint"`. Phép so sánh duy nhất là `comparisonDigest` quan sát được đối chiếu `comparisonBaseline` mà operational state của source đang giữ.

Canonicalization loại navigation/script/dynamic noise nhưng không được làm mất qualifier y khoa.

### Fetch security

Evidence Watch là một network fetcher chạy với credential của repository, nên fetch layer có contract an toàn tối thiểu cố định: chỉ fetch scheme `http`/`https` và ưu tiên HTTPS; từ chối `file:`, `data:`, `ftp:` và mọi scheme khác; chặn đích loopback, link-local, private và reserved trừ khi có contract tường minh về sau cho phép một đích cụ thể; validate mọi redirect target bằng đúng policy đó và giới hạn số bước redirect; giới hạn kích thước response và đặt timeout cho mọi request; validate content-type kỳ vọng của adapter khi khả thi; không bao giờ gửi lại credential/authorization header tới redirect target trên host chưa duyệt; scheduled fetch bình thường chỉ dùng canonical reviewed monitor config; còn URL/config chỉ tồn tại trên review branch thì freshness check và review-integrity check được phép fetch, nhưng phải qua đúng bộ validate URL/network-safety đó.

Phase 9 có test cho redirect, từ chối private-network và các giới hạn size/timeout.

### Comparison identity

`SourceFingerprint` chứa cả observation metadata lẫn phần vật liệu được so sánh, nên equality phải được định nghĩa tường minh. `comparisonDigest` là stable comparison identity đó, và là thứ duy nhất mọi phép so sánh trong contract này dùng.

```ts
interface SourceFingerprint {
  sourceId: string;
  checkedAt: string;

  etag?: string;
  lastModified?: string;
  metadataHash?: string;
  contentHash?: string;
  sectionHashes?: Record<string, string>;

  comparisonDigest: string;
}
```

`comparisonDigest` bắt buộc: deterministic; tính từ normalized compare-relevant material theo adapter và `compareMode` của monitor; **không** phụ thuộc `checkedAt`, fetch timestamp, retry metadata, workflow run ID, AI state hay Git state; không đổi khi watcher chạy lại trên cùng monitored material; và dùng cùng canonicalization/config/parser semantics cho baseline, observed fingerprint lẫn freshness check.

`checkedAt` là observation timestamp, không tham gia equality. `ETag`/`Last-Modified` là fetch/change signal; chúng chỉ tham gia comparison identity khi có approved adapter/compare rule quy định rõ, mặc định không tự làm đổi semantic/content digest.

Không phép so sánh nào so serialized `SourceFingerprint` object. Mọi so sánh — phân loại `UNCHANGED`, quyết định rerun AI, identity của cumulative diff cho review chưa resolve, freshness gate trước merge, dịch chuyển baseline — đều chỉ dựa trên `comparisonDigest`.

### Thuật toán digest đã chốt — `sha256-v1`

Phase 9 v1 không để implementation tự chọn hash algorithm hay serialization.

```text
comparisonDigestVersion = "sha256-v1"

comparisonDigest = sha256-v1:<lowercase-hex-sha256>
```

Input được hash là canonical JSON (UTF-8) của:

```text
{
  digestVersion: "1",
  sourceId,
  monitorConfigHash,
  parserVersion,
  material: normalizedComparePayload
}
```

`material` là normalized compare-relevant payload mà adapter sinh ra theo `compareMode` của monitor.

**Canonical JSON v1**: key của object sắp xếp lexicographic; không có whitespace thừa; array giữ nguyên semantic order do adapter normalization tạo ra; collection dạng set phải được adapter normalize deterministic **trước** khi serialize, để bước serialize không phải tự đoán thứ tự; và trong `material` không có timestamp, workflow run ID, AI state hay Git SHA. Hash là SHA-256, in ra dạng lowercase hex.

Operational state ghi lại version đã dùng: `comparisonDigestVersion: "sha256-v1"`.

Đổi thuật toán/version digest là đổi **cách HowToBaby đo** source, không phải source đã đổi:

```text
comparisonDigestVersion lệch
→ REBASELINE_REQUIRED
```

Không bao giờ phân loại lệch đó thành `CONTENT_CHANGED`, `METADATA_CHANGED` hay bất kỳ diff result nào. `parserVersion` chỉ version semantics của adapter/parser; **không** được dùng nó để version ngầm thuật toán digest, và hai giá trị được ghi/so riêng.

### `monitorConfigHash`

`monitorConfigHash` là SHA-256 deterministic trên cùng encoding canonical JSON v1, chỉ phủ phần monitor config có thể ảnh hưởng tới thứ được fetch, cách normalize, hoặc source identity đang được monitor:

```text
{
  sourceId,
  adapter,
  url,
  selector,
  includePatterns,
  excludePatterns,
  canonicalizationProfile,
  canonicalizationProfileVersion,
  compareMode
}
```

Các thuộc tính chỉ liên quan lịch chạy hoặc retention bị loại có chủ đích, vì đổi chúng không đổi phần bytes được so sánh:

```text
interval
licenseMode
```

Chúng chỉ vào hash nếu một contract về sau khiến chúng thật sự ảnh hưởng vật liệu fetch/so sánh.

Bất kỳ thay đổi nào ở `monitorConfigHash`, `parserVersion` hoặc `comparisonDigestVersion` khiến baseline đã lưu và fingerprint mới quan sát được không còn so sánh được đều sinh `REBASELINE_REQUIRED` — không bao giờ sinh một evidence diff giả.

## Diff categories

`UNCHANGED`, `METADATA_CHANGED`, `CONTENT_CHANGED`, `SOURCE_MOVED`, `SOURCE_MISSING`, `NEW_EDITION_OR_POLICY`, `POSSIBLE_SUPERSESSION`, `FETCH_ERROR`, `PARSER_ERROR`.

Ngoài ra còn các operational condition không phải kết quả diff: `BOOTSTRAP_REQUIRED`, `STATE_MISSING`, `STATE_CORRUPT`, `STATE_SYNC_ERROR`, `STATE_SCHEMA_MIGRATION_REQUIRED`, `REBASELINE_REQUIRED`, `REVIEW_ARTIFACT_MISSING`, `REVIEW_STATE_MISMATCH`, `REVIEW_BRANCH_CONFLICT`, `REVIEW_CLOSED_UNMERGED`.

`REVIEW_REVERTED_TO_BASELINE` không nằm ở cả hai danh sách: đó là một **review resolution condition** deterministic cho review đang mở mà upstream đã quay lại đúng baseline đã accept — không phải operational failure, cũng không phải diff result.

Content change không đồng nghĩa recommendation change. Mỗi category phải quy về đúng một trong bốn operational outcome bên dưới. Source có state bị mất, hỏng hoặc không còn so sánh được thì không được phân loại thành kết quả diff nào cả.

### Ranh giới phân loại: URL đổi hay source đã move

`SOURCE_MOVED` nghĩa là vị trí của tài liệu thực sự đã thay đổi. Đây **luôn** là actionable evidence change và không bao giờ là metadata-only outcome.

Nếu URL khác nhau nhưng một deterministic rule đã duyệt chứng minh được rằng URL đó **giữ nguyên identity** — canonical URL normalization, redirect protocol/host ổn định, hoặc khác nhau ở tracking parameter — vẫn resolve đúng phần nội dung được monitor, và source identity cùng provenance không đổi, thì phân loại là `METADATA_CHANGED`, không phải `SOURCE_MOVED`.

Rule này chỉ chạy một chiều: chứng minh deterministic giữ cho một khác biệt URL không rơi vào `SOURCE_MOVED`. Không có cơ chế nào được hạ một kết quả `SOURCE_MOVED` xuống metadata-only sau đó. Còn nghi ngờ về source identity thì phân loại là `SOURCE_MOVED`.

## Bốn operational outcome

Outcome được quyết định deterministic, **trước** mọi lời gọi AI, và nó quyết định workflow tạo ra cái gì.

### Ranh giới sở hữu state: watcher operational state và canonical Git state

Có hai loại state khác nhau, và không outcome nào được phép trộn lẫn:

```text
watcher operational state
→ do Evidence Watch sở hữu
→ ETag, Last-Modified, fingerprint, hash của monitored section,
  thời điểm check/fetch, normalized fetch metadata, parser version,
  adapter/cache state, classification deterministic gần nhất
→ một lần chạy watcher được phép tự cập nhật
→ không phải canonical product knowledge, cũng không phải phát ngôn evidence công khai

canonical Git knowledge/provenance state
→ do content/review contract canonical sở hữu
→ `SourceRecord` và mọi canonical authored file khác
→ chỉ đổi qua reviewed merge path
→ Evidence Watch không bao giờ ghi thẳng vào `main`
```

Watcher operational state được persist trên branch non-canonical dành riêng `evidence-watch/state`, trong `evidence/state/manifest.json` và `evidence/state/sources/<sourceId>.json`; branch đó không merge vào `main` và không deploy (xem mục Evidence Watch operational state machine, `REPOSITORY_STRUCTURE.md` §9). Mọi outcome bên dưới đều được phép refresh state đó, nhưng không outcome nào được hiểu quyền đó thành quyền sửa canonical authored file.

### `UNCHANGED`

Cập nhật check timestamp và watcher operational state nếu cần; giữ nguyên `comparisonBaseline` với tư cách meaning baseline; không gọi AI; không tạo Pull Request; không tạo Issue; không tạo noise cho maintainer.

### Deterministic metadata-only change

Là `METADATA_CHANGED` mà một deterministic rule đã được duyệt chứng minh là không ảnh hưởng monitored content, medical meaning hay provenance — ví dụ publication timestamp đổi nhưng monitored section không đổi, hoặc URL normalization/redirect giữ nguyên identity theo rule deterministic ở phần trên.

Xử lý deterministic; không gọi AI; không tạo Draft Pull Request; không tạo Issue; watcher operational state có thể tự cập nhật và `comparisonBaseline` CÓ THỂ advance ở mức operational với `authority = deterministic-metadata` để cùng một event không lặp lại mỗi lần chạy; **không được** tự ghi canonical `SourceRecord` metadata — hay bất kỳ canonical authored file nào — vào `main`; tuyệt đối không được đổi medical meaning; tuyệt đối không được dùng nhóm này để nuốt một kết quả `SOURCE_MOVED`. Còn nghi ngờ thì nâng thành actionable.

Khi một detection metadata-only cho thấy chính canonical `SourceRecord` thật sự cần sửa:

```text
thay đổi canonical metadata không trọng yếu
→ ghi vào watcher operational state và observability output
→ để maintainer cập nhật trong một reviewed Pull Request thông thường sau đó

thay đổi trọng yếu về provenance, độ mới hoặc source identity
→ không còn là metadata-only
→ nâng thành actionable evidence change
→ Draft Pull Request
```

Phase 9 v1 không thêm cơ chế auto-merge metadata Pull Request, cũng không mở bất kỳ đường ghi tự động nào khác vào `main`. Một deterministic rule chỉ có thể giữ một detection nằm ngoài nhóm actionable; nó không bao giờ cấp cho watcher quyền ghi canonical.

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

`SOURCE_MOVED` luôn actionable, bất kể diff của monitored section cho thấy gì. Một thay đổi vị trí thật cũng có thể là re-publication, thay thế, ngừng phát hành, hoặc locator không còn resolve được — chỉ human review mới kết luận được. Nó không bao giờ được xử lý như deterministic metadata-only change.

Bắt buộc: tạo hoặc cập nhật **đúng một** Draft Pull Request cho thay đổi chưa resolve đó; giữ nguyên `comparisonBaseline` trong khi cập nhật `lastObservedFingerprint` và `pendingReview` — phát hiện, phân loại hay báo cáo một actionable change không bao giờ advance baseline; đưa source và các claim phụ thuộc vào trạng thái review-required chưa resolve; giữ nguyên provenance, citation và review history cũ cho đến khi con người xử lý xong.

GitHub Issue không bao giờ thay thế được Draft Pull Request cho actionable evidence change.

### Operational failure

`BOOTSTRAP_REQUIRED`, `FETCH_ERROR`, `PARSER_ERROR`, `STATE_MISSING`, `STATE_CORRUPT`, `STATE_SYNC_ERROR`, `STATE_SCHEMA_MIGRATION_REQUIRED`, `REBASELINE_REQUIRED`, `REVIEW_ARTIFACT_MISSING`, `REVIEW_STATE_MISMATCH`, `REVIEW_BRANCH_CONFLICT`, `REVIEW_CLOSED_UNMERGED`, authentication/access failure, persistent adapter failure.

Đây không phải evidence change. Không condition nào trong nhóm này advance `comparisonBaseline`, tự lập baseline mới hay báo source là `UNCHANGED`. Có thể fail workflow và/hoặc tạo/cập nhật GitHub Issue theo retry/escalation policy, nhưng **không được** tạo evidence-change Pull Request nếu chưa xác định có evidence/provenance change thật. Phải phân biệt deterministic giữa lỗi transport/parser và `SOURCE_MISSING`/`SOURCE_MOVED` thật trước khi chọn outcome.

GitHub Issue **chỉ** dành cho operational failure. Không outcome nào khác tạo Issue: `UNCHANGED` và deterministic metadata-only không tạo Issue, còn actionable evidence change do Draft Pull Request gánh, không bao giờ do Issue.

`BOOTSTRAP_REQUIRED` là ngoại lệ trong nhóm này: đó là điều kiện khởi tạo bình thường của một monitor chưa từng initialized, không phải lỗi. Nó xuất hiện trong workflow summary và observability output nhưng không tự tạo Issue.

## Draft Pull Request contract

Draft PR là canonical human review surface; machine-readable report (JSON) và bản Markdown render deterministic là payload nó mang theo.

Draft PR phải có: source ID + title; canonical official-source URL; deterministic change classification; fingerprint/metadata cũ và mới khi phù hợp; deterministic diff summary; changed sections/locators; impacted claim IDs; impacted guidance blocks; impacted public routes; impacted Tools; deterministic policy risk; source/review state hiện tại; recommended review action; official-source link để verify; AI Review Summary hoặc trạng thái AI unavailable/failed.

Label ổn định nên dùng:

```text
evidence-watch
review-required
risk-low | risk-medium | risk-high | risk-critical
```

Đơn vị review chưa resolve của Phase 9 v1 là `sourceId`: nhiều revision upstream quan sát được trước khi resolve đều gộp vào cùng một open review PR, không tách thành nhiều PR.

### Identity của review payload

Payload deterministic mà review PR mang theo cũng phải có identity riêng, để lần merge chứng minh được nó merge đúng thứ đã review:

```ts
reviewBaseSha: string;
reviewPayloadDigest: string;
```

`reviewBaseSha` là commit `main` mà payload được tính trên đó. `reviewPayloadDigest` là SHA-256 trên canonical JSON v1 của tối thiểu: `sourceId`, `reviewBaseSha`, `baselineComparisonDigest`, `latestObservedComparisonDigest`, deterministic classification, locator/section đã đổi, claim ID bị ảnh hưởng, guidance ID bị ảnh hưởng, route/tool bị ảnh hưởng, deterministic policy risk, `monitorConfigHash`, `parserVersion`, `comparisonDigestVersion`.

Nó loại trừ có chủ đích: AI Review Summary, `checkedAt`/fetch timestamp, workflow run ID, và phần Markdown thuần trình bày.

Một **required deterministic review-integrity check**, bind với đúng PR head SHA, verify:

```text
PR head SHA                      == pendingReview.reviewHeadSha
PR đang current với `main` base bắt buộc
payload deterministic tính lại   == reviewPayloadDigest
review identity mới nhất         == pendingReview.latestObservedComparisonDigest
```

Check này tách khỏi pre-merge source freshness check: review-integrity chứng minh review artifact còn mô tả đúng head này trên `main` hiện tại, còn freshness chứng minh upstream chưa đi quá digest đã review. **Cả hai phải pass trước khi merge.**

Idempotent + concurrency: một source chưa resolve ↔ một review branch `evidence-watch/review/<sourceId>` ↔ một Draft PR; run sau cập nhật branch/PR đã có và tính lại cumulative diff `comparisonBaseline → latest observed fingerprint` thay vì mở PR mới; trước khi tạo gì, run phải tra cứu review theo deterministic identity (`sourceId`, `reviewKey`, branch `evidence-watch/review/<sourceId>`) và adopt thứ đã tồn tại; một run chết giữa lần ghi GitHub và lần ghi state không bao giờ được dẫn tới PR thứ hai — saga reserve-first ở state machine mới là cơ chế resume; run scheduled/manual chồng nhau không được tạo trùng branch/PR; workflow phải có concurrency control, và concurrency chỉ là hỗ trợ scheduling, không phải cơ chế đảm bảo tính transactional.

Body PR do deterministic renderer sinh ra, không phải do model. Mọi field deterministic bắt buộc phải có kể cả khi không có AI. Credential của Evidence Watch không được phép bypass review path hay publish semantic medical change thẳng lên `main`.

## Review workflow và provenance state

```text
current → changed-review-required
```

Giống mọi canonical change khác, transition này được đề xuất trên Evidence Watch branch và do Draft Pull Request mang theo; nó chỉ vào `main` qua review path.

### Pending review và public production state

```text
Evidence Watch phát hiện actionable change
→ Draft Pull Request là tín hiệu pending-review canonical hướng tới maintainer
→ canonical state của production không đổi trước khi merge đã review
```

`changed-review-required` là canonical source lifecycle state hợp lệ, có thể tồn tại trong reviewed canonical history; nó vẫn nằm trong `SourceStatus` (`EVIDENCE_PROVENANCE.md` §2) và Evidence Watch được phép đề xuất transition đó trên review branch. Cái Phase 9 v1 chốt là *một thay đổi chưa resolve được nhìn thấy ở đâu trước khi đề xuất đó được review*:

- Draft Pull Request là review surface tức thời, và là tín hiệu pending-review duy nhất Phase 9 v1 yêu cầu;
- Phase 9 v1 **không** yêu cầu public production site phản ánh pending watcher state trước khi Pull Request được merge;
- public UI không được hứa `Đang rà soát bản cập nhật` theo thời gian thực chỉ vì một lần chạy watcher vừa phát hiện thay đổi. Trạng thái công khai đó render từ canonical content đã deploy, nên chỉ xuất hiện sau khi lifecycle state tương ứng đã vào production qua reviewed merge path (`EVIDENCE_PROVENANCE.md` §14);
- muốn public site nhận pending operational freshness state trước canonical merge thì đó là một capability riêng, cần contract và publication path riêng. Nó không thuộc Phase 9 v1, và Evidence Watch không có side channel nào cho việc đó.

### `review-required` của dependent claim nghĩa là gì

```text
SourceRecord.status = changed-review-required
+ source→claim dependency mapping
→ dependent claim mang derived review-required signal
```

Đây là **derived review signal** — một điều kiện review chưa được giải quyết, tính ra từ `SourceRecord.status = changed-review-required` cộng với source→claim dependency mapping, đúng cơ chế propagation mà `EVIDENCE_PROVENANCE.md` §16 đã định nghĩa cho validation và public surface. Nó nói rằng **phần tài liệu hỗ trợ** của claim đang được rà soát, không nói rằng review state của chính claim đã đổi.

`Claim.reviewStatus` không có giá trị `review-required`, và contract này không thêm giá trị đó.

> **Evidence Watch KHÔNG được sửa `Claim.reviewStatus` chỉ vì phát hiện source thay đổi.**

`Claim.reviewStatus` canonical là reviewed content state thuộc sở hữu của `GUIDANCE_CONTENT_CONTRACT.md`. Nó chỉ đổi bên trong một reviewed canonical content change theo content/review contract hiện có — trên thực tế là trong kết quả đã review của Draft PR path, do con người quyết định. Bản thân Evidence Watch chỉ ghi watcher state và review artifact, và đề xuất `SourceRecord` lifecycle transition ở trên.

Claim phụ thuộc bị flag bằng derived signal đó nhưng provenance/history cũ vẫn giữ cho đến khi review xong. Detected change không được âm thầm xóa citation, thay source hay vô hiệu hóa provenance. Sau review: source không đổi nghĩa → `current` + refresh verification; source đổi nghĩa → sửa claim liên quan + `current`; source bị thay thế → `superseded` + map replacement. Kết quả đó được ghi trên review PR rồi merge; chính lần merge đó cũng là thứ advance comparison baseline của watcher, lên đúng fingerprint đã được review.

Metadata-only rủi ro thấp (publication timestamp, URL normalization/redirect giữ nguyên identity) chỉ làm watcher operational state tự refresh theo deterministic rule; canonical `SourceRecord` metadata không được ghi tự động — cần sửa canonical thì maintainer làm trong một reviewed PR thông thường, còn thứ gì trọng yếu về provenance/độ mới/source identity thì nâng thành actionable. `SOURCE_MOVED` không thuộc nhóm này và luôn đi qua Draft PR review path. Content change không có mapping đã duyệt → bật derived review-required signal cho claim phụ thuộc, không tự viết lại prose và không ghi `Claim.reviewStatus`. Structured exact-source data chỉ được mirror field non-interpretive theo rule đã duyệt, và chỉ dưới dạng draft trên review branch — không bao giờ ghi thẳng vào `main` — vẫn qua Draft PR + validation gate. Safety-critical/urgent/contraindication luôn cần human review và clinician review khi content contract yêu cầu.

## AI Review Summary

AI Review Summary là capability first-class của Phase 9, không phải tính năng optional/cosmetic. Khi AI khả dụng, mọi actionable evidence change đều có một bản.

AI chỉ chạy **sau** deterministic diff/classification/impact analysis, trên một review context đã bounded (diff, changed sections, `SourceRecord` metadata, affected claims, locators, canonical guidance liên quan, source đối chiếu/hỗ trợ nếu có).

Với một review đang mở, việc có gọi AI lại hay không là deterministic theo `pendingReview.aiAttempt` — bản ghi gắn mỗi lần thử AI với đúng `comparisonDigest` của nó:

```text
comparisonDigest mới
→ TỐI ĐA một lần gọi AI tự động

cùng comparisonDigest + status = completed
→ không gọi AI

cùng comparisonDigest + status = unavailable | failed
→ KHÔNG tự retry ở các scheduled run sau
```

Một lần thất bại/unavailable vì vậy không bị cron gọi lại mỗi lần chạy. Retry cho digest hiện tại là một thao tác manual tường minh:

```text
workflow_dispatch:
  mode     = retry-ai
  sourceId = <id>
```

Khi upstream digest đổi, một bản summary `completed` trước đó **lập tức trở thành stale** và không được trình bày như đánh giá AI hiện hành: renderer hiển thị status của **digest hiện tại**, và nếu AI failed/unavailable cho digest đó thì PR ghi rõ `AI Review: failed | unavailable for <current comparisonDigest>`. Bản summary thành công trước đó chỉ được giữ lại như historical/stale context có nhãn rõ ràng, không bao giờ như review hiện hành.

Deterministic wrapper quanh lời gọi AI tự ghi `comparisonDigest` đầu vào; không bao giờ hỏi model tự khai nó đã review digest nào.

### Ranh giới source material gửi cho AI (`licenseMode`)

`licenseMode` của monitor ràng buộc thứ được phép rời repository đi tới external AI reviewer: không bao giờ gửi trọn vẹn một tài liệu third-party chỉ vì Evidence Watch đã fetch nó; chỉ gửi phần material đã bounded thực sự cần cho semantic review; với material restricted/paywalled/có license, raw text chỉ được gửi tới external AI provider **khi** access/usage policy áp dụng cho phép; nếu không thì AI chỉ nhận metadata được phép và thông tin deterministic diff, hoặc bị đánh dấu `unavailable` cho semantic review và human review tiếp tục trên deterministic payload. AI unavailable vì ràng buộc này **không bao giờ** được suppress Draft PR deterministic. Ràng buộc này giới hạn thứ được chia sẻ, không đổi evidence authority.

AI được phép: summarize semantic change; giải thích meaning impact; đánh giá từng affected claim; phát hiện thay đổi qualifier/age boundary/quantity/urgency/contraindication/applicability; phát hiện possible contradiction; chỉ ra claim mà dependency list thuần cấu trúc thể hiện yếu; đề xuất claim cần verify/revise/supersede; đề xuất next action cho maintainer.

AI không được: đóng vai evidence; bịa evidence/quote/threshold/date; âm thầm mở rộng scope ngoài thay đổi đã detect; quyết định canonical approval state; hạ deterministic safety/risk requirement; tự đánh dấu `maintainer`; khẳng định `clinically-reviewed` hoặc `release-approved`; approve PR; merge PR; publish semantic medical change; bỏ qua source verification.

Review requirement do project policy quyết định, không do model confidence.

## Structured AI output

AI phải trả structured data có version và pass schema validation trước khi render Markdown. Contract là discriminated union theo `status`: chỉ khi AI thực sự hoàn thành review mới có semantic assessment.

```ts
type EvidenceAIReview =
  | {
      schemaVersion: string;
      status: "completed";

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
  | {
      schemaVersion: string;
      status: "unavailable" | "failed";
      reason?: string;
    };
```

Chỉ variant `completed` mới có `semanticAssessment`, `summary` và các field review optional. Variant `unavailable`/`failed` chỉ có `schemaVersion`, `status` và `reason` optional — một lý do vận hành ngắn gọn (timeout, hết quota, thiếu credential, schema validation fail), không bao giờ là nhận định về nội dung thay đổi của source.

Evidence Watch **không được** bịa `semanticAssessment`, `summary` hay bất kỳ field review nào khi AI unavailable/failed. Một assessment `uncertain` gắn tạm hay một summary sinh thay thế sẽ không phân biệt được với bản AI review thật và làm sai lệch trạng thái review. Việc **không có** semantic assessment chính là tín hiệu đúng.

`affectedClaimAssessments` map theo `claimId` canonical; assessment không map được chỉ có giá trị tham khảo. Policy risk và required review state được tính **ngoài** AI response. AI có thể đề xuất risk cao hơn, nhưng không được hạ deterministic policy risk hay bỏ yêu cầu human/clinical review. Một deterministic renderer chuyển kết quả đã validate thành phần Review Summary trong Draft PR.

## AI failure fallback

Nếu AI timeout, hết quota, thiếu credential, trả JSON/schema sai hoặc output không dùng được: vẫn phải tạo/cập nhật Draft PR từ deterministic report, và PR phải hiển thị rõ `AI Review: unavailable` hoặc `AI Review: failed` kèm `reason` optional và đủ deterministic evidence để maintainer tự review.

Trạng thái AI chỉ ảnh hưởng phần Review Summary. Mọi field deterministic bắt buộc của Draft PR vẫn render đầy đủ khi `unavailable`/`failed` y như khi `completed`; deterministic renderer không được rút gọn, lược bớt hay bỏ evidence payload chỉ vì AI không trả về gì.

AI failure không được: suppress detected change; đánh dấu source là unchanged; đóng/kết thúc review; auto-approve; chặn việc tạo deterministic review artifact.

## Ranh giới approval của con người

```text
AI review
≠ source verification
≠ human approval
≠ clinical review
≠ release approval
```

Maintainer review Draft PR đối chiếu official source và có thể approve, request changes, sửa canonical content, ghi kết quả review ngay trên PR đó rồi merge, yêu cầu review mạnh hơn/clinical review, hoặc merge sau khi mọi gate bắt buộc pass. Close mà không merge chỉ dành cho false positive / monitor defect / invalid detection, cộng thêm đúng một ngoại lệ là `REVIEW_REVERTED_TO_BASELINE` đã verify: một source đổi thật nhưng được kết luận là không đổi nghĩa thì **không** resolve bằng cách close PR, mà phải ghi minimal canonical review result (`SourceRecord.status`, `lastVerifiedAt`, `verifiedBy`, canonical metadata khác khi phù hợp) ngay trên PR đó rồi merge; close-không-merge không phải acceptance, không advance baseline, và đưa source vào `REVIEW_CLOSED_UNMERGED` cho tới khi monitor/config được sửa. Content safety-critical/urgent/contraindication/emergency luôn cần human review và clinician review theo `GUIDANCE_CONTENT_CONTRACT.md`. Bot Evidence Watch và AI reviewer không bao giờ thỏa mãn được required human reviewer gate.

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

Merge vào `main` — chứ không phải bản thân Evidence Watch — mới là sự kiện đi vào deployment pipeline. Vì production deploy khi push vào `main`, `main` phải được bảo vệ để merge đã review là con đường duy nhất một evidence change đi vào đó.

Trước khi merge, nơi nhìn thấy một evidence change chưa resolve là Draft Pull Request, không phải public site. Public provenance state — kể cả mọi nhãn độ mới của tài liệu — chỉ đổi như hệ quả của canonical content đã merge đi qua pipeline này.

Một reviewed merge cũng phải là merge đúng thứ đã được review. Có **hai** required status check, cả hai bind với đúng PR head SHA:

- **deterministic review-integrity check**: head đúng như state ghi, branch đang current với `main` base bắt buộc, payload deterministic tính lại vẫn bằng `reviewPayloadDigest`, và review identity vẫn bằng `pendingReview.latestObservedComparisonDigest`;
- **source freshness check**: refetch và fingerprint lại bằng đúng monitor config, parser version và digest version, rồi chặn merge khi upstream đã đi quá digest mà maintainer vừa review.

Cả hai mất hiệu lực mỗi khi head của review branch thay đổi, vì bất kỳ lý do gì.

Evidence Watch review PR còn phải **up to date với `main`** trước khi merge, theo enforcement ở mức repository. Một PR có thể mở lâu trong khi canonical claim/dependency trên `main` đã đổi, và impact analysis tính trên base cũ không phải impact analysis của lần merge. Khi `main` tiến lên: sync `main` mới vào review branch một cách non-destructive, giữ nguyên phần maintainer đã sửa, tính lại impact source→claim→route/tool và deterministic review payload, và head mới sinh ra làm mất hiệu lực approval cũ lẫn freshness acceptance cũ.

Required human approval phải áp cho **head reviewable mới nhất**. Enforcement bắt buộc phải dismiss approval cũ khi có commit mới push lên, và/hoặc yêu cầu approval cho lần push reviewable gần nhất; automation identity của Evidence Watch không bao giờ thỏa mãn được approval đó.

## GitHub Actions: implementation + security

Workflow scheduled/manual có thể chạy adapters, persist watcher operational state trên branch dành riêng `evidence-watch/state` trong `evidence/state/**` (artifact/cache chỉ là transient optimization, không bao giờ là store có thẩm quyền, và không bao giờ trộn vào canonical authored file), tạo/cập nhật branch `evidence-watch/review/<sourceId>`, tạo/cập nhật đúng một Draft PR cho mỗi source chưa resolve, tạo/cập nhật Issue **chỉ** cho operational failure, chạy freshness check trước merge cho PR đang mở, reconcile idempotent một review PR đã merge vào watcher state theo post-merge event cố định, và không cần inbound web service. Phải có concurrency control để run chồng nhau không tạo trùng branch/PR/report, và mọi write vào `evidence-watch/state` phải serialize sau một state-writer concurrency group duy nhất; watcher không bao giờ force-push branch đó. `concurrency` của workflow chỉ hỗ trợ scheduling, không phải transactional lock: tính đúng đắn đến từ fast-forward compare-and-swap khi ghi state và saga reserve-first, nên một run bị cancel/replace không bao giờ làm mất một review hay state transition đã bắt buộc.

Workflow phải có manual mode tường minh cho khởi tạo và khôi phục, tách khỏi scheduled run:

```text
workflow_dispatch:
  mode = bootstrap  | sourceId = <id | all>
  mode = rebaseline | sourceId = <id>
  mode = reconcile  | sourceId = <id | all>
  mode = retry-ai   | sourceId = <id>
```

Workflow còn phải reconcile head thật của PR với `pendingReview.reviewHeadSha` ở mọi lần head của Evidence Watch review PR thay đổi — các event tương đương `pull_request` `opened`, `synchronize`, `reopened` — và chạy required review-integrity check bên cạnh freshness check.

Scheduled run không bao giờ bootstrap hay rebaseline; gặp state thiếu/hỏng/không so sánh được thì báo operational condition. Nó có reconcile các merged review còn tồn đọng trước khi classification bình thường.

Security: khai báo `permissions` least-privilege; chỉ cấp quyền đọc repo, tạo/cập nhật Evidence Watch branch, tạo/cập nhật Draft PR và optional operational Issue; AI credential nằm trong GitHub Secrets hoặc secret store đã duyệt; không để secret lọt vào log/report/PR body/committed file; identity của Evidence Watch không được có quyền bypass branch/ruleset review requirement.

### Yêu cầu branch protection / ruleset

Production pipeline deploy khi push vào `main`. Khối `permissions` của workflow không ràng buộc được identity làm gì **ngoài** workflow đó, nên bắt buộc phải có enforcement ở mức repository, không phải hardening tùy chọn.

Phase 9 **phải** cấu hình GitHub Ruleset, branch protection hoặc enforcement tương đương trên `main` sao cho Evidence Watch identity:

- không push được semantic evidence change thẳng vào `main`;
- không bypass được Draft Pull Request review path;
- không bypass được required approval hoặc required status check;
- không tự approve PR evidence của chính nó, không force-push vào `main`, không xóa được protected branch;
- không ghi được canonical `SourceRecord` metadata hay bất kỳ canonical authored file nào vào `main` ngoài reviewed path, kể cả với kết quả deterministic metadata-only;
- không merge được Evidence Watch review PR chưa pass **cả hai** required check: deterministic review-integrity và source freshness;
- không merge được Evidence Watch review PR đang behind `main` base bắt buộc;
- không merge được nhờ một approval cấp cho head cũ: enforcement dismiss approval cũ khi có commit mới và/hoặc yêu cầu approval cho lần push reviewable gần nhất, nên required human/clinical review luôn áp cho head reviewable mới nhất.

### Enforcement: không có state file trên `main`

Watcher operational state chỉ sống trên `evidence-watch/state`. Phase 9 phải mở rộng repository-health/baseline enforcement để state đã có nội dung không thể lọt vào `main` do sơ suất:

```text
main:
  evidence/state/.gitkeep         → cho phép
  README nhỏ (optional)           → cho phép nếu có tài liệu hóa
  evidence/state/manifest.json    → cấm
  evidence/state/sources/**       → cấm
```

Branch `evidence-watch/state` được miễn trừ có chủ đích khỏi rule này — đó chính là nơi các file đó phải nằm. Check này là deliverable và gate của Phase 9.

`evidence-watch/state` là operational branch non-canonical: không merge vào `main`, không mở thành review PR, không trigger deployment. Nhưng vì nó là store operational bền có thẩm quyền, Phase 9 còn phải cấu hình ruleset/branch protection riêng cho chính branch đó — chặn force-push, chặn xóa, và giới hạn quyền write cho approved Evidence Watch identity cùng một maintainer recovery path tường minh. Protection này tách biệt với ruleset của `main`.

Chỉ merge vào `main` sau required review mới được đi vào production pipeline.

Đây là deliverable và gate của Phase 9 (`IMPLEMENTATION_ROADMAP.md`). Không được bật Evidence Watch chạy trên source thật khi `main` vẫn nhận push chưa qua review.

## Evidence Watch operational state machine

Deterministic classification chỉ có nghĩa khi watcher biết chính xác nó đang so với cái gì, cái đó lưu ở đâu, và ai được phép dịch chuyển nó. Phase 9 v1 chốt cả ba.

### Nơi lưu bền: branch `evidence-watch/state`

Phase 9 v1 persist watcher operational state trên đúng một branch non-canonical dành riêng:

```text
evidence-watch/state
```

Đây là store bền duy nhất có thẩm quyền. Artifact/cache của GitHub Actions chỉ được dùng như transient optimization, không bao giờ là authoritative persistent state; state thiếu trong artifact/cache thì khôi phục từ branch, không được tự bịa lại (`STATE_MISSING` bên dưới).

`evidence-watch/state`: không phải canonical knowledge; không merge vào `main`; không dùng làm Evidence Watch review PR; không trigger production deployment; chỉ chứa operational metadata/hash gọn; không chứa HTML/PDF/source body đã tải; không chứa secret; không chứa AI prompt hay source excerpt dài.

File state trên branch đó:

```text
evidence/state/manifest.json
evidence/state/sources/<sourceId>.json
```

Trên `main`, `evidence/state/` vẫn là thư mục placeholder rỗng giữ quy ước đường dẫn này; file state thực sự chỉ tồn tại trên `evidence-watch/state`.

Review branch là namespace riêng:

```text
evidence-watch/review/<sourceId>
```

Review branch mang một canonical change đang chờ review; nó không bao giờ là persistent watcher state store, và `evidence-watch/state` không bao giờ mang review.

### Ghi vào state branch: serialization và atomicity

`evidence-watch/state` là store bền có thẩm quyền, nên Phase 9 v1 giữ write model đơn giản có chủ đích:

```text
Mọi write vào evidence-watch/state đều được serialize.
```

Fetch/diff có thể chạy song song; commit vào state branch thì không. Một state-writer critical section duy nhất — một concurrency group — sở hữu mọi update, và đó là ranh giới scheduling chứ không phải bảo đảm tính đúng đắn (xem bên dưới).

- hai workflow run không bao giờ được race các write non-fast-forward;
- update state của source này không được mất vì update của source khác;
- file state của một source và thay đổi liên quan trong `manifest.json` phải commit atomically trong cùng một state update;
- writer phải đọc head mới nhất của state branch ngay trước khi ghi;
- write stale thì retry từ head mới nhất, hoặc fail như một operational condition — không bao giờ giải quyết race bằng cách ghi đè.

`concurrency` của GitHub Actions là **hỗ trợ scheduling, không phải cơ chế đảm bảo tính transactional**. Một workflow run bị cancel/replace không bao giờ được phép làm mất một review hoặc một state transition đã bắt buộc, nên mọi state mutation còn phải dùng fast-forward compare-and-swap:

```text
đọc head mới nhất của evidence-watch/state
→ tính mutation trên đúng head đó
→ thử fast-forward write
→ nếu head đã dịch, load lại state mới nhất rồi reapply/revalidate mutation
→ retry có giới hạn, hoặc fail như operational condition
```

Saga reserve-first bên dưới là cơ chế recovery cho transition duy nhất không thể gói trong một lần write: durable state và GitHub Pull Request.

> **Evidence Watch KHÔNG được force-push `evidence-watch/state`.**

### History và recovery của state branch

Git history của `evidence-watch/state` là recovery history của watcher, nên nó chỉ được append:

- update bình thường là fast-forward commit;
- không squash, không reset, không force rewrite history state;
- recovery cho `STATE_MISSING`/`STATE_CORRUPT` bắt đầu từ state commit hợp lệ gần nhất (xem mục Operational condition);
- một lần restore cũng là một commit mới — không rewrite history để xóa dấu vết sự cố.

History này là operational/audit trail của watcher. Nó không phải canonical medical history và không có gì trong đó được dùng làm provenance.

### Protection cho `evidence-watch/state`

Vì là store operational bền có thẩm quyền, state branch cần protection riêng — khác và nhẹ hơn về mục đích so với ruleset của `main`. Phase 9 phải cấu hình ruleset/branch protection trên `evidence-watch/state` tối thiểu:

- chặn force-push;
- chặn xóa branch;
- chỉ approved Evidence Watch automation identity và một maintainer recovery path tường minh được write;
- không merge branch này vào `main`;
- không trigger production deploy.

### Registry khởi tạo: `manifest.json`

`evidence/state/manifest.json` không phải một file chưa định nghĩa. Nó là registry ghi nhận source nào đã từng được initialized, và là thứ phân biệt một monitor hoàn toàn mới với một source đã initialized nhưng mất state.

```ts
interface EvidenceWatchManifest {
  schemaVersion: "1";

  sources: Record<string, {
    statePath: string;

    lifecycle:
      | "bootstrap-required"
      | "active"
      | "review-pending"
      | "recovery"
      | "inactive";

    everInitialized: boolean;
    initializedAt?: string;
    lastStateCommit?: string;
  }>;
}
```

Manifest và mọi per-source state file liên quan phải update **atomically** trong cùng một state commit.

**Monitor mới, chưa từng initialized.** Canonical monitor tồn tại nhưng manifest không có entry `everInitialized = true`:

```text
BOOTSTRAP_REQUIRED
→ lifecycle = bootstrap-required
→ scheduled run không tự bịa baseline
→ no AI
→ no evidence PR
→ bắt buộc dispatch `bootstrap` tường minh
```

`BOOTSTRAP_REQUIRED` là điều kiện khởi tạo bình thường — không phải evidence change, cũng không phải lỗi.

**Source đã initialized nhưng mất state.** Manifest ghi `everInitialized = true` mà file state của source thiếu hoặc không đọc được:

```text
STATE_MISSING / STATE_CORRUPT
```

Áp dụng recovery path ở mục Operational condition; **cấm** bootstrap.

**Monitor bị gỡ/disable khỏi canonical registry.** State còn lại của một monitor mà canonical config không còn mang theo **không** phải corruption:

```text
canonical monitor removed/disabled
→ lifecycle = inactive
→ dừng scheduled fetching
→ giữ nguyên state và history
```

Kích hoạt lại đúng `sourceId` đã initialized không bao giờ dùng `bootstrap`; dùng validation tường minh, và dùng `rebaseline` tường minh khi comparison semantics đã đổi.

### Migration schema của state

`schemaVersion` lệch không được âm thầm biến thành corruption hay rebaseline:

```text
migration deterministic được hỗ trợ
→ migrate mà không đổi ý nghĩa lẫn digest của comparisonBaseline
→ append một state-branch commit mới

migration không được hỗ trợ
→ STATE_SCHEMA_MIGRATION_REQUIRED
→ không classification bình thường
→ không advance baseline
→ không bootstrap
```

Bản thân một state schema migration không bao giờ cấp quyền lập baseline evidence mới: nó mã hóa lại thứ đã ghi, không quan sát lại source.

### Operational state của từng source

```ts
interface EvidenceWatchSourceState {
  schemaVersion: string;
  sourceId: string;

  monitorConfigHash: string;
  parserVersion: string;
  comparisonDigestVersion: string;

  comparisonBaseline: {
    fingerprint: SourceFingerprint;
    establishedAt: string;
    authority:
      | "bootstrap"
      | "deterministic-metadata"
      | "reviewed-pr"
      | "manual-rebaseline";
    canonicalGitSha?: string;
    prNumber?: number;
  };

  lastObservedFingerprint?: SourceFingerprint;

  pendingReview?: {
    reviewKey: string; // deterministic từ sourceId
    phase:
      | "reserved"
      | "open"
      | "merged-awaiting-reconcile"
      | "recovery";

    branch: string;
    prNumber?: number;

    reviewBaseSha: string;
    reviewHeadSha?: string;

    baselineComparisonDigest: string;
    latestObservedComparisonDigest: string;

    reviewPayloadDigest?: string;

    aiAttempt?: {
      comparisonDigest: string;
      status: "completed" | "unavailable" | "failed";
      attemptedAt: string;
    };

    freshnessAccepted?: {
      prHeadSha: string;
      comparisonDigest: string;
      reviewPayloadDigest: string;
      monitorConfigHash: string;
      parserVersion: string;
      comparisonDigestVersion: string;
      checkedAt: string;
    };

    detectedAt: string;
    updatedAt: string;
  };
}
```

Mọi field digest ở trên là `comparisonDigest` theo định nghĩa ở mục Comparison identity, trừ `reviewPayloadDigest` là digest của deterministic review payload; nên so sánh state không bao giờ phụ thuộc observation metadata hay object fingerprint đã serialize. `reviewKey` suy ra deterministic từ `sourceId`, nên cùng một review chưa resolve luôn địa chỉ hóa được kể cả khi state chưa kịp ghi. `reviewBaseSha` là commit `main` mà payload được tính trên đó; `reviewHeadSha` là head hiện tại của review branch mà PR đang mở mang theo, chỉ vắng mặt khi review còn ở phase `reserved`.

`phase` ghi review đang thực sự ở đâu, để một transition chết giữa chừng còn khôi phục được thay vì mơ hồ:

```text
reserved                   đã ghi state, chưa xác nhận có PR
open                       Draft PR tồn tại và state đã biết
merged-awaiting-reconcile  PR đã merge, baseline chưa advance
                           (vùng của STATE_SYNC_ERROR)
recovery                   REVIEW_CLOSED_UNMERGED, REVIEW_ARTIFACT_MISSING,
                           REVIEW_STATE_MISMATCH hoặc REVIEW_BRANCH_CONFLICT
                           đang giữ review này lại
```

`lifecycle` của source trong manifest dịch chuyển theo (`review-pending` khi có review mở, `recovery` khi một trong các condition đó còn hiệu lực).

Hai fingerprint là hai sự kiện khác nhau, không bao giờ tự động đồng nhất:

```text
comparisonBaseline
= fingerprint mà watcher được phép dùng làm baseline để xác định
  canonical evidence đã thay đổi hay chưa.

lastObservedFingerprint
= phiên bản source mới nhất watcher thực tế fetch thành công.
```

Contract này không dùng khái niệm mơ hồ `"previous fingerprint"`: mọi so sánh phải gọi tên một trong hai giá trị trên. Diff của một review chưa resolve luôn tính `comparisonBaseline → latest observed fingerprint`, không phải `previous cron observation → current cron observation`, để một thay đổi trải qua nhiều lần chạy không bị cắt vụn thành các mảnh trông vô hại.

### Quy tắc dịch chuyển baseline

`UNCHANGED`:

```text
fetch
→ observed comparisonDigest == comparisonBaseline.fingerprint.comparisonDigest
→ cập nhật check timestamp và operational metadata
→ comparisonBaseline không đổi về mặt meaning baseline
→ no AI / no PR / no Issue
```

`METADATA_CHANGED` deterministic được rule đã duyệt xác nhận non-actionable:

```text
→ no AI
→ no PR
→ no Issue
→ canonical Git không đổi
→ watcher MAY advance comparisonBaseline ở mức operational
   để không lặp lại cùng một metadata-only event mỗi lần chạy
→ authority = deterministic-metadata
```

Đây chỉ là operational baseline advancement, không phải canonical approval, và vẫn không ghi canonical `SourceRecord` metadata.

Actionable evidence change:

```text
comparisonBaseline      = GIỮ NGUYÊN
lastObservedFingerprint = cập nhật lên source mới nhất đã fetch
pendingReview           = tạo/cập nhật
Draft PR                = tạo/cập nhật
```

> **Watcher KHÔNG được advance `comparisonBaseline` chỉ vì một actionable change đã được fetch, phân loại hay báo cáo.** Chỉ một resolution hợp lệ mới dịch chuyển nó.

### Source đổi tiếp khi PR còn mở

Phase 9 v1 lấy `sourceId` làm đơn vị review chưa resolve: **một open Evidence Watch review PR cho mỗi `sourceId`**. Một source chưa resolve không sinh nhiều PR song song; nhiều revision upstream quan sát được trước khi resolve đều được gộp vào cùng review đó.

```text
comparisonBaseline giữ nguyên
→ fetch source mới nhất
→ tính lại cumulative deterministic diff:
   comparisonBaseline → newest observed fingerprint
→ cập nhật CÙNG review branch
→ cập nhật CÙNG Draft PR
```

Quyết định gọi AI là deterministic, dựa trên `pendingReview.aiAttempt`: cùng digest + `completed` thì không gọi lại; cùng digest + `unavailable`/`failed` thì **không tự retry** ở các run sau (chỉ `retry-ai` manual); digest đổi thì tối đa một lần gọi AI tự động cho digest mới và thay bản tóm tắt trong CÙNG PR, còn bản cũ lập tức stale và không được hiển thị như review hiện hành.

Mọi lần chạy có cập nhật review đang mở cũng phải cập nhật `latestObservedComparisonDigest`, tính lại `reviewPayloadDigest`, tạo review head mới (mục dưới), ghi `reviewHeadSha` mới và vô hiệu hóa `freshnessAccepted` cũ.

### Tạo review: saga reserve-first

State branch và GitHub Pull Request không thể ghi atomically, nên việc tạo review là một saga có thể khôi phục, thứ tự cố định:

```text
1. persist pendingReview với phase = reserved trên evidence-watch/state
2. tạo hoặc tìm review branch deterministic
3. tạo hoặc tìm Draft Pull Request
4. persist prNumber + reviewHeadSha + phase = open
```

Trước khi tạo bất kỳ PR nào, run luôn tra cứu trước, chỉ theo deterministic identity: `sourceId`, `reviewKey`, `evidence-watch/review/<sourceId>`.

Recovery sau crash vì vậy là deterministic:

```text
state reserved + chưa có PR
→ tiếp tục tạo

state reserved + PR đã tồn tại
→ adopt PR đó và hoàn tất sync state

state ghi open + PR biến mất
→ REVIEW_ARTIFACT_MISSING

PR tồn tại nhưng không reconcile an toàn được với durable state
→ REVIEW_STATE_MISMATCH
→ fail closed
```

> **Evidence Watch KHÔNG BAO GIỜ được tạo PR thứ hai chỉ vì một run trước đó chết giữa lần ghi GitHub và lần ghi state.**

### Review branch phải giữ nguyên phần con người sửa

`evidence-watch/review/<sourceId>` mang một canonical change đang đề xuất, và maintainer có thể đã tự sửa canonical trên đó. Automation là đồng tác giả, không phải chủ sở hữu:

- luôn fetch head mới nhất của review branch trước khi automation ghi;
- update của automation phải giữ nguyên commit/sửa đổi của con người;
- không reset về generated state;
- không force-push;
- không rebuild branch từ `main` theo cách làm mất phần con người đã làm.

Khi refresh tự động xung đột với phần maintainer đã sửa:

```text
REVIEW_BRANCH_CONFLICT
→ fail closed
→ giữ nguyên branch đúng như hiện trạng
→ yêu cầu maintainer xử lý
```

> **Evidence Watch KHÔNG được reset hay force-push `evidence-watch/review/<sourceId>`.**

### Mỗi upstream digest mới phải sinh review head SHA mới

Status check và approval của GitHub gắn với commit SHA, nên chỉ đổi body/state của PR là không đủ. Mỗi khi một review đang mở quan sát thấy `latestObservedComparisonDigest` thay đổi thì head của review branch **bắt buộc** phải đổi. Nếu bản refresh không có file change tự nhiên nào để commit, automation tạo một empty review-refresh commit do bot sở hữu:

```text
chore(evidence-watch): refresh <sourceId> review
```

Không được thêm file report vĩnh viễn vào canonical `main` chỉ để ép head đổi. Việc bump head bảo đảm: freshness acceptance cũ không còn hiệu lực; required check cũ không còn gắn với review hiện tại; approval cũ của con người bị vô hiệu; và `reviewHeadSha` định danh đúng thế hệ review. Không dùng force-push để đạt được điều đó.

### Đồng bộ mọi thay đổi head của PR, kể cả commit của con người

Head không chỉ đổi vì watcher. Với các event của Evidence Watch review PR tương đương `pull_request opened`, `synchronize`, `reopened`, workflow phải reconcile:

```text
PR head SHA thật  ↔  pendingReview.reviewHeadSha
```

Mọi thay đổi head:

```text
→ cập nhật reviewHeadSha
→ vô hiệu hóa freshnessAccepted
→ chạy lại required deterministic review-integrity check
→ chạy lại required source freshness check
```

Một commit do maintainer viết **không** làm chạy lại AI chỉ vì Git SHA đổi: quyết định AI phụ thuộc `comparisonDigest` của upstream, không phụ thuộc SHA của branch. Nếu phần canonical được sửa trên branch làm đổi mapping claim/source bị ảnh hưởng thì deterministic impact payload phải tính lại và `reviewPayloadDigest` cập nhật theo.

### Giữ review branch current với `main`

Evidence Watch review PR phải up to date với `main` base bắt buộc trước khi merge. Khi `main` tiến lên trong lúc review còn mở:

```text
→ sync `main` mới nhất vào review branch theo cách non-destructive
→ giữ nguyên phần maintainer đã sửa
→ tính lại impact source→claim→route/tool
→ tính lại deterministic review payload và reviewPayloadDigest
→ ghi reviewBaseSha mới và review head SHA mới
→ approval cũ và freshness acceptance cũ mất hiệu lực
```

Nếu lần sync đó xung đột: `REVIEW_BRANCH_CONFLICT`. Không bao giờ merge trên impact analysis đã stale.

### Upstream quay lại đúng baseline khi review còn mở

Upstream có thể rời baseline rồi quay lại trước khi review resolve:

```text
baseline = A
upstream A → B
Draft PR mở
upstream B → A trước khi review xong
```

Đây **không** phải monitor defect và **không** được đẩy qua recovery path `REVIEW_CLOSED_UNMERGED`. Đây là một review resolution condition deterministic:

```text
REVIEW_REVERTED_TO_BASELINE
```

nhận diện khi hội đủ: `pendingReview` tồn tại; `comparisonDigest` quan sát mới nhất `== comparisonBaseline.fingerprint.comparisonDigest`; source identity và các locator đã cấu hình vẫn validate.

Hành vi:

```text
→ cập nhật CHÍNH PR đó với kết quả deterministic
   "upstream đã quay lại baseline đã accept"
→ trạng thái reverted không cần AI
→ vô hiệu hóa freshness acceptance cũ và approval cũ
→ tạo một review-refresh head commit
→ con người CÓ THỂ close PR mà không merge
```

Evidence Watch không bao giờ tự close PR đó. Khi con người close và condition đã được verify:

```text
comparisonBaseline   không đổi
pendingReview        được xóa
canonical Git        không đổi
không có recovery REVIEW_CLOSED_UNMERGED
history operational/audit được giữ nguyên
```

Mọi trường hợp close-không-merge khác vẫn theo `REVIEW_CLOSED_UNMERGED` bên dưới.

### Bootstrap

Một scheduled run bình thường **không** được âm thầm bịa baseline khi state chưa tồn tại. Baseline đầu tiên phải qua một manual operation tường minh:

```text
workflow_dispatch:
  mode = bootstrap
  sourceId = <id | all>
```

Bootstrap thành công:

```text
canonical reviewed monitor config
→ fetch source
→ validate source identity
→ validate locator/section đã cấu hình khi áp dụng được
→ sinh fingerprint đầu tiên
→ comparisonBaseline = fingerprint
→ lastObservedFingerprint = fingerprint
→ authority = bootstrap
→ ghi canonical `main` SHA + monitorConfigHash + parserVersion
   + comparisonDigestVersion
→ manifest: everInitialized = true, initializedAt, lifecycle = active
→ no AI
→ no evidence PR
```

Scheduled run gặp một canonical monitor chưa có entry `everInitialized` thì báo `BOOTSTRAP_REQUIRED` và dừng ở đó.

Bootstrap là initialization, không phải evidence change, và chỉ áp dụng cho source **chưa từng** initialized. Monitor thêm về sau cũng phải bootstrap tường minh sau khi monitor config đã review/merge.

> **Source đã initialized rồi thì `bootstrap` KHÔNG BAO GIỜ được dùng lại — đặc biệt là không được dùng để thay một baseline bị mất hoặc hỏng.** Khôi phục một source đã initialized đi theo recovery path ở mục Operational condition, không phải lấy baseline mới từ bất kỳ thứ gì upstream đang trả về hôm nay.

### Rebaseline: đổi monitor config hoặc parser

Operational state pin `monitorConfigHash` và `parserVersion`. Khi config/selector/canonicalization/parser version đổi khiến fingerprint cũ không còn so sánh được:

```text
REBASELINE_REQUIRED
→ operational condition
→ không phân loại source là UNCHANGED / METADATA_CHANGED / CONTENT_CHANGED
→ không ghi đè comparisonBaseline cũ
→ không âm thầm rebaseline
```

Rebaseline chỉ qua manual operation tường minh:

```text
workflow_dispatch:
  mode = rebaseline
  sourceId = <id>
```

Manual rebaseline phải verify source identity và locator trước khi thay baseline. Nhưng identity + locator là chưa đủ: khi comparison semantics cũ và mới **không so sánh được** — `monitorConfigHash`, `parserVersion` hoặc `comparisonDigestVersion` đổi nghĩa là hai digest đang đo hai thứ khác nhau, nên không diff nào chứng minh được là nghĩa không đổi — maintainer còn phải verify rằng ý nghĩa và mức hỗ trợ của official source hiện tại vẫn nhất quán với các canonical claim đang dựa vào nó.

Nếu lần verify đó phát hiện thay đổi material về source identity/provenance/ý nghĩa/nội dung:

```text
→ hủy rebaseline
→ promote thành actionable evidence change
→ Draft PR
```

Rebaseline thành công ghi `authority = manual-rebaseline` kèm operational audit metadata tương đương:

```text
{
  authority: "manual-rebaseline",
  verifiedBy: "maintainer",
  verifiedAt: string,
  canonicalGitSha: string,
  monitorConfigHash: string,
  parserVersion: string,
  comparisonDigestVersion: string
}
```

`verifiedBy` operational này ghi nhận ai đã dịch chuyển một watcher baseline. Nó **không** phải `SourceRecord.verifiedBy` canonical và không bao giờ thay thế được giá trị đó.

### Resolution và dịch chuyển baseline

Actionable change chỉ advance `comparisonBaseline` sau một resolution hợp lệ.

**Reviewed PR đã merge:** merge là thứ resolve review, nhưng thứ dịch chuyển baseline là một finalizer deterministic riêng (mục dưới), không phải bản thân lần merge. Không được advance baseline lên một observed fingerprint mới hơn mà maintainer chưa review, và cũng không bao giờ lấy `lastObservedFingerprint` chỉ vì đó là thứ mới nhất watcher nhìn thấy.

**Source đổi thật nhưng người review kết luận không đổi nghĩa:** không đơn giản close PR rồi coi là xong. Maintainer phải hoàn tất minimal canonical review result ngay trên PR đó — ví dụ `SourceRecord.status → current`, `lastVerifiedAt` → ngày con người thực sự kiểm chứng, `verifiedBy → maintainer`, và canonical metadata khác chỉ khi phù hợp — rồi merge qua normal reviewed path, để canonical audit trail và watcher baseline có chung một điểm resolution rõ ràng.

**PR closed không merge:** không phải acceptance — trừ trường hợp close có verified `REVIEW_REVERTED_TO_BASELINE` (mục trên), khi review resolve với baseline không đổi và không vào recovery state.

```text
closed + unmerged
→ comparisonBaseline không đổi
→ không được coi là accepted
→ REVIEW_CLOSED_UNMERGED
→ source vào explicit operational recovery state
```

Không được âm thầm xóa unresolved state rồi chạy tiếp như chưa có gì. Vì close-không-merge ngoài ra chỉ dành cho false positive / monitor defect / invalid detection — ngoại lệ duy nhất là lần close có `REVIEW_REVERTED_TO_BASELINE` đã verify, vốn resolve review sạch sẽ và không đi vào path này — source ở nguyên recovery state đó cho tới khi monitor/config thực sự được sửa và một `rebaseline` tường minh hoặc một detection path hợp lệ hoàn tất. Scheduled run tiếp theo không được phản ứng bằng cách mở lại/đóng lại/tạo lại PR liên tục mà không có monitor recovery.

### Reconciliation sau merge

Việc advance baseline sau merge đi theo đúng một path cố định, không để implementation tự chọn:

```text
pull_request closed
+ merged == true
+ base == main
+ head khớp evidence-watch/review/<sourceId>
→ Evidence Watch state reconciliation/finalization
```

Finalizer phải idempotent: chạy lại cho một merge đã reconcile thì không đổi gì và không phải lỗi.

Nó chỉ advance baseline khi verify được tất cả:

```text
merged PR number == pendingReview.prNumber
merged PR head   == pendingReview.reviewHeadSha

freshnessAccepted.prHeadSha == merged PR head
freshnessAccepted.comparisonDigest
                 == pendingReview.latestObservedComparisonDigest
freshnessAccepted.reviewPayloadDigest
                 == pendingReview.reviewPayloadDigest

required review-integrity check đã pass cho đúng head đó
required freshness check        đã pass cho đúng head đó
```

Khi đó, và chỉ khi đó:

```text
comparisonBaseline = đúng SourceFingerprint có comparisonDigest chính là
                     digest đã accept, bind với PR head đã được review
authority          = reviewed-pr
prNumber           = số PR đã merge
canonicalGitSha    = canonical merge commit
pendingReview      = xóa
```

Finalizer còn phải cài đặt đúng comparison semantics đã bind với PR đã merge và với freshness acceptance đó: `monitorConfigHash`, `parserVersion`, `comparisonDigestVersion`. Điều này quan trọng nhất khi PR chính là thứ resolve một `SOURCE_MOVED`, một URL/selector mới, một thay đổi canonicalization hay bất kỳ thay đổi monitor config nào khác: một source-move/config change đã review thành công không được lập tức sinh `REBASELINE_REQUIRED` giả ở run kế tiếp chỉ vì operational state còn giữ config hash cũ.

Thiếu bất kỳ điều kiện nào thì finalizer không advance baseline; nó raise operational condition và giữ nguyên `pendingReview`.

**Ghi state thất bại thì fail closed.** Nếu canonical PR đã merge nhưng cập nhật `evidence-watch/state` thất bại:

```text
STATE_SYNC_ERROR
```

Đây là operational failure, và: canonical merge không bao giờ rollback; `comparisonBaseline` không được giả vờ đã advance; `pendingReview` không được âm thầm xóa; scheduled run không được mở evidence PR mới cho cùng revision đã accepted chỉ vì finalization chưa sync; reconciliation phải retry idempotent cho tới khi thành công hoặc maintainer can thiệp.

Vì vậy mọi scheduled/manual run của Evidence Watch phải reconcile các merged review còn tồn đọng **trước** khi classification bình thường, để một source đã có resolution accepted nhưng chưa sync không bị detect lại thành change mới. Có mode recovery tường minh cho cùng việc đó:

```text
workflow_dispatch:
  mode = reconcile
  sourceId = <id | all>
```

`reconcile` không bao giờ mở review mới; nó chỉ hoàn tất deterministic operational state sync từ một reviewed/merged resolution đã verify được.

### Freshness gate trước khi merge

Một Evidence Watch review PR không được merge nếu source đã đổi tiếp sau fingerprint mà maintainer vừa review. Phase 9 yêu cầu một deterministic freshness check là required status check trên Evidence Watch review PR:

```text
refetch monitored source
→ canonicalize bằng đúng config/parser version
→ comparisonDigest
→ so với digest mà review payload hiện tại của PR đại diện
```

```text
giống  → freshness check PASS
       → ghi freshnessAccepted {
           prHeadSha, comparisonDigest, reviewPayloadDigest,
           monitorConfigHash, parserVersion, comparisonDigestVersion,
           checkedAt
         }

khác   → freshness check FAIL
       → refresh CÙNG Draft PR
       → tính lại cumulative diff
       → chỉ chạy lại AI cho comparisonDigest MỚI,
         và tối đa một lần tự động
       → cần human review lại
```

Một lần PASS được bind với đúng một cặp — PR head SHA nó đã chạy trên đó và `comparisonDigest` nó chấp nhận — và vô giá trị ngoài cặp đó: review branch/head đổi vì bất kỳ lý do gì thì acceptance cũ mất hiệu lực và required check phải chạy lại; scheduled watcher thấy upstream đổi tiếp thì cập nhật cùng review PR, cập nhật `reviewHeadSha` và `latestObservedComparisonDigest`, vô hiệu hóa `freshnessAccepted` cũ, và cần human review + freshness check lại; finalizer sau merge chỉ được dùng `freshnessAccepted` khi `merged PR head SHA == freshnessAccepted.prHeadSha`.

Không hứa tuyệt đối rằng upstream không thể đổi ngay sau lần check; yêu cầu hẹp hơn và enforce được: PR không được merge với một reviewed fingerprint đã biết là stale.

### Operational condition

Ngoài lỗi transport/parser, các condition sau là operational, không phải evidence change. Đây là bộ cuối cùng của Phase 9 v1:

```text
BOOTSTRAP_REQUIRED                 canonical monitor chưa từng initialized;
                                   cần bootstrap tường minh
FETCH_ERROR                        lỗi transport/HTTP
PARSER_ERROR                       adapter không parse được response
STATE_MISSING                      source đã initialized, thiếu file state
STATE_CORRUPT                      source đã initialized, state không đọc được
STATE_SYNC_ERROR                   canonical merge đứng vững, ghi state thất bại
STATE_SCHEMA_MIGRATION_REQUIRED    schemaVersion của state không migrate
                                   deterministic được
REBASELINE_REQUIRED                monitorConfigHash / parserVersion /
                                   comparisonDigestVersion làm baseline đã lưu
                                   không còn so sánh được
REVIEW_ARTIFACT_MISSING            state ghi có review mở nhưng PR biến mất
REVIEW_STATE_MISMATCH              PR tồn tại nhưng durable state không
                                   reconcile an toàn được với nó
REVIEW_BRANCH_CONFLICT             refresh/base sync tự động xung đột với phần
                                   maintainer đã sửa trên review branch
REVIEW_CLOSED_UNMERGED             review close không merge, và không phải
                                   REVIEW_REVERTED_TO_BASELINE đã verify
authentication/access failure
persistent adapter failure
```

Không condition nào là phát ngôn về **nội dung** của source. Mỗi cái nói một sự thật về watcher, config, state store hay review artifact của nó, và không cái nào được render/báo cáo/phân loại thành evidence content change.

Với tất cả: không advance `comparisonBaseline`; không tự lập baseline mới; không báo source là `UNCHANGED`; không báo diff classification cho lần chạy đó; có thể fail workflow và tạo/cập nhật operational Issue — trừ `BOOTSTRAP_REQUIRED` vốn là điều kiện khởi tạo bình thường, chỉ vào workflow summary/observability chứ không tự tạo Issue; không tạo evidence-change PR giả khi chưa xác định có evidence change thật.

`REVIEW_REVERTED_TO_BASELINE` cố ý **không** nằm trong bộ này: đó là review resolution condition deterministic hợp lệ, không phải operational failure.

#### Khôi phục state bị mất hoặc hỏng

`STATE_MISSING`/`STATE_CORRUPT` nghĩa là state của một source **đã initialized** bị mất hoặc không đọc được. Khôi phục phải tường minh và theo thứ tự:

1. restore state hợp lệ gần nhất từ Git history của `evidence-watch/state`;
2. validate bản khôi phục — schema version, `sourceId`, tương thích `monitorConfigHash`/`parserVersion`;
3. không lập baseline mới từ upstream hiện tại chỉ vì state hiện tại bị mất.

Nếu không còn recover được baseline hợp lệ nào từ history đó:

```text
→ hard operational recovery condition
→ không phân loại source như bình thường
→ no UNCHANGED
→ no bootstrap
→ no baseline advancement
```

Khôi phục khi đó bắt buộc phải có maintainer verify source tường minh. Chỉ sau khi maintainer đã đối chiếu official source hiện tại với canonical content qua normal reviewed path thì một `rebaseline` tường minh mới được lập baseline mới, và baseline đó bind với canonical merge SHA đó (`authority = manual-rebaseline`, có ghi `canonicalGitSha`).

`bootstrap` không bao giờ là cơ chế recovery cho source đã initialized. State schema migration cũng vậy: `STATE_SCHEMA_MIGRATION_REQUIRED` được giải quyết bằng cách làm cho migration deterministic, không bao giờ bằng cách quan sát lại source rồi gọi kết quả đó là baseline.

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
  ├─ 2 metadata-only     → deterministic, no AI, không ghi canonical vào `main`,
  │                         baseline chỉ advance ở mức operational
  └─ 1 actionable change → impact analysis → Draft PR → AI Review Summary → human review
```

## Model independence

Không hard-code provider/model vào architecture. Provider, model, reasoning level là deployment configuration. Đổi model không được thay đổi evidence authority, canonical data ownership, review-state semantics, human approval requirement hay deployment gate.

## Legal/operational

Respect robots/terms/license/rate limit/auth; không bypass paywall/anti-bot; ưu tiên official feed/API; chỉ lưu dữ liệu cần thiết; source HTML/PDF là untrusted input (kể cả khi tài liệu tải về có nội dung chỉ dẫn reviewer hoặc model làm gì).

## Observability

Theo dõi: last successful check, consecutive failures, changed/unchanged counts, source đang chờ bootstrap tường minh (`BOOTSTRAP_REQUIRED`) hoặc rebaseline, lifecycle trong manifest (kể cả monitor `inactive` và source đang kẹt `STATE_SCHEMA_MIGRATION_REQUIRED`), review kẹt ở phase `reserved` cùng số lần `REVIEW_STATE_MISMATCH`/`REVIEW_BRANCH_CONFLICT`, review resolve bằng `REVIEW_REVERTED_TO_BASELINE`, review có branch behind `main` và số lần review-integrity check fail, các lần thử AI `unavailable`/`failed` cho digest hiện tại đang chờ `retry-ai` tường minh, merged review còn chờ reconcile và số lần `STATE_SYNC_ERROR`, source đang nằm trong operational recovery state (`REVIEW_CLOSED_UNMERGED`, `STATE_MISSING`/`STATE_CORRUPT` không recover được), số kết quả deterministic metadata-only (kể cả những kết quả gợi ý một chỗ cần sửa canonical `SourceRecord` mà maintainer còn phải làm trong reviewed PR thông thường), parser failures, Draft PR đang mở và tuổi của chúng, số AI Review completed/unavailable/failed, source quá hạn review, claim đang bị chặn bởi source changed/superseded, thời gian từ lúc detect đến lúc release.

## Evidence Watch v1

Registry + adapters + watcher operational state bền trên branch `evidence-watch/state` (`manifest.json` làm registry khởi tạo + state từng source) với các mode manual tường minh `bootstrap`/`rebaseline`/`reconcile`/`retry-ai` + fetch/fingerprint so với `comparisonBaseline` (tách khỏi `lastObservedFingerprint`) + diff và actionable classification + locator move detection + source→claim impact + deterministic structured payload/Markdown renderer + đúng một Draft PR idempotent cho mỗi source chưa resolve, cập nhật tại chỗ khi có revision mới, kèm AI Review Summary (hoặc trạng thái unavailable/failed) + `comparisonDigest` đã chốt ở `sha256-v1` trên canonical JSON v1 và `monitorConfigHash` chỉ phủ config ảnh hưởng comparison/identity + required source freshness check và required deterministic review-integrity check trước merge (cả hai bind với đúng PR head SHA), review branch bắt buộc current với `main` và approval của con người áp cho head reviewable mới nhất + post-merge reconciliation idempotent (advance cả `monitorConfigHash`/`parserVersion`/`comparisonDigestVersion` đã review) + Issue chỉ cho operational failure + fetch security contract và ranh giới `licenseMode` cho material gửi AI + enforcement giữ file `evidence/state/**` có nội dung khỏi `main`. Không advance baseline khi chưa có resolution hợp lệ, không bootstrap/rebaseline âm thầm, không re-bootstrap source đã initialized; write vào `evidence-watch/state` dùng compare-and-swap được serialize, không force-push, branch được protect, state-sync thất bại thì fail closed chứ không nhân đôi review, và saga reserve-first giúp một run chết giữa chừng resume thay vì mở PR thứ hai; review branch giữ nguyên phần canonical maintainer đã sửa (không reset, không force-push, xung đột thì `REVIEW_BRANCH_CONFLICT` fail closed), mỗi upstream digest mới sinh review head SHA mới, và upstream quay lại baseline đi theo path `REVIEW_REVERTED_TO_BASELINE`. **Không** tự viết lại canonical content, **không** tự ghi canonical vào `main` ở bất kỳ outcome nào (một lần chạy watcher chỉ persist operational state và review artifact), và **không** yêu cầu public production site phản ánh pending watcher state trước reviewed merge.

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

Ba state, không bao giờ được đánh đồng:

```text
1. watcher operational state
   → Evidence Watch được tự cập nhật, trên branch `evidence-watch/state`
   → không phải canonical product knowledge

2. pending Evidence Watch review
   → thể hiện bằng Draft Pull Request
   → không phải production state

3. canonical production provenance
   → reviewed Git/YAML state
   → chỉ đổi qua reviewed merge + deployment pipeline hiện có
```

> **Deterministic Evidence Watch detects and scopes the change.
> AI explains and assists.
> GitHub Draft PR carries the review.
> A human retains approval authority.
> Semantic medical changes never publish themselves.**
