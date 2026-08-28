# PROJECT_PROFILE — HowToBaby — Bản tiếng Việt

> Bản tiếng Việt dùng để đọc hiểu và review. **Các nguồn chính thức bên ngoài mới là nguồn bằng chứng có thẩm quyền; bản English là canonical product interpretation/source-of-truth cho nội dung của HowToBaby.** Bản Vietnamese là bản dịch ghép cặp từ bản English theo cùng stable IDs.

| Trường | Giá trị |
|---|---|
| Trạng thái tài liệu | Baseline làm việc tương ứng bản English v0.3.0 |
| Phiên bản profile | 0.3.0 |
| Cập nhật lần cuối | 2026-08-26 |
| Tên sản phẩm | HowToBaby |
| Tên miền chính | `howtobaby.com` |
| Repository slug tạm thời | `howtobaby` |
| Loại sản phẩm | Web app evidence-to-action, local-first, static-first, responsive |
| Phạm vi tuổi | Từ sơ sinh đến trước 5 tuổi |
| Khu vực hướng dẫn chính | Hoa Kỳ |
| Đối chiếu toàn cầu | WHO khi phù hợp |
| Nguồn bằng chứng có thẩm quyền | Các nguồn chính thức đã được duyệt; HowToBaby không tự tạo thẩm quyền y khoa |
| Ngôn ngữ canonical của product content | English |
| Ngôn ngữ UI/nội dung | English và Vietnamese |
| Mô hình truy cập hiện tại | Miễn phí |
| Backend cần cho v1 | Không |
| Kiến trúc ưu tiên | Next.js + TypeScript + static export |
| Prototype tham khảo | `Baby-Sleep-Schedule-v33.html`; `ke_hoach_phat_trien_theo_do_tuoi_cho_be_v31_clean_refactor.html` |

---

## 1. Định nghĩa dự án

HowToBaby là một **nền tảng evidence-to-action dành cho phụ huynh**. Mục tiêu không phải thay thế CDC, AAP, FDA, USDA/HHS, NIH, WHO hay các nguồn có thẩm quyền khác. HowToBaby có nhiệm vụ làm cho hướng dẫn hiện hành của họ dễ dùng trong đời sống: chọn đúng phần liên quan đến tuổi/context hiện tại của trẻ, giữ nguyên ý nghĩa và mức độ không chắc chắn của nguồn, sắp xếp lại, rồi chuyển thành hành động thực tế mà cha mẹ có thể hiểu nhanh.

Người dùng có thể browse hướng dẫn chung theo tuổi/topic mà không cần tạo profile. Nếu muốn dùng trang **Now** được cá nhân hóa, phụ huynh có thể nhập ngày sinh, tên hiển thị tùy chọn và ngày dự sinh tùy chọn. Dữ liệu lưu local; các domain tự resolve context độc lập.

Các domain ban đầu:

- **Feeding:** ăn gì, cho ăn như thế nào, readiness, texture progression, responsive feeding, an toàn sữa mẹ/formula, allergen, choking prevention;
- **Play & Development:** kỹ năng đang hình thành, nên làm gì trong wake period, cách tăng/giảm độ khó theo khả năng thực tế;
- **Sleep:** sleep-duration context, nap, nhịp sinh hoạt, bedtime routine, settling và behavioral sleep method khi phù hợp;
- **Safety:** safe sleep, feeding/choking safety, environmental safety và escalation guidance đã source-review;
- **Evidence:** provenance, source, classification, review status và ngày verify.

Kiến trúc domain phải mở rộng được. Sau này có thể thêm oral health, preventive-care preparation, physical activity, media use hoặc các chủ đề khác mà không phải xây một hệ thống evidence/provenance riêng.

HowToBaby là **hướng dẫn thực hành**, không phải hồ sơ y tế, công cụ chẩn đoán, developmental screening test, calorie calculator, dịch vụ cấp cứu hay thay thế bác sĩ nhi khoa.

### 1.1 Cam kết sản phẩm

Thông điệp public:

> **Know what your child needs. Right now.**

Sản phẩm phải trả lời rõ:

1. **Ở giai đoạn hiện tại, điều gì quan trọng nhất?**
2. **Cha mẹ có thể làm gì ngay lúc này?**
3. **Vì sao điều đó quan trọng?**
4. **Nội dung nào là official guidance, evidence synthesis, typical pattern, example hay heuristic?**
5. **Nên quan sát gì mà không biến phát triển bình thường thành pass/fail?**
6. **Khi nào nên hỏi clinician hoặc cần tìm trợ giúp khẩn cấp?**
7. **Thông tin đến từ đâu và được verify lần cuối khi nào?**

### 1.2 Định vị

HowToBaby phải đáng tin và có cấu trúc hơn parenting blog, nhưng dễ dùng hơn việc tự đọc nhiều guideline/public-health source riêng lẻ.

Lợi thế của sản phẩm là **context + organization**, không phải tự tạo medical knowledge:

```text
authoritative source
  → verified claim
  → canonical English interpretation
  → age/context applicability
  → practical action
  → parent-facing explanation
  → Vietnamese translation
```

HowToBaby không được tạo cảm giác rằng chính nó là cơ quan y khoa đứng sau một official recommendation.

### 1.3 Core interaction model

Khi phù hợp, guidance nên có thể trình bày thành 5 lớp:

