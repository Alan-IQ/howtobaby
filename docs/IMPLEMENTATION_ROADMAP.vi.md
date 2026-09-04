# IMPLEMENTATION_ROADMAP — Bản tiếng Việt

> Bản English là canonical cho phase/gate.

## Phase 0 — Docs/repo baseline

Chốt bộ docs v0.8.0, repo structure, CI skeleton, deployment decision, multi-license baseline (`AGPL-3.0-only` cho software; `CC-BY-NC-SA-4.0` cho original knowledge/docs), third-party notice và license guard.

## Phase 1 — App shell + Theme Engine

Next.js/TS **static-first nhưng server-capable**, không khóa kiến trúc vào `output: export`; Theme Registry + Theme Contract + adapter interfaces, Baby Modern Glass Light/Dark, AppShell/Header/Nav, responsive/print scaffold. Gate: component không hard-code theme palette và không import vendor theme trực tiếp.

## Phase 2 — Content/source schema

SourceRecord, Claim/GuidanceBlock/applicability/precision/review schemas, EN/VI framework, coverage/provenance validation, trust page scaffold; đồng thời dựng canonical YAML/Git + `KnowledgeRepository` + **derived `knowledge.sqlite`** và reverse indexes. SQLite phải xóa/build lại được.

## Phase 3 — Age/context + Browse

Date utilities, corrected-age proxy, actual/browsed/preview isolation, browse-by-age, optional local profile, public static routes.

## Phase 4 — Play & Development

Migrate prototype, stage map, activities, corrected age, stage navigator, source audit, print.

## Phase 5 — Sleep + Safe Sleep

Official duration matrix, safe sleep, newborn responsive mode, nap/wake heuristic, settling vs behavioral methods.

## Phase 6 — Feeding + Feeding Safety

Feeding resolver, readiness, texture, responsive feeding, allergen, choking metadata, formula/breast-milk handling.

## Phase 7 — Personalized Now

What matters now + Feed/Play/Sleep/Safety cards + Know/Do/Why/Watch/Source + timeline + adjustment + freshness.

## Phase 8 — Tools + Audio MVP

Tool Registry/Hub/Shell, shared AudioSession, Lullaby Player, Ambient/Frequency Player có optional 432 Hz, timer/fade, mini-player nếu UX tốt. Gate: không therapeutic 432 Hz claim.

## Phase 9 — Evidence Watch v1

Source monitor registry, adapters CDC/FDA/AAP/WHO phù hợp, hash/section diff, source→claim impact, deterministic actionable-change classification, deterministic structured review payload + Markdown renderer, Draft Pull Request tự động và idempotent cho mọi actionable evidence change, AI Review Summary có schema và version, fallback khi AI unavailable/failed, dedup/concurrency control, watcher operational state bền trên branch non-canonical `evidence-watch/state` (`evidence/state/manifest.json`, `evidence/state/sources/<sourceId>.json`) tách khỏi canonical knowledge (một lần chạy chỉ refresh fingerprint/metadata check, không ghi canonical `SourceRecord` metadata hay canonical authored file nào vào `main`), `comparisonDigest` deterministic làm comparison identity duy nhất (loại các field chỉ mang tính observation), state từng source có `comparisonBaseline` tách khỏi `lastObservedFingerprint` cùng `monitorConfigHash`/`parserVersion`/`pendingReview` (`reviewHeadSha`, các digest, `freshnessAccepted`), manual dispatch mode `bootstrap`, `rebaseline` và `reconcile` tường minh, deterministic source freshness check là required status check trước merge bind với đúng PR head SHA và digest, post-merge reconciliation idempotent, write vào `evidence-watch/state` được serialize và branch được protect, least-privilege GitHub Actions permissions, GitHub Ruleset/branch protection (hoặc enforcement tương đương) trên `main` chặn Evidence Watch identity push thẳng semantic evidence change, bypass Draft PR review path, bypass required approval/check hay tự approve PR của chính nó, `comparisonDigest` chốt ở `comparisonDigestVersion = "sha256-v1"` trên canonical JSON v1 của `{digestVersion, sourceId, monitorConfigHash, parserVersion, material}`, `monitorConfigHash` chỉ phủ config ảnh hưởng comparison/identity (loại `interval`, `licenseMode`), `evidence/state/manifest.json` làm registry khởi tạo (`lifecycle`, `everInitialized`) phân biệt monitor chưa từng initialized (`BOOTSTRAP_REQUIRED`) với source đã initialized bị mất state (`STATE_MISSING`/`STATE_CORRUPT`) và đánh dấu monitor bị gỡ là `inactive`, path migration schema state deterministic với `STATE_SCHEMA_MIGRATION_REQUIRED` khi không hỗ trợ, saga review reserve-first (`reserved → open`) tra cứu deterministic theo `sourceId`/`reviewKey`/review branch để crash giữa lần ghi GitHub và lần ghi state thì resume/adopt chứ không mở PR trùng (`REVIEW_STATE_MISMATCH` fail closed), review branch giữ nguyên phần canonical maintainer sửa (không reset/force-push, xung đột thì `REVIEW_BRANCH_CONFLICT`) và mỗi upstream digest mới sinh review head SHA mới, đồng bộ head PR ở event `opened`/`synchronize`/`reopened`, `reviewPayloadDigest` cùng required review-integrity check bind với đúng PR head, enforcement bắt review PR up-to-date với `main` và approval áp cho head reviewable mới nhất, path `REVIEW_REVERTED_TO_BASELINE`, `aiAttempt` + mode `retry-ai`, write state bằng fast-forward compare-and-swap, fetch security contract (scheme allowlist, chặn private-network, validate redirect, giới hạn redirect/size/timeout, không gửi lại credential sang host khác), ranh giới `licenseMode` cho material gửi external AI, và enforcement repository-health/baseline giữ `evidence/state/manifest.json` cùng `evidence/state/sources/**` khỏi `main`, human-review/merge boundary tests, scheduled/manual GitHub Actions. Contract: `EVIDENCE_UPDATE_ENGINE.md`.

