// SPDX-License-Identifier: AGPL-3.0-only
/**
 * App/page UI copy as key/message dictionaries (@howtobaby/i18n framework): navigation, header
 * controls, footer, and page chrome/prose. ONE dictionary per app — every locale must define
 * every key (compile-checked), so app copy can never ship half-translated.
 *
 * Every currently shipped user-facing page follows the ONE global language preference — the
 * trust/legal pages included; there is no English-only page exception. Boundaries: canonical
 * guidance/claim text and evidence vocabulary stay in @howtobaby/knowledge and
 * features/evidence/labels. Not translated, ever: exact original source titles, organization
 * and proper names (including "HowToBaby"), URLs, license identifiers such as `AGPL-3.0-only`
 * and `CC BY-NC-SA 4.0`, and canonical identifiers/IDs — their surrounding labels localize.
 *
 * Key semantics: `nav.*.label` is the SHORT navigation label only (e.g. "Play"); the domain's
 * display title — destination cards, page titles — is `domain.*.title` (e.g. "Play &
 * Development"). Never reuse a navigation label as a content/destination title.
 */

import { defineMessages } from "@howtobaby/i18n";

export const MESSAGES = defineMessages({
  en: {
    // App chrome / accessibility.
    "app.skipToContent": "Skip to content",
    "app.brandHome.label": "home",

    // Navigation (SHORT labels only — never a destination/content title).
    "nav.primary.label": "Primary",
    "nav.now.label": "Now",
    "nav.feeding.label": "Feeding",
    "nav.play.label": "Play",
    "nav.sleep.label": "Sleep",
    "nav.safety.label": "Safety",
    "nav.tools.label": "Tools",

    // Domain display titles (destination cards + page titles — full names).
    "domain.now.title": "Now",
    "domain.feeding.title": "Feeding",
    "domain.play.title": "Play & Development",
    "domain.sleep.title": "Sleep",
    "domain.safety.title": "Safety",
    "domain.tools.title": "Tools",

    // Header presentation controls.
    "language.control.label": "Language",
    "language.menu.label": "Choose language",
    "theme.colorMode.label": "Colour mode",
    "theme.colorMode.light": "Light",
    "theme.colorMode.dark": "Dark",
    "theme.colorMode.system": "Match device",
    "theme.family.label": "Theme",

    // Shared actions.
    "action.print.label": "Print this page",

    // Footer.
    "footer.trust.label": "Trust and legal",
    "footer.external.icon": "opens external site",
    "footer.disclaimer":
      "HowToBaby is a practical parent reference, not a medical record, diagnostic tool, developmental screening test, emergency service, or substitute for pediatric care.",
    "footer.licenses": "Software AGPL-3.0-only · Original content CC BY-NC-SA 4.0 · HowToBaby name and logo are not covered by those licenses.",

    // Trust/legal link labels + shared eyebrow.
    "trust.eyebrow": "Trust",
    "trust.sources.label": "Sources",
    "trust.methodology.label": "Methodology",
    "trust.editorialPolicy.label": "Editorial Policy",
    "trust.disclaimer.label": "Medical Disclaimer",
    "trust.privacy.label": "Privacy",
    "trust.license.label": "License",
    "trust.sourceCode.label": "Source Code",
    "trust.changelog.label": "Changelog / Corrections",

    // Now (home).
    "page.home.title": "Know what your child needs. Right now.",
    "page.home.lede": "Evidence-based guidance and practical tools for parents, organized around your child’s current stage.",
    "page.home.blurb.feeding": "What, how and when to feed, by stage and readiness.",
    "page.home.blurb.play": "Play ideas and development context for the current stage.",
    "page.home.blurb.sleep": "Sleep patterns, safe-sleep basics and example routines.",
    "page.home.blurb.safety": "Age-relevant safety priorities, clearly ranked.",
    "page.home.blurb.tools": "Practical utilities: calculators, routines, soothing sounds.",
    "page.home.how.title": "How HowToBaby works",
    "page.home.how.p1":
      "HowToBaby organizes approved guidance from public-health authorities by age and context, keeps each statement linked to its source, and turns it into practical actions — without inventing precision the source does not have.",
    "page.home.how.p2":
      "HowToBaby now includes its first evidence-backed guidance, beginning with Feeding; each statement links to its original source. You can browse every age stage without creating a profile. If you choose to add one, the child profile stored on your device shows which stage your child is in today. Additional personalization on Now and the remaining topics will be added as their content completes evidence checks and review.",

    // Shared destination scaffolding.
    "section.placeholder.title": "What will be added here",
    "section.placeholder.note":
      "This section is already part of HowToBaby, but guidance appears here only after it has been written, checked against its sources, and reviewed. Unreviewed guidance is never published.",

    // Feeding.
    "page.feeding.lede": "Feeding guidance by stage and readiness, with the source behind every statement.",
    "page.feeding.hold.p1":
      "Breastfeeding and formula feeding, starting solids, food textures, responsive feeding, allergen introduction, and feeding safety — organized by stage and readiness rather than a single age cut-off, with each statement linked to its original source.",
    "page.feeding.hold.p2":
      "Guidance appears here only after it has been written, checked against its sources, and reviewed. Unreviewed guidance is never published. More Feeding guidance will be added in a later phase.",
    "guidance.feeding.eyebrow": "Starting solids",

    // Play & Development.
    "page.play.lede": "Age-relevant play ideas and development context, without pass/fail milestones.",
    "page.play.hold.p1":
      "Developmental stages, milestone context, activities and variations, and how corrected age is used — presented to support play and connection, not as a screening test.",

    // Sleep.
    "page.sleep.lede": "Typical sleep patterns, safe-sleep basics and editable example routines.",
    "page.sleep.hold.p1":
      "Official sleep-duration guidance, safe-sleep guidance, responsive approaches for newborns, clearly labeled estimates for nap counts and wake windows, and adjustable example schedules.",

    // Safety.
    "page.safety.lede": "Age-relevant safety priorities, ranked by severity and kept visible in every theme.",
    "page.safety.hold.p1":
      "Safety guidance always follows your child’s current age. Browsing another stage never hides guidance that applies to your child and never makes guidance for another age apply automatically.",

    // Tools.
    "page.tools.lede": "Practical tools for parents. A tool is a utility first; being included in HowToBaby does not imply a health benefit.",
    "page.tools.hold.p1":
      "Grouped by purpose — Soothe & Sound, Plan & Routine, Calculate, Print & Share — with clear labels showing whether a tool is purely utility or linked to guidance.",

    // Evidence detail.
    "page.evidence.eyebrow": "Evidence",
    "page.evidence.lede": "What this claim says, which original sources support it, and when it was last verified.",
    "page.evidence.claim.title": "Claim",
    "page.evidence.sources.title": "Supporting sources",
    "page.evidence.original.title": "Original sources",

    // Sources trust page.
    "page.sources.lede": "The original sources HowToBaby uses to build its guidance.",
    "sources.usedByClaims.one": "Used by 1 published claim",
    "sources.usedByClaims.many": "Used by {count} published claims",
    "sources.generatedNote":
      "Every record above is maintained as reviewed data in the public repository; this page is generated from it and is never edited by hand.",
    "sources.browseRepository": "Browse the repository",

    // Methodology trust page.
    "page.methodology.lede": "How an original source becomes a HowToBaby claim, and how freshness and review work.",
    "methodology.p1":
      "HowToBaby interprets, cites and links. Each statement is classed (official guidance, evidence synthesis, typical pattern, example plan, practical interpretation or product heuristic), tied to one or more source records with a locator, and reviewed before it ships. Qualifiers such as “about”, “may” or “when ready” are preserved rather than sharpened into invented precision.",
    "methodology.p2":
      "Every source’s provenance and review state is tracked in the canonical model. When a change to a source is recorded, the claims that depend on it are marked for review — guidance is never rewritten automatically. Automated source monitoring belongs to a later phase.",
    "methodology.note": "The full methodology is documented alongside the evidence pipeline as it is implemented.",

    // Editorial policy trust page.
    "page.editorialPolicy.lede": "Who writes and reviews HowToBaby content, and what may not be published.",
    "editorialPolicy.p1":
      "English content is authored and reviewed first; Vietnamese must preserve the same meaning, quantities, negations, urgency and age boundaries. Official-guidance statements require direct support from an approved primary source. Disagreement between sources stays visible; it is never averaged away.",
    "editorialPolicy.p2":
      "AI assistance may help with retrieval, drafting or translation, but nothing becomes canonical without the required source verification and human review.",

    // Medical disclaimer trust page.
    "page.disclaimer.lede": "What HowToBaby is — and is not.",
    "disclaimer.p1.lead": "HowToBaby is a practical parent reference.",
    "disclaimer.p1.rest": "It is not a medical record, diagnostic tool, developmental screening test, emergency service, or substitute for pediatric care.",
    "disclaimer.p2":
      "Age helps HowToBaby select guidance that may be relevant to your child, but age alone cannot tell whether your child is ready, whether a particular recommendation is right for them, or how they are developing. Always follow the advice of your child’s clinician, and contact local emergency services in an emergency.",

    // Privacy trust page.
    "page.privacy.lede": "Local-first by design.",
    "privacy.p1":
      "Personalization in HowToBaby is local-first: the optional child profile (date of birth, and optionally a due date and a display name) stays in your browser on this device and is never sent to a server, placed in a URL or page metadata, or included in analytics or logs. You can remove it at any time from Now.",
    "privacy.p2":
      "Beyond that optional profile, the site stores only local presentation preferences in your browser — your theme and colour-mode choice and your language choice. There are no analytics or tracking scripts.",

    // License trust page.
    "page.license.lede": "Software, content and brand are licensed separately.",
    "license.software.term": "Software",
    "license.software.rest": "is licensed under AGPL-3.0-only.",
    "license.content.term": "Original HowToBaby knowledge, documentation and translations",
    "license.content.rest": "are licensed under CC BY-NC-SA 4.0 where the project holds the rights.",
    "license.p2":
      "Cited guidance from public-health authorities remains under its original rights — provenance is not relicensing. The HowToBaby name and logo are not covered by either license.",
    "license.readMap": "Read the full license map",
    "license.sourceCode": "Source code",

    // Changelog trust page.
    "page.changelog.lede": "Parent-facing changes and corrections, in one place.",
    "changelog.p1":
      "When published guidance changes meaning, or a correction is made, it is recorded here with the date and the affected content. This page is generated from the content version history once guidance is published.",
    "changelog.status":
      "Current release: the core site experience, theme system, the first evidence-backed guidance, age-based browsing, and an optional child profile stored on your device. Additional topics are being added phase by phase.",

    // Not found / common error UI.
    "notFound.title": "Page not found",
    "notFound.lede": "That address does not exist here. It may have moved, or the link may be incomplete.",
    "notFound.backHome": "Back to Now",

    // Local content-language override on guidance surfaces.
    "guidance.contentLanguage.label": "Guidance language",

    // Child profile (local-only, optional; PROJECT_PROFILE §6).
    "profile.title": "Your child",
    "profile.lede": "Optional. This information stays on this device, is never sent to a server, and never appears in the URL.",
    "profile.dob.label": "Date of birth",
    "profile.edd.label": "Estimated due date (optional)",
    "profile.edd.hint": "Used only to decide when Play & Development guidance should use corrected age. This information is not used for diagnosis.",
    "profile.name.label": "Name (optional, display only)",
    "profile.save": "Save on this device",
    "profile.remove": "Remove profile",
    "profile.edit": "Edit",
    "profile.cancel": "Cancel",
    "profile.error.dob-required": "Enter your child’s date of birth.",
    "profile.error.dob-invalid": "That is not a valid date.",
    "profile.error.dob-future": "The date of birth cannot be after today.",
    "profile.error.edd-invalid": "That due date is not a valid date.",
    "profile.error.name-too-long": "The name can be at most 40 characters.",
    "profile.persistence.unavailable": "This browser could not save the profile. It will work for this visit, but it will not be saved after you reload the page.",
    "profile.persistence.clearFailed":
      "HowToBaby could not remove the saved profile from this browser. The profile will not be used for this visit, but it may appear again after you reload the page.",
    "profile.empty": "No profile yet. You can still browse every stage without one.",
    "profile.saved.dob": "Date of birth",
    "profile.saved.edd": "Estimated due date",

    // Child summary / age context.
    "summary.child.generic": "Your child",
    "summary.age.label": "Age today",
    "summary.correctedAge.label": "Corrected age",
    "summary.corrected.note":
      "Your child was born {early} before the due date, so Play & Development guidance uses corrected age until 24 months after birth. This is only a rule for selecting guidance, not a diagnosis.",
    "summary.corrected.limit": "Your child was born {early} before the due date. From 24 months after birth, Play & Development guidance uses chronological age.",
    "summary.beforeBirth": "The date of birth you entered is after today’s date on this device.",
    "summary.outOfScope": "HowToBaby currently covers children from birth until their fifth birthday.",
    "summary.stage.label": "Current stage by topic",
    "summary.stage.unresolved": "Not determined",
    "summary.safeSleep.inScope": "Safe-sleep guidance for infants under 12 months still applies to your child.",

    // Browse by age / stage navigation.
    "browse.byAge.title": "Browse by age",
    "browse.byAge.lede": "You can browse every stage without a profile. Age helps select guidance that may be relevant; it is not a measure of your child’s development.",
    "stage.nav.label": "Stages",
    "stage.nav.actualMarker": "your child's current stage",
    "stage.nav.scrollBack": "Earlier stages",
    "stage.nav.scrollForward": "Later stages",
    "stage.prev": "Previous stage",
    "stage.next": "Next stage",
    "stage.eyebrow.browsing": "Browsing",
    "stage.empty.title": "No guidance has been published for this stage yet",
    "stage.empty.note": "Guidance appears here only after it has been written, checked against its sources, and reviewed. Unreviewed guidance is never published.",

    // Why this stage.
    "why.title": "Why this stage?",
    "why.range": "This stage covers {range}.",
    "why.range.approx": "The source uses “about {min} months” as the starting point. This age range is used to organize content, not as a readiness threshold.",
    "why.noProfile": "You are viewing this stage directly. Add your child’s date of birth on Now to see which stage applies today. Viewing another stage never changes the profile.",
    "why.basis.chronological": "In this topic, your child’s stage is based on age from birth: {age}.",
    "why.basis.corrected": "In this topic, your child’s stage is based on corrected age: {age} (born {early} before the due date).",
    "why.basis.correctedBeforeDue": "It is {time}, so no corrected-age stage applies in this topic yet.",
    "why.relation.actual": "This is your child's current stage.",
    "why.relation.earlier": "Your child has already passed this stage (current stage: {stage}).",
    "why.relation.later":
      "Your child has not reached this stage yet (current stage: {stage}). Reading ahead does not make guidance for older children apply early; safety guidance still follows your child’s current age.",
    "why.relation.unresolved": "Your child's stage here is not resolved yet.",
    "why.preview": "On {date}, your child is in {stage}.",
    "why.disclaimer": "Age helps HowToBaby select guidance that may be relevant to your child, but age alone cannot tell whether your child is ready or how they are developing.",

    // Preview plan date (session only).
    "preview.title": "View another date",
    "preview.lede": "Choose a date to see which stage your child is in then. Safety guidance always follows your child’s current age.",
    "preview.date.label": "Date to view",
    "preview.age.label": "Age on that date",
    "preview.beforeBirth": "Before your child’s date of birth",
    "preview.clear": "Back to today",
    "preview.banner": "You’re viewing {date}, not today. Safety guidance still follows your child’s current age.",
    "preview.needsProfile": "Add your child’s date of birth to view another date.",

    // Safety context (actual child only).
    "safety.context.title": "Safety by age",
    "safety.context.noProfile": "Safety guidance is organized by age from birth. Without a profile, you can still browse every safety topic; the guidance here does not change with the stage you are viewing elsewhere.",
    "safety.context.actual": "Today your child is {age}. Safety guidance always follows your child’s current age from birth. Viewing another stage or another date does not change that.",
  },
  vi: {
    "app.skipToContent": "Chuyển đến nội dung chính",
    "app.brandHome.label": "trang chủ",

    "nav.primary.label": "Điều hướng chính",
    "nav.now.label": "Hiện tại",
    "nav.feeding.label": "Ăn uống",
    "nav.play.label": "Chơi",
    "nav.sleep.label": "Ngủ",
    "nav.safety.label": "An toàn",
    "nav.tools.label": "Công cụ",

    "domain.now.title": "Hiện tại",
    "domain.feeding.title": "Ăn uống",
    "domain.play.title": "Chơi & Phát triển",
    "domain.sleep.title": "Giấc ngủ",
    "domain.safety.title": "An toàn",
    "domain.tools.title": "Công cụ",

    "language.control.label": "Ngôn ngữ",
    "language.menu.label": "Chọn ngôn ngữ",
    "theme.colorMode.label": "Chế độ hiển thị",
    "theme.colorMode.light": "Sáng",
    "theme.colorMode.dark": "Tối",
    "theme.colorMode.system": "Theo thiết bị",
    "theme.family.label": "Giao diện",

    "action.print.label": "In trang này",

    "footer.trust.label": "Minh bạch & pháp lý",
    "footer.external.icon": "mở trang web bên ngoài",
    "footer.disclaimer":
      "HowToBaby là nguồn tham khảo thiết thực dành cho cha mẹ, không phải hồ sơ y tế, công cụ chẩn đoán, bài kiểm tra sàng lọc phát triển hay dịch vụ cấp cứu, và không thay thế việc chăm sóc nhi khoa.",
    "footer.licenses":
      "Phần mềm: AGPL-3.0-only · Nội dung gốc: CC BY-NC-SA 4.0 · Tên và logo HowToBaby không thuộc phạm vi của các giấy phép này.",

    "trust.eyebrow": "Minh bạch",
    "trust.sources.label": "Tài liệu tham khảo",
    "trust.methodology.label": "Phương pháp biên soạn",
    "trust.editorialPolicy.label": "Chính sách biên tập",
    "trust.disclaimer.label": "Miễn trừ trách nhiệm y tế",
    "trust.privacy.label": "Quyền riêng tư",
    "trust.license.label": "Giấy phép",
    "trust.sourceCode.label": "Mã nguồn",
    "trust.changelog.label": "Lịch sử thay đổi / Đính chính",

    "page.home.title": "Hiểu bé cần gì, ngay lúc này.",
    "page.home.lede":
      "Hướng dẫn dựa trên bằng chứng và các công cụ thiết thực dành cho cha mẹ, được sắp xếp theo giai đoạn hiện tại của bé.",
    "page.home.blurb.feeding": "Cho bé ăn hoặc bú gì, như thế nào và khi nào — theo giai đoạn và mức độ sẵn sàng của bé.",
    "page.home.blurb.play": "Gợi ý trò chơi và thông tin phát triển phù hợp với giai đoạn hiện tại của bé.",
    "page.home.blurb.sleep": "Nếp ngủ thường gặp, nguyên tắc ngủ an toàn và lịch sinh hoạt tham khảo.",
    "page.home.blurb.safety": "Các vấn đề an toàn phù hợp theo độ tuổi, được xếp rõ theo mức độ ưu tiên.",
    "page.home.blurb.tools": "Các tiện ích thiết thực: công cụ tính, lịch sinh hoạt và âm thanh giúp thư giãn.",
    "page.home.how.title": "HowToBaby hoạt động như thế nào",
    "page.home.how.p1":
      "HowToBaby sắp xếp các hướng dẫn chính thức từ các cơ quan y tế công cộng theo độ tuổi và bối cảnh, giữ từng nội dung luôn gắn với tài liệu gốc, rồi chuyển thành những việc cha mẹ có thể áp dụng trong thực tế — mà không diễn giải chính xác hơn mức tài liệu gốc cho phép.",
    "page.home.how.p2":
      "HowToBaby hiện đã có những hướng dẫn đầu tiên dựa trên bằng chứng, bắt đầu từ mục Ăn uống; mỗi nội dung đều liên kết đến tài liệu gốc. Bạn có thể xem mọi giai đoạn theo độ tuổi mà không cần tạo hồ sơ. Nếu muốn, hồ sơ của bé được lưu trên thiết bị sẽ cho biết hôm nay bé đang ở giai đoạn nào. Các phần cá nhân hóa khác của trang Hiện tại và những chủ đề còn lại sẽ tiếp tục được bổ sung khi nội dung hoàn tất kiểm chứng và rà soát.",

    "section.placeholder.title": "Nội dung sẽ được bổ sung tại đây",
    "section.placeholder.note":
      "Mục này đã có sẵn trong HowToBaby, nhưng hướng dẫn chỉ được hiển thị sau khi hoàn tất biên soạn, kiểm chứng tài liệu và rà soát. HowToBaby không đăng nội dung chưa được duyệt.",

    "page.feeding.lede":
      "Hướng dẫn ăn uống theo từng giai đoạn và mức độ sẵn sàng của bé, với tài liệu tham khảo rõ ràng cho từng nội dung.",
    "page.feeding.hold.p1":
      "Bú mẹ hoặc dùng sữa công thức, bắt đầu ăn dặm, kết cấu thức ăn, cho ăn theo tín hiệu của bé, làm quen với thực phẩm có khả năng gây dị ứng và an toàn khi ăn uống — được sắp xếp theo giai đoạn và mức độ sẵn sàng thay vì chỉ dựa vào một mốc tuổi; mỗi nội dung đều liên kết đến tài liệu gốc.",
    "page.feeding.hold.p2":
      "Nội dung chỉ xuất hiện tại đây sau khi hoàn tất biên soạn, kiểm chứng tài liệu và rà soát. HowToBaby không đăng nội dung chưa được duyệt. Các hướng dẫn Ăn uống còn lại sẽ được bổ sung ở giai đoạn sau.",
    "guidance.feeding.eyebrow": "Bắt đầu ăn dặm",

    "page.play.lede":
      "Gợi ý trò chơi và thông tin phát triển phù hợp theo độ tuổi, không biến các cột mốc phát triển thành bài kiểm tra đạt hay không đạt.",
    "page.play.hold.p1":
      "Các giai đoạn phát triển, thông tin giúp hiểu các cột mốc, hoạt động và biến thể, cùng cách sử dụng tuổi hiệu chỉnh — được trình bày để hỗ trợ việc chơi và gắn kết với bé, không dùng như một bài sàng lọc.",

    "page.sleep.lede": "Nếp ngủ thường gặp, nguyên tắc ngủ an toàn và lịch sinh hoạt tham khảo có thể điều chỉnh.",
    "page.sleep.hold.p1":
      "Khuyến nghị chính thức về thời lượng ngủ, hướng dẫn ngủ an toàn, cách đáp ứng tín hiệu ngủ của trẻ sơ sinh, các ước lượng tham khảo về số giấc ngủ ban ngày và khoảng thời gian thức, cùng các lịch mẫu có thể điều chỉnh.",

    "page.safety.lede":
      "Các ưu tiên an toàn theo độ tuổi, được sắp xếp theo mức độ nghiêm trọng và luôn dễ nhận biết ở mọi giao diện.",
    "page.safety.hold.p1":
      "Hướng dẫn an toàn luôn dựa trên tuổi hiện tại của bé. Việc xem một giai đoạn khác không làm ẩn hướng dẫn đang áp dụng cho bé và cũng không khiến hướng dẫn dành cho độ tuổi khác tự động áp dụng.",

    "page.tools.lede":
      "Các công cụ thiết thực dành cho cha mẹ. Một công cụ trước hết chỉ là tiện ích; việc xuất hiện trong HowToBaby không có nghĩa HowToBaby khẳng định công cụ đó có tác dụng đối với sức khỏe.",
    "page.tools.hold.p1":
      "Được nhóm theo mục đích — Âm thanh thư giãn, Lập kế hoạch & lịch sinh hoạt, Tính toán, In & chia sẻ — với nhãn rõ ràng cho biết công cụ chỉ là tiện ích hay có liên kết đến nội dung hướng dẫn.",

    "page.evidence.eyebrow": "Bằng chứng",
    "page.evidence.lede":
      "Nội dung này nói gì, những tài liệu gốc nào hỗ trợ và HowToBaby kiểm chứng lần cuối khi nào.",
    "page.evidence.claim.title": "Nội dung",
    "page.evidence.sources.title": "Tài liệu tham khảo",
    "page.evidence.original.title": "Tài liệu gốc",

    "page.sources.lede": "Danh mục tài liệu gốc mà HowToBaby sử dụng để xây dựng nội dung hướng dẫn.",
    "sources.usedByClaims.one": "Được dùng cho 1 nội dung hướng dẫn đã xuất bản",
    "sources.usedByClaims.many": "Được dùng cho {count} nội dung hướng dẫn đã xuất bản",
    "sources.generatedNote":
      "Mỗi tài liệu ở trên được quản lý dưới dạng dữ liệu đã qua rà soát trong kho mã nguồn công khai. Trang này được tạo tự động từ dữ liệu đó, không chỉnh sửa thủ công.",
    "sources.browseRepository": "Xem kho mã nguồn",

    "page.methodology.lede":
      "Cách HowToBaby chuyển một tài liệu gốc thành nội dung hướng dẫn, đồng thời quản lý việc kiểm chứng và rà soát theo thời gian.",
    "methodology.p1":
      "HowToBaby diễn giải, trích dẫn và liên kết đến tài liệu gốc. Mỗi nội dung được phân loại — hướng dẫn chính thức, tổng hợp bằng chứng, xu hướng thường gặp, kế hoạch mẫu, cách áp dụng thực tế hoặc gợi ý của HowToBaby — rồi gắn với một hay nhiều tài liệu cùng vị trí liên quan trong tài liệu đó và được rà soát trước khi xuất bản. Những từ thể hiện mức độ chắc chắn như “khoảng”, “có thể” hoặc “khi đã sẵn sàng” phải được giữ nguyên, không bị diễn giải thành một mốc chính xác hơn mức tài liệu gốc cho phép.",
    "methodology.p2":
      "Tài liệu gốc, lịch sử kiểm chứng và trạng thái rà soát được theo dõi trong mô hình dữ liệu chuẩn. Khi một thay đổi ở tài liệu gốc được ghi nhận, các nội dung phụ thuộc vào tài liệu đó sẽ được đánh dấu để rà soát lại; hệ thống không tự viết lại hướng dẫn. Tự động theo dõi thay đổi tài liệu gốc sẽ được triển khai ở giai đoạn sau.",
    "methodology.note": "Tài liệu phương pháp đầy đủ được cập nhật cùng với hệ thống bằng chứng trong quá trình triển khai.",

    "page.editorialPolicy.lede":
      "Ai biên soạn và rà soát nội dung HowToBaby, cùng những điều kiện bắt buộc trước khi xuất bản.",
    "editorialPolicy.p1":
      "Nội dung tiếng Anh được biên soạn và rà soát trước. Bản tiếng Việt phải giữ nguyên ý nghĩa, số liệu, câu phủ định, mức độ khẩn cấp và các mốc tuổi. Nội dung được phân loại là hướng dẫn chính thức phải có tài liệu chính đã được phê duyệt hỗ trợ trực tiếp. Nếu các tài liệu đưa ra khuyến nghị khác nhau, HowToBaby phải trình bày rõ thay vì làm mờ bằng cách gộp hoặc lấy trung bình.",
    "editorialPolicy.p2":
      "AI có thể hỗ trợ tìm tài liệu, soạn thảo hoặc dịch thuật, nhưng nội dung chỉ trở thành bản chuẩn sau khi hoàn tất việc kiểm chứng tài liệu và rà soát bởi con người theo yêu cầu.",

    "page.disclaimer.lede": "HowToBaby cung cấp gì — và những gì HowToBaby không thay thế.",
    "disclaimer.p1.lead": "HowToBaby là nguồn tham khảo thiết thực dành cho cha mẹ.",
    "disclaimer.p1.rest":
      "HowToBaby không phải hồ sơ y tế, công cụ chẩn đoán, bài kiểm tra sàng lọc phát triển hay dịch vụ cấp cứu, và không thay thế việc chăm sóc nhi khoa.",
    "disclaimer.p2":
      "Độ tuổi giúp HowToBaby chọn những hướng dẫn có thể phù hợp với bé, nhưng không thể chỉ dựa vào tuổi để biết bé đã sẵn sàng, một khuyến nghị cụ thể có phù hợp với bé hay bé đang phát triển như thế nào. Hãy luôn làm theo lời khuyên của bác sĩ hoặc nhân viên y tế đang chăm sóc bé. Trong tình huống khẩn cấp, hãy liên hệ dịch vụ cấp cứu tại nơi bạn ở.",

    "page.privacy.lede": "Thiết kế ưu tiên dữ liệu lưu trên thiết bị.",
    "privacy.p1":
      "HowToBaby cá nhân hóa ngay trên thiết bị của bạn: hồ sơ của bé (ngày sinh, và nếu muốn thì thêm ngày dự sinh và tên hiển thị) là tùy chọn và chỉ được lưu trong trình duyệt trên thiết bị này. Hồ sơ không được gửi lên máy chủ, không xuất hiện trong đường link hay metadata của trang, và không đi vào dữ liệu phân tích hay nhật ký hệ thống. Bạn có thể xóa hồ sơ bất cứ lúc nào ở trang Hiện tại.",
    "privacy.p2":
      "Ngoài hồ sơ tùy chọn đó, trang web chỉ lưu một vài tùy chọn hiển thị trong trình duyệt — giao diện, chế độ sáng/tối và ngôn ngữ. HowToBaby không dùng công cụ phân tích hay theo dõi người dùng.",

    "page.license.lede": "Phần mềm, nội dung và thương hiệu có phạm vi cấp phép riêng.",
    "license.software.term": "Phần mềm",
    "license.software.rest": "được cấp phép theo AGPL-3.0-only.",
    "license.content.term": "Nội dung kiến thức, tài liệu và bản dịch gốc do HowToBaby tự tạo",
    "license.content.rest": "được cấp phép theo CC BY-NC-SA 4.0 tại những phần HowToBaby có quyền cấp phép.",
    "license.p2":
      "Nội dung được trích dẫn từ các cơ quan y tế công cộng vẫn thuộc các quyền và điều khoản của tài liệu gốc; việc ghi nguồn không có nghĩa HowToBaby cấp phép lại nội dung đó. Tên và logo HowToBaby không thuộc phạm vi của hai giấy phép trên.",
    "license.readMap": "Xem chi tiết phạm vi giấy phép",
    "license.sourceCode": "Mã nguồn",

    "page.changelog.lede": "Các thay đổi và đính chính ảnh hưởng đến nội dung dành cho cha mẹ, được tập hợp tại một nơi.",
    "changelog.p1":
      "Khi một hướng dẫn đã xuất bản thay đổi về ý nghĩa hoặc cần đính chính, HowToBaby ghi lại ngày thay đổi và phần nội dung bị ảnh hưởng tại đây. Trang này sẽ được tạo từ lịch sử phiên bản nội dung khi hệ thống changelog hoàn chỉnh được triển khai.",
    "changelog.status":
      "Bản hiện tại gồm trải nghiệm cốt lõi của trang web, hệ thống giao diện, những hướng dẫn dựa trên bằng chứng đầu tiên, tính năng xem theo độ tuổi và hồ sơ tùy chọn của bé lưu trên thiết bị. Các chủ đề khác đang được bổ sung dần theo lộ trình.",

    "notFound.title": "Không tìm thấy trang",
    "notFound.lede": "Không tìm thấy địa chỉ này. Trang có thể đã được chuyển, hoặc liên kết chưa đầy đủ.",
    "notFound.backHome": "Về trang Hiện tại",

    "guidance.contentLanguage.label": "Ngôn ngữ nội dung",

    // Child profile (local-only, optional; PROJECT_PROFILE §6).
    "profile.title": "Bé của bạn",
    "profile.lede": "Không bắt buộc. Thông tin chỉ được lưu trên thiết bị này, không gửi lên máy chủ và không xuất hiện trong địa chỉ trang.",
    "profile.dob.label": "Ngày sinh",
    "profile.edd.label": "Ngày dự sinh (không bắt buộc)",
    "profile.edd.hint": "Chỉ dùng để xác định khi nào hướng dẫn Chơi & Phát triển nên dựa trên tuổi hiệu chỉnh. Thông tin này không dùng để chẩn đoán.",
    "profile.name.label": "Tên bé (không bắt buộc, chỉ dùng để hiển thị)",
    "profile.save": "Lưu trên thiết bị này",
    "profile.remove": "Xóa hồ sơ",
    "profile.edit": "Chỉnh sửa",
    "profile.cancel": "Hủy",
    "profile.error.dob-required": "Hãy nhập ngày sinh của bé.",
    "profile.error.dob-invalid": "Ngày này không hợp lệ.",
    "profile.error.dob-future": "Ngày sinh không thể sau ngày hôm nay.",
    "profile.error.edd-invalid": "Ngày dự sinh không hợp lệ.",
    "profile.error.name-too-long": "Tên bé không được quá 40 ký tự.",
    "profile.persistence.unavailable": "Không thể lưu hồ sơ trên trình duyệt này. Thông tin vẫn dùng được trong lần truy cập hiện tại nhưng sẽ không được lưu lại sau khi bạn tải lại trang.",
    "profile.persistence.clearFailed":
      "HowToBaby chưa thể xóa hồ sơ đã lưu khỏi trình duyệt. Hồ sơ sẽ không được dùng trong lần truy cập này, nhưng có thể xuất hiện lại sau khi bạn tải lại trang.",
    "profile.empty": "Chưa có hồ sơ. Bạn vẫn có thể xem mọi giai đoạn mà không cần tạo hồ sơ.",
    "profile.saved.dob": "Ngày sinh",
    "profile.saved.edd": "Ngày dự sinh",

    // Child summary / age context.
    "summary.child.generic": "Bé của bạn",
    "summary.age.label": "Tuổi hôm nay",
    "summary.correctedAge.label": "Tuổi hiệu chỉnh",
    "summary.corrected.note":
      "Bé sinh sớm {early} so với ngày dự sinh, nên hướng dẫn Chơi & Phát triển sẽ dựa trên tuổi hiệu chỉnh cho đến khi bé đủ 24 tháng tính từ ngày sinh. Đây chỉ là quy tắc chọn nội dung, không phải chẩn đoán.",
    "summary.corrected.limit": "Bé sinh sớm {early} so với ngày dự sinh. Từ khi bé đủ 24 tháng tính từ ngày sinh, hướng dẫn Chơi & Phát triển sẽ dựa trên tuổi tính từ ngày sinh.",
    "summary.beforeBirth": "Ngày sinh đã nhập nằm sau ngày hôm nay trên thiết bị này.",
    "summary.outOfScope": "HowToBaby hiện có nội dung cho bé từ khi chào đời đến trước sinh nhật 5 tuổi.",
    "summary.stage.label": "Giai đoạn hiện tại theo từng chủ đề",
    "summary.stage.unresolved": "Chưa xác định",
    "summary.safeSleep.inScope": "Hướng dẫn ngủ an toàn dành cho trẻ dưới 12 tháng hiện vẫn áp dụng cho bé.",

    // Browse by age / stage navigation.
    "browse.byAge.title": "Xem theo độ tuổi",
    "browse.byAge.lede": "Bạn có thể xem mọi giai đoạn mà không cần hồ sơ. Độ tuổi chỉ giúp chọn nội dung có thể phù hợp, không phải thước đo sự phát triển của bé.",
    "stage.nav.label": "Các giai đoạn",
    "stage.nav.actualMarker": "giai đoạn hiện tại của bé",
    "stage.nav.scrollBack": "Các giai đoạn trước",
    "stage.nav.scrollForward": "Các giai đoạn sau",
    "stage.prev": "Giai đoạn trước",
    "stage.next": "Giai đoạn sau",
    "stage.eyebrow.browsing": "Đang xem",
    "stage.empty.title": "Chưa có hướng dẫn cho giai đoạn này",
    "stage.empty.note": "Hướng dẫn chỉ được hiển thị sau khi đã hoàn tất biên soạn, kiểm chứng tài liệu và rà soát. HowToBaby không đăng nội dung chưa được duyệt.",

    // Why this stage.
    "why.title": "Vì sao là giai đoạn này?",
    "why.range": "Giai đoạn này tương ứng với độ tuổi {range}.",
    "why.range.approx": "Tài liệu gốc dùng mốc “khoảng {min} tháng” cho điểm bắt đầu. Đây chỉ là khoảng tuổi dùng để sắp xếp nội dung, không phải mốc cho biết bé đã sẵn sàng.",
    "why.noProfile": "Bạn đang xem trực tiếp giai đoạn này. Thêm ngày sinh ở trang Hiện tại để HowToBaby cho biết hôm nay bé đang ở giai đoạn nào. Việc xem một giai đoạn khác không làm thay đổi hồ sơ của bé.",
    "why.basis.chronological": "Ở mục này, giai đoạn của bé được xác định theo tuổi tính từ ngày sinh: {age}.",
    "why.basis.corrected": "Ở mục này, giai đoạn của bé được xác định theo tuổi hiệu chỉnh: {age} (bé sinh sớm {early} so với ngày dự sinh).",
    "why.basis.correctedBeforeDue": "Hiện {time}, nên ở mục này chưa có giai đoạn nào áp dụng theo tuổi hiệu chỉnh.",
    "why.relation.actual": "Đây là giai đoạn hiện tại của bé.",
    "why.relation.earlier": "Bé đã qua giai đoạn này (giai đoạn hiện tại: {stage}).",
    "why.relation.later":
      "Bé chưa đến giai đoạn này (giai đoạn hiện tại: {stage}). Việc xem trước không khiến hướng dẫn dành cho trẻ lớn hơn áp dụng sớm cho bé; hướng dẫn an toàn vẫn luôn dựa trên tuổi hiện tại của bé.",
    "why.relation.unresolved": "Chưa xác định được giai đoạn của bé ở chủ đề này.",
    "why.preview": "Theo ngày đang xem ({date}), bé ở giai đoạn {stage}.",
    "why.disclaimer": "Độ tuổi giúp HowToBaby chọn những hướng dẫn có thể phù hợp với bé, nhưng không thể chỉ dựa vào tuổi để biết bé đã sẵn sàng hay đang phát triển như thế nào.",

    // Preview plan date (session only).
    "preview.title": "Xem theo ngày khác",
    "preview.lede": "Chọn một ngày để xem bé ở giai đoạn nào vào thời điểm đó. Hướng dẫn an toàn vẫn luôn dựa trên tuổi hiện tại của bé.",
    "preview.date.label": "Ngày muốn xem",
    "preview.age.label": "Tuổi vào ngày đó",
    "preview.beforeBirth": "Trước ngày sinh của bé",
    "preview.clear": "Trở về hôm nay",
    "preview.banner": "Bạn đang xem ngày {date}, không phải hôm nay. Hướng dẫn an toàn vẫn dựa trên tuổi hiện tại của bé.",
    "preview.needsProfile": "Hãy thêm ngày sinh của bé để xem theo một ngày khác.",

    // Safety context (actual child only).
    "safety.context.title": "An toàn theo độ tuổi",
    "safety.context.noProfile": "Hướng dẫn an toàn được sắp xếp theo tuổi tính từ ngày sinh. Khi chưa có hồ sơ, bạn vẫn có thể xem mọi chủ đề an toàn; nội dung ở đây không thay đổi theo giai đoạn bạn đang xem ở các mục khác.",
    "safety.context.actual": "Hôm nay bé {age}. Hướng dẫn an toàn luôn dựa trên tuổi hiện tại của bé, tính từ ngày sinh. Việc xem giai đoạn khác hoặc chọn một ngày khác không làm thay đổi điều này.",
  },
});

/** Every valid app message id. */
export type AppMessageKey = keyof (typeof MESSAGES)["en"];