- **Know** — giai đoạn này cần biết gì;
- **Do** — cha mẹ có thể làm gì;
- **Why** — lý do ngắn gọn, không phóng đại evidence;
- **Watch** — variation, readiness, giới hạn và escalation cue;
- **Source** — authority, link, evidence class, ngày verify.

Đây là presentation contract, không bắt buộc mọi claim nhỏ phải tách thành 5 card riêng.

---

## 2. Nguyên tắc sản phẩm

### 2.1 Evidence trước convenience

Mọi health/safety claim phải truy ngược được về nguồn đã duyệt. Khi diễn giải cho dễ hiểu phải giữ qualifiers, contraindications, uncertainty, applicability và safety condition.

### 2.2 Nguồn chính thức bên ngoài là evidence source-of-truth; English là canonical product interpretation

Nguồn bên ngoài đã duyệt mới có thẩm quyền cho claim mà chúng hỗ trợ. Bản English của HowToBaby là **cách diễn giải canonical của sản phẩm**, dùng làm gốc cho content/translation, nhưng không phải tự thân là medical authority.

### 2.3 Local-first, private-by-default

Profile bé và preferences ở browser của thiết bị hiện tại. v1 không account, cloud child profile, advertising tracker hay third-party behavioral analytics.

### 2.4 Browse không cần profile

Hướng dẫn chung theo tuổi/topic phải đọc được mà không cần nhập tên/DOB. Personalization là enhancement, không phải access gate.

### 2.5 Age-aware, không age-deterministic

Tuổi chỉ chọn candidate guidance. Tuổi một mình không chứng minh feeding readiness, developmental ability, sleep readiness hay medical suitability.

### 2.6 Mỗi domain có age logic riêng

Feeding, Play/Development, Sleep, Safety và future domain có thể dùng age basis/boundary khác nhau. **Không dùng universal stage map.**

### 2.7 Personalized context không phải personalized medicine

HowToBaby được phép cá nhân hóa **guidance nào được hiển thị và cách sắp xếp** dựa trên input ít rủi ro. Không được suy ra diagnosis, prescribe treatment hay biến general guidance thành medical order cá nhân.

### 2.8 Không tạo false precision

App phải giữ đúng độ chính xác của nguồn.

Nếu source nói **“around 6 months”**, sản phẩm không được biến thành một ngày chính xác. Nếu source cho range rộng, app không được tự thu hẹp range chỉ vì biết DOB chính xác.

Exact schedule time, wake window, amount, stage boundary hoặc planning value do sản phẩm tạo phải được label rõ khi chỉ là heuristic/example.

### 2.9 Guidance, không chấm điểm

Không grade cha mẹ/trẻ, không completion %, không dùng app interaction để kết luận trẻ “behind”.

### 2.10 Safety ưu tiên hơn optimization

Safe sleep, choking prevention, allergy precaution, formula handling, responsive feeding và red flags override schedule đẹp, engagement hoặc sleep-training goal.

### 2.11 Progressive disclosure

Màn đầu dễ quét; rationale, variation, uncertainty, evidence và source mở rộng khi cần.

### 2.12 Evidence label rõ ràng

- **Official guidance** — được approved authority hỗ trợ trực tiếp;
- **Evidence synthesis** — tổng hợp minh bạch từ nhiều approved source tương thích;
- **Typical pattern** — thường gặp, không bắt buộc;
- **Example plan** — ví dụ do HowToBaby tạo;
- **Practical interpretation** — chuyển source thành hành động nhưng không giả là official wording;
- **Product heuristic** — planning logic của HowToBaby, không phải medical recommendation.

### 2.13 Một design system

Light/Dark/responsive/print cùng geometry/behavior; theme chỉ đổi surfaces/colors.

### 2.14 Không silent medical inference

Không tự chẩn đoán allergy, feeding disorder, developmental delay, sleep disorder, prematurity hay contraindication từ date/settings/interaction.

### 2.15 Actual-child safety context không đổi khi browse

Browse stage khác hoặc preview tương lai không được thay safety guidance áp dụng cho child context thật.

### 2.16 Không âm thầm hòa trộn nguồn bất đồng

Khi approved sources khác nhau đáng kể, không được “average” thành consensus giả. Với audience Mỹ, theo U.S. source hierarchy; WHO có thể hiện như global context.

### 2.17 Trust quan trọng hơn monetization

Sponsor, affiliate, paid feature hay commercial relationship không được thay đổi canonical evidence, safety wording, source selection hoặc recommendation ranking.

### 2.18 Giọng điệu tôn trọng, không phán xét

Tránh fear-based copy, shame, milestone competition và wording khiến cha mẹ nghĩ mình thất bại vì trẻ không theo example schedule hay typical pattern.

---

## 3. Người dùng mục tiêu

### 3.1 Chính

- Phụ huynh/caregiver tại Hoa Kỳ có trẻ từ sơ sinh đến trước 5 tuổi.
- Người muốn biết ngay điều thực tế cần làm mà không phải tự đọc nhiều tài liệu chính thức.
- Người muốn hiểu cả **what to do** lẫn **why**.
- Gia đình Anh–Việt hoặc caregiver dùng tiếng Việt muốn content ghép cặp theo bản English canonical.
- Gia đình có trẻ sinh trước due date cần chronological/corrected-development-age context.

### 3.2 Phụ

