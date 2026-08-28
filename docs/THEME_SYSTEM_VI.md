# THEME_SYSTEM — HowToBaby — Bản tiếng Việt

> Bản English là canonical. Doc này sở hữu contract kỹ thuật để HowToBaby dùng được cả theme tự thiết kế và theme React mua/third-party mà không làm product logic lệ thuộc vendor.

## Mục tiêu

HowToBaby phải có thể:

- dùng **Baby Modern Glass** làm first-party baseline;
- thêm/đổi theme mà không rewrite Feeding/Sleep/Development/Safety/Tools;
- tận dụng theme/template React mua ngoài nếu chất lượng tốt;
- vẫn giữ evidence, safety, accessibility và domain logic độc lập với theme.

Theme mua ngoài là **presentation source**, không phải product architecture.

## Invariant

```text
Domain/Product
   ↓
HowToBaby UI primitives + semantic slots
   ↓
Theme Contract
   ↓
first-party theme OR third-party adapter
```

Domain component không được import trực tiếp vendor component/theme API.

## 3 mức tích hợp

### A — Token pack

Ưu tiên nhất. Theme chỉ map màu, typography, radius, shadow, motion, decorative assets vào semantic tokens. Component không đổi.

### B — Primitive adapter

Theme có thể thay implementation của các primitive như `Button`, `Card`, `Tabs`, `Drawer`, `Input`, `Navigation` nhưng phải wrap sau `@howtobaby/ui`.

Các component có nghĩa nghiệp vụ như `FeedingCard`, `SafetyCallout`, `EvidenceDrawer`, `ToolShell` vẫn do HowToBaby sở hữu.

### C — Shell/template adapter

Với template React mua ngoài có layout mạnh, cho phép adapt `AppFrame`, `HeaderFrame`, `PrimaryNavFrame`, `PageFrame`, `FooterFrame`.

Vendor không được sở hữu route semantics, age/stage logic, claim selection, evidence, safety hoặc canonical content.

## Theme Manifest

Mỗi theme phải khai báo:

- `id`, label;
- first-party/third-party;
- integration level;
- Light/Dark modes;
- adapter;
- capability matrix;
- license reference;
- assets.

Theme chỉ được bật production khi đủ required token/primitive/capability.

## Semantic tokens

Vendor color names phải map về semantics HowToBaby như:

```text
canvas
surface.*
text.*
border.*
focus.ring
status.info/caution/clinician/urgent/emergency
accent.feeding/play/sleep/safety/tools
```

Không cho domain component dùng raw palette/vendor token.

## Repo

```text
packages/themes/
  src/contract/
  src/registry/
  src/adapters/
  src/baby-modern-glass/

vendor-themes/
  README.md
  <licensed-theme>/   # private/gitignored nếu license không cho public
```

## Quy trình tích hợp theme mua ngoài

1. Ghi vendor/version/source.
2. Đọc license/redistribution rights.
3. Chọn level A/B/C.
4. Map tokens.
5. Wrap primitives/shell cần thiết.
6. Không sửa domain component nếu không cần.
7. Validate capabilities.
8. QA contrast/focus/accessibility.
9. QA evidence/safety states.
10. QA EN/VI desktop/mobile/print.

Không copy nguyên một purchased app template vào `apps/web` rồi nhét HowToBaby logic vào đó.

## License

Mua theme không đồng nghĩa được public source code. Nếu license hạn chế redistribution:

- actual code/assets để ở `vendor-themes/`, private registry/submodule/repo hoặc artifact channel phù hợp;
- public repo chỉ giữ adapter + metadata được phép;
- giữ Baby Modern Glass baseline để build/test vẫn hoạt động khi proprietary theme không có.

## Capability gates

Theme production phải pass:

- token/primitive completeness;
- keyboard/focus/contrast;
- reduced motion/transparency;
- evidence + safety readability;
- mobile navigation;
- Tools/audio states;
- EN/VI text expansion;
- print fallback.

## Runtime

`themeId + colorMode` chỉ là presentation preference. Đổi theme không được làm thay đổi claim, content version, age resolution, safety, provenance hay Tool semantics.

## Performance

Không ship tất cả theme cho mọi user. Theme không mặc định phải được lazy-load/code-split; vendor theme không được mang analytics/tracking script vào sản phẩm chỉ vì template có sẵn.

## Definition of done

Theme mới chỉ done khi manifest/license có đủ, vendor code không leak vào domain, QA đầy đủ, proprietary source lưu đúng license, và quay về Baby Modern Glass không cần migrate content/business logic.


## Repository health — v0.7.0

Theme package/assets lớn hoặc bị hạn chế redistribution không được đẩy vào normal public Git chỉ vì tiện. Dùng private package/repository/artifact/object storage phù hợp license và `REPOSITORY_HEALTH.md`; Baby Modern Glass first-party vẫn phải đủ để build/test repo độc lập.
