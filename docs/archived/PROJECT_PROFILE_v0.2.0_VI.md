# PROJECT_PROFILE — Baby Feed · Play · Sleep Guide — Bản tiếng Việt

> Bản tiếng Việt dùng để đọc hiểu và review. **Nội dung y khoa canonical/source-of-truth của sản phẩm vẫn là bản English** `PROJECT_PROFILE_v0.2.0.md`. Tên identifier, field, type và code contract được giữ bằng English để tránh sai lệch khi triển khai.

| Trường | Giá trị |
|---|---|
| Trạng thái tài liệu | Baseline làm việc canonical tương ứng bản English v0.2.0 |
| Phiên bản profile | 0.2.0 |
| Cập nhật lần cuối | 2026-08-26 |
| Tên sản phẩm tạm thời | Baby Feed · Play · Sleep Guide |
| Repository slug tạm thời | `baby-guide` |
| Loại sản phẩm | Web app responsive, local-first, static-first |
| Phạm vi tuổi | Từ sơ sinh đến trước 5 tuổi |
| Khu vực hướng dẫn chính | Hoa Kỳ |
| Đối chiếu toàn cầu | WHO khi phù hợp |
| Ngôn ngữ canonical cho nội dung y khoa | English |
| Ngôn ngữ UI/nội dung | English và Vietnamese |
| Backend cần cho v1 | Không |
| Kiến trúc ưu tiên | Next.js + TypeScript + static export |
| Prototype tham khảo | `Baby-Sleep-Schedule-v33.html`; `ke_hoach_phat_trien_theo_do_tuoi_cho_be_v31_clean_refactor.html` |

---

## 1. Định nghĩa dự án

Baby Feed · Play · Sleep Guide là web app hướng dẫn phụ huynh dựa trên bằng chứng. Phụ huynh nhập tên bé, ngày sinh và ngày dự sinh nếu có. Dữ liệu được lưu cục bộ trong trình duyệt. Ứng dụng tính các loại tuổi phù hợp rồi cung cấp kế hoạch có cấu trúc về:

- **Ăn:** ăn gì, cho ăn như thế nào, dấu hiệu sẵn sàng, tiến triển kết cấu, responsive feeding, an toàn sữa công thức/sữa mẹ, dị nguyên, phòng hóc nghẹn;
- **Chơi & phát triển:** kỹ năng nào đang hình thành, nên chơi gì trong các khoảng thức, cách tăng/giảm độ khó theo khả năng thật của bé;
- **Ngủ:** nhu cầu ngủ theo tuổi, nap, nhịp sinh hoạt, bedtime routine, settling, và các phương pháp behavioral sleep khi phù hợp;
- **An toàn:** safe sleep, feeding/choking safety, môi trường, red flags đã được review;
- **Nguồn:** phân loại nội dung, nguồn hỗ trợ claim, trạng thái review và ngày xác minh.

Sản phẩm là **hướng dẫn thực hành**, không phải hồ sơ y tế, công cụ chẩn đoán, developmental screening test, calorie calculator, dịch vụ cấp cứu hay thay thế bác sĩ nhi khoa.

### 1.1 Cam kết sản phẩm

Ứng dụng phải trả lời rõ 5 câu hỏi:

1. **Ở tuổi hiện tại của bé, điều gì quan trọng nhất?**
2. **Bé có thể ăn gì, cho ăn như thế nào và cần tuân thủ an toàn gì?**
3. **Nên chơi/tập gì lúc này và vì sao?**
4. **Nhịp ngủ nào là hợp lý và có thể cải thiện giấc ngủ an toàn như thế nào?**
5. **Nội dung nào là official guidance, typical pattern hay chỉ là example plan?**

### 1.2 Định vị

Sản phẩm phải đáng tin cậy và có cấu trúc hơn một parenting blog, nhưng dễ dùng hơn tài liệu guideline lâm sàng. Ứng dụng chuyển khuyến nghị chính thức thành hành động thực tế mà không giả định mọi trẻ phải theo một lịch hay trình tự phát triển giống nhau.

---

## 2. Nguyên tắc sản phẩm

### 2.1 Bằng chứng quan trọng hơn sự tiện lợi

Mọi claim về sức khỏe/an toàn phải truy ngược được về nguồn đã phê duyệt. Có thể diễn giải cho dễ hiểu nhưng không được làm mất điều kiện, chống chỉ định, mức độ chắc chắn hay cảnh báo an toàn.

### 2.2 English là source-of-truth của nội dung y khoa

English là canonical. Vietnamese là bản dịch ghép cặp theo cùng stable ID. Không được làm thay đổi ý nghĩa y khoa, mức độ nghiêm trọng, số lượng, tuổi, ngoại lệ hay stop condition.

### 2.3 Local-first và private-by-default

Thông tin bé và preferences chỉ lưu trong browser của thiết bị hiện tại. v1 không có account, cloud profile, advertising tracker hay third-party behavioral analytics.

### 2.4 Age-aware nhưng không age-deterministic

Tuổi chỉ giúp chọn candidate guidance. Tuổi một mình không chứng minh bé đã sẵn sàng ăn, đạt kỹ năng, sẵn sàng sleep training hay phù hợp về mặt y khoa.

### 2.5 Mỗi domain có age logic riêng

