# Canonical documentation changes for Vietnamese writing quality

These are the canonical contract changes that should accompany the translated files in this pack. English remains the canonical implementation documentation; the Vietnamese companion is for review/readability.

## 1. `docs/GUIDANCE_CONTENT_CONTRACT.md` — replace/expand §10 Translation contract

Keep the existing pipeline, then make §10 read substantially as follows:

```md
## 10. Translation contract

Pipeline:

```text
English authoring → source verification → review → Vietnamese translation → parity validation → release
```

Vietnamese must preserve age boundaries, approximate/range language, negation, urgency, quantities, contraindications, stop conditions, applicability conditions, and evidence meaning.

### Vietnamese writing quality

Semantic parity is necessary but not sufficient. Parent-facing Vietnamese must read as natural, professional Vietnamese rather than as an English sentence translated word by word.

- Translate from the canonical English meaning and context, not by polishing a previous machine-like Vietnamese rendering.
- Sentence structure may be reordered, split or combined when needed for idiomatic Vietnamese, provided the medical/editorial meaning is unchanged.
- Prefer familiar parent-facing language. Use technical terminology only when it materially improves accuracy, and keep it understandable to a non-clinical reader.
- Avoid English calques and one-to-one glossary thinking. Terms such as `source`, `claim`, `readiness`, `practical`, and `development` must be translated according to context rather than forced into one Vietnamese word everywhere.
- For parent-facing copy, `source` is normally `nguồn`; use a more specific form such as `nguồn ban đầu`, `nguồn chính`, or `nguồn tham khảo` only when the distinction is useful.
- `readiness` should normally read as `dấu hiệu sẵn sàng` or `mức độ sẵn sàng của bé` according to context. `developmental readiness` should use natural wording such as `sẵn sàng về mặt phát triển`, never a literal calque such as `sẵn sàng về phát triển`.
- `practical` should be rendered by meaning — for example `thiết thực`, `dễ áp dụng`, or `áp dụng thực tế` — rather than by a fixed dictionary substitution.
- Never add reassurance, certainty, advice, urgency, or medical meaning that the canonical English does not contain.
- Review Vietnamese in two separate passes: first as standalone native Vietnamese for fluency/clarity, then against English for semantic parity.

A translation that is semantically correct but visibly machine-like is not release-ready. A fluent translation that loses a qualifier, negation, quantity, age boundary, contraindication, or stop condition is also not release-ready.
```

This section owns the linguistic quality contract; do not duplicate a separate competing glossary elsewhere.

## 2. `docs/GUI_DESIGN.md` — add under §6 Language control/localization

```md
### Vietnamese copy quality

All Vietnamese user-facing copy follows `GUIDANCE_CONTENT_CONTRACT.md` §10. UI copy must be concise, native-sounding and professional; it must not mirror English word order or rely on literal one-to-one terminology. Short controls should prefer familiar Vietnamese labels, while evidence/safety copy may use more explicit wording when clarity matters. Exact source titles, proper names, URLs, license identifiers and canonical IDs remain untranslated as defined above.
```

## 3. `CLAUDE.md` — strengthen §5 Vietnamese rule

Replace the current single Vietnamese-parity bullet with these two bullets:

```md
- English canonical content is authored/reviewed first. Vietnamese must preserve semantic parity, including quantities, negation, urgency, age boundaries, qualifiers, contraindications, stop conditions, applicability conditions, and evidence meaning.
- Vietnamese user-facing copy must also read as natural, professional native Vietnamese according to `GUIDANCE_CONTENT_CONTRACT.md` §10. Do not translate English sentence structure word-for-word, do not polish a machine-like Vietnamese sentence without checking the canonical English, and do not force one English term to one Vietnamese term in every context. Restructure sentences freely when needed for idiomatic Vietnamese as long as semantic parity is preserved.
```

## 4. `docs/GUI_DESIGN_VI.md` — add a companion note

Add near the language/localization section:

```md
### Văn phong tiếng Việt

Toàn bộ nội dung tiếng Việt hiển thị cho người dùng phải tuân theo `GUIDANCE_CONTENT_CONTRACT.md` §10: đúng nghĩa thôi chưa đủ, câu chữ còn phải tự nhiên, rõ ràng và chuyên nghiệp như nội dung được biên soạn trực tiếp bằng tiếng Việt. Không dịch theo thứ tự từ/cấu trúc câu tiếng Anh và không ép một thuật ngữ tiếng Anh thành cùng một từ tiếng Việt trong mọi ngữ cảnh. Có thể đổi trật tự, tách hoặc gộp câu để tiếng Việt tự nhiên hơn, miễn giữ nguyên mốc tuổi, số liệu, mức độ chắc chắn, phủ định, cảnh báo, chống chỉ định và điều kiện áp dụng/dừng.
```

Also update evidence examples in the companion so they match the polished public labels:

- `Phát hành` → `Ngày xuất bản`
- `Cập nhật` → `Ngày cập nhật`
- `Xem nguồn gốc` → `Xem nguồn ban đầu`
- `Nguồn dùng trên trang này` → `Nguồn tham khảo trên trang này`
- `Vì sao dùng nguồn này` → `Vì sao HowToBaby dùng nguồn này`
- `Áp dụng cho` → `Phạm vi áp dụng` where it is the metadata label for jurisdiction.

Do not change canonical identifiers or source-status enum names.
