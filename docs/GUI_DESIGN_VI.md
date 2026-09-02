# GUI_DESIGN — Bản tiếng Việt

> Bản English là canonical. Theme ban đầu là **Baby Modern Glass**; GUI giữ contract trải nghiệm, còn tích hợp kỹ thuật theme tự xây/theme React mua ngoài thuộc `THEME_SYSTEM.md`.

## UX direction

Calm, modern, warm, trustworthy; dễ scan trên mobile; professional hơn parenting blog nhưng không quá clinical.

## Navigation

**Now · Feeding · Play & Development · Sleep · Safety · Tools**.

Label điều hướng giữ ngắn gọn: **Play & Development** hiển thị là **Play** (VI: **Chơi**) CHỈ trong top/bottom navigation. Ở mọi nơi destination xuất hiện như nội dung — page title, destination card trên Now/Home, display name — dùng tên miền đầy đủ (**Play & Development** / **Chơi & Phát triển**). Hai loại này là hai key dictionary tách biệt theo contract (`nav.<domain>.label` vs `domain.<domain>.title`); không bao giờ tái sử dụng navigation label làm display title của domain. Tất cả resolve từ app message dictionary theo ngôn ngữ đang active, không dùng config điều hướng riêng theo locale.

Sources/Methodology/Editorial/Disclaimer/Changelog là trust destinations global.

## Ngôn ngữ — v0.8.0

Một global language preference điều khiển toàn bộ site chrome/page copy. Control ở header là công tắc global duy nhất: một trigger gọn (icon globe phía trên, mã locale đang active phía dưới) mở popover accessible liệt kê mọi locale từ supported-locale registry (`@howtobaby/i18n`) — không hard-code cặp locale nào, thêm locale mới là menu tự có thêm; ngôn ngữ active được đánh dấu bằng selection state + check, không chỉ bằng màu; đặt sau theme control, ngoài cùng bên phải; `<html lang>` luôn theo global language.

Mọi trang user-facing đang ship đều theo global language — bao gồm cả các trang trust/legal (`/sources`, `/methodology`, `/editorial-policy`, `/disclaimer`, `/privacy`, `/license`, `/changelog`), evidence detail và not-found/error UI; không còn ngoại lệ trang English-only. Không dịch: tiêu đề gốc chính xác của source, tên tổ chức/tên riêng, URL, license identifier như `AGPL-3.0-only`/`CC BY-NC-SA 4.0`, và canonical identifier/ID — nhãn và ngữ cảnh xung quanh vẫn theo locale. Trình bày dữ liệu evidence đi qua presenter/view-model generic theo registry cho mọi locale — không trang nào hard-code trình bày tiếng Anh. Document metadata (`<title>`) giữ canonical prerender locale. Public route không có tiền tố locale: Phase 3 đã ship các age route (`/play|/feeding|/sleep/<stage slug>`) dưới dạng đường dẫn tĩnh trung lập về locale; locale-prefixed routing là ứng viên cho phase public discoverability (Phase 10), không phải deliverable của Phase 3.

Guidance card mặc định theo global language. Khi global language khác canonical locale, card có thêm một LOCAL control nhẹ — MỘT nút toggle nhị phân duy nhất dạng slider pill gọn: cao tổng 40px (`layout.touchTarget − 4px`, đã gồm padding 3px + border 1px), tức thấp hơn 6px so với theme-mode segmented control 46px, thumb hơi trong suốt để phần selected không trọi khỏi nền card (cả light lẫn dark) — track mặc bản kính siêu nhẹ của các control trên header (một lớp film glass thoáng, ring hairline làm dịu, inset highlight rất mảnh — toggle nằm TRÊN card nên không được mang nền đục hay viền đậm làm nó trọi khỏi nền của chính nó), ở card lẫn Evidence Drawer. Vị trí: desktop/wide đặt trong flow NGAY DƯỚI title của card; mobile (bề rộng có tab bar) ghim vào GÓC TRÊN BÊN PHẢI của card cạnh eyebrow; trong Evidence Drawer đặt ở vùng header: CẢ HAI tên bản địa đầy đủ luôn hiển thị (`Tiếng Việt`, `English`, sau này ví dụ `Español` — không dùng mã `EN`/`VI`, mỗi tên mang `lang` đúng), với một thumb nổi persistent đậu trên ngôn ngữ ĐANG HIỂN THỊ. Dù nhìn như slider, đây vẫn là MỘT nút: chạm/click bất kỳ đâu là đổi state giữa `locale đang active ↔ canonical` và thumb trượt sang (motion token; reduced motion → tức thời). Card và Evidence Drawer render CÙNG control này trên MỘT state chung: đổi ở card thì drawer đổi theo và ngược lại. Local switch không đổi global preference; đổi global language reset/sync mọi local override; ẩn hoàn toàn khi global là canonical; content khác `<html lang>` phải mang `lang` chính xác. Bản đầy đủ: `GUI_DESIGN.md` §6, §11.9.

