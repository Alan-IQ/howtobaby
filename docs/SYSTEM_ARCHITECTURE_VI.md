# SYSTEM_ARCHITECTURE — Bản tiếng Việt

> Bản English là canonical.

## Kiến trúc 3 plane

```text
PUBLIC RUNTIME
  static Next.js + client personalization + Tools
        ▲
BUILD / CONTENT PLANE
  schema → content graph → i18n → generated pages
        ▲
EVIDENCE OPERATIONS
  scheduled source monitor → diff → impact → PR/review
```

Evidence watcher có thể chạy GitHub Actions/cron worker; không phải user-profile backend.

## Repo gợi ý

```text
apps/web
packages/domain
packages/content-schema
packages/content
packages/i18n
packages/ui
packages/tools-core
packages/tools-audio
packages/validation
services/evidence-watch
scripts/*
docs/*
```

## Runtime

- static public routes;
- child profile local-only;
- client JS cho personalization/theme/language/tools;
- public và personalized dùng cùng compiled content graph.

## Content build

```text
source registry + claims + applicability + VI + tools + themes
→ schema validation
→ provenance
→ EN/VI parity
→ precision/safety invariant
→ compiled manifests
→ static pages/build
```

## Resolver

Date/age math không ở component; prose không ở business logic; theme không ở domain logic; tool không được hard-code medical rule riêng.

## Tools

Tool Registry quyết định navigation/route/module/guidance dependencies. Guidance-linked tool reference canonical claim IDs.

## Evidence operations

Scheduled fetch, cache, canonicalize, fingerprint, diff, source→claim impact, report/PR. Không tự mutate release-approved medical content vì một source vừa đổi.

## CI

Typecheck/lint/unit + content schema + provenance + EN/VI parity + coverage + safety/precision + tool registry + theme completeness + static generation + build + E2E/visual/print khi cần.

## Backend tương lai

Chỉ thêm user-facing backend khi thực sự cần sync/account/notifications/collaboration/subscription/API. Không thêm chỉ vì evidence watcher cần schedule compute hoặc vì knowledge files nhiều. Backend sở hữu user/runtime state; **không sở hữu canonical knowledge**.


## Repo/provenance v0.6.0

- Chi tiết folder/package nằm trong `REPOSITORY_STRUCTURE.md`; `SYSTEM_ARCHITECTURE` chỉ giữ boundary cấp kiến trúc.
- `packages/knowledge` sở hữu `SourceRecord → ClaimSourceRef/Locator → Claim → Guidance`.
- Build sinh `claim-evidence-index`, `source-claim-index`, `route-evidence-index`, `tool-evidence-index`; SourceChip/EvidenceDrawer/References/Print đều dùng các index này.
- `/sources` và `/evidence/...` là read model sinh từ graph, không phải content store thứ hai.
- CI phải validate direct source cho `official-guidance`, source link, reverse indexes và provenance của guidance-linked Tool.
- Evidence cache/full fetched HTML/PDF không được lọt vào public bundle và mặc định không commit vào Git.

## Canonical knowledge và SQLite — v0.6.0

- Knowledge đã review luôn canonical trong **YAML/structured text + Git history**.
- SQLite được tạo sớm ở Phase 2 như **derived index/read model** cho validation, joins, reverse dependency, reports và Evidence Watch.
- `knowledge.sqlite`, JSON manifests, search/reverse indexes và future PostgreSQL projection đều phải xóa/build lại được từ canonical source.
- Public browser không mặc định tải cả SQLite; runtime dùng route bundles/generated read models phù hợp.
- Next.js không bị khóa vào `output: export`; static export chỉ là deployment profile.
- Theme architecture chi tiết chuyển qua `THEME_SYSTEM.md`; third-party theme phải đi qua adapter và không được leak vendor APIs vào domain logic.

### SQLite projection gợi ý

Có thể normalize thành `sources`, `claims`, `claim_source_refs`, `source_locators`, `guidance_blocks`, `translations`, `applicability_rules`, `route_claims`, `tool_claims`, `content_release_metadata`. Stable string ID từ canonical source mới là durable ID; SQLite row ID không trở thành canonical/public ID. Build DB trong transaction và chỉ replace DB cũ sau khi validation pass.


## Repository/object-storage boundary — v0.7.0

YAML/Git vẫn canonical, nhưng Git chỉ giữ authored/auditable state. `knowledge.sqlite`, generated indexes, crawler cache/full source bodies và bulk media không thuộc permanent Git history. Media lớn dùng object storage/CDN; repo chỉ giữ metadata/asset ID/URL/license. Evidence Watch có thể dùng temporary CI/workspace/cache storage để fetch/diff. Budget và CI policy nằm ở `REPOSITORY_HEALTH.md`.
