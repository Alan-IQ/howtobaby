# LICENSING_POLICY — HowToBaby — Bản tiếng Việt

> Contract canonical về license và ranh giới quyền sử dụng trong repo HowToBaby. Bản English `LICENSING_POLICY.md` là canonical cho implementation; bản này dùng để đọc/review.

## 1. Mục tiêu

License model phải đồng thời đạt được:

- source code công khai và có thể tái sử dụng nhưng hạn chế việc fork rồi chạy dịch vụ đóng mà không chia sẻ cải tiến;
- phụ huynh vẫn dùng HowToBaby miễn phí nhưng người khác không được mặc nhiên bê nguyên knowledge base đi khai thác thương mại;
- chủ sở hữu quyền vẫn có thể kiếm tiền hoặc cấp commercial permission riêng sau này;
- không vô tình cấp lại license cho nội dung CDC/AAP/FDA/WHO hay nguồn third-party;
- theme mua ngoài, audio, font, icon và asset có license riêng được cô lập;
- mỗi loại file/path có license rõ ràng thay vì một license mơ hồ cho toàn repo.

## 2. Multi-license

HowToBaby cố ý dùng **nhiều license**.

### 2.1 Software

Code do HowToBaby tự viết dùng:

```text
AGPL-3.0-only
```

Áp dụng cho app/runtime, packages, Evidence Engine, scripts, validators, adapters, tool runtime, theme adapters và software khác nếu file không ghi license riêng.

Lý do chọn AGPL:

- MIT/Apache quá permissive nếu mục tiêu là tránh closed hosted fork;
- GPL mạnh khi software được distribute nhưng không xử lý network-service gap rõ như AGPL;
- AGPL yêu cầu modified covered software cung cấp source theo điều kiện của license khi dùng để phục vụ user qua network.

AGPL **vẫn cho phép commercial use**; nó không phải noncommercial license.

### 2.2 Knowledge và documentation do HowToBaby tự viết

Canonical knowledge, phần giải thích/editorial, structured claim text, bản dịch gốc EN/VI và project docs dùng:

```text
CC-BY-NC-SA-4.0
```

Người khác có thể reuse/adapt phi thương mại nếu attribution và ShareAlike; commercial reuse cần permission riêng.

Creative Commons dùng cho content/docs, **không dùng làm software license**.

### 2.3 Brand/trademark

Không license nào trong repo tự động cho quyền dùng:

- tên HowToBaby;
- logo;
- product mark;
- domain identity;
- branding dễ gây hiểu nhầm là được HowToBaby endorse/affiliate.

Trademark nằm ngoài AGPL và CC.

## 3. Mapping mặc định theo path

| Path/material | License mặc định |
|---|---|
| `apps/**` | AGPL-3.0-only |
| `packages/core/**` | AGPL-3.0-only |
| `packages/ui/**` | AGPL-3.0-only |
| `packages/tool-platform/**` | AGPL-3.0-only |
| `packages/themes/**` first-party code | AGPL-3.0-only |
| `evidence/**` software | AGPL-3.0-only |
| `scripts/**` | AGPL-3.0-only |
| `tools/**` original software | AGPL-3.0-only |
| `packages/knowledge/**` nội dung do HowToBaby author | CC-BY-NC-SA-4.0 |
| `docs/**` | CC-BY-NC-SA-4.0 |
| original EN/VI editorial translations | CC-BY-NC-SA-4.0 |
| `vendor-themes/**` | license của vendor; có thể private/excluded |
| audio/images/fonts/icons third-party | asset-specific license |
| body của nguồn authoritative | quyền/license nguồn gốc; HowToBaby không relicensing |
| SQLite/build/cache generated | derived, không canonical, mặc định không commit |

## 4. Ranh giới với nguồn chính thức

Provenance không có nghĩa là HowToBaby sở hữu tài liệu gốc.

Workflow mặc định:

```text
đọc/verify nguồn chính thức
        ↓
viết HowToBaby interpretation mới
        ↓
lưu provenance + source locator
        ↓
link user về nguồn gốc
```

Không tự động cho copied source text/PDF/screenshot/syndicated material vào CC-BY-NC-SA-4.0.

Nếu source có license/syndication terms riêng thì terms đó áp dụng cho phần reused material.

## 5. Kiếm tiền sau này

Public license không cấm chủ sở hữu copyright:

- vận hành HowToBaby thương mại;
- thu phí hosting, convenience feature, subscription, support;
- cấp commercial permission riêng cho quyền mình sở hữu;
- dual-license material của chính mình.

Nhưng:

- public license đã cấp không bị thu hồi ngược;
- external contribution có thể tạo thêm copyright holder;
- HowToBaby không thể relicense quyền mà mình không sở hữu hoặc không được cấp phép.

## 6. Contribution rights

### Code

Code contribution được accept mặc định dưới AGPL-3.0-only nếu không có thỏa thuận khác.

Nếu sau này muốn proprietary closed-source license cho codebase có contribution bên ngoài thì có thể cần CLA/separate permission.

### Canonical knowledge/docs

Chưa nên nhận substantial external canonical knowledge/translation contribution cho đến khi chủ động thiết kế contribution-rights/CLA.

Cho tới lúc đó:

- issue, suggestion, source pointer vẫn có thể dùng;
- maintainer có thể tự rewrite ý tưởng đã accept thành project-authored canonical content;
- không merge casual các đoạn canonical text lớn từ người ngoài.

## 7. Theme/vendor

Theme React/template mua ngoài không thành open source chỉ vì adapter của HowToBaby open source.

Phải:

- chỉ lưu vendor source/asset nơi license cho phép;
- private/gitignore khi redistribution bị cấm;
- integrate qua Theme Contract;
- lưu metadata về vendor/license/order/redistribution/deployment;
- không copy vendor source vào public example chỉ để setup dễ hơn.

## 8. Audio/media/font/icon

Production asset cần rights metadata tối thiểu:

```text
assetId
creator/source
license
commercialUseAllowed
redistributionAllowed
attributionRequired
attributionText
sourceUrl/orderReference
```

Asset public/free download không đồng nghĩa được dùng hoặc redistribute tự do.

## 9. Dependency license

Nên thêm automated dependency-license reporting từ giai đoạn setup repo.

CI/release review tối thiểu phải phát hiện dependency/license unknown/custom và các dependency có copyleft/redistribution condition cần xem xét.

## 10. SPDX/legal files

Identifier ưu tiên:

```text
AGPL-3.0-only
CC-BY-NC-SA-4.0
```

Root legal files:

```text
LICENSE.md
LICENSES/AGPL-3.0-only.txt
LICENSES/CC-BY-NC-SA-4.0.txt
THIRD_PARTY_NOTICES.md
CONTRIBUTING.md
```

## 11. Change control

Đổi license hoặc phạm vi license là quyết định product/legal, không phải refactor thường.

AI/contributor không được tự ý:

- đổi AGPL/CC;
- đổi path scope;
- copy third-party material vào path được license;
- thêm vendor/media dependency chưa rõ quyền;
- thay trademark permission.

## 12. Khi nào cần legal review

Trước khi launch thương mại đáng kể, subscription trả phí, mở contribution rộng hoặc filing trademark lớn, nên có qualified legal review về license boundary, contributor rights, theme/media vendor license, reuse nguồn, trademark và Terms/Privacy/medical disclaimer.

Tài liệu này là engineering/product licensing policy, không phải tư vấn pháp lý.