- Ông bà/caregiver dùng bản in.
- Người browse theo tuổi mà không tạo profile.
- Phụ huynh xem trước stage tiếp theo.
- Người chuẩn bị câu hỏi cho pediatric clinician.

### 3.3 Giả định sử dụng

- User có thể ít kiến thức y khoa.
- Có thể đang dùng điện thoại trong lúc chăm bé.
- Có thể vào thẳng age/topic page từ search engine.
- Có thể print/save PDF.
- App vẫn phải hữu ích nếu local persistence không hoạt động.
- User không cần hiểu internal stage model để dùng sản phẩm.

---

## 4. Phạm vi sản phẩm

### 4.1 Có trong v1

- Browse public theo tuổi/topic mà không cần child profile.
- Một optional local child profile cho trang **Now** cá nhân hóa.
- DOB chỉ required khi muốn personalized age resolution.
- Tên hiển thị của bé optional.
- Estimated due date optional.
- Plan-date preview.
- Chronological + corrected-development-age context.
- Independent resolver cho Feeding, Development/Play, Sleep và Safety.
- Trang **Now** hợp nhất.
- Feeding từ milk feeding đến preschool family eating.
- Play/Development đến `<5y`.
- Sleep planning với wake time, nap pattern/duration/style.
- Newborn responsive-rhythm.
- Safe sleep.
- Settling education + method-specific behavioral sleep education.
- Formula/breast-milk handling safety.
- EN/VI, Light/Dark, responsive + print.
- Evidence classification, source, applicability, review metadata hiển thị được.
- Public Methodology/Sources/Editorial Policy/Disclaimer.
- Static age/topic pages dùng cùng canonical content với personalized app.
- Static deployment + GitHub-driven release.

### 4.2 Không phải mục tiêu v1

- Diagnosis/symptom checker.
- Medication/supplement dosing.
- Growth percentile interpretation.
- Personalized vaccine scheduling.
- Therapeutic diet cá nhân hóa.
- Allergy treatment plan.
- Quản lý failure to thrive, swallowing disorder, complex prematurity hay chronic disease.
- Fixed calories/ounces cho mọi trẻ.
- Live logging/streak/gamification/scoring.
- Cry/video/audio analysis.
- Community/social.
- Product/sponsored/affiliate recommendation.
- Cloud account/sync.
- Multi-child saved profile.
- Live AI medical advice.
- Bắt buộc phải kiếm tiền ở v1.

### 4.3 Có thể mở rộng sau

- Multi-child.
- Optional encrypted sync.
- PWA/offline pack.
- Caregiver sharing.
- Optional logs.
- Preventive care/oral health/media use/physical activity sau khi review source/scope.
- Clinician-reviewed specialized packs.
- Thêm locale/jurisdiction.
- Recall integration nếu có maintenance plan đáng tin.
- Ask HowToBaby theo policy §31.
- Paid convenience features nhưng không paywall core evidence/safety.

---

## 5. Từ vựng canonical

| Thuật ngữ | Ý nghĩa |
|---|---|
| Authoritative source | Tổ chức/tài liệu bên ngoài đã duyệt hỗ trợ một claim. |
| Canonical English interpretation | Bản English đã review của HowToBaby; canonical cho product content/translation nhưng không thay thế external authority. |
| Child profile | Optional local display name, DOB và optional due date. |
| Actual-child context | Context thật hiện tại dùng cho current recommendation/safety. |
| Browsed-content context | Age/stage browse thủ công; không thay actual safety context. |
| Plan date | Ngày preview guidance; mặc định hôm nay. |
| Chronological age | Tuổi lịch từ DOB đến plan date. |
| Corrected development age | Tuổi phát triển hiệu chỉnh bằng due date khi proxy đủ điều kiện. |
| Likely-preterm due-date proxy | Xấp xỉ kỹ thuật khi sinh >21 ngày trước due date; không phải diagnosis. |
| Development stage | Range dùng cho milestone/play. |
| Feeding stage | Age/readiness/skill context cho feeding. |
| Sleep stage | Range dùng cho sleep context/defaults. |
| Readiness cue | Dấu hiệu/khả năng quan sát được liên quan recommendation. |
| Responsive feeding | Cho ăn theo hunger/fullness và khả năng phát triển, không ép. |
| Wake window | Planning interval do sản phẩm dùng; heuristic. |
| Responsive rhythm | Cue-led sequence cho newborn/young infant. |
| Official guidance | Claim được approved authority hỗ trợ trực tiếp. |
| Evidence synthesis | Statement tổng hợp minh bạch nhiều approved source. |
| Typical pattern | Mẫu thường gặp, không phải requirement. |
| Example plan | Ví dụ do app dựng. |
| Practical interpretation | Actionable wording phù hợp source nhưng không giả là official wording. |
| Product heuristic | Logic lập kế hoạch của HowToBaby, không phải medical recommendation. |
| Red flag | Observation đã source-review cần professional advice/escalation. |
| Source conflict | Approved sources khác nhau đáng kể và không thể gộp an toàn thành một statement. |
| Content version | ID bất biến của reviewed content dataset dùng để tạo output. |

---

## 6. Child profile và privacy contract

### 6.1 Hai mode

1. **Browse mode** — không cần profile; chọn tuổi/stage/topic thủ công.
2. **Personalized mode** — DOB resolve current context và bật trang **Now**.

### 6.2 Profile fields