Feeding, Play/Development, Sleep và Safety có thể dùng mốc tuổi và cách tính tuổi khác nhau. **Cấm dùng một universal stage map cho tất cả.**

### 2.6 Không biến app thành hệ thống chấm điểm

Không chấm cha mẹ/bé, không completion %, không dùng interaction trong app để kết luận bé “chậm” hay “không đạt”.

### 2.7 Safety luôn ưu tiên

Safe sleep, choking prevention, allergy precautions, formula handling, responsive feeding và red flags luôn được ưu tiên hơn việc làm timeline đẹp hay tối ưu sleep training.

### 2.8 Progressive disclosure

Trang đầu phải dễ quét. Chi tiết, lý do, biến thể, nguồn và safety notes mở rộng khi cần.

### 2.9 Phải phân biệt rõ loại bằng chứng

UI phải cho phụ huynh biết nội dung thuộc loại nào:

- **Official guidance** — được nguồn chính thức hỗ trợ trực tiếp;
- **Typical pattern** — kiểu thường gặp, không phải bắt buộc;
- **Example plan** — ví dụ do sản phẩm dựng;
- **Source-aligned suggestion** — gợi ý thực hành phù hợp nguồn nhưng không phải chỉ thị chính thức.

### 2.10 Một design system duy nhất

Light/Dark/responsive/print dùng cùng geometry và behavior. Theme chỉ thay đổi màu/surface.

### 2.11 Không tự suy luận y khoa

Không tự chẩn đoán allergy, feeding disorder, developmental delay, sleep disorder, prematurity hay contraindication từ ngày tháng/settings.

### 2.12 Safety context thật không đổi khi browse

Khi phụ huynh browse stage khác hoặc preview tương lai, các safety rule áp dụng cho bé **ở thời điểm hiện tại** vẫn giữ nguyên.

---

## 3. Người dùng mục tiêu

### 3.1 Chính

- Phụ huynh/caregiver của trẻ từ sơ sinh đến trước 5 tuổi.
- Gia đình song ngữ Anh–Việt.
- Người muốn kế hoạch thực tế nhưng vẫn biết cơ sở khoa học/an toàn.
- Gia đình có bé sinh trước ngày dự sinh cần chronological và corrected-development-age context.

### 3.2 Phụ

- Ông bà/người chăm sóc dùng bản in.
- Phụ huynh xem trước giai đoạn kế tiếp.
- Người chuẩn bị câu hỏi để trao đổi với bác sĩ nhi.

---

## 4. Phạm vi sản phẩm

### 4.1 Có trong v1

- Một active child profile lưu local.
- Required: tên và ngày sinh.
- Optional: ngày dự sinh.
- Plan-date preview.
- Chronological age và corrected-development-age context.
- Ba engine độc lập: Feeding, Development/Play, Sleep.
- Trang Today hợp nhất.
- Feeding từ milk feeding đến preschool family eating.
- Play/Development đến trước 5 tuổi.
- Sleep planning với wake time, nap pattern, nap duration, wake-window style.
- Newborn responsive-rhythm mode.
- Safe-sleep guidance.
- Settling education và behavioral sleep methods theo điều kiện riêng.
- Formula/breast-milk handling safety.
- EN/VI.
- Light/Dark.
- Responsive + print.
- Evidence label, source và review metadata hiển thị được.
- Static deployment + GitHub-driven release.

### 4.2 Không phải mục tiêu v1

- Chẩn đoán/symptom checker.
- Liều thuốc/supplement.
- Growth percentile interpretation.
- Vaccine schedule.
- Therapeutic diet cá nhân hóa.
- Điều trị food allergy.
- Quản lý failure to thrive, swallowing disorder, chronic disease hay complex prematurity.
- Ép exact calories/ounces cho mọi bé.
- Sleep/feed live logging, streak, gamification, scoring.
- Cry/video/audio analysis.
- Community/social.
- Affiliate/product recommendation.
- Cloud account/sync.
- Multi-child ở release đầu.
- Live AI medical advice.

### 4.3 Có thể mở rộng sau

Multi-child, encrypted sync, PWA/offline pack, caregiver share package, optional logs, clinician-reviewed special packs, thêm locale/jurisdiction và có thể tích hợp recall data chính thức nếu có maintenance plan đáng tin cậy.

---

## 5. Từ vựng canonical

| Thuật ngữ | Ý nghĩa |
|---|---|
| Child profile | Tên, DOB, optional due date lưu local. |
| Actual-child context | Context thật hiện tại của bé, dùng cho safety/current recommendations. |
| Browsed-content context | Stage đang browse thủ công; không thay safety context thật. |
| Plan date | Ngày muốn xem/preview guidance. |
| Chronological age | Tuổi lịch từ DOB đến plan date. |
| Corrected development age | Tuổi phát triển hiệu chỉnh bằng estimated due date khi proxy đủ điều kiện. |
| Likely-preterm due-date proxy | Xấp xỉ kỹ thuật khi sinh >21 ngày trước due date; không phải diagnosis. |
| Development stage | Range dùng cho milestone/play. |
| Feeding stage | Range/context dùng cho feeding guidance. |
| Sleep stage | Range dùng cho sleep-duration context và schedule defaults. |
| Readiness cue | Kỹ năng/biểu hiện cần xem xét trước recommendation. |
| Responsive feeding | Cho ăn dựa hunger/fullness và khả năng phát triển, không ép. |
| Wake window | Khoảng thức do sản phẩm dùng để lập kế hoạch; heuristic. |
| Responsive rhythm | Nhịp sinh hoạt theo cues cho newborn/young infant thay vì clock schedule cố định. |
| Settling education | Routine và cách hỗ trợ đi vào giấc ngủ, chưa phải behavioral intervention formal. |
| Behavioral sleep intervention | Phương pháp có cấu trúc nhằm giảm hỗ trợ khi vào/ngủ lại. |
| Official guidance | Claim được nguồn chính thức hỗ trợ trực tiếp. |
| Typical pattern | Mẫu thường gặp, không phải yêu cầu. |
| Example plan | Ví dụ do app dựng. |
| Red flag | Dấu hiệu đã được source-review cần trao đổi hoặc tìm chăm sóc chuyên môn. |