### Văn phong tiếng Việt

Toàn bộ nội dung tiếng Việt hiển thị cho người dùng phải tuân theo `GUIDANCE_CONTENT_CONTRACT.md` §10: đúng nghĩa thôi chưa đủ, câu chữ còn phải tự nhiên, rõ ràng và chuyên nghiệp như nội dung được biên soạn trực tiếp bằng tiếng Việt. Không dịch theo thứ tự từ/cấu trúc câu tiếng Anh và không ép một thuật ngữ tiếng Anh thành cùng một từ tiếng Việt trong mọi ngữ cảnh. Có thể đổi trật tự, tách hoặc gộp câu để tiếng Việt tự nhiên hơn, miễn giữ nguyên mốc tuổi, số liệu, mức độ chắc chắn, phủ định, cảnh báo, chống chỉ định và điều kiện áp dụng/dừng.

Trong UI dành cho phụ huynh, evidence/provenance dùng cách gọi thiên về **tài liệu** thay vì một chữ **nguồn** đứng riêng. Đây là quy ước presentation, không đổi model kỹ thuật. Thuật ngữ chuẩn:

- Sources → **Tài liệu tham khảo**; Original source → **Tài liệu gốc**
- Relationship: **Tài liệu chính**, **Tài liệu hỗ trợ trực tiếp**, **Tài liệu đối chiếu**, **Tài liệu bổ trợ**, **Tài liệu có khuyến nghị khác**
- Source status → **Trạng thái tài liệu**; Current source version → **Phiên bản tài liệu hiện tại**
- Source temporarily unavailable → **Tài liệu hiện tạm thời không truy cập được**
- Why this source is used → **Vì sao HowToBaby sử dụng tài liệu này**; View original source → **Xem tài liệu gốc**

Không đổi `SourceChip`, `SourceRecord`, `SourceLocator`, source IDs, route `/sources`, exact upstream title, URL hoặc identifier kỹ thuật; không replace chữ **nguồn** trong technical prose khi nó mang nghĩa `source of truth` (**nguồn chuẩn**) hay `data source` (**nguồn dữ liệu**).

## Theme engine

Tách:

```text
Theme family = baby-modern-glass
Mode = light | dark
```

Token layer:

```text
Foundation → Semantic → Component → Theme values
```

Component chỉ dùng semantic/component token, không raw hex.

CSS var gợi ý: `--htb-color-canvas`, `--htb-color-surface-glass`, `--htb-color-text-primary`, accent per domain, radius/shadow/glass blur.

## Baby Modern Glass

Light: sáng nhưng không nhạt/chìm; card đủ opacity/border, text strong. Domain accent ở light mode phải tươi và phân biệt được ngay khi nhìn lướt — Feeding cam san hô/đào, Play xanh bạc hà, Sleep tím oải hương/periwinkle, Safety hồng, Tools xanh cyan/trời, Brand xanh dương sạch — cùng sáu họ màu như dark mode nhưng dẫn xuất riêng cho nền sáng, không copy giá trị dark. Vì `accent.*` cũng là chữ (eyebrow, nav highlight) nên giữ ở tông đậm bão hòa nhất còn qua gate 4.5:1 trên canvas, card và tint của chính nó; độ sáng/độ tươi nằm ở `.soft`/`.glass` pastel và `.glass.border` rực hơn — không cần tách token decorative riêng.

Dark: deep cool/tinted canvas, vẫn baby-modern chứ không generic black SaaS.

Glass blur chỉ enhancement; nếu unsupported/reduced transparency thì dùng surface opaque hơn nhưng hierarchy giữ nguyên.

## Future themes