| Field | Type | Rule |
|---|---|---|
| `name` | string/null | Optional, chỉ để display; trim; max 40 chars; text-only. |
| `dateOfBirth` | local date/null | Required cho personalized mode; `YYYY-MM-DD`; không future. |
| `estimatedDueDate` | local date/null | Optional; chỉ dùng cho corrected-development context/proxy explanation. |

Không có name thì dùng copy trung tính như **your baby/your child**.

### 6.3 Preference/UI state

`planDate`, `language`, `theme`, `wakeTimeMinutes`, `napMode`, `napDurations`, `wakeWindowAdjustment`.

### 6.4 Privacy

- Dùng `localStorage` cho personalized persistence v1.
- Không dùng cookie lưu child data.
- Không bắt profile mới được đọc public guidance.
- Storage fail vẫn chạy session và cảnh báo không persist.
- Có **Clear local data** + confirm.
- Không đưa name/DOB/due date/exact derived age vào URL, telemetry, share params, server log hay third-party analytics.
- Public deep-link chỉ được encode broad age/topic khi không làm lộ child profile.
- Escape user string; không raw `innerHTML`.
- Không bán/expose child profile data cho advertiser/commercial partner.

### 6.5 Storage keys gợi ý

```text
howtobaby.profile.v1
howtobaby.preferences.v1
howtobaby.sleep-settings.v1
howtobaby.content-version.v1
```

### 6.6 Legacy migration candidates

```text
baby-guide.profile.v1
baby-guide.preferences.v1
baby-guide.sleep-settings.v1
baby-guide.content-version.v1
baby-sleep-planner.profile.v1
baby-sleep-planner.settings.v1:*
baby-sleep-planner.settings.v2:*
baby-sleep-planner.settings.v3:*
baby-development-plan-profile-v1
baby-development-plan-theme-v1
baby-development-plan-language-v1
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
- Khi dùng CDC milestone checklist và age nằm giữa hai checklist, dùng checklist nhỏ tuổi hơn theo hướng dẫn CDC; không tự nội suy một milestone threshold mới.

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

**Invariant:** qua mốc 4 tháng **không** được tự kích hoạt hướng dẫn bắt đầu solids. Complementary foods bắt đầu khoảng 6 tháng khi developmentally ready. Feeding-stage range chỉ là editorial/resolver bin; không được trình bày như bằng chứng rằng recommendation y khoa đổi chính xác vào ngày sinh nhật nếu source không định nghĩa threshold đó.

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

Primary destinations:

1. **Now** — personalized current-stage guidance khi có profile; nếu chưa có thì cho Browse by age hoặc Personalize locally.
2. **Feeding**
3. **Play & Development**
4. **Sleep**
5. **Safety**

Sources phải truy cập được ngay từ từng claim/block và qua page **Sources / Methodology** riêng; không được gom transparency vào một chỗ duy nhất khó tìm.

Header có product name, compact child summary khi có, age context, EN/VI, Light/Dark, Print, Edit profile.

Public age/topic route phải dùng được không cần profile và render từ cùng canonical content dataset với personalized views.

---

## 10. Trang Now

### 10.1 Mục tiêu

**Now** là practical home screen của personalized mode, trả lời: **“Với giai đoạn hiện tại của con tôi, điều gì quan trọng và tôi có thể làm gì?”** Nó hợp nhất output độc lập nhưng không giả vờ track behavior thật hay cung cấp individualized medical care.

Nếu chưa có profile, cho hai lựa chọn rõ: **Browse by age** hoặc **Personalize locally**.

### 10.2 Summary

Hiển thị chronological age, corrected age khi active, development/feeding/sleep stage, **What matters now**, **Why this stage?** khi basis khác nhau, và content review/freshness summary có link đến nguồn/methodology.

Không được dùng due-date proxy để clinical-label trẻ là premature.

### 10.3 Current-focus cards

- **Feed now**
- **Play & develop now**
- **Sleep now**
- **Safety now**

Mỗi card ưu tiên vài action giá trị cao thay vì dump tất cả. Khi phù hợp dùng **Know → Do → Why → Watch → Source**.

### 10.4 Composer rule

```text
Sleep events có thể tạo temporal structure.
Sleep event KHÔNG quyết định medical feeding frequency.
Responsive feeding override aesthetic timeline spacing.
Safety guidance có thể interrupt/override example plan.
```

Newborn mặc định cue-led:

```text
Feed → tương tác ngắn khi tỉnh → sleep opportunity → lặp theo cues
```

Không ép thành strict clock schedule.

### 10.5 Adjustment drawer

Wake time, nap count/duration, wake-window heuristic, active/calm play preference. Các setting này chỉ thay **Example plan**, không rewrite official guidance/safety/applicability.

### 10.6 Không false personalization

Nếu evidence chỉ hỗ trợ range hoặc “around”, personalized copy phải giữ wording tương ứng. Biết exact DOB không cho phép app tạo medical precision mới.

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

Production health guidance không hard-code trong JSX/HTML.

```text
content/
  sources.yaml
  coverage.yaml
  methodology.yaml
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

### 15.2 Evidence-to-action layers

```text
SourceRecord
  → Claim
  → Applicability
  → GuidanceBlock / Action
  → Translation
  → Presentation
```

Source không phải UI card; UI card không tự động là official recommendation.

### 15.3 Claim-level model

