# PROJECT_PROFILE — HowToBaby — Bản tiếng Việt

> Bản tiếng Việt dùng để đọc/review. **Bản English `PROJECT_PROFILE_v0.7.0.md` là canonical cho implementation.** HowToBaby được định nghĩa là nền tảng **evidence-to-action + parent utilities**, không chỉ là trang kiến thức.

## 1. Sứ mệnh

HowToBaby giúp thu hẹp khoảng cách giữa **hướng dẫn chính thống** và **việc cha mẹ thực sự có thể hiểu/làm ngay hôm nay**.

Giá trị của sản phẩm đến từ việc:

- theo dõi và sắp xếp nguồn uy tín;
- giữ nguyên ý nghĩa, uncertainty, jurisdiction và scope của nguồn;
- chọn nội dung liên quan đến tuổi/context hiện tại;
- chuyển guidance thành hành động dễ dùng;
- hiển thị provenance/freshness;
- cung cấp các công cụ thực hành cho phụ huynh.

Promise:

> **Know what your child needs. Right now.**

HowToBaby không phải hồ sơ y tế, diagnostic engine, developmental screening test, emergency service hay thay thế bác sĩ nhi.

## 2. Ba trụ cột sản phẩm

### 2.1 Guidance

Ban đầu gồm Feeding, Play & Development, Sleep, Safety. Có thể mở rộng Oral Health, preventive care, physical activity, media use... mà không đổi evidence architecture.

### 2.2 Tools

Tools là first-class feature.

Ví dụ:

- lullaby/music player;
- ambient sound/tone generator, có thể có preset 432 Hz;
- routine/timer;
- age calculator;
- printable planner;
- feeding/sleep/activity helpers;
- logs/caregiver workflow trong tương lai.

**Tool không tự trở thành evidence-based chỉ vì nằm trong HowToBaby.**

Ví dụ 432 Hz có thể được cung cấp như một audio preference/relaxation utility, nhưng không được nói rằng 432 Hz giúp bé ngủ tốt hơn, phát triển tốt hơn hay có therapeutic effect nếu chưa có approved source hỗ trợ claim đó.

Chi tiết: `TOOL_PLATFORM.md`.

### 2.3 Evidence operations

Thiết kế một **Evidence Update Engine** nội bộ để:

- monitor approved sources;
- phát hiện thay đổi;
- map source thay đổi tới các claim phụ thuộc;
- invalidate/flag content;
- tạo report/PR;
- chỉ publish sau review gate.

Core change detection phải có thể chạy rule-based, không phụ thuộc AI. AI chỉ là lớp hỗ trợ tùy chọn.

Chi tiết: `EVIDENCE_UPDATE_ENGINE.md`.

## 3. Hai mode sử dụng

### Browse

Không cần profile; browse theo tuổi/topic và dùng các utility tool không cần personalization.

### Personalized Now

DOB dùng để resolve context local. Name optional; EDD optional. Personalization chỉ chọn/sắp xếp approved guidance, không tạo personalized medicine.

Guidance khi phù hợp theo model:

**Know → Do → Why → Watch → Source**.

## 4. Nguyên tắc bắt buộc

1. Evidence trước convenience.
2. External authority mới là authoritative; English chỉ là canonical product interpretation.
3. Không invent precision.
4. Age-aware, không age-deterministic.
5. Mỗi domain có age logic riêng.
6. Personalized context ≠ personalized medicine.
7. Tools mặc định claim-neutral.
8. Safety override optimization/engagement.
9. Không tự average khi nguồn uy tín khác nhau.
10. Trust quan trọng hơn monetization.
11. Local-first/private-by-default.
12. Browse không cần profile.
13. Public/Now/print/tool-linked/future assistant dùng cùng content graph.
14. Component chỉ dùng stable Theme Contract; không hard-code palette/vendor API.
15. **YAML/Git luôn là canonical knowledge source**, kể cả sau này có SQLite/PostgreSQL/CMS/backend.
16. SQLite/JSON/search index/database projection đều là derived store, phải rebuild được từ canonical source.
17. Theme React mua/third-party chỉ tích hợp qua adapter; không được trở thành kiến trúc của domain/product.
18. Automation được detect/draft nhưng review quyết định publish.
19. Tone không phán xét/không gây guilt.
20. Mọi health/safety claim phải truy được tới source/locator gốc.
21. Mặc định interpret + cite + link, không copy nguyên third-party works nếu chưa có quyền.

