# TOOL_PLATFORM — Bản tiếng Việt

> Tools là first-class feature nhưng tách khỏi evidence-backed guidance.

## Tool classes

```text
utility
guidance-linked
safety-sensitive
```

`utility`: hữu ích mà không cần health claim, ví dụ lullaby player/timer.

`guidance-linked`: output dựa canonical claims.

`safety-sensitive`: output sai có thể ảnh hưởng safety, cần gate nghiêm hơn.

## Tool Registry

Mỗi tool có `id`, `slug`, `titleKey`, `descriptionKey`, `category`, `toolClass`, `ageApplicability`, `requiresProfile`, `guidanceClaimIds`, `safetyClaimIds`, `module`.

Hub/route/nav sinh từ registry, không hard-code từng tool.

## Audio tools ban đầu

- Lullaby Player.
- Ambient/Frequency Player, có thể có 432 Hz preset.

Shared audio engine dùng HTMLMediaElement/Web Audio API. AudioContext chỉ start/resume sau user gesture.

## 432 Hz

Có thể là audio preference/preset. Không được quảng bá là medically superior, sleep therapy, developmental benefit... nếu chưa có approved evidence.

## Audio safety

- không autoplay;
- có stop rõ;
- volume UI chỉ là device level, không đồng nghĩa dB ở tai bé;
- safety guidance nếu có phải reference canonical claim IDs;
- không hard-code safety medical prose trong tool.

## Guidance-linked tool

Tool reference claim IDs rồi resolver lấy content; không copy/paste claim vào tool code.

## Calculator/planner

Arithmetic tách khỏi medical interpretation. Exact schedule output phải label Example/Heuristic nếu source không quy định exact target.

## Future tracking

Không compliance scoring, không tự diagnosis, không guilt-based streak. Local-first cho đến khi sync architecture được approve.


## Provenance cho guidance-linked Tool

Tool có health/safety guidance chỉ tham chiếu canonical `guidanceClaimIds`; Tool không hard-code medical prose hoặc source URL riêng. Khi render claim, Tool kế thừa cùng `ClaimSourceRef/Locator`, SourceChip/EvidenceDrawer và source status như guidance page.

Nếu source/claim vào trạng thái `changed-review-required`, safety-sensitive Tool phải theo release/safety gate của claim thay vì tiếp tục dùng stale copy ẩn.

## Theme independence — v0.6.0

Tool UI dùng HowToBaby primitives/Theme Contract như phần còn lại của app. Tool không import trực tiếp theme vendor; theme mua ngoài chỉ thay presentation qua adapter và không được đổi Tool semantics/safety/evidence.


## Media storage — v0.7.0

Tool definition/audio metadata lưu Git; media library lớn thì không. Fixture nhỏ có license rõ ràng có thể nằm trong repo khi dev/MVP, nhưng production audio/video collection nên chuyển sang object storage/CDN khi bắt đầu đáng kể về dung lượng. Git LFS không phải kiến trúc media mặc định. Theo budget trong `REPOSITORY_HEALTH.md`.