```ts
type GuidanceClass =
  | "official-guidance"
  | "evidence-synthesis"
  | "typical-pattern"
  | "example-plan"
  | "practical-interpretation"
  | "product-heuristic";

type EvidenceStrength =
  | "source-graded"
  | "consensus"
  | "not-rated"
  | "not-applicable";

type ReviewStatus =
  | "draft"
  | "source-verified"
  | "clinical-review-required"
  | "clinically-reviewed"
  | "release-approved"
  | "superseded";

type PrecisionClass =
  | "source-exact"
  | "source-approximate"
  | "source-range"
  | "product-heuristic";
```

Mỗi `Claim` phải có `sourceIds`, `sourceSupport`, `safetyLevel`, `precisionClass`, applicability/exclusion khi cần, `reviewedAt`, `reviewStatus`. Nếu source có hệ thống evidence grade thì có thể lưu `evidenceGrade` + source của grade đó; HowToBaby không tự gán Strong/Moderate/Weak nếu nguồn không grade.

### 15.4 Giữ precision của source

- `source-approximate` như **around 6 months** không được render thành exact medical day threshold;
- `source-range` phải giữ supported range;
- `product-heuristic` có thể tạo exact planning value nhưng phải label rõ;
- resolver có thể dùng technical boundary nội bộ nhưng UI không được giả nó là medical threshold nếu source không nói vậy.

### 15.5 Claim-level citation

Một paragraph có thể có nhiều claim/source. Attribution ở claim level để biết chính xác cái gì cần re-review khi source đổi.

### 15.6 Coverage matrix

```text
stage × domain × required section × EN × VI × source coverage × review status
```

Thiếu cell bắt buộc → CI fail.

### 15.7 Public/personalized dùng chung content graph

Không duy trì medical prose riêng cho SEO page và personalized app. Public pages, Now, print và future assistant đều resolve từ cùng reviewed claim/content graph.

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

### 17.1 Source hierarchy

Với audience Mỹ, ưu tiên khi source phù hợp claim:

1. **U.S. primary/public-health source hiện hành** — CDC, FDA, USDA/HHS, NIH/NICHD hoặc federal source chịu trách nhiệm.
2. **AAP official policy/clinical report/official parent guidance** khi AAP là authority phù hợp.
3. **U.S. professional society/consensus khác** khi cần và được approve.
4. **WHO official guidance** cho global normative guidance/cross-check hoặc khi là authority phù hợp nhất.
5. **Systematic review/peer-reviewed evidence chất lượng cao** khi official guidance chưa cover đủ và đã được review cho product use.

Không dùng parenting blog, commercial site, influencer, retailer/manufacturer marketing, search snippet hay unsourced summary làm canonical medical source.

### 17.2 Jurisdiction và source conflict

- Primary jurisdiction là U.S.
- Không silent-merge U.S. và WHO nếu recommendation khác đáng kể.
- Với U.S.-specific guidance, ưu tiên current in-scope U.S. authority.
- WHO có thể hiện dưới label **Global guidance**.
- Nếu hai approved authority đều relevant nhưng khác nhau đáng kể, phải show khác biệt hoặc chưa simplify cho đến khi review.
- Source mới hơn không tự động tốt hơn; phải xét authority/scope/supersession/applicability.

### 17.3 SourceRecord

```ts
type SourceTier =
  | "us-primary"
  | "professional-authority"
  | "global-authority"
  | "evidence-review";
```

`SourceRecord` gồm organization, title, url, tier, jurisdiction, published/updated date, `lastVerifiedAt`, optional `nextReviewAt`, status, `supersededBy`, optional `sourceLocator`, fingerprint và notes.

`sourceLocator` có thể chỉ section/table/recommendation/page. Không cần lưu long copyrighted excerpt chỉ để chứng minh provenance.

### 17.4 Supersession

```text
source → superseded
  → dependent claims → review-required
  → CI/release report flag
  → verify source mới
  → revise/approve claims
```

### 17.5 Seed source registry tối thiểu

- CDC **Learn the Signs. Act Early.** developmental milestones/checklists;
- CDC Infant and Toddler Nutrition;
- Dietary Guidelines for Americans **2025–2030**;
- FDA infant formula/Cronobacter;
- AAP/HealthyChildren corrected-age guidance khi dùng;
- AAP safe-sleep policy/technical guidance;
- AAP sleep/settling guidance khi dùng;
- WHO complementary feeding / infant and young child feeding;
- WHO physical activity/sedentary behavior/sleep under 5 khi dùng;
- approved allergy-prevention guidance như NIAID peanut guideline khi relevant.

### 17.6 Freshness

- Safety-critical: verify ít nhất mỗi 6 tháng + trước major release.
- Health guidance khác: ít nhất yearly + trước substantive change.
- Có known newer edition/superseding policy → review sớm, không chờ scheduled date.
- Automated checker chỉ flag; không thay semantic human verification.

### 17.7 Honest review labeling

Không ghi **clinically reviewed** nếu chưa thật sự có qualified clinician review.

Với solo-maintained product:

- direct/faithful restatement từ current official guidance có thể ship ở `source-verified` nếu pass release checks;
- original synthesis làm thay đổi interpretation, safety-critical branching, contraindication logic hoặc `urgent`/`emergency` wording phải `clinical-review-required` trừ khi map trực tiếp, rõ ràng vào official instruction;
- content chưa review bắt buộc không được trình bày như clinician-approved.

### 17.8 Current source correction giữ từ v0.2.0

