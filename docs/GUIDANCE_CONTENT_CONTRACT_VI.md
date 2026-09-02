# GUIDANCE_CONTENT_CONTRACT — Bản tiếng Việt

> Bản tiếng Anh là tài liệu chuẩn (canonical). Bản này dùng để đọc và rà soát thuận tiện hơn; không tự tạo hoặc thay đổi contract độc lập với bản tiếng Anh.

## Mô hình từ bằng chứng đến hướng dẫn

```text
SourceRecord → Claim → Applicability → GuidanceBlock/Action → Translation → Presentation
```

Các lớp hướng dẫn: `official-guidance`, `evidence-synthesis`, `typical-pattern`, `example-plan`, `practical-interpretation`, `product-heuristic`.

Các mức độ chính xác: `source-exact`, `source-approximate`, `source-range`, `product-heuristic`.

Nội dung gắn nhãn `source-approximate` hoặc `source-range` phải giữ nguyên tính xấp xỉ hoặc khoảng giá trị khi hiển thị cho cha mẹ. Việc ứng dụng biết chính xác ngày sinh không cho phép biến “khoảng 6 tháng” thành một ngưỡng ngày tuổi chính xác.

## Tuổi và bối cảnh

Dùng phép tính theo ngày trên lịch, so sánh không phụ thuộc múi giờ và khoảng nửa mở `[min,max)`. Proxy cho tuổi phát triển hiệu chỉnh:

```text
earlyByDays = EDD - DOB
likelyPretermByDueDateProxy = earlyByDays > 21
useCorrectedDevelopmentAge = proxy AND chronologicalAge < 24m
correctedDevelopmentAge = planDate - EDD
```

Đây chỉ là proxy phục vụ triển khai, không phải chẩn đoán sinh non.

## Các giai đoạn Phát triển / Chơi

`0–<2m`, `2–<4m`, `4–<6m`, `6–<9m`, `9–<12m`, `12–<15m`, `15–<18m`, `18–<24m`, `24–<30m`, `30–<36m`, `3–<4y`, `4–<5y`.

Các cột mốc phát triển là thông tin tham khảo, không phải hạn chót hay điểm đạt/trượt. Khi dùng checklist của CDC và tuổi của trẻ nằm giữa hai mốc checklist, chọn checklist dành cho độ tuổi nhỏ hơn theo hướng dẫn của CDC; không tự nội suy thành một ngưỡng mới.

## Các giai đoạn Ăn uống

- `0–<4m`: sữa mẹ/sữa công thức, cho bú theo tín hiệu của bé và an toàn khi bú/bình sữa.
- `4–<6m`: giáo dục về chuẩn bị và dấu hiệu sẵn sàng; **không** tự động cho phép bắt đầu ăn dặm chỉ vì bé đủ 4 tháng.
- khoảng `6–<8m`: thức ăn bổ sung khi bé đã sẵn sàng, thực phẩm giàu sắt, chất gây dị ứng và kết cấu thức ăn an toàn.
- `8–<12m`: tăng dần kết cấu, thức ăn cầm tay, tập dùng cốc và tự ăn.
- `12–<24m`: thức ăn gia đình, nhịp bữa chính/bữa phụ và chuyển đổi sữa phù hợp.
- `2–<3y`: dinh dưỡng trẻ nhỏ, làm quen lặp lại với thực phẩm và tự ăn.
- `3–<5y`: bữa ăn gia đình ở tuổi mẫu giáo và tăng tính tự lập.

Ranh giới giữa các giai đoạn là khoảng phân loại nội bộ của resolver/editorial workflow; chúng không tự trở thành ngưỡng y khoa.

## Các giai đoạn Giấc ngủ

Giữ stage map đã được xác định, nhưng số giấc ngày, khoảng thời gian thức và thời lượng giấc cụ thể chỉ được trình bày theo đúng lớp bằng chứng tương ứng (`typical-pattern`, `example-plan` hoặc `product-heuristic`). Luôn tách rõ sáu lớp:

1. khuyến nghị chính thức về tổng thời lượng ngủ;
2. hướng dẫn ngủ an toàn;
3. xu hướng chuyển số giấc thường gặp;
4. khoảng thời gian thức/lịch mẫu mang tính tham khảo;
5. hướng dẫn hỗ trợ bé đi vào giấc;
6. các phương pháp thay đổi hành vi ngủ.

Với trẻ `<4m`, không mặc định áp dụng một protocol hành vi chính thức. Trẻ `>=4m` cũng không tự động phù hợp với mọi phương pháp.

## Ngủ an toàn

```text
fullInfantSafeSleepScope = birth to <12 months
```

Việc xem một giai đoạn khác, tập ngủ, bé biết lăn hay dùng tuổi hiệu chỉnh không tự động làm nới lỏng các nguyên tắc ngủ an toàn đang áp dụng cho bé thực tế.

## Tách biệt các loại bối cảnh

