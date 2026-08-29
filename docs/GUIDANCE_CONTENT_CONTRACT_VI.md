# GUIDANCE_CONTENT_CONTRACT — Bản tiếng Việt

> Bản English là canonical. File này giữ cùng contract để đọc/review.

## Evidence model

```text
SourceRecord → Claim → Applicability → GuidanceBlock/Action → Translation → Presentation
```

Guidance classes: `official-guidance`, `evidence-synthesis`, `typical-pattern`, `example-plan`, `practical-interpretation`, `product-heuristic`.

Precision classes: `source-exact`, `source-approximate`, `source-range`, `product-heuristic`.

Không được biến “around 6 months” thành exact day threshold chỉ vì app biết DOB.

## Age/context

Dùng calendar-date math; timezone-independent comparisons; half-open range. Corrected-age proxy:

```text
earlyByDays = EDD - DOB
likelyPretermByDueDateProxy = earlyByDays > 21
useCorrectedDevelopmentAge = proxy AND chronologicalAge < 24m
correctedDevelopmentAge = planDate - EDD
```

Đây là implementation proxy, không phải diagnosis.

## Development/Play stages

`0–<2m`, `2–<4m`, `4–<6m`, `6–<9m`, `9–<12m`, `12–<15m`, `15–<18m`, `18–<24m`, `24–<30m`, `30–<36m`, `3–<4y`, `4–<5y`.

Milestones là reference, không pass/fail. Khi dùng CDC checklist và tuổi nằm giữa hai checklist, chọn checklist nhỏ hơn theo instruction của CDC, không tự interpolate threshold mới.

## Feeding stages

- `0–<4m`: milk/formula + responsive feeding + safety.
- `4–<6m`: readiness/preparation; **không** auto solids.
- khoảng `6–<8m`: complementary foods khi ready, iron-rich foods, allergens, safe textures.
- `8–<12m`: texture/finger food/cup/self-feeding.
- `12–<24m`: family foods/meals/snacks/milk transition.
- `2–<3y`: toddler nutrition/repeated exposure.
- `3–<5y`: preschool family meals/independence.

Stage boundary là resolver bin, không tự trở thành medical threshold.

## Sleep stages

Giữ stage map từ prototype nhưng nap count/wake window/exact duration chỉ là Typical/Example/Heuristic. Phải tách:

1. official sleep-duration;
2. safe sleep;
3. typical transition;
4. heuristic wake windows/schedules;
5. settling education;
6. behavioral methods.

`<4m`: không formal behavioral protocol. `>=4m` không tự đồng nghĩa mọi method phù hợp.

## Safe sleep

```text
fullInfantSafeSleepScope = birth to <12 months
```

Browsing/tập ngủ/rolling/corrected age không tự relax safety.

## Context isolation

Actual child, browsed stage và preview plan date tách state. Browse không mutate profile; older stage không unlock safety cho child nhỏ hơn.

## Now composer

Sleep có thể làm temporal structure nhưng không prescribe feeding frequency. Responsive feeding và Safety có thể override aesthetic timeline.

## Translation

English → source verification → review → Vietnamese → parity validation → release. Vietnamese phải giữ age/approximation/negation/urgency/quantity/contraindication/stop condition.

## Source hierarchy/governance

Với U.S. users, ưu tiên nguồn phù hợp theo thứ tự: U.S. primary/public-health (CDC/FDA/USDA-HHS/NIH...), AAP official policy/guidance, professional society khác khi cần, WHO cho global guidance/cross-check, rồi systematic review/peer-reviewed evidence khi official guidance chưa đủ.

Blog, retailer/manufacturer marketing, influencer, search snippet không được làm canonical health source. Không tự merge U.S. và WHO khi khác nhau đáng kể.

Seed registry tối thiểu phải cover current CDC development/nutrition, Dietary Guidelines 2025–2030, FDA formula/Cronobacter, AAP corrected age/safe sleep, WHO infant feeding/under-5 guidance khi dùng, và approved allergy guidance như NIAID peanut khi relevant.

## Freshness/supersession

- Safety-critical source: verify ít nhất mỗi 6 tháng + trước major release.
- Health guidance khác: ít nhất hàng năm + trước substantive change.
- Có edition/policy mới thì review sớm dù chưa tới scheduled date.
- Automation detect change nhưng không thay semantic review.

```text
source superseded → dependent claims review-required → affected pages/tools flag → verify replacement → revise/approve
```

## Honest review states

Không ghi clinically reviewed nếu chưa có qualified clinician review thật. Faithful official restatement có thể `source-verified`; synthesis làm thay đổi interpretation/contraindication hoặc urgent/emergency wording nên `clinical-review-required` trừ khi map trực tiếp rõ ràng vào official instruction.


## Provenance v0.6.0

Canonical graph được mở rộng thành:

```text
SourceRecord → ClaimSourceRef + SourceLocator → Claim → Applicability → Guidance/Action → Translation → Presentation
```

`official-guidance` health/safety claim bắt buộc có ít nhất một approved `primary`/`direct-support` source phù hợp scope. `evidence-synthesis` phải khai báo các authority quan trọng đã dùng; disagreement không được average/giấu. Chi tiết schema, Evidence Drawer, page References, original link và copyright boundary thuộc `EVIDENCE_PROVENANCE.md`.

Content change chưa done nếu source relationship/locator chưa update, original link chưa verify và citation UI chưa generate được từ canonical provenance.

## Definition of done cho content change

Update English + verify source/scope/status + giữ qualifier/uncertainty/contraindication + check conflict + update review metadata + update VI parity + pass validation + kiểm tra public/Now/print/guidance-linked tools + hoàn tất required qualified review + ghi changelog khi recommendation đổi.


## Storage invariant — v0.6.0

Guidance/provenance canonical vẫn nằm trong YAML/structured text được Git track theo `REPOSITORY_STRUCTURE.md`. SQLite/JSON index chỉ là projection để validate/query/render, phải rebuild được và không được trở thành nguồn edit độc lập.


## Repository storage — v0.7.0

Claim/provenance canonical vẫn là authored Git text; generated SQLite/index và full third-party source body không phải canonical và tuân theo `REPOSITORY_HEALTH.md`.

## Licensing boundary — v0.8.0

Canonical claim do HowToBaby tự viết có thể dùng `CC-BY-NC-SA-4.0`, nhưng provenance phải giữ quyền upstream tách biệt. Không copy wording của nguồn chính thức vào canonical content chỉ để citation dễ hơn. Chi tiết: `LICENSING_POLICY.md`.
