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

Ngoài ra còn các operational condition không phải kết quả diff: `STATE_MISSING`, `STATE_CORRUPT`, `REBASELINE_REQUIRED`, `REVIEW_ARTIFACT_MISSING`.

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

`FETCH_ERROR`, `PARSER_ERROR`, `STATE_MISSING`, `STATE_CORRUPT`, `REBASELINE_REQUIRED`, `REVIEW_ARTIFACT_MISSING`, authentication/access failure, persistent adapter failure.

Đây không phải evidence change. Không condition nào trong nhóm này advance `comparisonBaseline`, tự lập baseline mới hay báo source là `UNCHANGED`. Có thể fail workflow và/hoặc tạo/cập nhật GitHub Issue theo retry/escalation policy, nhưng **không được** tạo evidence-change Pull Request nếu chưa xác định có evidence/provenance change thật. Phải phân biệt deterministic giữa lỗi transport/parser và `SOURCE_MISSING`/`SOURCE_MOVED` thật trước khi chọn outcome.

GitHub Issue **chỉ** dành cho operational failure. Không outcome nào khác tạo Issue: `UNCHANGED` và deterministic metadata-only không tạo Issue, còn actionable evidence change do Draft Pull Request gánh, không bao giờ do Issue.

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

Idempotent + concurrency: một source chưa resolve ↔ một review branch `evidence-watch/review/<sourceId>` ↔ một Draft PR; run sau cập nhật branch/PR đã có và tính lại cumulative diff `comparisonBaseline → latest observed fingerprint` thay vì mở PR mới; run scheduled/manual chồng nhau không được tạo trùng branch/PR; workflow phải có concurrency control.

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

Với một review đang mở, việc có gọi AI lại hay không là deterministic theo `pendingReview.lastAiReviewedFingerprintHash`: fingerprint quan sát được không đổi thì không gọi AI; có revision mới thì chạy lại summary trên cumulative diff mới nhất và thay bản cũ trong cùng PR.

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

Maintainer review Draft PR đối chiếu official source và có thể approve, request changes, sửa canonical content, ghi kết quả review ngay trên PR đó rồi merge, yêu cầu review mạnh hơn/clinical review, hoặc merge sau khi mọi gate bắt buộc pass. Close mà không merge chỉ dành cho false positive / monitor defect / invalid detection: một source đổi thật nhưng được kết luận là không đổi nghĩa thì **không** resolve bằng cách close PR, mà phải ghi minimal canonical review result (`SourceRecord.status`, `lastVerifiedAt`, `verifiedBy`, canonical metadata khác khi phù hợp) ngay trên PR đó rồi merge; close-không-merge không phải acceptance và không advance baseline. Content safety-critical/urgent/contraindication/emergency luôn cần human review và clinician review theo `GUIDANCE_CONTENT_CONTRACT.md`. Bot Evidence Watch và AI reviewer không bao giờ thỏa mãn được required human reviewer gate.

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

Một reviewed merge cũng phải là merge đúng thứ đã được review: mỗi Evidence Watch review PR có một deterministic source freshness check là required status check, refetch và fingerprint lại bằng đúng monitor config/parser version, và chặn merge khi source đã đi quá fingerprint mà maintainer vừa review.

## GitHub Actions: implementation + security

Workflow scheduled/manual có thể chạy adapters, persist watcher operational state trên branch dành riêng `evidence-watch/state` trong `evidence/state/**` (artifact/cache chỉ là transient optimization, không bao giờ là store có thẩm quyền, và không bao giờ trộn vào canonical authored file), tạo/cập nhật branch `evidence-watch/review/<sourceId>`, tạo/cập nhật đúng một Draft PR cho mỗi source chưa resolve, tạo/cập nhật Issue **chỉ** cho operational failure, chạy freshness check trước merge cho PR đang mở, và không cần inbound web service. Phải có concurrency control để run chồng nhau không tạo trùng branch/PR/report.

