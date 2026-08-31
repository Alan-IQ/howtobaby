// SPDX-License-Identifier: AGPL-3.0-only
/**
 * App/page UI copy as key/message dictionaries (@howtobaby/i18n framework): navigation, header
 * controls, footer, and page chrome/prose. ONE dictionary per app — every locale must define
 * every key (compile-checked), so app copy can never ship half-translated.
 *
 * Boundaries: canonical guidance/claim text and evidence vocabulary stay in @howtobaby/knowledge
 * and features/evidence/labels; long-form trust/legal document pages stay English until their
 * content phases. Brand strings ("HowToBaby") are proper nouns, not translations.
 */

import { defineMessages } from "@howtobaby/i18n";

export const MESSAGES = defineMessages({
  en: {
    // Navigation (labels only; the /play PAGE title deliberately keeps the full name).
    "nav.primary.label": "Primary",
    "nav.now.label": "Now",
    "nav.feeding.label": "Feeding",
    "nav.play.label": "Play",
    "nav.sleep.label": "Sleep",
    "nav.safety.label": "Safety",
    "nav.tools.label": "Tools",

    // Header language control.
    "language.control.label": "Language",
    "language.menu.label": "Choose language",

    // Footer.
    "footer.trust.label": "Trust and legal",
    "footer.external.icon": "opens external site",
    "footer.disclaimer":
      "HowToBaby is a practical parent reference, not a medical record, diagnosis engine, developmental screening test, emergency service, or substitute for pediatric care.",
    "footer.licenses": "Software AGPL-3.0-only · Original content CC BY-NC-SA 4.0 · HowToBaby name and logo are not covered by those licenses.",

    // Trust/legal link labels.
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
      "Guidance content, age-aware browsing and the personalized Now view are being added phase by phase. Everything you see today is the application shell; no health guidance is published here yet.",

    // Shared destination scaffolding.
    "section.placeholder.title": "What this section will hold",
    "section.placeholder.note":
      "This destination is part of the application shell. Its guidance is published only after the content, evidence and review pipeline for it is in place — never as unreviewed text.",

    // Feeding.
    "page.feeding.title": "Feeding",
    "page.feeding.lede": "Feeding guidance by stage and readiness, with the source behind every statement.",
    "page.feeding.hold.p1":
      "Milk feeding, starting solids, textures, responsive feeding, allergen introduction and feeding safety — organized by stage and readiness rather than by a single age cut-off, with each claim linked to its original source.",
    "page.feeding.hold.p2":
      "Guidance appears here only after it has passed the content, evidence and review pipeline — never as unreviewed text. The full feeding domain migrates in a later phase.",
    "guidance.feeding.eyebrow": "Starting solids",

    // Play & Development (page keeps the full title; only NAV labels shorten to "Play").
    "page.play.title": "Play & Development",
    "page.play.lede": "Age-relevant play ideas and development context, without pass/fail milestones.",
    "page.play.hold.p1":
      "Stage maps, milestone context, activities and variations, and corrected-age handling, presented as context for play and connection — not as a screening test.",

    // Sleep.
    "page.sleep.title": "Sleep",
    "page.sleep.lede": "Typical sleep patterns, safe-sleep basics and editable example routines.",
    "page.sleep.hold.p1":
      "Official duration guidance, safe-sleep guidance, responsive newborn mode, nap and wake-window heuristics labelled as heuristics, and example plans you can adjust.",

    // Safety.
    "page.safety.title": "Safety",
    "page.safety.lede": "Age-relevant safety priorities, ranked by severity and kept visible in every theme.",
    "page.safety.hold.p1":
      "Safety guidance for the actual child’s current stage. Browsing another stage never hides or unlocks safety guidance that applies to your child.",

    // Tools.
    "page.tools.title": "Tools",
    "page.tools.lede": "Practical utilities for parents. A tool is a utility first; it carries no health claim just for living here.",
    "page.tools.hold.p1":
      "Grouped by purpose — Soothe & Sound, Plan & Routine, Calculate, Print & Share — with clear labels showing whether a tool is purely utility or linked to guidance.",

    // Evidence detail.
    "page.evidence.eyebrow": "Evidence",
    "page.evidence.lede": "What this claim says, which original sources support it, and when it was last verified.",
    "page.evidence.claim.title": "Claim",
    "page.evidence.sources.title": "Supporting sources",
    "page.evidence.original.title": "Original sources",

    // Local content-language override on guidance surfaces.
    "guidance.contentLanguage.label": "Guidance language",
  },
  vi: {
    "nav.primary.label": "Chính",
    "nav.now.label": "Hiện tại",
    "nav.feeding.label": "Ăn uống",
    "nav.play.label": "Chơi",
    "nav.sleep.label": "Ngủ",
    "nav.safety.label": "An toàn",
    "nav.tools.label": "Công cụ",

    "language.control.label": "Ngôn ngữ",
    "language.menu.label": "Chọn ngôn ngữ",

    "footer.trust.label": "Tin cậy và pháp lý",
    "footer.external.icon": "mở trang ngoài",
    "footer.disclaimer":
      "HowToBaby là một tài liệu tham khảo thực hành cho cha mẹ — không phải hồ sơ y tế, công cụ chẩn đoán, bài sàng lọc phát triển, dịch vụ cấp cứu hay sự thay thế cho chăm sóc nhi khoa.",
    "footer.licenses": "Phần mềm AGPL-3.0-only · Nội dung gốc CC BY-NC-SA 4.0 · Tên và logo HowToBaby không thuộc các giấy phép này.",

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
      "Nội dung hướng dẫn, duyệt theo độ tuổi và trang Hiện tại cá nhân hóa đang được bổ sung theo từng giai đoạn. Những gì bạn thấy hôm nay là khung ứng dụng; chưa có hướng dẫn sức khỏe nào được xuất bản tại đây.",

    "section.placeholder.title": "Mục này sẽ có gì",
    "section.placeholder.note":
      "Trang này thuộc khung ứng dụng. Hướng dẫn của nó chỉ được xuất bản sau khi quy trình nội dung, bằng chứng và rà soát sẵn sàng — không bao giờ là văn bản chưa duyệt.",

    "page.feeding.title": "Ăn uống",
    "page.feeding.lede": "Hướng dẫn ăn uống theo giai đoạn và mức sẵn sàng, với nguồn gốc đứng sau mỗi nội dung.",
    "page.feeding.hold.p1":
      "Bú sữa, ăn dặm, kết cấu thức ăn, cho ăn theo tín hiệu, làm quen chất gây dị ứng và an toàn ăn uống — tổ chức theo giai đoạn và mức sẵn sàng thay vì một mốc tuổi duy nhất, mỗi nội dung gắn với nguồn gốc của nó.",
    "page.feeding.hold.p2":
      "Hướng dẫn chỉ xuất hiện tại đây sau khi đã qua quy trình nội dung, bằng chứng và rà soát — không bao giờ là văn bản chưa duyệt. Toàn bộ mảng ăn uống sẽ chuyển sang ở giai đoạn sau.",
    "guidance.feeding.eyebrow": "Ăn dặm",

    "page.play.title": "Chơi & Phát triển",
    "page.play.lede": "Ý tưởng chơi và bối cảnh phát triển theo độ tuổi, không có cột mốc đạt/trượt.",
    "page.play.hold.p1":
      "Bản đồ giai đoạn, bối cảnh cột mốc, hoạt động và biến thể, cùng xử lý tuổi hiệu chỉnh — trình bày như bối cảnh để chơi và gắn kết, không phải bài sàng lọc.",

    "page.sleep.title": "Ngủ",
    "page.sleep.lede": "Nếp ngủ thường gặp, nguyên tắc ngủ an toàn và lịch sinh hoạt mẫu có thể điều chỉnh.",
    "page.sleep.hold.p1":
      "Hướng dẫn chính thức về thời lượng ngủ, hướng dẫn ngủ an toàn, chế độ sơ sinh linh hoạt, gợi ý giấc ngày và cửa sổ thức được ghi rõ là gợi ý, cùng kế hoạch mẫu bạn có thể điều chỉnh.",

    "page.safety.title": "An toàn",
    "page.safety.lede": "Ưu tiên an toàn theo độ tuổi, xếp theo mức độ nghiêm trọng và luôn hiển thị ở mọi theme.",
    "page.safety.hold.p1":
      "Hướng dẫn an toàn cho giai đoạn hiện tại thật của bé. Việc xem giai đoạn khác không bao giờ ẩn hay mở khóa hướng dẫn an toàn áp dụng cho con bạn.",

    "page.tools.title": "Công cụ",
    "page.tools.lede": "Tiện ích thực hành cho cha mẹ. Công cụ trước hết là tiện ích; không mang tuyên bố sức khỏe chỉ vì nằm ở đây.",
    "page.tools.hold.p1":
      "Nhóm theo mục đích — Ru dịu & Âm thanh, Kế hoạch & Lịch sinh hoạt, Tính toán, In & Chia sẻ — với nhãn rõ ràng cho biết công cụ là tiện ích thuần túy hay gắn với hướng dẫn.",

    "page.evidence.eyebrow": "Bằng chứng",
    "page.evidence.lede": "Nội dung của nhận định này, những nguồn gốc nào hỗ trợ nó, và lần kiểm chứng gần nhất.",
    "page.evidence.claim.title": "Nhận định",
    "page.evidence.sources.title": "Nguồn hỗ trợ",
    "page.evidence.original.title": "Nguồn gốc",

    "guidance.contentLanguage.label": "Ngôn ngữ hướng dẫn",
  },
});

/** Every valid app message id. */
export type AppMessageKey = keyof (typeof MESSAGES)["en"];