---

## 6. Child profile và privacy contract

### 6.1 Field

| Field | Type | Rule |
|---|---|---|
| `name` | string | Required, trim, tối đa 40 ký tự, render text-only. |
| `dateOfBirth` | local date | Required, `YYYY-MM-DD`, không được ở tương lai khi save. |
| `estimatedDueDate` | local date/null | Optional, chỉ dùng cho corrected-development context/proxy explanation. |

### 6.2 Preference/UI state

`planDate`, `language`, `theme`, `wakeTimeMinutes`, `napMode`, `napDurations`, `wakeWindowAdjustment`.

### 6.3 Privacy

- Dùng `localStorage` cho v1.
- Không dùng cookie lưu child data.
- Nếu storage fail, app vẫn chạy trong session và cảnh báo không lưu được.
- Có **Clear local data** + confirm.
- Không đưa tên/ngày sinh vào URL, telemetry, share query, server log hay third-party analytics.
- Escape user strings; không raw `innerHTML`.

### 6.4 Storage keys gợi ý

```text
baby-guide.profile.v1
baby-guide.preferences.v1
baby-guide.sleep-settings.v1
baby-guide.content-version.v1
```

---

## 7. Date, age và stage engine

### 7.1 Date model

Ngày là calendar date, không phải timestamp.

Phải:

- parse year/month/day riêng;
- tránh timezone-shift khi dùng bare `YYYY-MM-DD`;
- dùng day serial độc lập timezone;
- tính age theo calendar-month clamping;
- stage range dạng `[min, max)`;
- test leap year, Feb 29, end-of-month, DST, timezone.

### 7.2 Chronological age

```text
chronologicalAge = planDate - dateOfBirth
```

### 7.3 Corrected-development-age proxy

Vì v1 không hỏi gestational age at birth, due date chỉ là proxy:

```text
earlyByDays = estimatedDueDate - dateOfBirth
likelyPretermByDueDateProxy = earlyByDays > 21
useCorrectedDevelopmentAge = likelyPretermByDueDateProxy
  AND chronologicalAge < 24 months

correctedDevelopmentAge = planDate - estimatedDueDate
```

Quy tắc:

- `>21 days` chỉ là proxy xấp xỉ sinh trước 37 completed weeks, **không phải diagnosis of prematurity**.
- Không ghi “bé sinh non” như kết luận y khoa chỉ từ rule này.
- Nếu plan date trước due date, hiển thị `before due date`, không hiển thị tuổi âm.
- Khi dùng corrected age phải show cả chronological age.
- Sau 24 tháng chronological, Development/Play quay về chronological age.

### 7.4 Age basis theo domain

| Domain | Basis chính |
|---|---|
| Development/Milestone | corrected development age khi eligible, nếu không chronological |
| Play | giống Development + observed ability |
| Feeding | chronological + readiness/skill |
| Sleep duration | chronological |
| Safe sleep | actual chronological infant scope + current ability |
| Sleep heuristics | chronological mặc định |
| Behavioral sleep method | chronological + method prerequisites + medical/feeding context |

### 7.5 Tách context

```ts
interface GuidanceContext {
  actualChildContext: ChildAgeContext;
  browsedContentContext?: BrowsedStageContext;
  previewPlanDateContext?: PlanDateContext;
}
```

Invariant:

- Browse không mutate profile.
- Browse stage lớn hơn không unlock safety-sensitive recommendation.
- Future preview không thay current safety scope.
- Current stage và browsed stage phải phân biệt rõ trên UI.

### 7.6 Plan-date preview

- Default hôm nay.
- Có thể xem past/future trong phạm vi hỗ trợ.
- Khi khác hôm nay phải có banner **Previewing guidance for [date]**.
- Chỉ hiện reset-to-today khi cần.

---

## 8. Stage map độc lập theo domain

### 8.1 Development/Play

`0–2m`, `2–4m`, `4–6m`, `6–9m`, `9–12m`, `12–15m`, `15–18m`, `18–24m`, `24–30m`, `30–36m`, `3–4y`, `4–5y`.

### 8.2 Feeding

| Stage | Range | Trọng tâm |
|---|---|---|
| `feed-00-04m` | 0–<4m | Sữa mẹ/formula, responsive feeding, bottle/formula safety, hunger/fullness. |
| `feed-04-06m` | 4–<6m | **Chuẩn bị/readiness education**; sữa vẫn là chính; 4 tháng không tự unlock solids. |
| `feed-06-08m` | khoảng 6–<8m | Complementary foods khi ready, iron-rich foods, allergens, safe textures. |
| `feed-08-12m` | 8–<12m | Texture progression, finger food, cup, self-feeding. |
| `feed-12-24m` | 12–<24m | Family foods, meal/snack rhythm, milk transition, cup/utensils. |
| `feed-24-36m` | 2–<3y | Toddler nutrition, picky eating, repeated exposure. |
| `feed-36-60m` | 3–<5y | Preschool family meals, independence, variety. |

