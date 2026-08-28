# EVIDENCE_UPDATE_ENGINE — Bản tiếng Việt

> Core engine được thiết kế để hoạt động **không cần AI**. AI chỉ optional sau deterministic diff.

## Mục tiêu

```text
registered source
→ scheduled check
→ deterministic change detection
→ impacted claims
→ review artifact
→ approved content change
→ validate/build/deploy
```

Engine chính là change detection + impact analysis, không phải autonomous medical author.

## Tại sao không cần AI

Có thể detect bằng ETag/Last-Modified, RSS/Atom, API response, metadata date, normalized section hash, PDF checksum/text diff và source→claim dependency graph.

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

Content change không đồng nghĩa recommendation change.

## Dependency graph

```text
sourceId → claimIds → guidance blocks → public routes/tools
```

Source đổi → dependent claims thành `review-required` + report affected surfaces.

## Review workflow

Ban đầu nên làm:

```text
watcher
→ Markdown/JSON report hoặc GitHub issue/PR
→ maintainer mở official source review
→ update canonical English
→ VI parity
→ CI
→ merge/deploy
```

Đây đã tự động hóa rất nhiều mà không cần AI.

## AI optional

Sau deterministic diff, AI có thể summary, map likely claims, draft English/VI, phát hiện contradiction. Không được coi AI output là evidence, không auto-approve safety-critical change, không auto-publish semantic medical change chỉ vì model confidence cao.

## Legal/operational

Respect robots/terms/license/rate limit/auth; không bypass paywall/anti-bot; ưu tiên official feed/API; chỉ lưu dữ liệu cần thiết; source HTML/PDF là untrusted input.

## Evidence Watch v1

Chỉ cần registry + adapters + fingerprint + diff + source→claim impact + reports + scheduled GitHub Action. **Không cần automatic rewriting** để đã có phần lớn value.


## Provenance integration v0.6.0

Evidence Watch dùng cùng `SourceRecord`/`ClaimSourceRef` với public citation, không tạo model riêng. Khi phát hiện semantic/content change:

```text
current → changed-review-required
```

Claim phụ thuộc bị flag nhưng provenance/history cũ vẫn giữ cho đến khi review. Sau review source có thể quay lại `current`, claim được sửa, hoặc source thành `superseded` và map replacement.

Adapter nên kiểm tra cả `SourceLocator` (heading/section/page) khi có. Locator biến mất/move là review signal.

Mặc định chỉ persist metadata + canonical URL + locator + ETag/hash/fingerprint; full HTML/PDF nằm `evidence/cache/` temporary/gitignored. Chỉ retain/republish full source khi quyền reuse/syndication cho phép rõ ràng.

Watcher phải reuse canonical `source-claim-index`/`route-evidence-index` để impact report và public provenance không lệch nhau.

## SQLite / backend boundary — v0.6.0

Evidence Watch có thể query `packages/knowledge/generated/knowledge.sqlite` để tìm source→claim→route/tool impact nhanh hơn. SQLite chỉ là derived read model, phải rebuild được từ YAML/Git. Watcher/backend không được sửa knowledge canonical chỉ trong database rồi coi đó là publishable content.


## Repository health — v0.7.0

Watcher được phép tải HTML/PDF/source body vào ephemeral workspace/cache để parse/diff nhưng mặc định không commit các body này vào Git. Persistent Git state chỉ giữ metadata/URL/locator/hash/timestamp/parser version/change record cần thiết. CI phải bắt accidental source/cache commit theo `REPOSITORY_HEALTH.md`.
