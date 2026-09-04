# HowToBaby AI Instruction

This file is the canonical AI instruction entry point for HowToBaby.
If a repository instruction conflicts with this file, this file takes precedence unless the user explicitly overrides it in the current task.

## 1. Operating Contract

- Communicate with the user in Vietnamese (xưng "mình" với "bạn") unless explicitly requested otherwise.
- Use English for code comments, public APIs, identifiers, file names, commit messages, and technical documentation unless the project explicitly requires otherwise.
- Be direct, practical, architecture-aware, and shop-floor aware. Never over-explain obvious details.
- Explain tradeoffs only when they materially affect correctness, reliability, maintainability, production accuracy, recoverability, or user intent.
- State a concise plan before large, destructive, security-sensitive, or non-trivial changes.
- Ask questions only when a missing decision genuinely blocks correct or safe progress. Otherwise make the safest minimal assumption and proceed.
- After editing, summarize changed files concisely.
- NEVER claim a command, build, test, deployment, migration, or validation succeeded unless it was actually executed and completed successfully.

## 2. Immutable Prime Directive

> **Do not reach a conclusion until it can be justified as the best available conclusion under the known constraints, evidence, and project context.**

Treat every request as a fresh problem. Never accept the first plausible interpretation merely because it resembles prior work.

Before answering, recommending, designing, reviewing, or implementing:

1. Understand exactly what the request requires and which constraints matter.
2. Verify material assumptions against relevant current documentation, implementation, configuration, and tests.
3. Consider a meaningful alternative when more than one reasonable solution exists.
4. Challenge the current best answer for invalid assumptions, overlooked constraints, unnecessary complexity, and materially better options.
5. Conclude only when the result is sufficiently supported by evidence and project context.

Execution discipline:

- Optimize for correctness, simplicity, maintainability, reversibility, and project fit — not agreement.
- NEVER over-engineer, broaden scope, or introduce concepts unnecessary to solve the actual request.
- Make the smallest complete change that preserves project integrity.
- Preserve current intent, architecture, terminology, public behavior, and ownership boundaries unless change is necessary and justified.
- Introduce a new abstraction, dependency, convention, or architectural layer only when it provides material value that cannot be achieved cleanly within the existing design.
- Keep implemented behavior, planned capability, historical behavior, and proposed design explicitly separate.
- Stop investigating when sufficient evidence supports a safe conclusion.

## 3. Read only the context the task needs

Use `docs/DOCS_INDEX.md` to locate the canonical owner. Search headings/terms first; do not load every large document indiscriminately.

- `docs/PROJECT_PROFILE_v0.8.0.md` — mission, scope, product principles, non-negotiable decisions.
- `docs/GUIDANCE_CONTENT_CONTRACT.md` — age logic, Feeding/Development/Sleep/Safety content rules.
- `docs/EVIDENCE_PROVENANCE.md` — SourceRecord/ClaimSourceRef/locator, public citations, original-source links.
- `docs/SYSTEM_ARCHITECTURE.md` — runtime/build/evidence planes and storage abstractions.
- `docs/REPOSITORY_STRUCTURE.md` — repo/package ownership and dependency boundaries.
- `docs/REPOSITORY_HEALTH.md` — Git/large-file/generated/cache/media policy and CI health gates.
- `docs/LICENSING_POLICY.md` — software/content licenses, third-party rights, contribution/trademark/vendor/media boundaries.
- `docs/GUI_DESIGN.md` — approved product UI behavior and evidence/safety presentation.
- `docs/THEME_SYSTEM.md` — theme contract, first/third-party adapters, licensing isolation.
- `docs/TOOL_PLATFORM.md` — Tool Registry, audio/utilities and guidance-linked tool behavior.
- `docs/EVIDENCE_UPDATE_ENGINE.md` — source monitoring/diff/impact/review workflow.
- `docs/IMPLEMENTATION_ROADMAP.md` — current phase, dependencies and gates.
- `README.md` — public overview and verified operational commands once implementation exists.

English docs are canonical. Vietnamese companion docs are for review/readability and do not independently redefine implementation contracts.

If docs and implementation conflict, expose the conflict. Current code/tests prove what exists now; they do not silently override canonical product rules.

## 4. Project identity and priority

HowToBaby is an evidence-to-action parent guidance **and utility** platform for children from birth through `<5 years` initially. It organizes authoritative guidance by age/context, translates it into practical action, exposes provenance, and provides useful parent-facing tools.

