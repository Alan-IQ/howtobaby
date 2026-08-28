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
│  ├─ i18n/
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
└─ .github/workflows/
```

## 3. Ownership quan trọng

- `apps/web`: route, layout, browser state; **không** chứa canonical health guidance.
- `packages/core`: date/age/context/resolver thuần; không có medical prose.
- `packages/knowledge`: source → claim → applicability → guidance → translation; đây là source-of-truth nội bộ của HowToBaby.
- `packages/ui`: component trình bày; không quyết định nội dung nào phù hợp y khoa.
- `packages/themes`: semantic tokens/theme family.
- `tools/*`: tính năng tool; guidance-linked tool chỉ tham chiếu claim ID.
- `evidence/*`: fetch/diff/impact/report; không tự sửa JSX hay auto-publish medical guidance.

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

Có thể lưu ETag, Last-Modified, hash, section hash, check time, parser version và change classification. Với source có copyright/restricted, ưu tiên:

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

## 9. Definition of done

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
