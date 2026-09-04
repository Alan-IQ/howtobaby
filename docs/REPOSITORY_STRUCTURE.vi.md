# REPOSITORY_STRUCTURE — HowToBaby — Bản tiếng Việt

> Contract về cấu trúc repo và ownership. Mục tiêu là để nhìn vào repo có thể biết ngay code nào sở hữu UI, logic tuổi, knowledge, theme, Tools và evidence monitoring.

## 1. Nguyên tắc

- UI chỉ **render** knowledge, không sở hữu medical prose.
- Knowledge canonical nằm trong structured data riêng.
- Source/provenance không hard-code rải rác trong page/component.
- Evidence Watch là operational infrastructure, không phải backend chứa child profile.
- Tool dùng lại claim canonical thay vì copy lời khuyên.
- Theme tách khỏi component.
- Generated output luôn rebuild được.
- Không commit bừa full HTML/PDF có copyright vào public repo.

## 2. Layout đề nghị

```text
howtobaby/
├─ apps/web/                       # Next.js public app
├─ packages/
│  ├─ core/                        # age/context/applicability
│  ├─ knowledge/                   # canonical source + claim + guidance + VI
│  ├─ ui/                          # reusable components/evidence UI
│  ├─ themes/                      # theme registry + Baby Modern Glass
│  ├─ tool-platform/
│  ├─ i18n/                        # locale registry + message dictionaries + content-locale override
│  └─ validation/
├─ tools/                          # lullaby, ambient audio, future tools
├─ evidence/
│  ├─ adapters/                    # CDC/AAP/FDA/WHO/...
│  ├─ watcher/
│  ├─ diff/
│  ├─ dependency-graph/
│  ├─ reports/
│  ├─ state/                       # fingerprint/metadata
│  └─ cache/                       # temporary, gitignored
├─ scripts/
├─ docs/
├─ tests/
└─ .github/workflows/            # pipeline.yml (repository-health ∥ quality-build → deploy-production) + evidence-watch.yml (placeholder manual-only, target Phase 9: scheduled + manual)
```

## 3. Ownership quan trọng

- `apps/web`: route, layout, browser state; **không** chứa canonical health guidance.
- `packages/core`: date/age/context/resolver thuần; không có medical prose.
- `packages/knowledge`: source → claim → applicability → guidance → translation; đây là source-of-truth nội bộ của HowToBaby.
- `packages/i18n`: supported-locale registry, message-dictionary framework, content-locale override; bản dịch guidance canonical vẫn ở `packages/knowledge`, còn browser language preference/provider ở `apps/web`.
- `packages/ui`: component trình bày; không quyết định nội dung nào phù hợp y khoa.
- `packages/themes`: semantic tokens/theme family.
- `tools/*`: tính năng tool; guidance-linked tool chỉ tham chiếu claim ID.
- `evidence/*`: fetch/diff/impact/report và watcher operational state do việc đó sinh ra; không tự sửa JSX hay auto-publish medical guidance. Ranh giới sở hữu: Evidence Watch operational state do `evidence/*` sở hữu và được tự cập nhật bên ngoài canonical knowledge; còn canonical `SourceRecord`/claim/provenance thuộc `packages/knowledge`, là Git-reviewed canonical state, chỉ đổi qua reviewed merge path.

## 4. Dependency direction

```text
web → core / knowledge / ui / tool-platform
tools → tool-platform / core / knowledge API / ui
evidence → knowledge schema/registry → reports
```

Không cho phép `knowledge` phụ thuộc `web`, `core` phụ thuộc React, hoặc component tự tạo source record.

## 5. Dữ liệu canonical, generated và temporary

**Git-tracked canonical:** source registry, English claims, source refs/locators, applicability, VI translation, tool config, first-party theme/adapter metadata được phép lưu theo license, monitor config, review metadata. **YAML/Git luôn là canonical knowledge, kể cả sau này có backend/database/CMS.**

**Generated:** `content-manifest`, `source-manifest`, `evidence-manifest`, `route-evidence-index`, `content-version`.

**Temporary/gitignored:** downloaded HTML/PDF để diff, parser scratch, screenshots, full third-party snapshots trừ khi có quyền rõ ràng.

## 6. Knowledge structure

Ví dụ:

```text
packages/knowledge/src/claims/feeding/
  milk.yaml
  solids-readiness.yaml
  allergens.yaml
  choking.yaml
```

ID phải ổn định dù đổi filename:

```text
feeding.solids.start
sleep.safe.back_to_sleep
```

## 7. Evidence monitor state

Có thể lưu ETag, Last-Modified, hash, section hash, check time, parser version, availability, normalized effective URL, locator state, `acceptedObservation` (toàn bộ source condition đã accept) tách khỏi observation quan sát gần nhất, `comparisonBaseline` (material available được accept gần nhất) và change classification. Phase 9 v1 persist state đó trên đúng một branch non-canonical dành riêng `evidence-watch/state` (`evidence/state/manifest.json`, `evidence/state/sources/<sourceId>.json`); artifact/cache chỉ là transient optimization. Branch đó không merge vào `main`, không mở thành review PR, không trigger deployment, chỉ chứa metadata/status/hash gọn cùng các bản `SourceObservation` gọn nhẹ — không chứa source body, secret, AI prompt, output của AI hay excerpt dài. `manifest.json` là registry khởi tạo (`lifecycle`, `everInitialized` cho từng source), phân biệt monitor chưa từng initialized với source đã initialized bị mất state; nó và các file state liên quan update atomically trong cùng một state commit. `lifecycle` là một tập transition đóng, và manifest cố ý không mang field SHA của state commit — chính Git commit chứa manifest đã là identity của revision state đó. Trên `main`, `evidence/state/` chỉ là thư mục placeholder rỗng giữ quy ước đường dẫn, và Phase 9 thêm check repository-health/baseline giữ `manifest.json`/`sources/**` có nội dung khỏi `main`. Review branch là namespace riêng `evidence-watch/review/<sourceId>` và không bao giờ dùng làm state store. Mọi write vào branch đó được serialize sau một state-writer concurrency group và dùng fast-forward compare-and-swap (concurrency của workflow chỉ hỗ trợ scheduling, không phải cơ chế transactional), file state của source commit atomically cùng thay đổi liên quan trong `manifest.json`, write stale thì retry từ head mới nhất chứ không ghi đè, và branch không bao giờ bị force-push; history là append-only recovery history (không squash/reset/rewrite), restore cũng là một commit mới. Phase 9 cấu hình ruleset riêng cho `evidence-watch/state` (chặn force-push/xóa, giới hạn quyền write), tách biệt với ruleset của `main`. Schema và transition đầy đủ ở `EVIDENCE_UPDATE_ENGINE.md`. Tất cả những thứ đó là **watcher operational state**: do Evidence Watch sở hữu, một lần chạy watcher được tự refresh, và không phải canonical product knowledge. Vì vậy `evidence/state/` và `evidence/cache/` không bao giờ là canonical source metadata — giá trị canonical của `SourceRecord` nằm ở `packages/knowledge` và chỉ đổi qua reviewed merge path (`EVIDENCE_UPDATE_ENGINE.md`). Một lần chạy watcher không được ghi canonical authored file vào `main`, và giá trị chỉ tồn tại trong watcher state không bao giờ được dùng làm provenance công khai. Với source có copyright/restricted, ưu tiên:

```text
metadata + URL + locator + hash + temporary cache
```

thay vì commit nguyên tài liệu.

## 8. Git/PR

Content PR nên cho reviewer nhìn được cùng lúc:

- claim text thay đổi;
- source ref/locator;
- source metadata nếu đổi;
- EN/VI;
- review date/status;
- changelog khi meaning thay đổi.

Git history hỗ trợ audit nhưng không thay thế provenance schema.

## 9. Workflow ownership

`pipeline.yml` là workflow chính: `repository-health` ∥ `quality-build` → `deploy-production`, deploy chỉ chạy trên `main`.

`evidence-watch.yml` là workflow riêng của Evidence Watch. Hiện tại file mới là placeholder manual-only; target của Phase 9 là workflow scheduled + manual dispatch chạy deterministic source monitoring theo `EVIDENCE_UPDATE_ENGINE.md`:

- fetch/fingerprint/diff/classification/impact analysis deterministic, không phụ thuộc AI;
- watcher operational state bền trên branch `evidence-watch/state`, có manual dispatch mode `bootstrap`, `rebaseline`, `reconcile` và `retry-ai` tường minh — scheduled run không bao giờ tự lập hay thay baseline, không tự retry AI cho một digest không đổi, và reconcile các merged review tồn đọng trước khi classify;
- mỗi source chưa resolve ứng với đúng một branch `evidence-watch/review/<sourceId>` và một Draft Pull Request, idempotent, mang deterministic review payload kèm AI Review Summary hoặc trạng thái unavailable/failed rõ ràng, revision upstream tiếp theo cập nhật chính PR đó;
- ba required check chặn merge một Evidence Watch review PR — deterministic review-integrity, source freshness trên toàn bộ source observation và chỉ báo PASS sau khi acceptance đã ghi bền, và review-resolution chặn merge khi evidence event còn chưa resolve — còn post-merge reconciliation idempotent chỉ advance baseline theo đúng PR head đã verify;
- operational failure (fetch, parser, authentication, adapter) có thể fail workflow và optionally mở/cập nhật GitHub Issue;
- GitHub Issue **chỉ** dành cho operational failure — không bao giờ thay thế Draft PR review, và không tạo cho `UNCHANGED` hay deterministic metadata-only;
- workflow không viết canonical medical prose, không ghi canonical authored file (kể cả `SourceRecord` metadata) vào `main` ngoài reviewed path, và không bypass release review path.

Chỉ merge đã review vào `main` mới đi vào `pipeline.yml`. Evidence Watch identity không được push semantic evidence change vào `main` hay bypass required review/check; Phase 9 cấu hình ruleset/branch protection để enforce điều này.

## 10. Definition of done

Repo baseline đạt khi mỗi loại artifact có owner rõ, medical prose không nằm trong UI/logic, source/claim refs validate được, cache external source không lọt vào Git, generated files rebuild được, dependency không vòng và public build không lộ child data/internal evidence cache.

## SQLite derived index — v0.6.0

`packages/knowledge/generated/knowledge.sqlite` nên được triển khai ở Phase 2 sau khi schema ổn định. Nó dùng cho validation/query/reverse dependency/Evidence Watch/build-time bundle và phải xóa/build lại được 100% từ `packages/knowledge/src/**`. Không edit knowledge canonical trực tiếp trong SQLite. `packages/knowledge/generated/` mặc định nên gitignore và build ở local/CI; có thể cache/publish như CI artifact nhưng không review như authored content.

## Third-party / purchased themes — v0.6.0

`packages/themes` chứa Theme Contract + adapters + first-party themes. Theme React mua ngoài phải đi qua adapter; app/domain component không import vendor trực tiếp. Commercial source/assets đặt ở `vendor-themes/` hoặc private package/submodule phù hợp license; public repo chỉ giữ code/metadata được phép redistribution. Chi tiết: `THEME_SYSTEM.md`.


## Repository/storage health — v0.7.0

Git là audit trail cho **authored knowledge/provenance/code/docs**, không phải object storage.

**Được lưu normal Git:** YAML/Markdown/JSON canonical, translation, source metadata/locator/fingerprint/review record, schema/code/test/docs, first-party theme và adapter được phép theo license.

**Mặc định không lưu normal Git:** `knowledge.sqlite`, generated index/bundle/build output, `evidence/cache/**`, full HTML/PDF/source snapshot tải để diff, parser scratch, bulk audio/video/image, dependency/vendor cache.

Fixture binary nhỏ có thể giữ nếu thực sự cần cho development/test và pass budget. Media library lớn phải dùng object storage/CDN. Git LFS chỉ là exception cho binary có lý do rõ ràng, không dùng cho canonical YAML/Markdown/JSON.

Budget và CI gate chi tiết: `REPOSITORY_HEALTH.md`.

## Bổ sung v0.8.0 — license boundaries

Root repo cần có:

```text
LICENSE.md
LICENSES/AGPL-3.0-only.txt
LICENSES/CC-BY-NC-SA-4.0.txt
THIRD_PARTY_NOTICES.md
CONTRIBUTING.md
docs/LICENSING_POLICY.md
```

Mapping mặc định: software gốc → `AGPL-3.0-only`; original knowledge/docs → `CC-BY-NC-SA-4.0`; source body authoritative → quyền upstream; vendor theme/media/font/icon → license riêng; brand/trademark → reserved. Di chuyển file sang folder khác không làm biến mất restriction/license gốc.