Workflow phải có manual mode tường minh cho khởi tạo và khôi phục, tách khỏi scheduled run:

```text
workflow_dispatch:
  mode = bootstrap  | sourceId = <id | all>
  mode = rebaseline | sourceId = <id>
```

Scheduled run không bao giờ bootstrap hay rebaseline; gặp state thiếu/hỏng/không so sánh được thì báo operational condition.

Security: khai báo `permissions` least-privilege; chỉ cấp quyền đọc repo, tạo/cập nhật Evidence Watch branch, tạo/cập nhật Draft PR và optional operational Issue; AI credential nằm trong GitHub Secrets hoặc secret store đã duyệt; không để secret lọt vào log/report/PR body/committed file; identity của Evidence Watch không được có quyền bypass branch/ruleset review requirement.

### Yêu cầu branch protection / ruleset

Production pipeline deploy khi push vào `main`. Khối `permissions` của workflow không ràng buộc được identity làm gì **ngoài** workflow đó, nên bắt buộc phải có enforcement ở mức repository, không phải hardening tùy chọn.

Phase 9 **phải** cấu hình GitHub Ruleset, branch protection hoặc enforcement tương đương trên `main` sao cho Evidence Watch identity:

- không push được semantic evidence change thẳng vào `main`;
- không bypass được Draft Pull Request review path;
- không bypass được required approval hoặc required status check;
- không tự approve PR evidence của chính nó, không force-push vào `main`, không xóa được protected branch;
- không ghi được canonical `SourceRecord` metadata hay bất kỳ canonical authored file nào vào `main` ngoài reviewed path, kể cả với kết quả deterministic metadata-only;
- không merge được Evidence Watch review PR chưa pass required source freshness check.

`evidence-watch/state` là operational branch non-canonical: không merge vào `main`, không mở thành review PR, không trigger deployment.

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

### Operational state của từng source

```ts
interface EvidenceWatchSourceState {
  schemaVersion: string;
  sourceId: string;

  monitorConfigHash: string;
  parserVersion: string;

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
    prNumber: number;
    branch: string;
    detectedAt: string;
    updatedAt: string;
    baselineFingerprintHash: string;
    latestObservedFingerprintHash: string;
    lastAiReviewedFingerprintHash?: string;
  };
}
```

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
→ observed == comparisonBaseline
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

Quyết định gọi AI là deterministic, dựa trên `pendingReview.lastAiReviewedFingerprintHash`: fingerprint mới nhất trùng giá trị đó thì **không gọi AI lại**; fingerprint đổi tiếp thì chạy lại AI Review Summary trên cumulative diff mới nhất và thay bản tóm tắt trong CÙNG PR.

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
→ no AI
→ no evidence PR
```

Bootstrap là initialization, không phải evidence change. Source đã initialized rồi thì scheduled run không bao giờ được bootstrap lại nó. Monitor thêm về sau cũng phải bootstrap tường minh sau khi monitor config đã review/merge.

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

Manual rebaseline phải verify source identity và locator trước khi thay baseline. Nếu trong lúc đó phát hiện thay đổi material về source identity/provenance/content:

```text
→ hủy rebaseline
→ promote thành actionable evidence change
→ Draft PR
```

Rebaseline thành công ghi `authority = manual-rebaseline`.

### Resolution và dịch chuyển baseline

Actionable change chỉ advance `comparisonBaseline` sau một resolution hợp lệ.

**Reviewed PR đã merge:**

```text
→ verify PR/fingerprint resolution metadata
→ comparisonBaseline = đúng fingerprint đã thực sự được review cho PR đã merge đó
→ authority = reviewed-pr
→ ghi prNumber
→ xóa pendingReview
```

Không được advance baseline lên một observed fingerprint mới hơn mà maintainer chưa review.

**Source đổi thật nhưng người review kết luận không đổi nghĩa:** không đơn giản close PR rồi coi là xong. Maintainer phải hoàn tất minimal canonical review result ngay trên PR đó — ví dụ `SourceRecord.status → current`, `lastVerifiedAt` → ngày con người thực sự kiểm chứng, `verifiedBy → maintainer`, và canonical metadata khác chỉ khi phù hợp — rồi merge qua normal reviewed path, để canonical audit trail và watcher baseline có chung một điểm resolution rõ ràng.

**PR closed không merge:** không phải acceptance và không advance `comparisonBaseline`. Chỉ dùng khi event là false positive / monitor defect / invalid detection; sau đó phải sửa monitor/config rồi đi qua explicit rebaseline hoặc detection path phù hợp.

### Freshness gate trước khi merge

Một Evidence Watch review PR không được merge nếu source đã đổi tiếp sau fingerprint mà maintainer vừa review. Phase 9 yêu cầu một deterministic freshness check là required status check trên Evidence Watch review PR:

```text
refetch monitored source
→ canonicalize bằng đúng config/parser version
→ fingerprint
→ so với fingerprint mà review payload hiện tại của PR đại diện
```

```text
giống  → freshness check PASS