Có thể thêm `minimal-clean`, `high-contrast`, `paper-soft` chủ yếu bằng token/config chứ không fork component.

## Now

Child/context summary → What matters now → Feed/Play/Sleep/Safety focus cards → example timeline → relevant tools → sources/freshness.

## Tools hub

Group theo purpose: Soothe & Sound, Plan & Routine, Calculate, Track, Print & Share. Tool card phải cho biết utility hay guidance-linked nếu cần.

## Audio UX

Không autoplay; có Play/Pause/Stop/volume/timer/fade; có thể persistent mini-player sau khi user chủ động play. 432 Hz chỉ là preset/audio preference, không therapeutic claim.

## Evidence/Safety UI

Hiển thị rõ Official/Evidence synthesis/Typical/Example/Practical/Product heuristic. Safety severity dùng icon/text/structure chứ không chỉ màu; urgent/emergency không giấu trong drawer.

## Print

Letter/A4; print profile riêng, không cố in nguyên glass UI; bỏ controls, giữ hierarchy, tránh gradient bị cắt, source phù hợp bản in.

## Motion

Control có state trượt thay vì đổi tức thời, trong một hệ motion điềm tĩnh: segmented control (theme mode) dùng MỘT selection pill chung trượt giữa các option; bottom/desktop navigation dùng MỘT active indicator chung (tint pill + underline nhỏ) trượt sang item mới; local guidance-language toggle có slide nhẹ khi đổi nhãn; global language popover mở bằng slide-down + fade ngắn, đóng bằng transition ngược, absolutely positioned nên không layout jump.

Indicator là PERSISTENT theo contract: có mặt từ prerendered HTML (tab bar định vị thuần CSS theo active index — không đo đạc, không phụ thuộc hydration), chỉ được reposition — không bao giờ unmount/remount khi đổi route; route ngoài navigation thì fade out tại chỗ, giữ vị trí + accent cuối để khi quay lại trượt tiếp từ đó. Underline không được mount rồi biến mất; icon/label không được nhấp nháy khi đổi route. Reposition vì lý do không phải đổi selection (hydration hand-over, resize, font load) áp dụng KHÔNG animation. Ưu tiên transform/opacity, tránh property gây layout jank.

Toàn bộ dùng semantic motion duration/easing token (~120–200 ms, không bounce); keyboard/focus không phụ thuộc animation; `prefers-reduced-motion: reduce` và reduced-motion preference của project đưa token về 0 ms — mọi transition thành gần tức thời. Chi tiết: `GUI_DESIGN.md` §6 Motion.

## Accessibility

Keyboard, focus, contrast, reduced motion/transparency, no color-only semantics, audio controls có accessible labels.


## Evidence/provenance UI v0.6.0

Citation nên có ba lớp:

1. **SourceChip** ngay card/claim: `Official guidance · CDC · WHO`.
2. **EvidenceDrawer** khi click: exact source title, relationship badge, rồi metadata theo đúng thứ tự cố định: (1) `Phần liên quan` — section/page locator; (2) `Phạm vi áp dụng`; (3) metadata phát hành/phiên bản nguồn theo ma trận điều kiện (EVIDENCE_PROVENANCE.md §14): chỉ `publishedAt` → `Ngày xuất bản: …`; chỉ `updatedAt` → `Phiên bản tài liệu hiện tại: 14/04/2026`; có cả hai và bằng nhau → chỉ `Ngày xuất bản: …` (không lặp cùng ngày thành `Ngày cập nhật`); có cả hai và `updatedAt` muộn hơn → `Ngày xuất bản: 10/01/2025` + `Ngày cập nhật: 14/04/2026`; không có cả hai → bỏ hẳn, không suy đoán ngày; (4) `HowToBaby kiểm chứng lần cuối: 31/08/2026` — ngày review workflow của HowToBaby thực sự xác nhận nguồn, không phải crawl hay deploy time; (5) `Vì sao HowToBaby sử dụng tài liệu này`; (6) `Xem tài liệu gốc`. Badge trạng thái CHỈ render khi cần chú ý (`changed-review-required`, `superseded`, `retired`, `temporarily-unreachable`); source `current` lành mạnh không có status UI. Interpretation/conflict note đi sau khi cần. References (`Tài liệu tham khảo trên trang này`) nối cùng các hàng đó trên một dòng (`Ngày xuất bản: … · Ngày cập nhật: … · HowToBaby kiểm chứng lần cuối: …`), không thêm hàng để list không nặng.
3. **Sources used on this page** cuối page, auto-generate và dedupe từ các claim đang render.

