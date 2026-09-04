# REPOSITORY_HEALTH — HowToBaby — Bản tiếng Việt

> Contract về sức khỏe/dung lượng Git repo, large-file policy, generated/cache/media exclusions, CI guard và điều kiện tách repo trong tương lai. Bản English là canonical cho implementation.

## 1. Mục tiêu

HowToBaby giữ knowledge canonical trong Git vì diff/PR/history/rollback rất phù hợp với evidence review. Nhưng GitHub không phải object storage unlimited. Repo phải giữ nhỏ, dễ clone, dễ review và không bị binary/cache/media làm phình lịch sử.

## 2. Guardrail GitHub hiện tại

Tại baseline v0.7.0, GitHub cảnh báo regular Git file trên 50 MiB, chặn trên 100 MiB, khuyến nghị repo lý tưởng dưới 1 GB và mạnh mẽ khuyến nghị dưới 5 GB. Các số này phải được verify lại định kỳ; HowToBaby dùng giới hạn nội bộ thấp hơn.

## 3. Được lưu normal Git

- YAML/Markdown/JSON knowledge canonical;
- EN canonical + VI translation;
- source/provenance/locator/fingerprint/review metadata nhỏ gọn;
- schema/code/test/CI/docs;
- tool/media metadata;
- first-party theme và vendor adapter được phép, kích thước hợp lý.

Số lượng file text nhiều **không** phải lý do để thêm backend/database canonical.

## 4. Mặc định không lưu normal Git

- `knowledge.sqlite` / generated DB;
- generated index/bundle/build output có thể rebuild;
- `evidence/cache/**` và full HTML/PDF/source body tải để diff;
- parser scratch/screenshot monitor;
- bulk audio/video/image;
- large vendor-theme archive/package;
- dependency cache, secret, production/user data.

## 5. Budget nội bộ

| Metric | Policy |
|---|---|
| Canonical knowledge tree | Target `<250 MiB` trước khi architecture review |
| Authored working tree | Warn gần `500 MiB` |
| Git object/repository | Review khi gần `1 GiB` |
| New normal Git blob | Warn `10 MiB`; block `>25 MiB` nếu không allowlist |
| `knowledge.sqlite` committed | `0 MiB` |
| Evidence fetched body/cache committed | `0 MiB` mặc định |
| Bulk media | chuyển object storage/CDN khi vượt mức fixture nhỏ |

Exception phải có lý do + allowlist rõ ràng; không tăng threshold chỉ để CI xanh.

## 6. CI guard

CI phải kiểm tra largest new blob, deny-pattern file, Git object/repo size, thư mục authored tăng bất thường, SQLite/generated DB, evidence cache/source body và oversized media/theme binary. Nên có `scripts/check-repo-health.ts`; dùng thêm `git-sizer`/`git count-objects -vH` khi phù hợp.

## 7. Media

Fixture nhỏ có thể commit nếu cần cho dev/test, license cho phép và nằm xa giới hạn. Media production lớn dùng object storage/CDN; Git chỉ giữ asset ID, metadata, license/attribution, hash/version và delivery URL/key. Git LFS không phải mặc định cho knowledge hay media.

## 8. SQLite

`knowledge.sqlite` là derived read model, luôn xóa/rebuild được 100% từ YAML/Git + code/schema. Local/CI có thể cache/publish SQLite như CI artifact, nhưng không review/commit nó như content.

## 9. Evidence source

Watcher có thể tải full document tạm thời. Persistent proof là URL + locator + fingerprint + availability/locator state + timestamp + parser version + review/change history; không phải bản copy vĩnh viễn của mọi CDC/AAP/WHO/FDA document.

Tính đúng đắn của Evidence Watch không được phụ thuộc việc giữ lại đó. Review payload tự nêu diff basis của nó — `before-after`, `structural-hash-only` hoặc `current-source-vs-canonical` — nên một review đã mất hợp lệ văn bản nguồn cũ sẽ báo đúng những hash/section/locator deterministic nào đã đổi, hoặc đối chiếu source hiện tại với canonical claim hiện tại, thay vì bịa lại wording cũ.

### Watcher operational state không bao giờ nằm trên `main`

Evidence Watch persist state gọn đó — gồm cả các bản `SourceObservation` gọn nhẹ và bản observation mà một freshness acceptance giữ lại, và không bao giờ có source body đã fetch, AI prompt hay output của AI — trên branch non-canonical `evidence-watch/state`, không bao giờ trên `main`. Phase 9 mở rộng gate repository-health/baseline để state đã có nội dung không lọt vào `main` do sơ suất:

```text
main:
  evidence/state/.gitkeep         → cho phép
  README nhỏ (optional)           → cho phép nếu có tài liệu hóa
  evidence/state/manifest.json    → cấm
  evidence/state/sources/**       → cấm
```

Branch `evidence-watch/state` được miễn trừ có chủ đích khỏi rule này. Check là deliverable và gate của Phase 9, chưa triển khai trước Phase 9.

## 10. Backup

Không coi GitHub là bản copy duy nhất. Nên định kỳ mirror/archive canonical repository + Git history ở nơi khác. Generated DB/cache không cần backup nếu rebuild được.

## 11. Khi nào tách repo

Không tách chỉ vì YAML nhiều. Chỉ cân nhắc `howtobaby-knowledge` riêng khi size/clone/CI/access-control/release cadence/license thực sự cần. Dù tách, YAML/Git knowledge repo vẫn canonical và app pin theo commit/content version.

## 12. Done

Policy hoàn thành khi SQLite/cache/source bodies bị block/gitignore, CI có repo-health gate, metric size hiện rõ, exception review được, media có đường external storage và canonical knowledge vẫn clone/rebuild/restore độc lập với generated DB.