It is NOT a diagnosis engine, medical record, developmental screening test, emergency service, or substitute for pediatric care.

Priority order:

1. Safety and medical-meaning integrity
2. Evidence/provenance correctness
3. Product/domain correctness
4. Privacy
5. Maintainability and architecture integrity
6. Accessibility
7. Reliability and deterministic builds
8. Performance
9. UX clarity
10. Visual polish
11. Developer convenience

## 5. Non-negotiable evidence/content invariants

- Current approved **original authorities** are the evidence source of truth. HowToBaby English is the canonical product interpretation, not medical authority itself.
- Every shipped health/safety claim must resolve through canonical provenance to approved source relationship(s) and original-source link/locator where practical.
- NEVER invent a source, quote, guideline, age threshold, evidence grade, contraindication, emergency instruction, or source update date.
- Preserve qualifiers such as `about`, `may`, `when ready`, `not recommended`, scope limitations, uncertainty, and jurisdiction. **No invented precision.**
- Age selects candidate guidance; age alone does not prove readiness, suitability, diagnosis, or developmental status.
- English canonical content is authored/reviewed first. Vietnamese must preserve semantic parity, including quantities, negation, urgency, age boundaries, qualifiers, contraindications, stop conditions, applicability conditions, and evidence meaning.
- Vietnamese user-facing copy must also read as natural, professional native Vietnamese according to `GUIDANCE_CONTENT_CONTRACT.md` §10. Do not translate English sentence structure word-for-word, do not polish a machine-like Vietnamese sentence without checking the canonical English, and do not force one English term to one Vietnamese term in every context. Restructure sentences freely when needed for idiomatic Vietnamese as long as semantic parity is preserved.
- In parent-facing Vietnamese evidence/provenance copy, generic `source` terminology defaults to `tài liệu`, not bare `nguồn`. Use the approved vocabulary in `GUIDANCE_CONTENT_CONTRACT.md` §10 and `GUI_DESIGN.md` §6, including `Tài liệu tham khảo`, `Tài liệu gốc`, `Tài liệu tham khảo chính`, `Tài liệu hỗ trợ trực tiếp`, `Tài liệu đối chiếu`, `Tài liệu bổ trợ`, `Tài liệu có khuyến nghị khác`, and `Phiên bản tài liệu hiện tại`.
- NEVER apply the `tài liệu` rule as a repository-wide string replacement. Technical identifiers/model concepts such as `SourceRecord`, `SourceLocator`, `ClaimSourceRef`, `sourceId`, `sourceRefs`, `source of truth`, `data source`, source indexes, and the `/sources` route retain their technical identity.
- When editing Vietnamese user-facing copy, perform two checks: (1) read it independently as natural Vietnamese; (2) compare against canonical English for quantities, age boundaries, qualifiers, negation, urgency, contraindications, applicability and stop conditions.
- `official-guidance` requires approved direct/primary support according to `GUIDANCE_CONTENT_CONTRACT.md` and `EVIDENCE_PROVENANCE.md`.
- Source disagreement must remain visible when materially relevant; NEVER silently average conflicting guidance.
- Evidence labels, inline source chips, Evidence Drawer, page references, print citations, and guidance-linked Tool citations come from one canonical provenance graph. Do not maintain parallel manual citation lists.
- Interpret + cite + link is the default reuse mode. Do not republish full third-party works unless license/permission/syndication explicitly permits it.
- A detected source change marks impact/review state on the Evidence Watch review path; it does not silently rewrite or auto-publish medical guidance.
- AI may assist diff triage/drafting/translation/retrieval, but AI output is NEVER canonical without the required source verification/review path.
- Evidence Watch actionable source changes MUST use the canonical Draft-PR review path. `SOURCE_MOVED` is always an actionable evidence change, never a metadata-only outcome; so is a locator that stops resolving, and a `SOURCE_RETURNED` when a source accepted as absent becomes available again. `SOURCE_MISSING` requires confirmed deterministic absence — never a timeout, TLS/DNS/auth/rate-limit/5xx or parser failure — and never a fabricated fingerprint. Merging an Evidence Watch review Pull Request means that evidence event is resolved: a required review-resolution check blocks a merge that would leave the same event in `changed-review-required` (`REVIEW_RESOLUTION_INCOMPLETE`). AI Review Summary may assist but cannot override deterministic policy risk, satisfy human/clinical review, approve, merge, or publish. AI failure must never suppress the deterministic review artifact, and an unavailable/failed AI review must never be rendered as a synthesized semantic assessment. GitHub Issues are reserved for operational failures only. A detected source change produces a derived review signal from `SourceRecord.status`; Evidence Watch must never mutate `Claim.reviewStatus`. Watcher operational state (ETag/Last-Modified/fingerprints/check metadata/cache) may update automatically; canonical `SourceRecord` metadata and every other canonical authored file change only through the reviewed merge path, so a deterministic metadata-only result must never write canonical state to `main`. The pending Draft PR — not the public site — is the Phase 9 v1 pending-review signal: public provenance state changes only as a consequence of a reviewed merge reaching production.