**Invariant:** qua mốc 4 tháng **không** được tự kích hoạt hướng dẫn bắt đầu solids. Complementary foods bắt đầu khoảng 6 tháng khi developmentally ready.

### 8.3 Sleep

| Stage | Mode/default |
|---|---|
| 0–<2m | `responsive-rhythm`, không fixed clock mặc định |
| 2–<3m | responsive/flexible, optional 5-nap example |
| 3–<4m | transitional/flexible 4-nap example |
| 4–<5m | 4-nap example |
| 5–<6m | 3-nap example |
| 6–<7m | 3-nap example |
| 7–<8m | 3→2 transition |
| 8–<10m | 2-nap example |
| 10–<12m | 2-nap example |
| 12–<15m | 2-nap example |
| 15–<18m | 2→1 transition |
| 18–<24m | 1 nap |
| 2–<3y | 1 nap giảm dần |
| 3–<5y | nap optional, có thể quiet time |

Nap count, wake window và exact duration là heuristic. Phải label `Typical pattern` hoặc `Example plan`.

---

## 9. Information architecture

5 destination chính:

1. **Today**
2. **Feeding**
3. **Play & Development**
4. **Sleep**
5. **Safety & Sources**

Header luôn có product title, compact child summary, age context, EN/VI, Light/Dark, Print và Edit profile.

---

## 10. Trang Today

### 10.1 Mục tiêu

Today là practical home screen, hợp nhất output độc lập của ba domain nhưng không giả vờ đang track behavior thật.

### 10.2 Summary

Show chronological age, corrected age khi active, development stage, feeding stage, sleep stage, “what matters now”, và **Why this stage?** khi age logic khác nhau.

Ví dụ:

> Play dùng corrected development age vì due-date proxy cho thấy bé có thể sinh sớm. Feeding dùng chronological age + readiness. Sleep planning dùng chronological age.

### 10.3 Ba focus card

- **Feed today**
- **Play today**
- **Sleep today**

Dùng baby-modern glass style và có evidence label phù hợp.

### 10.4 Composer rule quan trọng

```text
Sleep events có thể làm khung thời gian.
Sleep timeline KHÔNG được quyết định medical feeding frequency.
Responsive feeding override việc spacing timeline cho đẹp.
```

Với newborn mặc định:

```text
Feed → tương tác ngắn khi tỉnh → sleep opportunity → lặp theo cues
```

Không ép thành clock schedule.

### 10.5 Adjustment drawer

Cho chỉnh wake time, nap count, nap duration, wake-window style, play intensity. Các thay đổi chỉ tác động example plan và persist local.

---

## 11. Feeding domain contract

### 11.1 Mỗi stage bắt buộc có

1. At a glance
2. Primary nutrition source
3. What to offer
4. How to offer it
5. Frequency/amount context
6. Texture/skill progression
7. Hunger/fullness cues
8. Iron/nutrient priorities
9. Allergen context
10. Choking prevention
11. Drinks
12. Foods/drinks to avoid/limit
13. Formula/breast-milk handling
14. Practical examples
15. When to ask clinician
16. Sources/review metadata

### 11.2 Complementary-food readiness

Không làm logic kiểu `allChecks === true => medically ready`.

**Core official readiness signs** gồm các dấu hiệu như:

- ngồi thẳng một mình hoặc có hỗ trợ;
- kiểm soát đầu/cổ;
- mở miệng khi đưa thức ăn;
- nuốt thay vì liên tục đẩy thức ăn ra.

**Additional developmental observations** có thể gồm:

- đưa đồ vào miệng;
- với/nắm đồ/food;
- chuyển thức ăn về sau lưỡi để nuốt.

Đây là education, không phải diagnostic test.

### 11.3 Timing bắt đầu complementary foods

- Khoảng 6 tháng và developmentally ready.
- Không khuyến nghị trước 4 tháng.
- Stage 4–6m chủ yếu là readiness/preparation, không tự prescribe solids.

### 11.4 Texture progression

Theo eating skill thực tế, không chỉ theo tuổi. Hỗ trợ smooth/mashed → thicker/lumpy → finely chopped/ground → safe finger food khi phù hợp.

### 11.5 Responsive feeding

- Nhận biết hunger/fullness cues.
- Caregiver quyết định what/when/where trong phạm vi an toàn.
- Child quyết định có ăn hay không và ăn bao nhiêu.
- Không ép, không dụ bằng distraction, không coi refusal là thất bại.

### 11.6 Allergy architecture

Không dùng một generic `highRiskAllergy=true`.

Ít nhất phân biệt:

```text
previous immediate reaction / known food allergy
severe eczema and/or egg allergy
mild-to-moderate eczema
no known eczema/food allergy
```

- Known allergy hoặc immediate reaction → clinician-directed.
- Severe eczema/egg allergy → peanut-specific clinician/evaluation guidance theo nguồn hiện hành.
- Mild/moderate eczema không tự động cấm home introduction.
- Mỗi allergen có thể có source/rule riêng.

