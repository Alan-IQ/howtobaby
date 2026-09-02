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
 *
 * A page or site named inside a sentence is written as a `{link:<key>}` token (MESSAGE_LINKS in
 * `@/site`; see i18n/message-links.ts), never as plain text: `<T>` renders it as a link whose
 * anchor text is that destination's own localized name. Value placeholders stay `{name}`.
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
    "page.home.blurb.safety": "Age-relevant safety priorities, with the most important first.",
    "page.home.blurb.tools": "Practical utilities: calculators, routines, soothing sounds.",
    "page.home.how.title": "How HowToBaby works",
    "page.home.how.p1":
      "HowToBaby organizes guidance from public-health authorities by age and context, keeps each statement linked to its original source, and turns that guidance into practical steps for parents without making it more precise than the source allows.",
    "page.home.how.p2":
      "HowToBaby has started publishing its first evidence-backed guidance, beginning with {link:feeding}, and each statement links to its original source. You can browse every age range without creating a profile. If you add a child profile, it stays on your device and shows which stage your child is in today. More personalization on {link:now} and the remaining topics will be added as their content is verified and reviewed.",

    // Shared destination scaffolding.
    "section.placeholder.title": "What will be added here",
    "section.placeholder.note":
      "This section is already part of HowToBaby, but guidance appears here only after it has been written, checked against its sources, and reviewed. Unreviewed guidance is never published.",

    // Feeding.
    "page.feeding.lede": "Feeding guidance by stage and readiness, with every statement linked to its original source.",
    "page.feeding.hold.p1":
      "Breastfeeding and formula feeding, starting solids, food textures, responsive feeding, allergen introduction, and feeding safety — organized by stage and readiness rather than a single age cut-off, with each statement linked to its original source.",
    "page.feeding.hold.p2":
      "Guidance appears here only after it has been written, checked against its sources, and reviewed. Unreviewed guidance is never published. More Feeding guidance will be added after it has been checked and reviewed.",
    "guidance.feeding.eyebrow": "Starting solids",

    // Play & Development.
    "page.play.lede": "Play ideas and developmental context by age, without turning milestones into pass/fail tests.",
    "page.play.hold.p1":
      "Developmental stages, milestone context, activity ideas and variations, and how corrected age is used — all presented to support play and connection, not to screen development.",

    // Sleep.
    "page.sleep.lede": "Typical sleep patterns, safe-sleep basics and editable example routines.",
    "page.sleep.hold.p1":
      "Official guidance on sleep duration and safe sleep, responsive approaches for newborns, clearly labeled estimates for nap counts and wake windows, and adjustable example schedules.",

    // Safety.
    "page.safety.lede": "Age-relevant safety priorities, ordered by severity so the most important guidance is easy to spot.",
    "page.safety.hold.p1":
      "Safety guidance always follows your child’s current age. Browsing another stage never hides guidance that applies to your child and never makes guidance for another age apply automatically.",

    // Tools.
    "page.tools.lede": "Practical tools for parents. A tool’s presence on HowToBaby does not mean it provides a health benefit.",
    "page.tools.hold.p1":
      "Grouped by purpose — Soothe & Sound, Plan & Routine, Calculate, Print & Share — with clear labels showing whether a tool is simply a utility or is connected to guidance.",

    // Evidence detail.
    "page.evidence.eyebrow": "Evidence",
    "page.evidence.lede": "What the guidance says, which original sources support it, and when HowToBaby last verified those sources.",
    "page.evidence.claim.title": "Guidance",
    "page.evidence.sources.title": "Supporting sources",
    "page.evidence.original.title": "Original sources",

    // Sources trust page.
    "page.sources.lede": "The original sources HowToBaby uses to build its guidance.",
    "sources.usedByClaims.one": "Used in 1 published guidance statement",
    "sources.usedByClaims.many": "Used in {count} published guidance statements",
    "sources.generatedNote":
      "Each source above is maintained as reviewed data in the public repository. This page is generated from that data rather than edited by hand.",
    "sources.browseRepository": "Browse the repository",

    // Methodology trust page.
    "page.methodology.lede": "How original sources become HowToBaby guidance, and how those sources are verified and reviewed over time.",
    "methodology.p1":
      "HowToBaby interprets and summarizes source material while keeping every statement linked to its evidence. Each statement is classified as official guidance, evidence synthesis, typical pattern, example plan, practical interpretation, or product heuristic; it is linked to one or more sources, including the relevant location in each source, and reviewed before publication. Qualifiers such as “about”, “may”, and “when ready” are preserved rather than turned into false precision.",
    "methodology.p2":
      "HowToBaby tracks the provenance and review status of every source. If a source changes, any guidance that depends on it is flagged for review; HowToBaby never rewrites guidance automatically. Automated source monitoring is planned for a future release.",
    "methodology.note": "The full methodology is documented alongside the evidence system and updated as that system grows.",

    // Editorial policy trust page.
    "page.editorialPolicy.lede": "Who writes and reviews HowToBaby content, and what may not be published.",
    "editorialPolicy.p1":
      "English content is authored and reviewed first; Vietnamese must preserve the same meaning, quantities, negations, urgency, and age boundaries. Statements presented as official guidance must be directly supported by an approved primary source. When sources disagree, HowToBaby keeps the meaningful differences visible instead of blending them into one answer.",
    "editorialPolicy.p2":
      "AI may assist with finding sources, drafting, or translation, but no content is published until the required source checks and human review are complete.",

    // Medical disclaimer trust page.
    "page.disclaimer.lede": "What HowToBaby is — and what it is not.",
    "disclaimer.p1.lead": "HowToBaby is a practical parent reference.",
    "disclaimer.p1.rest": "It is not a medical record, diagnostic tool, developmental screening test, emergency service, or substitute for pediatric care.",
    "disclaimer.p2":
      "Age is only one factor HowToBaby uses to select guidance that may be relevant. Age alone cannot tell whether your child is ready, whether a recommendation is right for your child, or how your child is developing. Always follow the advice of your child’s clinician. In an emergency, contact local emergency services.",

    // Privacy trust page.
    "page.privacy.lede": "Local-first by design.",
    "privacy.p1":
      "The optional child profile — date of birth, plus an optional due date and display name — stays in your browser on this device. It is never sent to a server, added to a URL or page metadata, or included in analytics or logs. You can remove it at any time from {link:now}.",
    "privacy.p2":
      "Apart from the optional profile, HowToBaby stores only your display preferences in the browser: theme, light or dark mode, and language. The site uses no analytics or tracking scripts.",

    // License trust page.
    "page.license.lede": "Software, content and brand are licensed separately.",
    "license.software.term": "Software",
    "license.software.rest": "is licensed under AGPL-3.0-only.",
    "license.content.term": "Original HowToBaby knowledge, documentation and translations",
    "license.content.rest": "are licensed under CC BY-NC-SA 4.0 where the project holds the rights.",
    "license.p2":
      "Guidance cited from public-health authorities remains subject to the rights and terms of the original source; citing it does not relicense it. The HowToBaby name and logo are not covered by either license.",
    "license.readMap": "Read the full license map",
    "license.sourceCode": "Source code",

    // Changelog trust page.
    "page.changelog.lede": "Changes and corrections that affect published guidance, in one place.",
    "changelog.p1":
      "When published guidance changes meaning or a correction is made, HowToBaby records the date and affected content here. This page will be generated from content version history as the full changelog system is completed.",
    "changelog.status":
      "The current release includes the core site, theme system, the first evidence-backed guidance, browsing by age, and an optional child profile stored on your device. More topics are being added over time.",

    // Not found / common error UI.
    "notFound.title": "Page not found",
    "notFound.lede": "This page does not exist. It may have moved, or the link may be incomplete.",
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
    "profile.persistence.unavailable": "This browser could not save the profile. You can still use it for this visit, but it will be lost when you reload the page.",
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
    "summary.corrected.limit": "Your child was born {early} before the due date. Once your child is 24 months old from birth, Play & Development guidance uses age from birth rather than corrected age.",
    "summary.beforeBirth": "The date of birth you entered is in the future according to this device.",
    "summary.outOfScope": "HowToBaby currently covers children from birth until their fifth birthday.",
    "summary.stage.label": "Current stage by topic",
    "summary.stage.unresolved": "Not determined",
    "summary.safeSleep.inScope": "Safe-sleep guidance for infants under 12 months still applies to your child.",

    // Browse by age / stage navigation.
    "browse.byAge.title": "Browse by age",
    "browse.byAge.lede": "You can browse every stage without a profile. Age is used to organize guidance, not to measure your child’s development.",
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
    "why.range": "Age range for this stage: {range}.",
    "why.range.approx": "The source describes the starting point as “about {min} months”. HowToBaby uses that wording to organize content, not to decide whether your child is ready.",
    "why.noProfile": "You chose this stage to browse. Add your child’s date of birth on {link:now} and HowToBaby can show which stage applies today. Browsing another stage never changes the profile.",
    "why.basis.chronological": "For this topic, HowToBaby uses age from birth to determine your child’s stage. Current age: {age}.",
    "why.basis.corrected": "For this topic, HowToBaby uses corrected age to determine your child’s stage. Corrected age: {age} (born {early} before the due date).",
    "why.basis.correctedBeforeDue": "It is {time}, so no corrected-age stage applies in this topic yet.",
    "why.relation.actual": "This is your child's current stage.",
    "why.relation.earlier": "Your child has already moved past this stage. Current stage: {stage}.",
    "why.relation.later":
      "Your child has not reached this stage yet. Current stage: {stage}. You can still read ahead, but guidance for older children does not start applying early; safety guidance continues to follow your child’s current age.",
    "why.relation.unresolved": "HowToBaby cannot determine your child’s stage for this topic yet.",
    "why.preview": "On {date}, your child is in {stage}.",
    "why.disclaimer": "Age is only one factor HowToBaby uses to select guidance that may be relevant. Age alone cannot tell whether your child is ready or how they are developing.",

    // Preview plan date (session only).
    "preview.title": "View another date",
    "preview.lede": "Choose a date to see which stage would apply then. Safety guidance still follows your child’s current age.",
    "preview.date.label": "Date to view",
    "preview.age.label": "Age on that date",
    "preview.beforeBirth": "Before your child’s date of birth",
    "preview.clear": "Back to today",
    "preview.banner": "You’re viewing {date}, not today. Safety guidance still follows your child’s current age.",
    "preview.needsProfile": "Add your child’s date of birth to view another date.",

    // Safety context (actual child only).
    "safety.context.title": "Safety by age",
    "safety.context.noProfile": "Safety guidance is organized by your child’s age from birth. Without a profile, you can still browse every safety topic; the guidance here does not change when you browse another stage elsewhere.",
    "safety.context.actual": "Today your child is {age}. Safety guidance uses that current age from birth. Browsing another stage or viewing another date does not change it.",
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
    "page.home.blurb.safety": "Các ưu tiên an toàn theo độ tuổi, với những vấn đề quan trọng nhất được đưa lên trước.",
    "page.home.blurb.tools": "Các tiện ích thiết thực: công cụ tính, lịch sinh hoạt và âm thanh giúp thư giãn.",
    "page.home.how.title": "HowToBaby hoạt động như thế nào",
    "page.home.how.p1":
      "HowToBaby sắp xếp hướng dẫn từ các cơ quan y tế công cộng theo độ tuổi và bối cảnh, giữ từng nội dung gắn với tài liệu gốc và chuyển thành những bước cha mẹ có thể áp dụng trong thực tế mà không diễn giải chính xác hơn mức tài liệu cho phép.",
    "page.home.how.p2":
      "HowToBaby đã bắt đầu xuất bản những hướng dẫn đầu tiên dựa trên bằng chứng, trước hết ở mục {link:feeding}; mỗi nội dung đều liên kết đến tài liệu gốc. Bạn có thể xem mọi giai đoạn theo độ tuổi mà không cần tạo hồ sơ. Nếu thêm hồ sơ của bé, thông tin sẽ chỉ được lưu trên thiết bị và HowToBaby sẽ cho biết hôm nay bé đang ở giai đoạn nào. Các phần cá nhân hóa khác của trang {link:now} và những chủ đề còn lại sẽ được bổ sung sau khi nội dung được kiểm chứng và rà soát.",

    "section.placeholder.title": "Nội dung sẽ được bổ sung tại đây",
    "section.placeholder.note":
      "Mục này đã có sẵn trong HowToBaby, nhưng hướng dẫn chỉ được hiển thị sau khi hoàn tất biên soạn, kiểm chứng tài liệu và rà soát. HowToBaby không đăng nội dung chưa được duyệt.",

    "page.feeding.lede":
      "Hướng dẫn ăn uống theo giai đoạn và mức độ sẵn sàng của bé, mỗi nội dung đều liên kết đến tài liệu gốc.",
    "page.feeding.hold.p1":
      "Bú mẹ hoặc dùng sữa công thức, bắt đầu ăn dặm, kết cấu thức ăn, cho ăn theo tín hiệu của bé, làm quen với thực phẩm có khả năng gây dị ứng và an toàn khi ăn uống — được sắp xếp theo giai đoạn và mức độ sẵn sàng thay vì chỉ dựa vào một mốc tuổi; mỗi nội dung đều liên kết đến tài liệu gốc.",
    "page.feeding.hold.p2":
      "Nội dung chỉ xuất hiện tại đây sau khi hoàn tất biên soạn, kiểm chứng tài liệu và rà soát. HowToBaby không đăng nội dung chưa được duyệt. Các hướng dẫn Ăn uống còn lại sẽ được bổ sung sau khi được kiểm chứng và rà soát.",
    "guidance.feeding.eyebrow": "Bắt đầu ăn dặm",

    "page.play.lede":
      "Gợi ý chơi và thông tin phát triển theo độ tuổi, không biến các cột mốc thành bài kiểm tra đạt–không đạt.",
    "page.play.hold.p1":
      "Các giai đoạn phát triển, thông tin giúp hiểu các cột mốc, gợi ý hoạt động và biến thể, cùng cách sử dụng tuổi hiệu chỉnh — nhằm hỗ trợ việc chơi và gắn kết với bé, không nhằm sàng lọc phát triển.",

    "page.sleep.lede": "Nếp ngủ thường gặp, nguyên tắc ngủ an toàn và lịch sinh hoạt tham khảo có thể điều chỉnh.",
    "page.sleep.hold.p1":
      "Khuyến nghị chính thức về thời lượng ngủ và ngủ an toàn, cách hỗ trợ giấc ngủ theo tín hiệu của trẻ sơ sinh, các ước lượng tham khảo về số giấc ngủ ban ngày và khoảng thời gian thức, cùng các lịch mẫu có thể điều chỉnh.",

    "page.safety.lede":
      "Các ưu tiên an toàn theo độ tuổi, được sắp xếp theo mức độ nghiêm trọng để những hướng dẫn quan trọng nhất luôn dễ thấy.",
    "page.safety.hold.p1":
      "Hướng dẫn an toàn luôn dựa trên tuổi hiện tại của bé. Việc xem một giai đoạn khác không làm ẩn hướng dẫn đang áp dụng cho bé và cũng không khiến hướng dẫn dành cho độ tuổi khác tự động áp dụng.",

    "page.tools.lede":
      "Các công cụ thiết thực dành cho cha mẹ. Việc một công cụ xuất hiện trên HowToBaby không có nghĩa công cụ đó mang lại lợi ích cho sức khỏe.",
    "page.tools.hold.p1":
      "Các công cụ được nhóm theo mục đích — Âm thanh thư giãn, Lập kế hoạch & lịch sinh hoạt, Tính toán, In & chia sẻ — và có nhãn rõ ràng cho biết công cụ chỉ là tiện ích hay có liên quan đến nội dung hướng dẫn.",

    "page.evidence.eyebrow": "Bằng chứng",
    "page.evidence.lede":
      "Hướng dẫn này nói gì, dựa trên những tài liệu gốc nào và HowToBaby kiểm chứng các tài liệu đó lần cuối khi nào.",
    "page.evidence.claim.title": "Hướng dẫn",
    "page.evidence.sources.title": "Tài liệu tham khảo",
    "page.evidence.original.title": "Tài liệu gốc",

    "page.sources.lede": "Danh mục tài liệu gốc mà HowToBaby sử dụng để xây dựng nội dung hướng dẫn.",
    "sources.usedByClaims.one": "Được dùng trong 1 nội dung hướng dẫn đã xuất bản",
    "sources.usedByClaims.many": "Được dùng trong {count} nội dung hướng dẫn đã xuất bản",
    "sources.generatedNote":
      "Mỗi tài liệu ở trên được quản lý dưới dạng dữ liệu đã qua rà soát trong kho mã nguồn công khai. Trang này được tạo từ dữ liệu đó thay vì chỉnh sửa thủ công.",
    "sources.browseRepository": "Xem kho mã nguồn",

    "page.methodology.lede":
      "Cách HowToBaby chuyển tài liệu gốc thành hướng dẫn và cách các tài liệu đó được kiểm chứng, rà soát theo thời gian.",
    "methodology.p1":
      "HowToBaby diễn giải và tóm tắt tài liệu gốc nhưng luôn giữ từng nội dung gắn với bằng chứng hỗ trợ. Mỗi nội dung được phân loại — hướng dẫn chính thức, tổng hợp bằng chứng, xu hướng thường gặp, kế hoạch mẫu, cách áp dụng thực tế hoặc gợi ý của HowToBaby — rồi liên kết đến một hoặc nhiều tài liệu gốc, kèm vị trí liên quan trong từng tài liệu, và được rà soát trước khi xuất bản. Các từ như “khoảng”, “có thể” và “khi đã sẵn sàng” được giữ nguyên thay vì bị biến thành những mốc chính xác hơn mức tài liệu cho phép.",
    "methodology.p2":
      "HowToBaby theo dõi nguồn gốc và trạng thái rà soát của từng tài liệu. Khi một tài liệu gốc thay đổi, các hướng dẫn phụ thuộc vào tài liệu đó sẽ được đánh dấu để rà soát lại; HowToBaby không tự động viết lại hướng dẫn. Tính năng tự động theo dõi thay đổi của tài liệu gốc sẽ được bổ sung trong một bản cập nhật sau.",
    "methodology.note": "Phương pháp biên soạn đầy đủ được ghi lại cùng hệ thống bằng chứng và cập nhật khi hệ thống này được mở rộng.",

    "page.editorialPolicy.lede":
      "Ai biên soạn và rà soát nội dung HowToBaby, cùng những điều kiện bắt buộc trước khi xuất bản.",
    "editorialPolicy.p1":
      "Nội dung tiếng Anh được biên soạn và rà soát trước. Bản tiếng Việt phải giữ nguyên ý nghĩa, số liệu, ý phủ định, mức độ khẩn cấp và các mốc tuổi. Nội dung được trình bày là hướng dẫn chính thức phải được hỗ trợ trực tiếp bởi một tài liệu chính đã được phê duyệt. Khi các tài liệu đưa ra khuyến nghị khác nhau, HowToBaby trình bày rõ những điểm khác biệt có ý nghĩa thay vì gộp chúng thành một kết luận chung.",
    "editorialPolicy.p2":
      "AI có thể hỗ trợ tìm tài liệu, soạn thảo hoặc dịch thuật, nhưng nội dung chỉ được xuất bản sau khi hoàn tất các bước kiểm chứng tài liệu và rà soát bởi con người theo yêu cầu.",

    "page.disclaimer.lede": "Vai trò của HowToBaby — và những giới hạn cần biết.",
    "disclaimer.p1.lead": "HowToBaby là nguồn tham khảo thiết thực dành cho cha mẹ.",
    "disclaimer.p1.rest":
      "HowToBaby không phải hồ sơ y tế, công cụ chẩn đoán, bài kiểm tra sàng lọc phát triển hay dịch vụ cấp cứu, và không thay thế việc chăm sóc nhi khoa.",
    "disclaimer.p2":
      "Độ tuổi chỉ là một trong những yếu tố HowToBaby dùng để chọn hướng dẫn có thể phù hợp. Chỉ riêng độ tuổi không thể cho biết bé đã sẵn sàng, một khuyến nghị có phù hợp với bé hay bé đang phát triển ra sao. Hãy luôn làm theo lời khuyên của bác sĩ hoặc nhân viên y tế đang chăm sóc bé. Trong tình huống khẩn cấp, hãy liên hệ dịch vụ cấp cứu tại nơi bạn ở.",

    "page.privacy.lede": "Ưu tiên lưu dữ liệu trên thiết bị.",
    "privacy.p1":
      "Hồ sơ của bé là tùy chọn và chỉ được lưu trong trình duyệt trên thiết bị này. Hồ sơ gồm ngày sinh và, nếu bạn muốn, ngày dự sinh cùng tên hiển thị. Thông tin này không được gửi lên máy chủ, không xuất hiện trong địa chỉ trang hay metadata, và không được đưa vào dữ liệu phân tích hoặc nhật ký hệ thống. Bạn có thể xóa hồ sơ bất cứ lúc nào ở trang {link:now}.",
    "privacy.p2":
      "Ngoài hồ sơ tùy chọn, HowToBaby chỉ lưu các tùy chọn hiển thị trong trình duyệt: giao diện, chế độ sáng hoặc tối và ngôn ngữ. Trang web không sử dụng công cụ phân tích hay mã theo dõi người dùng.",

    "page.license.lede": "Phần mềm, nội dung và thương hiệu có phạm vi cấp phép riêng.",
    "license.software.term": "Phần mềm",
    "license.software.rest": "được cấp phép theo AGPL-3.0-only.",
    "license.content.term": "Nội dung kiến thức, tài liệu và bản dịch gốc do HowToBaby tự tạo",
    "license.content.rest": "được cấp phép theo CC BY-NC-SA 4.0 tại những phần HowToBaby có quyền cấp phép.",
    "license.p2":
      "Nội dung được trích dẫn từ các cơ quan y tế công cộng vẫn tuân theo quyền và điều khoản của tài liệu gốc; việc ghi nguồn không có nghĩa HowToBaby cấp phép lại nội dung đó. Tên và logo HowToBaby không thuộc phạm vi của hai giấy phép trên.",
    "license.readMap": "Xem chi tiết phạm vi giấy phép",
    "license.sourceCode": "Mã nguồn",

    "page.changelog.lede": "Các thay đổi và đính chính ảnh hưởng đến hướng dẫn đã xuất bản, được tập hợp tại một nơi.",
    "changelog.p1":
      "Khi một hướng dẫn đã xuất bản thay đổi về ý nghĩa hoặc cần đính chính, HowToBaby sẽ ghi ngày thay đổi và nội dung bị ảnh hưởng tại đây. Trang này sẽ được tạo từ lịch sử phiên bản nội dung khi hệ thống lịch sử thay đổi được hoàn thiện.",
    "changelog.status":
      "Bản hiện tại gồm các chức năng cốt lõi của trang web, hệ thống giao diện, những hướng dẫn đầu tiên dựa trên bằng chứng, tính năng xem theo độ tuổi và hồ sơ tùy chọn của bé lưu trên thiết bị. Các chủ đề khác đang tiếp tục được bổ sung.",

    "notFound.title": "Không tìm thấy trang",
    "notFound.lede": "Trang này không tồn tại. Có thể trang đã được chuyển sang địa chỉ khác hoặc liên kết chưa đầy đủ.",
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
    "profile.persistence.unavailable": "Trình duyệt không thể lưu hồ sơ. Bạn vẫn có thể dùng hồ sơ trong lần truy cập này, nhưng thông tin sẽ mất khi tải lại trang.",
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
    "summary.corrected.limit": "Bé sinh sớm {early} so với ngày dự sinh. Khi bé đủ 24 tháng tính từ ngày sinh, hướng dẫn Chơi & Phát triển sẽ dùng tuổi tính từ ngày sinh thay cho tuổi hiệu chỉnh.",
    "summary.beforeBirth": "Ngày sinh đã nhập đang nằm trong tương lai theo ngày trên thiết bị này.",
    "summary.outOfScope": "HowToBaby hiện có nội dung cho bé từ khi chào đời đến trước sinh nhật 5 tuổi.",
    "summary.stage.label": "Giai đoạn hiện tại theo từng chủ đề",
    "summary.stage.unresolved": "Chưa xác định",
    "summary.safeSleep.inScope": "Hướng dẫn ngủ an toàn dành cho trẻ dưới 12 tháng hiện vẫn áp dụng cho bé.",

    // Browse by age / stage navigation.
    "browse.byAge.title": "Xem theo độ tuổi",
    "browse.byAge.lede": "Bạn có thể xem mọi giai đoạn mà không cần hồ sơ. Độ tuổi được dùng để sắp xếp hướng dẫn, không phải để đánh giá sự phát triển của bé.",
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
    "why.range": "Độ tuổi của giai đoạn này: {range}.",
    "why.range.approx": "Tài liệu gốc mô tả mốc bắt đầu là “khoảng {min} tháng”. HowToBaby dùng mốc này để sắp xếp nội dung, không phải để quyết định bé đã sẵn sàng hay chưa.",
    "why.noProfile": "Bạn đang tự chọn giai đoạn này để xem. Nếu thêm ngày sinh ở trang {link:now}, HowToBaby có thể cho biết hôm nay bé đang ở giai đoạn nào. Việc xem giai đoạn khác không làm thay đổi hồ sơ của bé.",
    "why.basis.chronological": "Trong mục này, HowToBaby dùng tuổi tính từ ngày sinh để xác định giai đoạn của bé. Tuổi hiện tại: {age}.",
    "why.basis.corrected": "Trong mục này, HowToBaby dùng tuổi hiệu chỉnh để xác định giai đoạn của bé. Tuổi hiệu chỉnh hiện tại: {age} (bé sinh sớm {early} so với ngày dự sinh).",
    "why.basis.correctedBeforeDue": "Hiện {time}, nên ở mục này chưa có giai đoạn nào áp dụng theo tuổi hiệu chỉnh.",
    "why.relation.actual": "Đây là giai đoạn hiện tại của bé.",
    "why.relation.earlier": "Bé đã qua giai đoạn này. Giai đoạn hiện tại: {stage}.",
    "why.relation.later":
      "Bé chưa đến giai đoạn này. Giai đoạn hiện tại: {stage}. Bạn vẫn có thể xem trước, nhưng hướng dẫn dành cho trẻ lớn hơn sẽ không tự động áp dụng sớm cho bé; hướng dẫn an toàn vẫn dựa trên tuổi hiện tại của bé.",
    "why.relation.unresolved": "HowToBaby chưa xác định được giai đoạn của bé trong mục này.",
    "why.preview": "Vào ngày {date}, bé ở giai đoạn {stage}.",
    "why.disclaimer": "Độ tuổi chỉ là một trong những yếu tố HowToBaby dùng để chọn hướng dẫn có thể phù hợp. Chỉ riêng độ tuổi không thể cho biết bé đã sẵn sàng hay đang phát triển ra sao.",

    // Preview plan date (session only).
    "preview.title": "Xem theo ngày khác",
    "preview.lede": "Chọn một ngày để xem khi đó bé ở giai đoạn nào. Hướng dẫn an toàn vẫn luôn dựa trên tuổi hiện tại của bé.",
    "preview.date.label": "Ngày muốn xem",
    "preview.age.label": "Tuổi vào ngày đó",
    "preview.beforeBirth": "Trước ngày sinh của bé",
    "preview.clear": "Trở về hôm nay",
    "preview.banner": "Bạn đang xem ngày {date}, không phải hôm nay. Hướng dẫn an toàn vẫn dựa trên tuổi hiện tại của bé.",
    "preview.needsProfile": "Hãy thêm ngày sinh của bé để xem theo một ngày khác.",

    // Safety context (actual child only).
    "safety.context.title": "An toàn theo độ tuổi",
    "safety.context.noProfile": "Hướng dẫn an toàn được sắp xếp theo tuổi của bé tính từ ngày sinh. Khi chưa có hồ sơ, bạn vẫn có thể xem mọi chủ đề an toàn; nội dung ở đây không thay đổi theo giai đoạn bạn đang xem ở những mục khác.",
    "safety.context.actual": "Hôm nay bé {age}. Hướng dẫn an toàn dựa trên độ tuổi hiện tại này, tính từ ngày sinh. Việc xem giai đoạn hoặc ngày khác không làm thay đổi điều đó.",
  },
});

/** Every valid app message id. */
export type AppMessageKey = keyof (typeof MESSAGES)["en"];
