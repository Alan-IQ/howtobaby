Apply the attached Vietnamese-polish pack to the current HowToBaby main branch.

Use the replacement files exactly as the translation baseline:
- `apps/web/src/i18n/messages.ts`
- `apps/web/src/features/evidence/labels.ts`
- `apps/web/src/features/evidence/labels.test.ts`
- `packages/knowledge/src/translations/vi/feeding.yaml`
- `docs/GUIDANCE_CONTENT_CONTRACT_VI.md`

Then apply the canonical documentation changes described in `CANONICAL_DOC_CHANGES.md` to:
- `docs/GUIDANCE_CONTENT_CONTRACT.md`
- `docs/GUI_DESIGN.md`
- `docs/GUI_DESIGN_VI.md`
- `CLAUDE.md`

Do not rewrite the English user-facing copy, canonical IDs, exact source titles, organization names, URLs or license identifiers.

The purpose of this change is linguistic quality only: Vietnamese must read naturally and professionally while preserving the existing Phase 2 product/evidence behavior. Do not change route behavior, evidence logic, source-date logic, i18n architecture, schema, lifecycle semantics or Phase 3+ scope.

After applying:
1. inspect any tests with exact Vietnamese string assertions and update only assertions affected by the approved wording;
2. run `pnpm validate` under the repository's Node 24 baseline;
3. report any semantic-parity failure rather than weakening or bypassing the validator;
4. report changed files and validation result concisely.