### 11.7 Choking

Food example có choking relevance phải có preparation form, texture/shape note và supervision/seated-upright context phù hợp. Phải phân biệt gagging education với choking emergency.

### 11.8 Formula và milk handling là first-class domain

Tạo family **Feeding Safety** gồm:

- powdered formula handling;
- ready-to-feed/liquid formula context;
- bottle/preparation hygiene;
- storage/discard;
- breast-milk storage;
- Cronobacter/contamination context;
- higher-risk infant context khi current official source hỗ trợ;
- kiến trúc để link FDA recall/current safety information mà không hard-code transient recall vào evergreen content.

### 11.9 Feeding không được làm

- therapeutic diet;
- chẩn đoán allergy/intolerance;
- fixed calorie/ounce cho mọi trẻ;
- cho cereal/solid vào bottle để ngủ lâu;
- đánh đồng gagging với choking;
- dùng tuổi đơn thuần làm readiness proof.

---

## 12. Play & Development domain

### 12.1 Mỗi stage gồm

At a glance, Milestone context, Development focus, Gross motor, Fine motor/hand-eye, Language, Cognitive, Social-emotional, activities theo wake period, easier variation, harder variation, safety/environment, what not to force, what to observe, when to discuss with clinician, sources.

### 12.2 Milestone không phải deadline

Dùng wording như “developing toward”, “many children can”, “reference milestone”. Không biến thành pass/fail.

### 12.3 Corrected age

Khi active, Development/Play có thể resolve theo corrected development age cho đến chronological age 24m; luôn show chronological age bên cạnh.

### 12.4 Activity principles

Ưu tiên floor play, back-and-forth interaction, language exposure, movement opportunity, outdoor/social experience và independence phù hợp tuổi. Nhiều lượt ngắn tốt hơn ép một buổi dài. Tôn trọng mệt/stress/hứng thú.

### 12.5 Red flags

Chỉ dùng red flags có source review. Không diagnosis. Loss of previously acquired skills là lý do quan trọng để contact clinician theo wording nguồn hiện hành.

---

## 13. Sleep domain contract

### 13.1 Phải tách 6 lớp

1. Official sleep-duration guidance
2. Safe-sleep guidance
3. Typical nap-transition patterns
4. Product heuristic wake windows/exact schedule
5. Settling education
6. Behavioral sleep methods

### 13.2 Sleep-duration source matrix

Không dùng một generic source cho mọi tuổi. Mỗi displayed age range phải map tới source thực sự cover range đó.

### 13.3 Sleep modes

```ts
type SleepPlanMode = "responsive-rhythm" | "flexible-example" | "clock-example";
```

- 0–2m → `responsive-rhythm`
- 2–4m → responsive/flexible
- lớn hơn → có thể cung cấp clock example

### 13.4 Newborn rule

Cue-led feeding/sleep quan trọng hơn clock schedule đẹp. Exact clock chỉ hiện khi parent chủ động chọn example và phải có label **Example plan** nổi bật.

### 13.5 Wake windows/nap duration

Là heuristics kế thừa từ prototype, không phải official medical targets.

### 13.6 Settling vs behavioral intervention

**Settling education**: consistent routine, giảm stimulation, opportunity cho independent settling phù hợp tuổi, responsive soothing, environment.

**Behavioral intervention**: method có tên/cấu trúc, prerequisites, steps, stop conditions, evidence class.

### 13.7 Age policy

- `<4m`: responsive settling + routine + safe sleep, không formal behavioral protocol.
- `>=4m`: có thể hiện age-appropriate independent-settling education.
- Tròn 4 tháng **không đồng nghĩa** mọi formal method đều phù hợp.
- Mỗi method có minimum age/context, prerequisites, contraindications và stop conditions riêng.

### 13.8 Method schema

Giữ schema `SleepMethod` với `category`, `minChronologicalAgeMonths`, `prerequisites`, `notFor`, `steps`, `stopConditions`, `evidenceStrength`, `sourceIds`, `reviewStatus`.

### 13.9 Safe-sleep scope

```text
fullInfantSafeSleepScope = birth to <12 months
```

Mỗi claim cụ thể có thể có scope riêng theo source. Không tự relax safe sleep vì bé biết lật, corrected age thấp hơn, đã sleep trained hay parent browse stage lớn hơn.

---

## 14. Safety và escalation contract

Safety families: infant safe sleep, choking, allergen reaction awareness, formula/milk handling, food preparation, developmental/environmental safety, red flags.

```ts
type SafetyLevel = "info" | "caution" | "clinician" | "urgent" | "emergency";
```

Chỉ claim đã source-review mới được dùng `urgent`/`emergency`.

Không chẩn đoán. Không giấu urgent content trong drawer phụ. Browsed stage không được suppress current safety alerts.

---

## 15. Content architecture

### 15.1 Nội dung là data

Không hard-code medical prose trong JSX/HTML.

```text
content/
  sources.yaml
  coverage.yaml
  feeding/
    en.yaml
    vi.yaml
  development/
    en.yaml
    vi.yaml
  sleep/
    en.yaml
    vi.yaml
  safety/
    en.yaml
    vi.yaml
```

### 15.2 Claim-level model