Hỗ trợ `/evidence/<slug>` để xem claim + source + history và `/sources` để browse registry. Đây là read model từ canonical data, không author content lần hai.

External evidence link phải rõ là source gốc, không affiliate tracking. Nếu source vừa thay đổi có thể hiện `Reviewing an update`; không biến trạng thái này thành alert nguy hiểm nếu nội dung không phải emergency. Status trên `/sources` dùng cùng tone mapping với Evidence Drawer: source `current` lành mạnh KHÔNG có badge/chip trạng thái — `current` là lifecycle state của máy, thông tin tin cậy public là các ngày có nhãn theo đúng thứ tự: ngày của chính authority theo hợp đồng ngày nguồn (chỉ `Ngày xuất bản` — kể cả khi `updatedAt` bằng `publishedAt`, `Phiên bản tài liệu hiện tại` khi chỉ có `updatedAt`, `Ngày xuất bản` + `Ngày cập nhật` chỉ khi cập nhật muộn hơn, bỏ hẳn khi không có — không bịa, không gọi mọi ngày là "Ngày xuất bản") rồi `HowToBaby kiểm chứng lần cuối: 31/08/2026` (việc kiểm chứng của HowToBaby — một sự kiện khác); status UI chỉ render khi cần chú ý (`changed-review-required`, `superseded`, `retired`, `temporarily-unreachable`); `changed-review-required` = caution nhẹ (`Đang rà soát bản cập nhật`); superseded/retired/unreachable theo cùng cách xử lý non-current và luôn hiển thị. Một bộ STATUS_LABELS duy nhất (chỉ các trạng thái non-current) cấp chữ cho mọi surface (registry /sources, drawer badge, evidence detail, References) nên wording không thể lệch nhau.

Layout: mọi page (domain lẫn trust/legal) dùng CHUNG một page-shell/container contract — cùng max-width, cùng horizontal padding theo breakpoint, cùng vertical rhythm; hàng toolbar của page-shell giữ chiều cao cố định dù có hay không có print action nên title mọi trang bắt đầu ở cùng một y. SourceChip là pill hairline lặng: nền trong suốt, viền subtle, hover = tint nhẹ + viền đậm hơn; cảm giác khắc chìm nằm ở CHỮ (text-shadow hairline bằng glass highlight — cả light lẫn dark), không phải well/border khắc chìm. Selected item trên navigation (tab bar + desktop row) mặc pill kính "bắt sáng": film trong mờ với rim đôi hairline từ cặp token `surface.glass.glow` (vòng trong 1px) + `surface.glass.seam` (đường viền ngoài 1px), độ sáng ĐẢO giữa hai mode — light: vòng trong glare (bằng glass highlight), seam ngoài tối hơn; dark: seam ngoài là đường sáng mảnh còn vòng trong lùi tối (kiếng bắt sáng từ ngoài). Cả hai luôn 1px — mỏng nhẹ, không bao giờ thành viền sáng dày — kèm một đường seam ngoài rất nhạt để rim sáng vẫn đọc được trên nền sáng, và underline accent. Panel dark mode giữ viền kính mảnh (glass border + inset highlight tinh) để không bị bệt.

Print cũng lấy References từ cùng provenance graph và nên mang content version/verification context.

## Theme mua/third-party — v0.6.0

HowToBaby cho phép dùng theme React mua ngoài nếu chất lượng tốt, nhưng UI/domain component chỉ dùng Theme Contract và HowToBaby primitives. Vendor theme có thể cung cấp token, primitive implementation hoặc shell/layout adapter; không được thay đổi route semantics, age logic, evidence/safety hay canonical content. License/redistribution phải được kiểm tra trước khi commit code/assets. Chi tiết: `THEME_SYSTEM.md`.


## Bổ sung v0.8.0 — legal/source footer

Production UI phải có global footer/surface truy cập được tới Sources/Methodology, Medical Disclaimer, Privacy, License, Source Code khi cần theo AGPL, và Changelog/Corrections. Vendor theme không được làm mất các link pháp lý/trust bắt buộc này. Chi tiết license: `LICENSING_POLICY.md`.