khác   → freshness check FAIL
       → refresh CÙNG Draft PR
       → tính lại cumulative diff
       → chỉ chạy lại AI nếu fingerprint đổi
       → cần human review lại
```

Không hứa tuyệt đối rằng upstream không thể đổi ngay sau lần check; yêu cầu hẹp hơn và enforce được: PR không được merge với một reviewed fingerprint đã biết là stale.

### Operational condition

Ngoài lỗi transport/parser, các condition sau là operational, không phải evidence change:

```text
FETCH_ERROR
PARSER_ERROR
STATE_MISSING
STATE_CORRUPT
REBASELINE_REQUIRED
REVIEW_ARTIFACT_MISSING
authentication/access failure
persistent adapter failure
```

Với tất cả: không advance `comparisonBaseline`; không tự lập baseline mới; không báo source là `UNCHANGED`; có thể fail workflow và tạo/cập nhật operational Issue; không tạo evidence-change PR giả khi chưa xác định có evidence change thật.

`STATE_MISSING`/`STATE_CORRUPT` nghĩa là state của một source đã initialized bị mất hoặc không đọc được. Khôi phục phải tường minh — restore state, hoặc chạy bootstrap/rebaseline tường minh — không bao giờ là một baseline mới âm thầm hay một `UNCHANGED` giả.

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

Theo dõi: last successful check, consecutive failures, changed/unchanged counts, số kết quả deterministic metadata-only (kể cả những kết quả gợi ý một chỗ cần sửa canonical `SourceRecord` mà maintainer còn phải làm trong reviewed PR thông thường), parser failures, Draft PR đang mở và tuổi của chúng, số AI Review completed/unavailable/failed, source quá hạn review, claim đang bị chặn bởi source changed/superseded, thời gian từ lúc detect đến lúc release.

## Evidence Watch v1

Registry + adapters + watcher operational state bền trên branch `evidence-watch/state` với bootstrap/rebaseline manual tường minh + fetch/fingerprint so với `comparisonBaseline` (tách khỏi `lastObservedFingerprint`) + diff và actionable classification + locator move detection + source→claim impact + deterministic structured payload/Markdown renderer + đúng một Draft PR idempotent cho mỗi source chưa resolve, cập nhật tại chỗ khi có revision mới, kèm AI Review Summary (hoặc trạng thái unavailable/failed) + required source freshness check trước merge + Issue chỉ cho operational failure. Không advance baseline khi chưa có resolution hợp lệ, không bootstrap/rebaseline âm thầm. **Không** tự viết lại canonical content, **không** tự ghi canonical vào `main` ở bất kỳ outcome nào (một lần chạy watcher chỉ persist operational state và review artifact), và **không** yêu cầu public production site phản ánh pending watcher state trước reviewed merge.

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