## 5. Scope v1

Có:

- public browse;
- optional local profile + Now;
- Feeding/Play/Sleep/Safety;
- EN/VI;
- evidence/source/freshness;
- trust pages;
- reusable theme engine + Baby Modern Glass Light/Dark;
- Tools hub/registry;
- có thể ship ít nhất một utility tool trong release đầu, audio là candidate hợp lý;
- static pages + GitHub deployment;
- source monitoring chạy schedule được nhưng không biến public app thành server app.

Không có trong v1:

- diagnosis/symptom checker;
- medication dosing;
- therapeutic diet/allergy treatment;
- complex disease management;
- automated cry/video/audio diagnosis;
- behavioral ads;
- live AI medical advice;
- auto-publish semantic medical change chưa review;
- claim therapeutic cho 432 Hz/lullaby/ambient sound nếu không có evidence.

## 6. Privacy/profile

Browse không cần profile. Personalized mode cần DOB; name/EDD optional. Child data chỉ local trong v1; không đưa exact data vào URL/metadata/analytics/logs.

## 7. Guidance/evidence invariants

Chi tiết nằm trong `GUIDANCE_CONTENT_CONTRACT.md`.

Các invariant chính:

- corrected age tự động chủ yếu dùng Development/Play khi eligible;
- 4 tháng không auto unlock solids;
- newborn sleep default responsive rhythm;
- sleep planner không quyết định medical feeding frequency;
- safe sleep lấy actual-child context;
- claim có provenance/precision/review/applicability;
- evidence grade chỉ lấy từ source nếu source thật sự grade;
- Vietnamese giữ semantic parity.

## 8. Tools contract

Tool class tối thiểu:

```text
utility
guidance-linked
safety-sensitive
```

Audio tool: user chủ động Play, không therapeutic claim, không đánh đồng volume % với dB ở tai bé, safety note phải từ canonical guidance graph.

## 9. Information architecture

Top-level:

1. Now
2. Feeding
3. Play & Development
4. Sleep
5. Safety
6. Tools

Sources/Methodology/Editorial/Disclaimer/Changelog là trust destinations global.

## 10. GUI/theme

Theme đầu tiên: **Baby Modern Glass** với Light/Dark. Đây là theme family, không hard-code style vào component. HowToBaby phải hỗ trợ cả theme tự xây và theme React mua/third-party thông qua **Theme Integration Contract**; domain component không import trực tiếp API/component đặc thù của vendor. Code/assets thương mại phải được cô lập theo license và không được public nếu license cấm redistribution. Print có profile riêng. Chi tiết: `GUI_DESIGN.md` và `THEME_SYSTEM.md`.

## 11. Architecture

Ba plane:

1. Public runtime **static-first nhưng server-capable**; v1 không cần request-time backend.
2. Content/tool build system: YAML/Git canonical → schema/provenance validation → compile `knowledge.sqlite`/indexes/bundles.
3. Evidence operations chạy scheduled.

Plane 3 có thể chạy GitHub Actions/worker và **không** có nghĩa v1 cần request-time backend cho user data. Sau này backend có thể giữ account/sync/history/subscription nhưng **knowledge canonical vẫn phải là YAML/Git**; SQLite/PostgreSQL/CMS chỉ là projection/runtime store nếu dùng. Full static export chỉ là deployment option, không phải ràng buộc kiến trúc vĩnh viễn.

## 12. Evidence Update Engine

Ưu tiên:

```text
official API/syndication
→ RSS/Atom
→ structured index/sitemap
→ deterministic page-section monitor
→ PDF monitor
→ manual-only
```