For a health/safety content change, inspect the actual current primary source when tooling/access permits. If a material source cannot be verified, say so and do not fabricate certainty.

## 6. Canonical knowledge and storage invariants

- Reviewed YAML/structured text in Git is the **permanent canonical HowToBaby knowledge source**, even after adding a backend, PostgreSQL, CMS, or AI service.
- `knowledge.sqlite`, generated JSON/manifests, route/search/reverse indexes, caches, and future DB projections are **derived and disposable**. Delete + rebuild from canonical Git must produce an equivalent validated projection.
- Never author/review a knowledge change only inside SQLite/PostgreSQL and treat it as canonical.
- Do not add a backend merely because the knowledge file count grows or Evidence Watch needs scheduled compute.
- Git stores authored/auditable knowledge, provenance, code, schemas, tests and docs — not bulk artifacts.
- `knowledge.sqlite`, build output, Evidence Watch cache/full downloaded source bodies, parser scratch, and bulk audio/video/image libraries stay out of normal Git by default.
- Evidence Watch operational state is persisted on the dedicated non-canonical `evidence-watch/state` branch (`evidence/state/**`), never merged into `main`, never canonical, and blocked from `main` by a Phase 9 repository-health gate. `comparisonDigest` — frozen at `sha256-v1` over canonical JSON v1, never `checkedAt` or other observation metadata — is the identity of the normalized monitored material only, never of the complete source condition. The complete observed condition is a compact `SourceObservation` (availability, public-safe normalized effective URL, optional fingerprint, `locatorSetDigest`, locator states keyed by a derived `locatorKey`, bounded classification signals) identified by a domain-separated `sourceObservationDigest`, and it is what decides `SOURCE_MISSING`, `SOURCE_MOVED`, `SOURCE_RETURNED`, locator state, freshness, `REVIEW_REVERTED_TO_BASELINE`, AI attempt identity and review generation. State keeps both an `acceptedObservation` and a `comparisonBaseline` (the last accepted **available** material), distinct from the last observed observation; neither advances without a valid resolution verified against the merged Pull Request head, the finalizer installs the exact accepted observation the freshness acceptance retained, and `comparisonBaseline` stays at the last available fingerprint when that accepted observation is a confirmed absence. A `monitorConfigHash`/`parserVersion`/`comparisonDigestVersion`/`sourceObservationDigestVersion` mismatch is `REBASELINE_REQUIRED`, never a diff result. `evidence/state/manifest.json` is the initialization registry that separates a never-initialized monitor (`BOOTSTRAP_REQUIRED`) from an initialized source whose state was lost (`STATE_MISSING`/`STATE_CORRUPT`); its lifecycle is a closed transition set and it carries no self-referential state-commit SHA field. Canonical `SourceLocator` has no identifier and Phase 9 adds none: Evidence Watch derives an operational `locatorKey` from the structural locator fields (excluding `paragraphHint` and `supportNoteKey`), and a reviewed canonical locator edit is a monitoring-scope sync, never an upstream evidence change — while a locator that fails to resolve stays actionable. Nothing persisted to state, hashed into a digest, rendered into a Pull Request or sent to AI may carry credentials, signed tokens, session identifiers, cookies or secret query parameters: the repository and the state branch are public. Bootstrap, rebaseline, reconcile and retry-ai are explicit manual operations, never something a scheduled run does silently; an initialized source is never re-bootstrapped to recover lost state; state-sync failure fails closed; and writes to that branch are serialized fast-forward compare-and-swap commits, never force-pushed (workflow concurrency is not the transactional mechanism). Review creation is a reserve-first saga, so a crash between the GitHub and state writes never opens a duplicate Pull Request; the review branch preserves maintainer canonical edits and is never reset or force-pushed; every new observed source condition produces a new review head SHA, invalidating stale approvals and freshness acceptance; one open review pins its own observation semantics (`monitorConfigHash`, `locatorSetDigest`, `parserVersion`, both digest versions) and is repinned and re-observed when the review branch changes them, so a scheduled run never overwrites it with an observation taken under older `main` semantics; a merged or closed Pull Request is never adopted as the current review, a resolved review's branch is cleaned up idempotently, and the next evidence event for that source branches afresh from `main`; a review Pull Request must be current with `main` and pass all three required checks — review-integrity, source freshness over the complete observation (whose PASS is reported only after the acceptance is durably written) and review-resolution — with human approval on the latest reviewable head; and upstream returning to the exact accepted observation resolves as `REVIEW_REVERTED_TO_BASELINE`, not as a monitor defect, never on content equality alone.
- Follow `REPOSITORY_HEALTH.md`; do not bypass repository-size/large-blob guards just to make CI pass.
- Large production media belongs in object storage/CDN. Git LFS is an explicitly justified exception, not the default architecture and never the destination for canonical YAML/Markdown/JSON.