```ts
type GuidanceClass =
  | "official-guidance"
  | "typical-pattern"
  | "example-plan"
  | "source-aligned-suggestion"
  | "product-heuristic";

type EvidenceStrength =
  | "strong"
  | "moderate"
  | "limited"
  | "consensus"
  | "not-applicable";

type ReviewStatus =
  | "draft"
  | "source-verified"
  | "clinical-review-required"
  | "approved"
  | "superseded";
```

Mỗi `Claim` có `sourceIds`, `safetyLevel`, `reviewedAt`, `reviewStatus`.

### 15.3 Vì sao citation phải ở claim level

Một paragraph có thể chứa nhiều claim, mỗi claim khác source. Khi source đổi, maintainer phải biết chính xác claim nào cần review.

### 15.4 Coverage matrix

`content/coverage.yaml` phải kiểm tra:

```text
stage × domain × required section × EN × VI × source coverage × review status
```

Thiếu một ô bắt buộc thì CI fail.

---

## 16. Internationalization

Pipeline:

```text
English authoring → source verification → review → Vietnamese translation → parity validation → release
```

Vietnamese phải giữ nguyên quantity/unit, age boundary, negation, urgency, “about/may/when ready/not recommended”, contraindication, stop condition và evidence label.

Dùng semantic key, ví dụ:

```text
feeding.solids.readiness.head_control
sleep.safe.back_to_sleep
play.4_6m.gross_motor.floor_reach
```

Không dùng opaque hash làm taxonomy canonical.

---

## 17. Evidence và source governance

### 17.1 Thứ tự ưu tiên nguồn

1. US federal/public-health và primary official publication phù hợp claim.
2. AAP official policy/parent guidance.
3. WHO khi phù hợp hoặc để global cross-check.
4. Professional society khác chỉ khi cần và được approve.

Không dùng parenting blog/commercial/influencer làm canonical medical source.

### 17.2 SourceRecord

```ts
interface SourceRecord {
  id: string;
  organization: string;
  title: string;
  url: string;
  jurisdiction: "US" | "global" | string;
  publishedAt?: string;
  updatedAt?: string;
  lastVerifiedAt: string;
  status: "current" | "superseded" | "retired";
  supersededBy?: string;
  verifiedTitle?: string;
  contentFingerprint?: string;
  notes?: string;
}
```

### 17.3 Khi source bị superseded

```text
source → superseded
  → dependent claims → review-required
  → CI/release report flag
  → verify source mới
  → revise/approve claims
```

Không bao giờ im lặng để outdated source vẫn có `status: current`.

### 17.4 Seed source registry tối thiểu

- CDC Developmental Milestones;
- CDC Infant and Toddler Nutrition;
- **Dietary Guidelines for Americans 2025–2030**;
- FDA infant formula handling/Cronobacter;
- AAP/HealthyChildren corrected age;
- AAP safe sleep;
- AAP sleep/settling parent guidance;
- WHO complementary feeding;
- WHO physical activity/sedentary behavior/sleep under 5;
- allergy-prevention guidance đã approve khi cần, ví dụ NIAID peanut guideline.

### 17.5 Freshness

- Safety-critical: verify ít nhất mỗi 6 tháng và trước major release.
- Medical guidance khác: ít nhất hàng năm và trước substantive content change.
- Link checker không thay human verification.

### 17.6 Sửa đổi quan trọng ở v0.2.0

`Dietary Guidelines for Americans, 2025–2030` là edition hiện hành. `2020–2025` phải đánh dấu `superseded`, chỉ giữ cho historical traceability nếu cần.

---

## 18. GUI/design system

### 18.1 Hướng thiết kế

Dùng Baby Sleep v33 làm visual reference chính:

- baby-modern pastel;
- translucent/glass;
- blue/peach/green/lavender mềm;
- circles/dots motifs;
- shadow nhẹ;
- typography thân thiện nhưng professional;
- tránh cartoon quá mức.

### 18.2 Light/Dark parity

Cùng geometry, hierarchy, spacing, radius, behavior; chỉ theme tokens khác màu/surface.

### 18.3 Reusable components

`AppHeader`, `ProfileEditor`, `ChildSummary`, `DomainTabs`, `StageNavigator`, `GuidanceLabel`, `WhyThisStage`, `FocusCard`, `SafetyCallout`, `SourceDrawer`, `Timeline`, `SleepSummaryBadge`, `ActivityCard`, `FeedingCard`, `MethodCard`, `PreviewBanner`.

### 18.4 Evidence labels

Hiển thị ngay trên UI:

```text
Official guidance
Typical pattern
Example plan
Practical suggestion
```

Không giấu hết trong source drawer.

### 18.5 Stage navigator

Horizontal chips, no visible scrollbar, arrows, swipe/drag, current stage khác browsed stage, browse không đổi actual child stage.

---

## 19. Responsive, print, accessibility

### Responsive

Mobile-first, no essential hover-only action, form 1 cột trên màn nhỏ, timeline không overflow ngang.

### Print

Hỗ trợ Letter/A4, in Today/current stage/all stages. Bỏ controls/nav, giữ pastel phân biệt nhưng print-safe, không background gradient gây tốn mực, giữ motif khi không làm layout bị cắt, tránh split logical card nếu có thể.

### Accessibility

Keyboard, focus visible, semantic HTML, ARIA khi cần, screen-reader announcements hợp lý, reduced motion, không dùng màu là tín hiệu duy nhất.