Bối cảnh của bé thực tế, giai đoạn đang duyệt và ngày kế hoạch xem trước phải là các state riêng. Duyệt nội dung không được thay đổi hồ sơ; xem một giai đoạn lớn hơn không được mở khóa hướng dẫn an toàn không phù hợp với bé nhỏ hơn.

## Now composer

Các sự kiện giấc ngủ có thể tạo khung thời gian cho lịch mẫu, nhưng không được quyết định tần suất bú/ăn mang tính y khoa. Cho bú/ăn theo tín hiệu và các yêu cầu an toàn có quyền ghi đè một timeline chỉ nhằm mục đích trình bày đẹp hoặc đều giờ.

## Hợp đồng dịch thuật

Pipeline vẫn là:

```text
English canonical → kiểm chứng tài liệu → review → dịch tiếng Việt → kiểm tra parity → release
```

Bản tiếng Việt phải giữ nguyên các mốc tuổi, khoảng/xấp xỉ, phủ định, mức độ khẩn cấp, số lượng, chống chỉ định, điều kiện áp dụng và điều kiện dừng.

### Chất lượng câu chữ tiếng Việt

Đúng nghĩa là bắt buộc nhưng chưa đủ. Nội dung dành cho phụ huynh phải đọc tự nhiên, rõ ràng và chuyên nghiệp như được biên soạn trực tiếp bằng tiếng Việt, không mang cấu trúc của một câu tiếng Anh được dịch từng chữ.

- Dịch từ ý nghĩa và ngữ cảnh của bản English canonical, không sửa chắp vá một bản Việt máy móc có sẵn.
- Có thể đổi trật tự, tách hoặc gộp câu để tiếng Việt tự nhiên hơn, miễn không thay đổi ý nghĩa y khoa/biên tập.
- Ưu tiên cách nói quen thuộc với phụ huynh; chỉ dùng thuật ngữ chuyên môn khi thực sự cần cho độ chính xác.
- Không ép mỗi từ tiếng Anh thành một từ tiếng Việt cố định trong mọi ngữ cảnh.
- `readiness` trong nội dung dành cho cha mẹ nên diễn đạt là **dấu hiệu sẵn sàng** hoặc **mức độ sẵn sàng của bé** tùy câu; `developmental readiness` nên diễn đạt tự nhiên như **sẵn sàng về mặt phát triển**, tránh kiểu dịch `sẵn sàng về phát triển`.
- `practical` nên dịch theo ý nghĩa cụ thể như **thiết thực**, **dễ áp dụng** hoặc **áp dụng thực tế**, không mặc định dùng một từ tương ứng duy nhất.
- Không thêm lời trấn an, mức độ chắc chắn, lời khuyên hay sắc thái mà bản tiếng Anh không có.

### Quy ước `source` trong nội dung dành cho phụ huynh

Trong **parent-facing UI/copy**, `source` mặc định dùng **tài liệu**, không dùng một chữ **nguồn** đứng riêng:

- Sources → **Tài liệu tham khảo**
- Original source → **Tài liệu gốc**
- Primary source → **Tài liệu chính**
- Direct support → **Tài liệu hỗ trợ trực tiếp**
- Corroborating source → **Tài liệu đối chiếu**
- Contextual source → **Tài liệu bổ trợ**
- Conflicting source/view → **Tài liệu có khuyến nghị khác**
- Current source version → **Phiên bản tài liệu hiện tại**
- View original source → **Xem tài liệu gốc**
- Why this source is used → **Vì sao HowToBaby sử dụng tài liệu này**

Không search/replace máy móc toàn repository. Các thuật ngữ kỹ thuật và identifier như `SourceRecord`, `SourceLocator`, `sourceId`, `sourceRefs`, `source of truth`, `data source` vẫn giữ đúng nghĩa kỹ thuật; trong technical prose có thể dùng **nguồn dữ liệu**, **nguồn chuẩn** hoặc giữ English khi phù hợp.

Không đổi exact upstream title, tên tổ chức, URL, canonical ID, schema identifier hay route `/sources`.

Mỗi bản dịch cần được review hai lượt:

1. đọc riêng như một đoạn tiếng Việt để kiểm tra độ tự nhiên, rõ nghĩa;
2. đối chiếu English canonical để kiểm tra semantic parity.

Naturalness review và semantic-parity review là hai yêu cầu riêng: một bản dịch chỉ đúng nghĩa nhưng gượng gạo vẫn chưa đạt; một bản dịch trôi chảy nhưng làm mất qualifier, negation, số lượng, mốc tuổi, chống chỉ định, điều kiện áp dụng hoặc điều kiện dừng cũng không đạt.

## Thứ tự ưu tiên và quản trị nguồn