## 7. Personalization/privacy/safety context

- Public guidance must remain browseable without a child profile.
- v1 child profile is local-first; do not send name/DOB/due date to a server, URL, analytics, logs, or telemetry unless a future canonical contract explicitly introduces that behavior.
- Name is display-only; DOB/due date resolve context but do not create medical diagnosis.
- Actual-child safety context is distinct from browsed stage and future plan-date preview.
- Browsing an older/future stage must NEVER unlock safety-sensitive guidance inappropriate for the actual child or suppress current infant safety guidance.
- Feeding, Development/Play, Sleep, and Safety may use different age bases. Never force a universal stage map.

## 8. Tools invariants

- Tools are first-class product features but **claim-neutral by default**.
- A utility must not inherit a therapeutic/medical claim simply because it appears in HowToBaby.
- Guidance-linked tools reference canonical claim IDs/provenance rather than duplicating medical prose or source URLs.
- Example: a 432 Hz/audio option may exist as a listening preference without claiming improved sleep, brain development, calming, or other health benefit unless canonical evidence explicitly supports the claim.
- Safety rules can interrupt or constrain Tool UX.
- Large media libraries use external storage/CDN per `REPOSITORY_HEALTH.md` and `TOOL_PLATFORM.md`.

## 9. Architecture and ownership

Preserve the intended direction:

```text
Canonical YAML/Git
      ↓ validate/compile
Derived read models (SQLite/manifests/bundles)
      ↓
Core/domain resolvers
      ↓
App/UI/Tools
```

Evidence operations are separate:

```text
Original source
   ↓ fetch/fingerprint/diff
Impact analysis
   ↓
Review-required report/PR
   ↓ human/source verification
Canonical YAML/Git
```

Key ownership:

- `apps/web` — routes/composition/browser behavior; no canonical medical prose.
- `packages/core` — pure age/context/applicability logic; no React or user-facing medical prose.
- `packages/knowledge` — canonical source/claim/guidance/translation graph + repository interfaces.
- `packages/ui` — presentation/evidence primitives; does not decide medical applicability.
- `packages/themes` — vendor-neutral Theme Contract/adapters/first-party themes.
- `packages/tool-platform` + `tools/*` — Tool Registry/runtime and individual utilities.
- `evidence/*` — source monitoring/diff/impact/reporting; not canonical authoring.

Never create competing source trees, duplicate knowledge stores, parallel citation systems, or vendor-theme dependencies inside domain code.

## 10. Next.js and backend discipline

- Preserve **Next.js + TypeScript, static-first and server-capable** unless the user explicitly approves a foundational change.
- Public shared routes should be statically rendered when appropriate.
- Full static export may be a deployment profile but is not a permanent architecture constraint.
- Add server/backend capabilities only when a feature needs request-time persistence/compute, e.g. accounts, sync, subscriptions, notifications, user history, or a secured assistant gateway.
- A future backend may project canonical knowledge for query performance; it may not replace YAML/Git authority.

## 11. Theme discipline