---

## 20. Technical architecture

### 20.1 Contract

v1 static-first, client-personalized.

**Preferred:** Next.js + TypeScript + static export.

Framework **không** phải immutable product contract. Có thể thay nếu vẫn giữ:

- static deployment;
- strict type safety tương đương TypeScript;
- build-time schema/content validation;
- child personalization chỉ client-side;
- không cần backend v1;
- deterministic stage engine;
- i18n integrity;
- print support.

### 20.2 Suggested structure

```text
src/
  app/
  components/
  domain/
    age/
    feeding/
    development/
    sleep/
    safety/
  content/
  i18n/
  storage/
  styles/
  print/
  tests/
```

### 20.3 Separation rules

Date math không ở UI component; medical prose không nằm trong business logic; i18n không duplicate domain logic; sleep heuristic không lưu như medical claim; actual safety context không lấy từ browsed stage UI state.

---

## 21. Functional requirements

- **FR-001 Profile:** create/save/edit/cancel/restore/clear local profile.
- **FR-002 Age engine:** chronological + corrected-development calculation.
- **FR-003 Independent stages:** feeding/development/sleep resolve độc lập.
- **FR-004 Why this stage:** giải thích khi stage basis khác nhau.
- **FR-005 Browsing isolation:** browse/preview không đổi safety context thật.
- **FR-006 Feeding:** what/how/readiness/texture/nutrient/allergen/choking/drink/formula handling/clinician guidance + source traceability.
- **FR-007 Development:** milestone context + practical progression không pass/fail.
- **FR-008 Sleep:** official duration tách typical/example.
- **FR-009 Newborn rhythm:** 0–2m mặc định responsive-rhythm.
- **FR-010 Sleep methods:** settling khác behavioral methods; method-specific eligibility.
- **FR-011 Safe sleep:** resolve từ actual-child infant scope/current ability.
- **FR-012 Today:** combine domain độc lập; sleep không prescribe feed frequency.
- **FR-013 Language/theme:** persist độc lập content state.
- **FR-014 Sources:** expose source/review metadata.
- **FR-015 Print:** current/all supported print clean.

---

## 22. Non-functional requirements

- **Privacy:** child data không rời browser ở v1.
- **Performance:** static load nhanh, JS tối thiểu hợp lý, không third-party scripts dư thừa.
- **Reliability:** localStorage fail vẫn dùng được; same input → same output.
- **Accessibility:** keyboard/screen reader/contrast/reduced-motion/print.
- **Security:** no raw HTML injection, safe external links, CSP khi có thể, dependency scanning.
- **Maintainability:** strict types, centralized date/content schemas, no duplicate theme geometry/i18n logic, no monolithic production HTML.
- **Traceability:** claim → source → status → review → translation.
- **Determinism:** profile + planDate + contentVersion + preferences giống nhau → output giống nhau.

---

## 23. Testing/verification contract

### 23.1 Date/age

Test same-day birth, future DOB, Feb 29, end-of-month, due date trước/sau DOB, đúng 21 ngày/22 ngày sớm, before due date, 24m transition, mọi stage boundary, timezone/DST, invalid plan dates.

### 23.2 Context isolation

- Browse không đổi actual stage/safety.
- Future preview không đổi current safe-sleep scope.
- Browse feeding stage lớn không unlock solids/allergens cho actual child nhỏ hơn.
- Browse toddler sleep không suppress infant safe-sleep.

### 23.3 Feeding

- Tròn 4m không unlock complementary foods.
- Readiness checklist không phải all-true medical gate.
- Allergy branches riêng biệt.
- Formula safety chỉ hiện theo metadata/source đúng.
- Food có choking relevance phải có preparation metadata.

### 23.4 Sleep

- 0–2m default responsive rhythm.
- Exact newborn schedule chỉ khi explicit example mode.
- Sleep event không set feeding frequency.
- Nap modes hợp lệ.
- Wake-window adjustment không tạo interval invalid.
- Sleep math consistent.
- Heuristic label đúng.
- Behavioral method enforce prerequisites.

### 23.5 Source/content

- Mọi medical claim có source.
- Source ID resolve được.
- Superseded source không thỏa `current source required`.
- Source superseded → dependent claim bị flag.
- Safety claim có review metadata.
- Coverage matrix complete.
- EN/VI parity.
- Safety translation parity.

### 23.6 E2E/visual/accessibility

Test first visit, save/return/edit/cancel/clear, storage blocked, EN/VI, Light/Dark, preview/reset, stage arrows/swipe, WhyThisStage, Today adjustments, newborn mode, print. Visual snapshots cho desktop/mobile, feeding/development/sleep/safety, Letter/A4.

---

## 24. Điều kiện hoàn thành MVP

v1 chỉ release khi:

1. Local profile hoạt động và degrade gracefully khi không persist được.
2. Date/age/corrected proxy boundary-tested.
3. Domain stage engines độc lập.
4. Actual/browsed/preview context tách đúng.
5. Today hợp nhất domain mà không biến sleep thành feeding prescription.
6. Newborn mặc định responsive rhythm.
7. Tất cả stage có English content đầy đủ.
8. Vietnamese parity đầy đủ.
9. Feeding cover what/how/readiness/texture/responsive feeding/choking/allergen/formula handling.
10. Play cover skills/activities/variations/safety/observation.
11. Sleep tách official/typical/heuristic/settling/behavioral.
12. Full infant safe-sleep áp dụng đến `<12m` trừ claim-specific scope khác.
13. Claim-level source/review traceable.
14. Source registry không có known superseded source đánh dấu current.
15. Coverage matrix pass.
16. Light/Dark/mobile/Letter/A4 visual QA pass.
17. Accessibility/typecheck/lint/unit/E2E/content validation/build pass.
18. Safety-critical English và Vietnamese được qualified reviewer duyệt trước production.