Gate: mỗi actionable evidence change tạo/cập nhật đúng một Draft PR cho `sourceId` đó; `SOURCE_MOVED` luôn được phân loại actionable, không bao giờ metadata-only; kết quả deterministic metadata-only không tạo PR, không tạo Issue và không ghi canonical vào `main` (cần sửa canonical `SourceRecord` thì để maintainer làm trong reviewed PR thông thường, hoặc nâng thành actionable); watcher operational state và canonical knowledge state tách bạch, thứ chỉ nằm trong watcher state/cache không được coi là canonical source metadata hay provenance công khai; Draft PR đang chờ là tín hiệu pending-review của Phase 9 cho maintainer, public production site không bắt buộc phản ánh pending watcher state trước reviewed merge và Phase 9 không thêm backend/runtime freshness service để publish state đó; branch `evidence-watch/state` tồn tại và được dùng làm store bền (artifact/cache chỉ transient; branch đó không merge vào `main`, không thành review PR, không deploy); bootstrap đầu tiên tường minh và có test, state mất/hỏng không âm thầm rebaseline và không báo `UNCHANGED`; lệch monitor config/parser sinh `REBASELINE_REQUIRED` và bắt buộc manual rebaseline có verify identity/locator, phát hiện thay đổi material thì hủy và promote thành actionable; `comparisonBaseline` tách khỏi `lastObservedFingerprint` và actionable detection không advance baseline trước khi có resolution hợp lệ; đúng một open review PR cho mỗi `sourceId`, revision upstream tiếp theo cập nhật chính PR đó trên cumulative diff, fingerprint pending không đổi thì không gọi AI thêm; PR đã merge chỉ advance baseline lên đúng fingerprint đã review, PR close-không-merge không advance gì; freshness check chặn merge với reviewed fingerprint đã stale; `comparisonDigest` deterministic và không phụ thuộc field observation, `checkedAt` không tham gia equality; source đã initialized không bao giờ được bootstrap lại để recovery; state mất/hỏng phải restore từ history của state branch, hết cách thì cần maintainer verify source tường minh rồi mới rebaseline bind với canonical merge đó; post-merge reconciliation deterministic, idempotent, retry được và baseline chỉ advance theo đúng merged PR head SHA cùng `comparisonDigest` đã freshness-accepted; state-sync lỗi thì fail closed (canonical merge giữ nguyên, baseline không advance, `pendingReview` không bị xóa, không mở review trùng); PR closed-không-merge không advance baseline và đưa source vào recovery state tường minh; write vào `evidence-watch/state` được serialize, atomic, không force-push và branch được chặn force-push/xóa; AI chỉ chạy sau deterministic detection; AI failure không suppress deterministic review artifact và không được bịa semantic assessment/summary; detected source change không sửa `Claim.reviewStatus` (chỉ derived signal từ `SourceRecord.status`); operational failure không giả thành evidence-change PR; AI không hạ được policy risk, không approve/merge/publish; enforcement trên `main` đã cấu hình và verify để chỉ merge đã review mới vào production pipeline; semantic medical change không tới production trước human review + merge; `checkedAt` đổi thì `comparisonDigest` không đổi và cùng normalized material luôn cho đúng một digest `sha256-v1`; lệch digest algorithm/version sinh `REBASELINE_REQUIRED` chứ không phải diff result; source chưa từng initialized sinh `BOOTSTRAP_REQUIRED`, source đã initialized mất state sinh `STATE_MISSING` và không bao giờ được bootstrap; migration schema được hỗ trợ giữ nguyên ý nghĩa/digest của `comparisonBaseline`, không hỗ trợ thì `STATE_SCHEMA_MIGRATION_REQUIRED` và không classify/advance gì; crash sau khi reserve review nhưng trước khi tạo PR thì resume an toàn, crash sau khi tạo PR nhưng trước khi sync `prNumber` thì adopt PR đã có, không bao giờ tạo PR trùng; commit của con người trên review branch làm sync `reviewHeadSha` và vô hiệu freshness cũ, automation không ghi đè phần canonical con người sửa, xung đột thì `REVIEW_BRANCH_CONFLICT`; upstream digest mới làm đổi PR head SHA, approval cũ thành stale và head mới cần approval lại; `main` tiến lên khi PR mở thì sync branch và tính lại impact payload, lệch `reviewPayloadDigest` thì chặn merge; source A→B→A khi PR mở đi theo `REVIEW_REVERTED_TO_BASELINE`, baseline giữ nguyên A và lần close hợp lệ của con người không sinh recovery error; AI fail cho một digest thì không bị gọi lại mỗi cron, `retry-ai` hoạt động, và summary của digest cũ không bao giờ được hiển thị như review hiện hành; thay đổi config/URL được resolve trong PR đã review thì finalizer cài đúng config/parser/digest-version đã review, không sinh `REBASELINE_REQUIRED` giả; PR đã merge mà ghi state lỗi thì reconcile bằng retry, không nhân đôi evidence PR; write state đồng thời/stale-head không mất update và không force-push; file `evidence/state` có nội dung trên `main` làm fail repository gate; approval stale và freshness check stale không bao giờ authorize được merge; fetch tới đích private-network hoặc redirect không an toàn bị từ chối, và giới hạn size/timeout được giữ.