Với người dùng tại Hoa Kỳ, ưu tiên nguồn phù hợp theo thứ tự: cơ quan/chỉ dẫn y tế công cộng chính thức của Hoa Kỳ (CDC/FDA/USDA-HHS/NIH...), chính sách/hướng dẫn chính thức của AAP, hội chuyên môn khác khi cần, WHO cho hướng dẫn toàn cầu/đối chiếu, sau đó mới đến systematic review hoặc bằng chứng peer-reviewed khi hướng dẫn chính thức chưa đủ.

Blog, nội dung marketing của nhà bán lẻ/nhà sản xuất, influencer hay đoạn trích từ kết quả tìm kiếm không được dùng làm nguồn y tế chuẩn. Không tự gộp hướng dẫn của Hoa Kỳ và WHO nếu giữa chúng có khác biệt đáng kể.

Seed registry tối thiểu phải bao phủ các nguồn hiện hành cần thiết cho phạm vi sản phẩm, gồm CDC về phát triển/dinh dưỡng, Dietary Guidelines 2025–2030, FDA về sữa công thức/Cronobacter, AAP về tuổi hiệu chỉnh/ngủ an toàn, WHO về nuôi dưỡng trẻ nhỏ và hướng dẫn dưới 5 tuổi khi được sử dụng, cùng nguồn dị ứng đã được phê duyệt như NIAID về đậu phộng khi phù hợp.

## Độ mới và thay thế nguồn

- Nguồn liên quan an toàn quan trọng: kiểm chứng ít nhất mỗi 6 tháng và trước major release.
- Hướng dẫn sức khỏe khác: kiểm chứng ít nhất hằng năm và trước thay đổi nội dung đáng kể.
- Khi có edition/policy mới, phải rà soát sớm dù chưa đến lịch định kỳ.
- Tự động hóa có thể phát hiện thay đổi nhưng không thay thế việc con người rà soát ý nghĩa.

```text
source superseded → dependent claims review-required → affected pages/tools flag → verify replacement → revise/approve
```

## Trạng thái rà soát phải phản ánh đúng thực tế

Không ghi `clinically-reviewed` nếu chưa thực sự có người đủ chuyên môn thực hiện clinical review. Nội dung diễn đạt lại trung thành từ hướng dẫn chính thức có thể ở trạng thái `source-verified`; nội dung tổng hợp làm thay đổi cách diễn giải/chống chỉ định hoặc dùng wording `urgent`/`emergency` thường cần `clinical-review-required`, trừ khi nó ánh xạ trực tiếp và rõ ràng từ chỉ dẫn chính thức.

## Provenance v0.6.0

Canonical graph được mở rộng thành:

```text
SourceRecord → ClaimSourceRef + SourceLocator → Claim → Applicability → Guidance/Action → Translation → Presentation
```

Một claim sức khỏe/an toàn thuộc `official-guidance` bắt buộc có ít nhất một nguồn `primary` hoặc `direct-support` đã được phê duyệt và phù hợp với phạm vi của claim. `evidence-synthesis` phải khai báo các authority quan trọng được sử dụng; bất đồng giữa các nguồn không được làm mờ bằng cách lấy trung bình hoặc bỏ qua. Chi tiết schema, Evidence Drawer, References cuối trang, link nguồn ban đầu và giới hạn bản quyền thuộc `EVIDENCE_PROVENANCE.md`.

Một thay đổi nội dung chưa được xem là hoàn tất nếu quan hệ/locator của nguồn chưa được cập nhật, link nguồn ban đầu chưa được kiểm tra hoặc UI citation chưa thể được tạo từ canonical provenance.

## Definition of done cho thay đổi nội dung

Cập nhật bản tiếng Anh → kiểm chứng source/scope/status → giữ nguyên qualifier/uncertainty/contraindication → kiểm tra xung đột → cập nhật review metadata → cập nhật bản tiếng Việt theo cả naturalness + semantic parity → chạy validation → kiểm tra public/Now/print/guidance-linked tools → hoàn tất qualified review bắt buộc → ghi changelog nếu recommendation thay đổi.

## Bất biến lưu trữ — v0.6.0

Guidance/provenance chuẩn vẫn nằm trong YAML/structured text được Git theo dõi theo `REPOSITORY_STRUCTURE.md`. SQLite/JSON index chỉ là projection để validate/query/render; phải có thể xóa và dựng lại, và không được trở thành nguồn biên tập độc lập.

## Lưu trữ repository — v0.7.0

Claim/provenance chuẩn vẫn là authored Git text. Generated SQLite/index và toàn bộ nội dung tải về từ nguồn bên thứ ba không phải canonical và phải tuân theo `REPOSITORY_HEALTH.md`.

## Ranh giới cấp phép — v0.8.0

Claim do HowToBaby tự biên soạn có thể dùng `CC-BY-NC-SA-4.0`, nhưng provenance phải giữ quyền của nguồn upstream tách biệt. Không sao chép nguyên văn từ nguồn chính thức vào canonical content chỉ để việc trích dẫn trở nên dễ hơn. Xem chi tiết tại `LICENSING_POLICY.md`.