---

## 25. Thứ tự triển khai

1. Project shell, design tokens, static export, CI.
2. Profile/storage/date utilities/age engine.
3. Actual vs browsed vs preview context model.
4. Source registry + lifecycle + claim schema + coverage validation.
5. i18n + parity checks.
6. Header/profile/stage navigator/print.
7. Development/play migration + source audit.
8. Sleep duration/safe-sleep + sleep engine migration.
9. Newborn responsive-rhythm mode.
10. Feeding + Feeding Safety/formula handling.
11. Today composer.
12. Settling education + method-specific behavioral sleep library.
13. Full medical/source audit, accessibility, visual QA, deployment automation.

Không làm final Today composer trước khi domain resolvers và safety-context isolation ổn định.

---

## 26. Kế thừa từ prototype

### 26.1 Từ Baby Sleep Schedule v33

- baby-modern glass style;
- Light/Dark parity;
- EN/VI controls;
- local profile;
- compact header controls;
- nap seed data;
- editable wake/nap/wake-window settings;
- timeline + sleep summary badges;
- print compaction;
- storage warning/migration concept.

### 26.2 Từ Development Plan v31

- due date;
- chronological/corrected age;
- corrected development stage đến 2 tuổi;
- plan-date preview;
- saved-profile summary;
- 0–5 stage structure;
- arrows/drag/swipe;
- current-stage marker;
- per-stage/all-stage print;
- focus/activity cards;
- milestone-as-reference framing;
- bilingual paired content + sources.

### 26.3 Không kế thừa nguyên trạng

- monolithic HTML;
- medical prose hard-coded;
- opaque hashed i18n taxonomy;
- fixed newborn clock schedule;
- wake window như official target;
- universal stage map;
- source chỉ attach page-level;
- outdated/unverified content;
- browsed stage dùng làm safety context;
- raw `innerHTML` với profile data.

---

## 27. Decision log

| Quyết định | Trạng thái | Lý do |
|---|---|---|
| English medical content canonical, Vietnamese paired | Accepted | Tránh lệch nghĩa y khoa. |
| Phạm vi birth–`<5y` | Accepted | Phù hợp mục tiêu sản phẩm. |
| Một local child profile v1 | Accepted | Privacy/UX đơn giản. |
| Không cần backend v1 | Accepted | Personalization local/deterministic. |
| Domain-specific stage engines | Accepted | Mỗi domain khác rule. |
| Corrected age tự động chỉ cho Development/Play | Accepted | Không lan sai sang Feeding/Safety. |
| `>21 days` là due-date proxy, không diagnosis | Accepted v0.2.0 | Sửa điểm mơ hồ của v0.1.0. |
| 4–6m là readiness education, không auto solids | Accepted v0.2.0 | Tránh age-only activation. |
| Newborn default responsive rhythm | Accepted v0.2.0 | Tránh false clock precision. |
| Sleep không quyết định feeding frequency | Accepted v0.2.0 | Bảo toàn responsive feeding. |
| Settling khác behavioral intervention | Accepted v0.2.0 | Không biến 4 tháng thành universal approval. |
| Infant safe-sleep scope birth–`<12m` | Accepted v0.2.0 | Scope rõ ràng. |
| Claim-level source | Accepted v0.2.0 | Review chính xác. |
| Source lifecycle current/superseded/retired | Accepted v0.2.0 | Tránh stale guidance. |
| Dietary Guidelines 2025–2030 là current | Accepted v0.2.0 | Thay 2020–2025 đã superseded. |
| Next.js/TS là preferred, không immutable | Accepted v0.2.0 | Product contract không phụ thuộc framework. |
| Không live AI medical advice | Accepted | Safety + traceability. |
| Baby-modern glass Light/Dark | Accepted | Yêu cầu design. |

---

## 28. Definition of done cho content change

Một content PR chưa xong nếu chưa:

- cập nhật English claim;
- mở và verify source URL;
- xác nhận source status;
- classify đúng guidance/evidence/safety;
- giữ qualifiers/contraindications;
- cập nhật `reviewedAt`/`reviewStatus`;
- cập nhật Vietnamese với semantic parity;
- pass coverage/source checks;
- review responsive/print bị ảnh hưởng;
- qualified review cho safety-critical change;
- ghi release note nếu recommendation thay đổi.

---

## 29. Tuyên bố sản phẩm cuối cùng

Baby Feed · Play · Sleep Guide phải trở thành một tài liệu tham khảo local-first bền vững cho phụ huynh: đủ chi tiết để trả lời câu hỏi hằng ngày, đủ có cấu trúc để tiếp tục mở rộng mà không rối, đủ minh bạch để người dùng biết recommendation dựa trên đâu, và đủ thận trọng để **example/heuristic/general guidance không bị biến thành medical advice cá nhân hóa**.
