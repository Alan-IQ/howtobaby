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
      "HowToBaby is a practical parent reference, not a medical record, diagnosis engine, developmental screening test, emergency service, or substitute for pediatric care.",
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
    "page.home.lede": "Evidence-to-action guidance and practical tools for parents — organized around your child’s current stage.",
    "page.home.blurb.feeding": "What, how and when to feed, by stage and readiness.",
    "page.home.blurb.play": "Play ideas and development context for the current stage.",
    "page.home.blurb.sleep": "Sleep patterns, safe-sleep basics and example routines.",
    "page.home.blurb.safety": "Age-relevant safety priorities, clearly ranked.",
    "page.home.blurb.tools": "Practical utilities: calculators, routines, soothing sounds.",
    "page.home.how.title": "How HowToBaby works",
    "page.home.how.p1":
      "HowToBaby organizes approved guidance from public-health authorities by age and context, keeps each statement linked to its source, and turns it into practical actions — without inventing precision the source does not have.",
    "page.home.how.p2":
      "A first, small set of evidence-backed official guidance is already published — Feeding carries the first of it — and each statement links to its original source. Age-aware browsing, the personalized Now view and the remaining domains are added as their content passes the evidence and review pipeline.",

    // Shared destination scaffolding.
    "section.placeholder.title": "What this section will hold",
    "section.placeholder.note":
      "This destination is part of the application shell. Its guidance is published only after the content, evidence and review pipeline for it is in place — never as unreviewed text.",

    // Feeding.
    "page.feeding.lede": "Feeding guidance by stage and readiness, with the source behind every statement.",
    "page.feeding.hold.p1":
      "Milk feeding, starting solids, textures, responsive feeding, allergen introduction and feeding safety — organized by stage and readiness rather than by a single age cut-off, with each claim linked to its original source.",
    "page.feeding.hold.p2":
      "Guidance appears here only after it has passed the content, evidence and review pipeline — never as unreviewed text. The full feeding domain migrates in a later phase.",
    "guidance.feeding.eyebrow": "Starting solids",

    // Play & Development.
    "page.play.lede": "Age-relevant play ideas and development context, without pass/fail milestones.",
    "page.play.hold.p1":
      "Stage maps, milestone context, activities and variations, and corrected-age handling, presented as context for play and connection — not as a screening test.",

    // Sleep.
    "page.sleep.lede": "Typical sleep patterns, safe-sleep basics and editable example routines.",
    "page.sleep.hold.p1":
      "Official duration guidance, safe-sleep guidance, responsive newborn mode, nap and wake-window heuristics labelled as heuristics, and example plans you can adjust.",

    // Safety.
    "page.safety.lede": "Age-relevant safety priorities, ranked by severity and kept visible in every theme.",
    "page.safety.hold.p1":
      "Safety guidance for the actual child’s current stage. Browsing another stage never hides or unlocks safety guidance that applies to your child.",

    // Tools.
    "page.tools.lede": "Practical utilities for parents. A tool is a utility first; it carries no health claim just for living here.",
    "page.tools.hold.p1":
      "Grouped by purpose — Soothe & Sound, Plan & Routine, Calculate, Print & Share — with clear labels showing whether a tool is purely utility or linked to guidance.",

    // Evidence detail.
    "page.evidence.eyebrow": "Evidence",
    "page.evidence.lede": "What this claim says, which original sources support it, and when it was last verified.",
    "page.evidence.claim.title": "Claim",
    "page.evidence.sources.title": "Supporting sources",
    "page.evidence.original.title": "Original sources",

    // Sources trust page.
    "page.sources.lede": "The registry of original authorities HowToBaby guidance is built from.",
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
    "disclaimer.p1.rest": "It is not a medical record, a diagnosis engine, a developmental screening test, an emergency service, or a substitute for pediatric care.",
    "disclaimer.p2":
      "Age selects candidate guidance; it does not prove readiness, suitability or developmental status. Always follow the advice of your child’s clinician, and contact local emergency services in an emergency.",

    // Privacy trust page.
    "page.privacy.lede": "Local-first by design.",
    "privacy.p1":
      "Personalization in HowToBaby is local-first: a child profile, when that feature exists, stays on your device and is never sent to a server, placed in a URL, or included in analytics or logs.",
    "privacy.p2":
      "Today the site stores only local presentation preferences in your browser — currently your theme and colour-mode choice and your language choice. There are no analytics or tracking scripts.",

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
      "Current release: the application shell, the theme engine and the first evidence-backed guidance, with the remaining domains being added phase by phase.",

    // Not found / common error UI.
    "notFound.title": "Page not found",
    "notFound.lede": "That address does not exist here. It may have moved, or the link may be incomplete.",
    "notFound.backHome": "Back to Now",

    // Local content-language override on guidance surfaces.
    "guidance.contentLanguage.label": "Guidance language",
  },
  vi: {
    "app.skipToContent": "Bỏ qua tới nội dung chính",
    "app.brandHome.label": "trang chính",

    "nav.primary.label": "Chính",
    "nav.now.label": "Hiện tại",
    "nav.feeding.label": "Ăn uống",
    "nav.play.label": "Chơi",
    "nav.sleep.label": "Ngủ",
    "nav.safety.label": "An toàn",
    "nav.tools.label": "Công cụ",

    "domain.now.title": "Hiện tại",
    "domain.feeding.title": "Ăn uống",
    "domain.play.title": "Chơi & Phát triển",
    "domain.sleep.title": "Ngủ",
    "domain.safety.title": "An toàn",
    "domain.tools.title": "Công cụ",

    "language.control.label": "Ngôn ngữ",
    "language.menu.label": "Chọn ngôn ngữ",
    "theme.colorMode.label": "Chế độ màu",
    "theme.colorMode.light": "Sáng",
    "theme.colorMode.dark": "Tối",
    "theme.colorMode.system": "Theo thiết bị",
    "theme.family.label": "Giao diện",

    "action.print.label": "In trang này",

    "footer.trust.label": "Tin cậy và pháp lý",
    "footer.external.icon": "mở trang ngoài",
    "footer.disclaimer":
      "HowToBaby là một tài liệu tham khảo thực hành cho cha mẹ — không phải hồ sơ y tế, công cụ chẩn đoán, bài sàng lọc phát triển, dịch vụ cấp cứu hay sự thay thế cho chăm sóc nhi khoa.",
    "footer.licenses": "Phần mềm AGPL-3.0-only · Nội dung gốc CC BY-NC-SA 4.0 · Tên và logo HowToBaby không thuộc các giấy phép này.",

    "trust.eyebrow": "Tin cậy",
    "trust.sources.label": "Nguồn",
    "trust.methodology.label": "Phương pháp",
    "trust.editorialPolicy.label": "Chính sách biên tập",
    "trust.disclaimer.label": "Miễn trừ y khoa",
    "trust.privacy.label": "Quyền riêng tư",
    "trust.license.label": "Giấy phép",
    "trust.sourceCode.label": "Mã nguồn",
    "trust.changelog.label": "Thay đổi / Đính chính",

    "page.home.title": "Biết bé cần gì. Ngay lúc này.",
    "page.home.lede": "Hướng dẫn dựa trên bằng chứng và công cụ thực hành cho cha mẹ — tổ chức quanh giai đoạn hiện tại của bé.",
    "page.home.blurb.feeding": "Cho bé ăn gì, thế nào và khi nào — theo giai đoạn và mức sẵn sàng.",
    "page.home.blurb.play": "Ý tưởng chơi và bối cảnh phát triển cho giai đoạn hiện tại.",
    "page.home.blurb.sleep": "Nếp ngủ, nguyên tắc ngủ an toàn và lịch sinh hoạt mẫu.",
    "page.home.blurb.safety": "Ưu tiên an toàn theo độ tuổi, xếp hạng rõ ràng.",
    "page.home.blurb.tools": "Tiện ích thực hành: công cụ tính, lịch sinh hoạt, âm thanh ru dịu.",
    "page.home.how.title": "HowToBaby hoạt động thế nào",
    "page.home.how.p1":
      "HowToBaby tổ chức hướng dẫn đã được phê duyệt từ các cơ quan y tế công cộng theo độ tuổi và bối cảnh, giữ mỗi nội dung gắn với nguồn gốc của nó, và biến chúng thành hành động thực tế — không tự tạo độ chính xác mà nguồn không có.",
    "page.home.how.p2":
      "Một lượng nhỏ hướng dẫn chính thức dựa trên bằng chứng đã được xuất bản — Ăn uống có phần đầu tiên — và mỗi nội dung đều gắn với nguồn gốc của nó. Duyệt theo độ tuổi, trang Hiện tại cá nhân hóa và các mảng còn lại sẽ được bổ sung khi nội dung của chúng qua quy trình bằng chứng và rà soát.",

    "section.placeholder.title": "Mục này sẽ có gì",
    "section.placeholder.note":
      "Trang này thuộc khung ứng dụng. Hướng dẫn của nó chỉ được xuất bản sau khi quy trình nội dung, bằng chứng và rà soát sẵn sàng — không bao giờ là văn bản chưa duyệt.",

    "page.feeding.lede": "Hướng dẫn ăn uống theo giai đoạn và mức sẵn sàng, với nguồn gốc đứng sau mỗi nội dung.",
    "page.feeding.hold.p1":
      "Bú sữa, ăn dặm, kết cấu thức ăn, cho ăn theo tín hiệu, làm quen chất gây dị ứng và an toàn ăn uống — tổ chức theo giai đoạn và mức sẵn sàng thay vì một mốc tuổi duy nhất, mỗi nội dung gắn với nguồn gốc của nó.",
    "page.feeding.hold.p2":
      "Hướng dẫn chỉ xuất hiện tại đây sau khi đã qua quy trình nội dung, bằng chứng và rà soát — không bao giờ là văn bản chưa duyệt. Toàn bộ mảng ăn uống sẽ chuyển sang ở giai đoạn sau.",
    "guidance.feeding.eyebrow": "Ăn dặm",

    "page.play.lede": "Ý tưởng chơi và bối cảnh phát triển theo độ tuổi, không có cột mốc đạt/trượt.",
    "page.play.hold.p1":
      "Bản đồ giai đoạn, bối cảnh cột mốc, hoạt động và biến thể, cùng xử lý tuổi hiệu chỉnh — trình bày như bối cảnh để chơi và gắn kết, không phải bài sàng lọc.",

    "page.sleep.lede": "Nếp ngủ thường gặp, nguyên tắc ngủ an toàn và lịch sinh hoạt mẫu có thể điều chỉnh.",
    "page.sleep.hold.p1":
      "Hướng dẫn chính thức về thời lượng ngủ, hướng dẫn ngủ an toàn, chế độ sơ sinh linh hoạt, gợi ý giấc ngày và cửa sổ thức được ghi rõ là gợi ý, cùng kế hoạch mẫu bạn có thể điều chỉnh.",

    "page.safety.lede": "Ưu tiên an toàn theo độ tuổi, xếp theo mức độ nghiêm trọng và luôn hiển thị ở mọi theme.",
    "page.safety.hold.p1":
      "Hướng dẫn an toàn cho giai đoạn hiện tại thật của bé. Việc xem giai đoạn khác không bao giờ ẩn hay mở khóa hướng dẫn an toàn áp dụng cho con bạn.",

    "page.tools.lede": "Tiện ích thực hành cho cha mẹ. Công cụ trước hết là tiện ích; không mang tuyên bố sức khỏe chỉ vì nằm ở đây.",
    "page.tools.hold.p1":
      "Nhóm theo mục đích — Ru dịu & Âm thanh, Kế hoạch & Lịch sinh hoạt, Tính toán, In & Chia sẻ — với nhãn rõ ràng cho biết công cụ là tiện ích thuần túy hay gắn với hướng dẫn.",

    "page.evidence.eyebrow": "Bằng chứng",
    "page.evidence.lede": "Nội dung của nhận định này, những nguồn gốc nào hỗ trợ nó, và lần kiểm chứng gần nhất.",
    "page.evidence.claim.title": "Nhận định",
    "page.evidence.sources.title": "Nguồn hỗ trợ",
    "page.evidence.original.title": "Nguồn gốc",

    "page.sources.lede": "Danh mục các nguồn gốc chính thức mà hướng dẫn của HowToBaby được xây dựng từ đó.",
    "sources.usedByClaims.one": "Được 1 nhận định đã xuất bản sử dụng",
    "sources.usedByClaims.many": "Được {count} nhận định đã xuất bản sử dụng",
    "sources.generatedNote":
      "Mỗi bản ghi ở trên được duy trì dưới dạng dữ liệu đã rà soát trong kho mã nguồn công khai; trang này được sinh ra từ đó và không bao giờ được chỉnh sửa thủ công.",
    "sources.browseRepository": "Xem kho mã nguồn",

    "page.methodology.lede": "Cách một nguồn gốc trở thành nhận định của HowToBaby, và cách độ mới cùng quy trình rà soát vận hành.",
    "methodology.p1":
      "HowToBaby diễn giải, trích dẫn và liên kết. Mỗi nội dung được phân loại (hướng dẫn chính thức, tổng hợp bằng chứng, mô hình thường gặp, kế hoạch ví dụ, diễn giải thực hành hoặc gợi ý của sản phẩm), gắn với một hoặc nhiều bản ghi nguồn kèm vị trí trích dẫn, và được rà soát trước khi xuất bản. Các từ định tính như “khoảng”, “có thể” hay “khi sẵn sàng” được giữ nguyên thay vì bị mài sắc thành độ chính xác tự tạo.",
    "methodology.p2":
      "Xuất xứ và trạng thái rà soát của từng nguồn được theo dõi trong mô hình chuẩn. Khi một thay đổi của nguồn được ghi nhận, các nhận định phụ thuộc vào nó được đánh dấu cần rà soát — hướng dẫn không bao giờ bị viết lại tự động. Giám sát nguồn tự động thuộc về giai đoạn sau.",
    "methodology.note": "Phương pháp đầy đủ được ghi lại cùng quy trình bằng chứng khi nó được triển khai.",

    "page.editorialPolicy.lede": "Ai viết và rà soát nội dung HowToBaby, và những gì không được phép xuất bản.",
    "editorialPolicy.p1":
      "Nội dung tiếng Anh được biên soạn và rà soát trước; bản tiếng Việt phải giữ nguyên ý nghĩa, số lượng, phủ định, mức khẩn cấp và ranh giới độ tuổi. Các phát biểu thuộc hướng dẫn chính thức phải có hỗ trợ trực tiếp từ một nguồn chính đã được phê duyệt. Khác biệt giữa các nguồn được giữ hiển thị; không bao giờ bị trung bình hóa cho biến mất.",
    "editorialPolicy.p2":
      "AI có thể hỗ trợ tra cứu, soạn thảo hoặc dịch thuật, nhưng không nội dung nào trở thành chuẩn khi chưa qua kiểm chứng nguồn bắt buộc và rà soát bởi con người.",

    "page.disclaimer.lede": "HowToBaby là gì — và không phải là gì.",
    "disclaimer.p1.lead": "HowToBaby là một tài liệu tham khảo thực hành cho cha mẹ.",
    "disclaimer.p1.rest": "Đây không phải hồ sơ y tế, công cụ chẩn đoán, bài sàng lọc phát triển, dịch vụ cấp cứu hay sự thay thế cho chăm sóc nhi khoa.",
    "disclaimer.p2":
      "Độ tuổi chỉ chọn ra hướng dẫn ứng viên; nó không chứng minh mức sẵn sàng, sự phù hợp hay tình trạng phát triển. Luôn làm theo lời khuyên của bác sĩ của bé, và liên hệ dịch vụ cấp cứu địa phương trong tình huống khẩn cấp.",

    "page.privacy.lede": "Ưu tiên cục bộ ngay từ thiết kế.",
    "privacy.p1":
      "Cá nhân hóa trong HowToBaby là cục bộ trước hết: hồ sơ của bé, khi tính năng đó tồn tại, sẽ nằm trên thiết bị của bạn và không bao giờ được gửi lên máy chủ, đặt trong URL, hay đưa vào phân tích hoặc nhật ký.",
    "privacy.p2":
      "Hiện trang chỉ lưu các tùy chọn hiển thị cục bộ trong trình duyệt của bạn — hiện gồm lựa chọn giao diện/chế độ màu và lựa chọn ngôn ngữ. Không có script phân tích hay theo dõi nào.",

    "page.license.lede": "Phần mềm, nội dung và thương hiệu được cấp phép riêng.",
    "license.software.term": "Phần mềm",
    "license.software.rest": "được cấp phép theo AGPL-3.0-only.",
    "license.content.term": "Tri thức, tài liệu và bản dịch gốc của HowToBaby",
    "license.content.rest": "được cấp phép theo CC BY-NC-SA 4.0 ở những phần dự án nắm quyền.",
    "license.p2":
      "Hướng dẫn trích dẫn từ các cơ quan y tế công cộng vẫn thuộc quyền gốc của họ — ghi xuất xứ không phải là cấp phép lại. Tên và logo HowToBaby không thuộc cả hai giấy phép này.",
    "license.readMap": "Xem sơ đồ giấy phép đầy đủ",
    "license.sourceCode": "Mã nguồn",

    "page.changelog.lede": "Các thay đổi và đính chính hướng tới cha mẹ, ở một nơi.",
    "changelog.p1":
      "Khi hướng dẫn đã xuất bản thay đổi về ý nghĩa, hoặc có đính chính, việc đó được ghi lại tại đây kèm ngày và nội dung bị ảnh hưởng. Trang này được sinh ra từ lịch sử phiên bản nội dung khi hướng dẫn được xuất bản.",
    "changelog.status":
      "Bản phát hành hiện tại: khung ứng dụng, hệ thống giao diện và những hướng dẫn dựa trên bằng chứng đầu tiên; các mảng còn lại đang được bổ sung theo từng giai đoạn.",

    "notFound.title": "Không tìm thấy trang",
    "notFound.lede": "Địa chỉ này không tồn tại ở đây. Nó có thể đã được chuyển đi, hoặc liên kết chưa đầy đủ.",
    "notFound.backHome": "Về trang Hiện tại",

    "guidance.contentLanguage.label": "Ngôn ngữ hướng dẫn",
  },
});

/** Every valid app message id. */
export type AppMessageKey = keyof (typeof MESSAGES)["en"];
