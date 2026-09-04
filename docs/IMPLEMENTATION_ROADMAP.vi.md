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

Source monitor registry, adapters CDC/FDA/AAP/WHO phù hợp, hash/section diff, source→claim impact, deterministic actionable-change classification, deterministic structured review payload + Markdown renderer, Draft Pull Request tự động và idempotent cho mọi actionable evidence change, AI Review Summary có schema và version, fallback khi AI unavailable/failed, dedup/concurrency control, least-privilege GitHub Actions permissions, human-review/merge boundary tests, scheduled/manual GitHub Actions. Contract: `EVIDENCE_UPDATE_ENGINE.md`.

Gate: mỗi actionable evidence change tạo/cập nhật đúng một Draft PR; AI chỉ chạy sau deterministic detection; AI failure không suppress deterministic review artifact; operational failure không giả thành evidence-change PR; AI không hạ được policy risk, không approve/merge/publish; semantic medical change không tới production trước human review + merge.

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
- **Phase 9:** watcher detect locator move, dùng canonical reverse index, cache full source temporary/gitignored, giữ history khi source đổi, và đưa mọi actionable change qua canonical Draft-PR review path.
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