`Dietary Guidelines for Americans, 2025–2030` là current federal edition; `2020–2025` là superseded.

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
Evidence synthesis
Typical pattern
Example plan
Practical interpretation
Product heuristic
```

Không giấu hết trong source drawer.

### 18.5 Stage navigator

Horizontal chips, no visible scrollbar, arrows, swipe/drag, current stage khác browsed stage, browse không đổi actual child stage.

---

## 19. Responsive, print, accessibility

### Responsive

Mobile-first, no essential hover-only action, form 1 cột trên màn nhỏ, timeline không overflow ngang.

### Print

Hỗ trợ Letter/A4, in Now/current stage/all stages. Bỏ controls/nav, giữ pastel phân biệt nhưng print-safe, không background gradient gây tốn mực, giữ motif khi không làm layout bị cắt, tránh split logical card nếu có thể.

### Accessibility

Keyboard, focus visible, semantic HTML, ARIA khi cần, screen-reader announcements hợp lý, reduced motion, không dùng màu là tín hiệu duy nhất.

---

## 20. Technical architecture

### 20.1 Contract

v1 static-first, client-personalized.

**Preferred:** Next.js + TypeScript + static export.

Có thể thay framework nếu vẫn giữ:

- static deployment;
- strict type safety;
- build-time schema/content validation;
- client-only child personalization;
- public profile-free age/topic pages;
- no backend v1;
- deterministic resolvers;
- bilingual integrity;
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

### 20.3 Domain registry

Không hard-wire toàn sản phẩm vào đúng 3 domain. Initial IDs: `feeding`, `development`, `sleep`, `safety`; future domain phải dùng cùng content/provenance contract.

### 20.4 Separation rules

- Date math không ở UI component.
- Medical prose không ở business logic.
- i18n không duplicate domain logic.
- Sleep heuristic không lưu như medical claim.
- Actual safety context không lấy từ browsed-stage UI state.
- SEO/public page không fork medical guidance khỏi canonical graph.
- Monetization code không được tác động claim/source resolution.

### 20.5 Deployment

Static host + GitHub-driven deployment. Public age/topic pages pre-render khi phù hợp; child profile chỉ apply client-side, không gửi server/build.

---

## 21. Functional requirements

- **FR-001 Browse:** useful age/topic guidance không cần profile.
- **FR-002 Profile:** optional local profile; DOB chỉ required cho personalized mode, display name optional.
- **FR-003 Age engine:** chronological + corrected-development.
- **FR-004 Independent domains:** feeding/development/sleep/safety resolve độc lập.
- **FR-005 Why this stage:** giải thích khi age basis khác nhau.
- **FR-006 Browsing isolation:** browse/preview không đổi actual safety context.
- **FR-007 Feeding:** what/how/readiness/texture/nutrient/allergen/choking/drink/formula handling/clinician guidance + source traceability.
- **FR-008 Development:** milestone context + practical progression không pass/fail.
- **FR-009 Sleep:** official duration tách typical/example.
- **FR-010 Newborn rhythm:** 0–2m mặc định responsive-rhythm.
- **FR-011 Sleep methods:** settling khác formal behavioral methods; method-specific eligibility.
- **FR-012 Safe sleep:** resolve từ actual-child infant scope/current ability.
- **FR-013 Now composer:** combine independent output; sleep không prescribe feed frequency; safety override example plan khi cần.
- **FR-014 Evidence-to-action:** hỗ trợ Know/Do/Why/Watch/Source mà không đổi meaning/precision.
- **FR-015 Language/theme:** persist độc lập.
- **FR-016 Sources/trust metadata:** expose source, evidence class, applicability, review metadata, methodology.
- **FR-017 Public routes:** static age/topic pages dùng cùng canonical content graph.
- **FR-018 Print:** current/all supported print clean.

---

## 22. Non-functional requirements

- **Privacy:** profile không rời browser; general guidance dùng được không profile.
- **Performance:** static load nhanh, JS hợp lý, không third-party dư thừa.
- **Reliability:** localStorage fail vẫn dùng được; same input/contentVersion → same output.
- **Accessibility:** keyboard/screen reader/contrast/reduced-motion/print.
- **Security:** no raw HTML injection, safe links, CSP khi có thể, dependency scanning.
- **Maintainability:** strict types, centralized date/content schemas, no duplicate theme/i18n logic, no monolithic production HTML.
- **Traceability:** presentation → block/action → claim → source → status → review → translation.
- **Determinism:** same profile/planDate/contentVersion/preferences → same output.
- **Precision integrity:** không layer nào được tăng medical precision vượt source.
- **Commercial independence:** ads/sponsor/affiliate/paid entitlement không ảnh hưởng medical/safety content hay source resolution.
- **Content consistency:** public SEO, personalized, print và future retrieval không có canonical health guidance khác nhau.

---

## 23. Testing/verification contract

### 23.1 Date/age

Test same-day birth, future DOB, browse không DOB, Feb 29, end-of-month, due date trước/sau DOB, đúng 21/22 ngày sớm, before due date, 24m transition, mọi stage boundary, timezone/DST, invalid dates.

### 23.2 Context isolation

- Browse không đổi actual stage/safety.
- Future preview không đổi current safety.
- Browse feeding stage lớn không unlock solids/allergen cho actual child nhỏ hơn.
- Browse toddler sleep không suppress infant safe sleep.
- Browse mode không vô tình tạo/store profile.

### 23.3 Feeding/Sleep

Giữ toàn bộ boundary tests hiện có: 4m không auto solids, readiness không all-true gate, allergy branches tách, formula safety đúng metadata; newborn responsive rhythm, sleep không set feed frequency, heuristic label đúng, method prerequisites đúng.

### 23.4 Precision/provenance

- `source-approximate` không render exact medical threshold.
- `source-range` giữ range.
- Exact value từ `product-heuristic` luôn label non-official.
- `Official guidance` phải có direct approved-source support.
- `Evidence synthesis` giữ đủ source IDs.
- Source conflict không được collapse thành fabricated consensus.

### 23.5 Source/content

- Mọi health claim có approved source hoặc explicit non-medical heuristic class.
- Source ID resolve.
- Superseded source không satisfy current requirement.
- Source superseded → dependent claim flag.
- Safety claim có review metadata.
- Không claim clinically reviewed nếu thiếu review metadata.
- Coverage complete; EN/VI parity; safety translation parity.

### 23.6 Public/personalized consistency

- Equivalent context → public page và personalized view resolve cùng canonical claim IDs.
- Child profile không xuất hiện trong generated URL/static output.
- SEO metadata không tạo unsupported health claim.

### 23.7 E2E/visual/accessibility

Test browse no-profile; personalize/save/edit/clear; storage blocked; EN/VI; Light/Dark; preview; navigation; WhyThisStage; Now adjustments; newborn mode; Sources/Methodology; print; desktop/mobile/Letter/A4 snapshots.

---

## 24. Điều kiện hoàn thành MVP

v1 chỉ release khi:

1. Browse không profile hữu ích và không cần child data.
2. Optional local profile hoạt động/degrade graceful.
3. Age/corrected proxy boundary-tested.
4. Domain resolvers độc lập.
5. Actual/browsed/preview context tách đúng.
6. Now không biến sleep thành feeding prescription.
7. Newborn default responsive rhythm.
8. Mọi stage có English content đầy đủ.
9. Vietnamese parity đầy đủ.
10. Feeding/Play/Sleep/Safety coverage đạt contract.
11. Infant safe-sleep scope đúng.
12. Claim-level source/evidence/precision/review traceable.
13. Không known superseded source đánh dấu current.
14. Source-conflict + no-invented-precision tests pass.
15. Public/personalized dùng chung canonical content graph.
16. Methodology, Sources, Editorial Policy, Medical Disclaimer published.
17. Coverage matrix pass.
18. Light/Dark/mobile/Letter/A4 QA pass.
19. Accessibility/typecheck/lint/unit/E2E/content validation/build pass.
20. Content cần qualified clinical review theo §17.7 phải được review hoặc loại khỏi production; không false clinician-review claim.

---

## 25. Thứ tự triển khai

1. Rename/brand HowToBaby; domain/design tokens/static export/CI.
2. Source registry + evidence class + precision model + lifecycle + schema.
3. Browse shell không profile + optional profile/storage/date/age engine.
4. Actual vs browsed vs preview context.
5. i18n + parity.
6. Public route framework + header/profile/stage navigator + trust pages + print.
7. Development/play migration + source audit.
8. Sleep duration/safe-sleep + sleep engine.
9. Newborn responsive rhythm.
10. Feeding + Feeding Safety.
11. Safety resolver + Now composer.
12. Settling + behavioral sleep library.
13. Static age/topic generation từ canonical graph.
14. Full source/precision audit + accessibility + visual QA + deployment automation.

Không làm final Now composer trước khi domain resolver, provenance, precision rules và safety-context isolation ổn định.

Không thêm monetization/AI trước khi canonical content/source pipeline đáng tin.

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
| Brand là HowToBaby / `howtobaby.com` | Accepted v0.3.0 | Phản ánh mission rộng hơn Feed/Play/Sleep tool bundle. |
| Promise “Know what your child needs. Right now.” | Accepted v0.3.0 | Tóm đúng giá trị contextualize official guidance. |
| External source có thẩm quyền; English là canonical product interpretation | Accepted v0.3.0 | Không giả product prose là medical authority. |
| Browse không profile | Accepted v0.3.0 | Tốt hơn cho privacy, public usefulness và discoverability. |
| Display name optional | Accepted v0.3.0 | Name chỉ cosmetic, không cần bắt buộc PII. |
| No invented precision | Accepted v0.3.0 | Exact age không được tạo false medical exactness. |
| Know/Do/Why/Watch/Source | Accepted v0.3.0 | Chuyển evidence thành action nhưng giữ rationale/provenance. |
| Public/personalized chung canonical content graph | Accepted v0.3.0 | Tránh SEO/app drift. |
| U.S. primary; WHO global cross-check/context | Accepted v0.3.0 | Phù hợp primary jurisdiction. |
| Không silent-average source conflict | Accepted v0.3.0 | Tránh consensus giả. |
| Core evidence/safety luôn free | Accepted v0.3.0 | Bảo vệ mission/trust nếu sau này monetize. |
| Commercial relationship không đổi canonical guidance | Accepted v0.3.0 | Tách revenue incentive khỏi evidence. |
| English canonical, Vietnamese paired | Retained | Tránh lệch nghĩa. |
| Birth–`<5y` | Retained | Phù hợp scope. |
| No backend v1 | Retained | Local/deterministic. |
| Domain-specific stage engines | Retained | Mỗi domain khác rule. |
| Corrected age tự động chỉ Development/Play | Retained | Không propagate sai. |
| `>21 days` là proxy, không diagnosis | Retained | Giữ đúng ý nghĩa. |
| 4–6m readiness education, không auto solids | Retained | Tránh age-only activation. |
| Newborn responsive rhythm | Retained | Tránh false clock precision. |
| Sleep không quyết định feeding frequency | Retained | Responsive feeding. |
| Settling tách behavioral intervention | Retained | Không universalize 4m. |
| Safe-sleep full scope birth–`<12m` | Retained | Safety scope rõ. |
| Claim-level source + lifecycle | Retained | Traceability/supersession. |
| DGA 2025–2030 current | Retained | 2020–2025 superseded. |
| Next.js/TS preferred, không immutable | Retained | Framework-independent contract. |
| No live AI medical advice v1 | Retained | Safety/traceability. |
| Baby-modern glass Light/Dark | Retained | Design requirement. |

---

## 28. Definition of done cho content change

Content change chưa done nếu chưa:

- cập nhật canonical English claim/action;
- mọi health/safety statement có evidence class đúng;
- mở/verify source URL và confirm title/scope/status;
- check source disagreement khi nhiều authority relevant;
- classify đúng evidence/safety/precision;
- evidence grade nếu hiển thị phải trace được về source, không phải grade do HowToBaby tự tạo;
- giữ qualifiers, uncertainty, age range, contraindication, stop condition;
- practical interpretation không mạnh/chính xác hơn source;
- cập nhật `reviewedAt`/`reviewStatus`;
- update Vietnamese semantic parity;
- pass coverage/source/provenance/precision checks;
- public/personalized equivalent context resolve cùng canonical claim IDs;
- review responsive/print;
- hoàn thành qualified review nếu §17.7 yêu cầu;
- release notes ghi recommendation change đáng kể.

---

## 29. Trust và monetization boundaries

### 29.1 v1

HowToBaby v1 miễn phí; không cần monetization mới được release.

### 29.2 Nội dung phải luôn free

Core age-appropriate evidence, safety guidance, source citation, escalation guidance, methodology và correction notice không được paywall.

### 29.3 Paid value hợp lý về sau

Nếu monetize, ưu tiên **convenience/workflow**, không bán “medical knowledge tốt hơn”: multi-child, encrypted sync, caregiver sharing, logs/history, reminder/stage notification, advanced export/print, cross-device continuity...

### 29.4 Ads/affiliate/sponsor

v1 không có. Nếu sau này có:

- phải tách/disclose rõ;
- không ảnh hưởng canonical recommendation/evidence label/ranking/safety;
- không gọi một commercial product là medically preferred nếu approved source không hỗ trợ;
- không bán child profile hoặc dùng nó cho behavioral ad targeting.

---

## 30. Public content và discoverability

HowToBaby vừa là personalized app vừa là public reference website.

Có thể generate static routes như:

```text
/6-months
/feeding/6-months
/play/6-months
/sleep/6-months
/safety/infant-sleep
/sources
/methodology
/editorial-policy
/medical-disclaimer
/changelog
```

Invariant: public/personalized cùng reviewed claims.

### SEO integrity

- Không tạo unsupported medical claim chỉ để kéo search traffic.
- Không clickbait/fear copy trái canonical tone.
- Title/description không được làm claim mạnh hơn source.
- Structured data không imply clinician authorship/review nếu không có.
- Child data không xuất hiện trong indexable URL/metadata.

### Trust pages

- **Methodology** — chọn/diễn giải/classify/translate/update source như nào;
- **Sources** — registry + status;
- **Editorial Policy** — conflict, correction, AI assistance, commercial independence;
- **Medical Disclaimer** — scope + emergency limitations;
- **Changelog / Corrections** — recommendation changes/corrections đáng kể.

---

## 31. Future AI / Ask HowToBaby policy

Chỉ thêm **Ask HowToBaby** sau khi canonical content graph/source governance ổn định.

- Retrieval health guidance chỉ từ approved HowToBaby claims/sources.
- Mọi substantive health answer phải expose citation/provenance.
- Model được explain/organize, không invent diagnosis, dose, contraindication hay unsupported recommendation.
- Giữ uncertainty/source disagreement.
- High-risk/emergency intent theo reviewed escalation policy.
- Generated answer không tự động trở thành canonical content.
- AI có thể hỗ trợ draft/translation nội bộ nhưng source verification + semantic review vẫn bắt buộc.
- Không market assistant như pediatrician/clinician replacement.

---

## 32. Tuyên bố sản phẩm cuối cùng

HowToBaby phải trở thành một **evidence-to-action layer đáng tin cho phụ huynh**: nơi caregiver có thể biết ngay ở giai đoạn hiện tại điều gì quan trọng, hành động thực tế nào hợp lý, vì sao, variation nào bình thường, khi nào cần tìm trợ giúp và chính xác guidance dựa trên authority nào.

Giá trị dài hạn không đến từ việc tạo nhiều medical information hơn CDC, AAP, FDA, USDA/HHS, NIH, WHO... mà từ việc làm cho guidance của họ **đúng context, dễ điều hướng, thực tế, song ngữ, minh bạch và luôn được cập nhật** mà không biến generalized evidence thành false individualized medicine.
