# HowToBaby Vietnamese Polish Pack

Prepared against repository state audited at `1e79dd239d59e5cece0cdd63726560a66a4155e4`.

## Ready-to-replace files

Copy these paths over the same paths in the repository:

- `apps/web/src/i18n/messages.ts`
- `apps/web/src/features/evidence/labels.ts`
- `apps/web/src/features/evidence/labels.test.ts`
- `packages/knowledge/src/translations/vi/feeding.yaml`
- `docs/GUIDANCE_CONTENT_CONTRACT_VI.md`

## Canonical docs

Apply the targeted canonical-contract changes in `CANONICAL_DOC_CHANGES.md` to:

- `docs/GUIDANCE_CONTENT_CONTRACT.md`
- `docs/GUI_DESIGN.md`
- `docs/GUI_DESIGN_VI.md`
- `CLAUDE.md`

`APPLY_WITH_CLAUDE.md` is a ready-to-paste integration instruction if Claude is doing the repository edit.

## Review notes

Read `TRANSLATION_REVIEW.md` for translation choices, terminology and the semantic-parity review of the current feeding guidance.

## Validation

After integration, run:

```bash
pnpm validate
```

The replacement TypeScript files were syntax-checked independently and the YAML file was parsed successfully in this pack. Full monorepo validation must still be run after the files are applied to HowToBaby.