## Phase 10 — Trust/SEO/print/accessibility

Methodology/Sources/Editorial/Disclaimer/Changelog, static metadata/sitemap, print QA, accessibility/performance.

## Phase 11 — Public v1 hardening

Full source audit, content version freeze, EN/VI parity, tests/build, rollback, production deploy, privacy/security review.

## Phase 12 — Post-v1

PWA/offline, more Tools, logs/reminders, multi-child/sync, recalls, AI draft canonical EN/VI patch trên Evidence Watch review PR branch có sẵn, Ask HowToBaby, additional domains/locales.

## Cross-phase rules

- Không build final Now trước domain resolver ổn định.
- Tool không duplicate medical prose.
- Không làm AI rewrite trước deterministic monitoring/provenance.
- Không thêm user backend chỉ vì watcher cần scheduled compute hoặc vì knowledge files nhiều.
- YAML/Git luôn canonical; SQLite/PostgreSQL/generated store chỉ là projection.
- Theme mua ngoài phải qua `THEME_SYSTEM.md`, không leak vendor code vào domain.


## Bổ sung roadmap v0.6.0

- **Phase 0:** dựng repo/package ownership theo `REPOSITORY_STRUCTURE.md`; `evidence/cache` gitignored.
- **Phase 2:** thêm `ClaimSourceRef`, `SourceLocator`, source status/access mode, các evidence reverse indexes; làm `SourceChip`, `EvidenceDrawer`, `ReferenceList` sample ngay từ đầu. `official-guidance` không có direct/primary source phải fail CI.
- **Phase 4–6:** domain claim khi ship phải mở được provenance/original source, không đợi tới cuối project mới gắn citation.
- **Phase 7:** Now reuse cùng claim IDs + provenance với public pages.
- **Phase 8:** guidance-linked Tool reuse claim provenance, không source URL riêng.
- **Phase 9:** watcher detect locator move, dùng canonical reverse index, cache full source temporary/gitignored, giữ history khi source đổi, đưa mọi actionable change qua canonical Draft-PR review path, khóa `main` bằng ruleset/branch protection để review path không bypass được, và giữ watcher operational state tách hẳn khỏi canonical knowledge (không tự ghi canonical vào `main`, không đẩy pending state ra public site).
- **Phase 10:** hoàn thiện `/sources`, `/evidence/...`, revision history và trust UX.
- **Phase 11:** mọi release-approved health/safety claim phải pass provenance + original-source-link/status validation.

Cross-phase: không maintain References riêng ở page, không copy medical prose/source URL vào Tool, không commit routine full third-party source snapshots.

## Bổ sung v0.6.0 — storage/theme

- **Phase 1:** triển khai Theme Contract/adapter boundary ngay từ đầu và dùng fixture theme để chứng minh vendor independence; commercial theme thật có thể tích hợp sau.
- **Phase 2:** triển khai SQLite sớm vì lúc này schema/provenance đã đủ ổn định; dùng cho validation, joins, dependency graph, report/Evidence Watch và build-time bundles.
- Full static export chỉ là deployment profile nếu host cần; canonical Next.js app vẫn server-capable.
- Backend tương lai chỉ giữ user/runtime state; knowledge canonical không chuyển vào database.


## Bổ sung roadmap v0.7.0 — repository health

**Phase 0:** thêm `.gitignore`/guard cho `knowledge.sqlite`, generated artifacts, `evidence/cache`, bulk media; CI chạy repository-health check, chặn large blob ngoài allowlist và report repo size/object health.

**Phase 2:** SQLite vẫn build sớm nhưng chỉ là derived artifact, build local/CI; không commit binary DB.

**Mọi phase:** không dùng GitHub như object storage cho audio/video/source snapshots. Khi media library tăng, chuyển sang object storage/CDN và chỉ giữ metadata trong Git.