- Product/domain components consume HowToBaby semantic tokens/primitives, not raw Baby Modern Glass values or vendor APIs.
- Baby Modern Glass is the first-party baseline theme, not the product architecture.
- Purchased/open-source React themes integrate only through the Theme Contract (`tokens`, approved `primitives`, or approved `shell` adapters).
- Do not import an entire commercial template into `apps/web` and retrofit product logic into vendor pages.
- Respect theme license/redistribution constraints. Restricted theme code/assets must not be exposed in a public repository accidentally.
- A theme cannot override evidence meaning, safety hierarchy, age logic, routing semantics, or Tool safety behavior.

## 12. Licensing and third-party rights discipline

- Treat `docs/LICENSING_POLICY.md` as canonical for license scope. Never change repository license choices or path coverage without explicit maintainer approval.
- Original HowToBaby software defaults to `AGPL-3.0-only`; original HowToBaby-authored knowledge/docs/translations default to `CC-BY-NC-SA-4.0` where the project actually has licensing rights.
- Never assume cited CDC/AAP/FDA/WHO/other source material inherits the HowToBaby content license. Provenance is not relicensing.
- Never commit or redistribute purchased theme code/assets, fonts, icons, audio, images, source snapshots, or other third-party material unless redistribution rights are explicit and required notices are preserved.
- Keep HowToBaby name/logo/brand permissions separate from code/content permissions; repository licenses do not grant trademark permission.
- Do not accept/merge substantial external canonical knowledge or translations until the documented contribution-rights/CLA path exists.
- When adding dependencies or assets, verify license compatibility when material to distribution; unknown/custom/restricted licenses require review rather than assumption.
- Preserve SPDX/license/attribution notices. Do not remove or rewrite upstream notices merely for formatting consistency.
- A generated artifact does not gain a new permissive license merely because it was generated by project code; underlying content/asset rights still apply.

## 13. Change discipline

- Preserve existing naming, IDs, ownership boundaries, and behavior unless the requested change requires otherwise.
- Make the smallest complete change; do not mix unrelated refactors, formatting, renames, dependency upgrades, or architecture work.
- Introduce an abstraction/dependency only when it provides material value within the current project/phase.
- Keep implemented behavior, planned behavior, historical behavior, and proposals explicitly separate.
- Stable claim/source/tool/theme IDs must not change merely because files move or labels change.
- Never silently swallow validation/fetch/build failures.
- Keep secrets, private child/user data, restricted vendor assets, and private source caches out of logs and source control.

When debugging: establish observed vs expected behavior, reproduce with the smallest safe path, prove the root cause, apply the smallest safe fix, and add a regression test when practical.

## 14. Phase discipline

- Inspect the current phase in `IMPLEMENTATION_ROADMAP.md` before non-trivial implementation.
- Do not implement later-phase behavior merely because it is easy or attractive.
- Infrastructure may be made future-compatible only when it does not broaden current behavior or create unnecessary complexity.
- Do not claim a phase is complete until its documented gate is actually satisfied.

## 15. Testing and validation

Verify repository commands from actual configuration/README before running or documenting them. Never invent scripts.

Run the narrowest relevant validation first, then broader gates proportional to risk.

Depending on the change, validation should cover:

- TypeScript/type checks and lint;
- unit/integration/E2E tests;
- date/age/stage boundary tests;
- content schema and coverage validation;
- source/provenance/locator validation;
- EN/VI parity and safety-translation parity;
- no-invented-precision/content classification rules;
- deterministic SQLite/index rebuild;
- repository-health checks;
- theme capability/vendor-boundary checks;
- responsive/print/accessibility/visual checks;
- production build/deployment profile when relevant.

Tests and source-monitoring tasks must not mutate production/user data.

## 16. Version-control summary

After file changes, every response must include a concise `Commit description`. Leave changes uncommitted by default; NEVER create/amend/push a commit unless the user explicitly requests it.

Required format:

```text
Describe the overall completed change directly without a type or scope prefix.

- type(scope): Describe the first material logical change.
- type(scope): Describe each additional logical change when applicable.
```

Rules:

- First line: plain-language imperative, no Conventional Commits prefix.
- Bullets: use the most specific conventional prefix (`feat`, `fix`, `docs`, `refactor`, `test`, `build`, `ci`, `chore`, `perf`, `revert`) and optional scope.
- Do not include a bullet for work that was not actually completed.
- Enclose the entire commit description in one standalone fenced `text` block.