Flow:

```text
check source
→ detect change
→ map impacted claims
→ review-required
→ update English
→ update VI
→ validate/build
→ deploy
```

AI chỉ optional sau bước deterministic diff.

## 13. Monetization

v1 free. Core evidence/safety/source/escalation/methodology/corrections phải free. Nếu thu phí sau này thì ưu tiên convenience như sync, multi-child, sharing, history, reminders, export.

## 14. AI

Không live AI medical advice trong v1. Sau này AI có thể hỗ trợ source-diff triage, draft, translation hoặc source-grounded Ask HowToBaby; output AI không tự trở thành canonical.

## 15. Documentation ownership

Xem `DOCS_INDEX.md`. Project Profile chỉ giữ product-level contract; detailed stages, GUI token/component, crawler adapters và phase tasks nằm ở specialist docs.


## Bổ sung v0.6.0 — Provenance và repo ownership

- `REPOSITORY_STRUCTURE.md` là canonical contract cho folder/package/dependency/generated/cache boundaries.
- `EVIDENCE_PROVENANCE.md` là canonical contract cho `SourceRecord → ClaimSourceRef/Locator → Claim → UI`, Evidence Drawer, page References, original-source link và audit history.
- `official-guidance` phải có approved primary/direct source.
- Citation ở card, Evidence Drawer, References cuối page, print và guidance-linked Tool phải sinh từ cùng provenance graph; không maintain nhiều list riêng.
- Evidence Watch khi phát hiện source đổi chỉ flag/review, không xóa provenance cũ hoặc tự publish medical wording mới.
- Full HTML/PDF tải để diff nằm temporary cache/gitignored theo mặc định; public repo chỉ giữ metadata/hash/locator cần thiết trừ khi reuse rights cho phép.

## Bổ sung v0.7.0 — repository/storage health

- Git/GitHub chỉ giữ **authored canonical knowledge + provenance + code/docs**, không biến repo thành nơi chứa generated database, crawler cache hay bulk media.
- `knowledge.sqlite`, generated indexes/manifests và các database projection phải gitignore/rebuild được.
- Full HTML/PDF/source snapshot tải về để diff là temporary cache theo mặc định, không commit chỉ để “làm bằng chứng”. Provenance thật nằm ở URL + locator + relationship + fingerprint/review history.
- Audio/video/image lớn phải chuyển sang object storage/CDN khi vượt khỏi vài fixture nhỏ phục vụ development/MVP.
- Git LFS không dùng cho YAML/Markdown/JSON canonical; chỉ cân nhắc cho binary có lý do rõ ràng.
- CI phải kiểm tra repository health và chặn accidental large blob/generated DB/cache/media.
- Nếu repo thật sự lớn trong tương lai có thể tách canonical knowledge sang repo riêng, nhưng **YAML/Git vẫn là source of truth**; không tách sớm nếu chưa có nhu cầu thực tế.
- Chi tiết budget/gate nằm ở `REPOSITORY_HEALTH.md`.

## 16. Decision log v0.6.0

- HowToBaby = Guidance + Tools platform.
- Tools first-class nhưng claim-neutral mặc định.
- Tools là top-level navigation.
- Baby Modern Glass là first-party theme family; theme mua ngoài tích hợp qua vendor-neutral adapter contract.
- Public app static-first nhưng Next.js vẫn server-capable; full static export chỉ là deployment option.
- YAML/Git luôn là canonical knowledge source.
- SQLite triển khai sớm như derived index/read model, không phải authoring store.
- Backend/database tương lai không được thay thế canonical knowledge.
- Commercial theme code/assets phải tách theo license/redistribution rights.
- Evidence watcher có thể chạy scheduled bên ngoài runtime.
- Change detection không cần AI.
- AI optional cho triage/draft.
- Source change không auto-publish semantic medical change.
- 432 Hz/audio được phép tồn tại dưới dạng utility nhưng không therapeutic claim.
- Tách specialist docs để tránh Project Profile phình và lặp.
