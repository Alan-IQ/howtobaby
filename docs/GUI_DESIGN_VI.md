# GUI_DESIGN — Bản tiếng Việt

> Bản English là canonical. Theme ban đầu là **Baby Modern Glass**; GUI giữ contract trải nghiệm, còn tích hợp kỹ thuật theme tự xây/theme React mua ngoài thuộc `THEME_SYSTEM.md`.

## UX direction

Calm, modern, warm, trustworthy; dễ scan trên mobile; professional hơn parenting blog nhưng không quá clinical.

## Navigation

**Now · Feeding · Play & Development · Sleep · Safety · Tools**.

Sources/Methodology/Editorial/Disclaimer/Changelog là trust destinations global.

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

Light: sáng nhưng không nhạt/chìm; card đủ opacity/border, text strong.

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

## Accessibility

Keyboard, focus, contrast, reduced motion/transparency, no color-only semantics, audio controls có accessible labels.


## Evidence/provenance UI v0.6.0

Citation nên có ba lớp:

1. **SourceChip** ngay card/claim: `Official guidance · CDC · WHO`.
2. **EvidenceDrawer** khi click: exact source title, relationship, section/page locator, jurisdiction, last verified, status, `View original source`, interpretation/conflict note.
3. **Sources used on this page** cuối page, auto-generate và dedupe từ các claim đang render.

Hỗ trợ `/evidence/<slug>` để xem claim + source + history và `/sources` để browse registry. Đây là read model từ canonical data, không author content lần hai.

External evidence link phải rõ là source gốc, không affiliate tracking. Nếu source vừa thay đổi có thể hiện `Reviewing an update`; không biến trạng thái này thành alert nguy hiểm nếu nội dung không phải emergency.

Print cũng lấy References từ cùng provenance graph và nên mang content version/verification context.

## Theme mua/third-party — v0.6.0

HowToBaby cho phép dùng theme React mua ngoài nếu chất lượng tốt, nhưng UI/domain component chỉ dùng Theme Contract và HowToBaby primitives. Vendor theme có thể cung cấp token, primitive implementation hoặc shell/layout adapter; không được thay đổi route semantics, age logic, evidence/safety hay canonical content. License/redistribution phải được kiểm tra trước khi commit code/assets. Chi tiết: `THEME_SYSTEM.md`.


## Bổ sung v0.8.0 — legal/source footer

Production UI phải có global footer/surface truy cập được tới Sources/Methodology, Medical Disclaimer, Privacy, License, Source Code khi cần theo AGPL, và Changelog/Corrections. Vendor theme không được làm mất các link pháp lý/trust bắt buộc này. Chi tiết license: `LICENSING_POLICY.md`.
