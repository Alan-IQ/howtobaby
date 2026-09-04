# IMPLEMENTATION_ROADMAP — HowToBaby

> Canonical execution sequence. This document owns phase ordering and release gates; permanent product/domain rules belong to the specialist contracts.

## Phase 0 — Documentation and repository baseline

**Goal:** freeze contracts before production implementation.

Deliverables:

- adopt v0.8.0 documentation set;
- implement logical/physical repo baseline from `REPOSITORY_STRUCTURE.md`;
- add gitignore/cache policy for fetched third-party evidence material;
- implement `REPOSITORY_HEALTH.md` baseline: large-blob guard, generated SQLite/cache/media exclusions, repository-size reporting, and allowlist/exception mechanism;
- coding/PR conventions;
- CI skeleton;
- decisions recorded for static-first deployment target without permanently forcing full static export;
- Theme System contract and third-party license-isolation policy established.
- root multi-license files established (`LICENSE.md`, `LICENSES/*`, `THIRD_PARTY_NOTICES.md`, `CONTRIBUTING.md`) and `LICENSING_POLICY.md` adopted;
- dependency/asset license-reporting approach defined for implementation;

Gate:

- docs have no unresolved architecture contradictions;
- every top-level package/artifact has one canonical owner;
- external-source cache cannot be committed accidentally;
- `knowledge.sqlite`, generated build artifacts, and bulk media cannot enter normal Git accidentally;
- repository health check runs in CI and reports current Git/object-size health;
- `PROJECT_PROFILE` references current specialist docs.
- license scope/path mapping is unambiguous and restricted third-party material cannot silently inherit repository licenses.

## Phase 1 — App shell + theme engine

**Goal:** establish a reusable UI foundation before domain screens multiply.

Deliverables:

- Next.js + TypeScript configured **static-first and server-capable**;
- no permanent `output: "export"` constraint in the canonical app configuration; a static-export deployment profile may be added if hosting requires it;
- `ThemeProvider`/Theme Registry + Theme Contract;
- primitive/shell adapter interfaces from `THEME_SYSTEM.md`;
- Baby Modern Glass Light/Dark first-party token packs;
- typography/spacing/radius/motion foundations;
- AppShell/Header/Nav;
- responsive baseline;
- print profile scaffold;
- theme token/primitive/capability completeness validation;
- vendor-theme import boundary lint/check;
- sample adapter fixture proving a third-party theme can map without domain imports.

Gate:

- components contain no Baby Modern Glass-specific raw palette dependencies outside theme definitions;
- product/domain components contain no direct vendor-theme imports;
- Light/Dark geometry parity verified;
- switching between baseline and adapter fixture changes presentation only;
- static-first build deploys; full-static export remains optional.

## Phase 2 — Content/source schema platform

**Goal:** make evidence structured and compile a deterministic knowledge read model before migrating large amounts of prose.

Deliverables:

- SourceRecord + SourceStatus/AccessMode schema;
- ClaimSourceRef + SourceLocator relationship schema;
- Claim/GuidanceBlock/applicability/precision/review schemas;
- content version manifest;
- EN/VI key framework;
- source ID/relationship/locator/original-link validation;
- canonical YAML/Git authoring baseline for sources/claims/guidance/translations;
- `KnowledgeRepository` read-model interface;
- generated `knowledge.sqlite` derived index (gitignored; built locally/CI and optionally cached as an artifact);
- generated `claim-evidence`, `source-claim`, `route-evidence`, and `tool-evidence` indexes;
- SourceChip, EvidenceDrawer, and ReferenceList primitives;
- coverage matrix framework;
- trust/evidence-page scaffolds.

Gate:

- invalid source IDs/claim relationships/precision states fail CI;
- `official-guidance` without approved direct/primary source fails CI;
- one sample claim renders EN/VI + SourceChip + EvidenceDrawer + page References from canonical data;
- deleting `knowledge.sqlite` + generated evidence indexes and rebuilding produces deterministic equivalent results;
- no canonical claim/source/review data exists only in SQLite or generated output;
- a sample SQLite query resolves source → claim → route/tool impact correctly.

## Phase 3 — Age/context + browse/public routing

**Goal:** establish deterministic context without tying all access to a profile.

Deliverables:

- date utilities;
- chronological age;
- corrected-development proxy;
- actual/browsed/preview state isolation;
- Browse by Age;
- optional local profile;
- static public route generation;
- Why-this-stage component.

Gate:

- boundary/timezone tests pass;
- browse works with zero profile data;
- exact child data never enters URL/metadata.

## Phase 4 — Play & Development domain

**Goal:** migrate the development prototype into the canonical content graph.

Deliverables:

- stage map;
- milestone context;
- activities/variations;
- corrected-age handling;
- stage navigator;
- source audit;
- print stage/all-stage support.

Gate:

- milestones are not pass/fail;
- CDC checklist resolution behavior tested;
- EN/VI/content coverage passes;
- all shipped health/safety claims expose original-source provenance through canonical evidence UI.

## Phase 5 — Sleep + Safe Sleep domain

**Goal:** migrate the sleep prototype while separating evidence classes.

Deliverables:

- official duration source matrix;
- safe-sleep guidance;
- responsive newborn mode;
- nap/wake-window heuristic model;
- editable example plan;
- settling vs behavioral-method architecture;
- sleep print views.

Gate:

- 0–2m defaults responsive;
- heuristic labels visible;
- browsed stage cannot suppress actual infant safety;
- sleep events do not dictate feeding frequency.

## Phase 6 — Feeding + Feeding Safety domain

**Goal:** build a complete age/readiness-aware feeding contract.

Deliverables:

- feeding stage resolver;
- what/how/texture/responsive feeding;
- solids readiness education;
- iron/nutrient content;
- allergen architecture;
- choking preparation metadata;
- formula/breast-milk handling;
- source audit.

Gate:

- 4-month birthday alone does not unlock solids;
- allergen branches remain source-specific;
- choking-relevant examples have preparation metadata;
- safety-critical claims meet review policy.

## Phase 7 — Personalized Now composer

**Goal:** combine independent domain outputs into the core HowToBaby experience.

Deliverables:

- What Matters Now;
- Feed/Play/Sleep/Safety focus cards;
- Know/Do/Why/Watch/Source disclosure;
- example routine/timeline;
- adjustments drawer;
- content freshness summary;
- Now cards reuse the same claim provenance/EvidenceDrawer as public domain pages.

Gate:

- no false precision;
- safety can override example plan;
- public and personalized views resolve equivalent claim IDs and source provenance where contexts match.

## Phase 8 — Tools Platform + Audio Tools MVP

**Goal:** prove HowToBaby is a platform, not only a knowledge site.

Deliverables:

- Tool Registry;
- Tools hub;
- ToolShell/ToolCard;
- shared AudioSession;
- Lullaby Player;
- Ambient/Frequency Player with optional 432 Hz preset;
- sleep timer/fade-out;
- persistent mini-player if UX remains clean;
- utility-vs-guidance labels.

Gate:

- no therapeutic 432 Hz claim;
- audio requires user gesture;
- player accessible and stable across navigation;
- tool metadata/schema validation passes;
- guidance-linked Tool health claims resolve to canonical provenance and never maintain separate source URLs.

## Phase 9 — Evidence Watch v1

**Goal:** automate source-change detection and route every actionable change through the mandatory Draft-PR review path, without autonomous medical rewriting. Contract: `EVIDENCE_UPDATE_ENGINE.md`.

Deliverables:

- source monitor registry;
- adapter interface;
- CDC structured adapter where applicable;
- FDA RSS/structured adapter where applicable;
- AAP policy-index monitor;
- WHO feed/page monitor;
- hash/section diff;
- source-locator resolution/move detection where configured;
- source→claim reverse dependency index reused from canonical provenance;
- temporary evidence cache + metadata/fingerprint persistence policy;
- durable watcher operational state on the dedicated non-canonical `evidence-watch/state` branch (`evidence/state/manifest.json`, `evidence/state/sources/<sourceId>.json`), kept separate from canonical knowledge, so a run refreshes fingerprints/check metadata without writing canonical `SourceRecord` metadata — or any other canonical authored file — to `main` (`EVIDENCE_UPDATE_ENGINE.md` §11, §13, §21);
- a deterministic `comparisonDigest` as the single fingerprint comparison identity, frozen at `comparisonDigestVersion = "sha256-v1"` over the canonical JSON v1 encoding of `{digestVersion, sourceId, monitorConfigHash, parserVersion, material}`, excluding observation-only fields (`EVIDENCE_UPDATE_ENGINE.md` §8);
- a `monitorConfigHash` defined over comparison/identity-affecting monitor configuration only, excluding scheduling/retention-only properties such as `interval` and `licenseMode`;
- an `evidence/state/manifest.json` initialization registry (`lifecycle`, `everInitialized`) that distinguishes a never-initialized monitor (`BOOTSTRAP_REQUIRED`) from an initialized source whose state was lost (`STATE_MISSING`/`STATE_CORRUPT`), and marks a removed/disabled monitor `inactive` rather than corrupt;
- a deterministic state schema migration path, with `STATE_SCHEMA_MIGRATION_REQUIRED` when migration is unsupported and no baseline advancement either way;
- per-source state with a `comparisonBaseline` distinct from `lastObservedFingerprint`, pinned `monitorConfigHash`/`parserVersion`/`comparisonDigestVersion`, and `pendingReview` tracking `reviewKey`, `phase`, `reviewBaseSha`, `reviewHeadSha`, the baseline/observed digests, `reviewPayloadDigest`, `aiAttempt` and `freshnessAccepted`;
- explicit manual `bootstrap`, `rebaseline`, `reconcile` and `retry-ai` dispatch modes, separate from the scheduled run;
- a reserve-first review saga (`reserved → open`) with deterministic lookup by `sourceId`/`reviewKey`/review branch, so a crash between the GitHub and state writes resumes or adopts instead of opening a duplicate Pull Request (`REVIEW_STATE_MISMATCH` fails closed);
- review branches that preserve maintainer canonical edits — never reset, never force-pushed, `REVIEW_BRANCH_CONFLICT` on conflict — with a new review head SHA (a bot-owned review-refresh commit when needed) for every new upstream digest;
- Pull Request head synchronization on the `opened`/`synchronize`/`reopened` events, invalidating freshness and re-running the required checks, without re-running AI for a maintainer commit;
- a deterministic `reviewPayloadDigest` (§12) and a required review-integrity status check bound to the exact Pull Request head, alongside the deterministic pre-merge source freshness check;
- repository enforcement that a review Pull Request is up to date with `main` and that human approval applies to the latest reviewable head (stale approvals dismissed);
- a deterministic `REVIEW_REVERTED_TO_BASELINE` resolution when upstream returns to the accepted baseline while a review is open;
- an idempotent post-merge reconciliation on the fixed merged-Pull-Request event that also installs the reviewed `monitorConfigHash`/`parserVersion`/`comparisonDigestVersion`, plus serialized fast-forward compare-and-swap, never force-pushed writes to a protected `evidence-watch/state` branch;
- a fetch security contract (scheme allowlist, private-network/redirect validation, bounded redirects/response size/timeouts, no credential replay across hosts);
- a `licenseMode` boundary on the source material sent to an external AI provider (`EVIDENCE_UPDATE_ENGINE.md` §14, `LICENSING_POLICY.md`);
- repository-health/baseline enforcement that keeps populated `evidence/state/manifest.json` and `evidence/state/sources/**` off `main` while allowing the placeholder (`REPOSITORY_HEALTH.md`);
- deterministic actionable-change classification separating unchanged, deterministic metadata-only, actionable evidence change, and operational failure;
- deterministic structured review payload (JSON) + deterministic Markdown renderer;
- automatic idempotent Draft Pull Request creation/update for every actionable evidence change;
- structured, versioned, schema-validated AI Review Summary rendered into that Pull Request;
- AI failure fallback that still creates/updates the deterministic Draft PR with an explicit unavailable/failed status;
- Pull Request/branch deduplication and workflow concurrency control (scheduling assistance only — correctness comes from the compare-and-swap state writes and the reserve-first saga);
- least-privilege GitHub Actions permissions and secret handling for the AI provider credential;
- GitHub Ruleset/branch protection (or equivalent enforcement) on `main` so the Evidence Watch identity cannot push semantic evidence changes directly, bypass the Draft Pull Request review path, bypass required approvals/status checks, or self-approve its own evidence Pull Request (`EVIDENCE_UPDATE_ENGINE.md` §20);
- human-review/merge boundary tests;
- scheduled/manual GitHub Actions workflow.

Gate:

- unchanged sources do not create noise;
- a test source change flags only dependent claims/routes/tools;
- every actionable evidence change creates or updates exactly one Draft Pull Request for that `sourceId`, and repeated runs do not duplicate branches or Pull Requests;
- AI runs only after deterministic actionable-change detection and impact analysis;
- AI failure or absence never suppresses the deterministic review artifact, and never marks a changed source unchanged;
- an operational failure never masquerades as an evidence-change Pull Request;
- AI cannot lower deterministic policy risk, satisfy a required human/clinical review, approve, merge, or publish;
- `SOURCE_MOVED` is classified as an actionable evidence change and never handled as a metadata-only outcome;
- a deterministic metadata-only result creates no Pull Request, no Issue and no canonical write to `main`: a canonical `SourceRecord` correction it reveals is either left for a maintainer's normal reviewed Pull Request or promoted to an actionable evidence change;
- watcher operational state and canonical knowledge state stay distinct: nothing held only in watcher state/cache is treated as canonical source metadata or as public provenance;
- the pending Draft Pull Request is the Phase 9 maintainer-facing pending-review signal; the public production site is not required to reflect pending watcher state before the reviewed merge, and no backend or runtime freshness service is introduced to publish it;
- the dedicated `evidence-watch/state` branch exists and is used as the durable operational store; artifacts/caches are transient only, and that branch never merges into `main`, never opens as a review Pull Request and never deploys;
- initial bootstrap is explicit and tested; lost or corrupt state never silently rebaselines and never reports `UNCHANGED`;
- a monitor-config or parser mismatch raises `REBASELINE_REQUIRED` and requires an explicit manual rebaseline, which verifies source identity/locator and aborts into an actionable evidence change when it finds a material change;
- `comparisonBaseline` and `lastObservedFingerprint` are separate, and an actionable detection never advances `comparisonBaseline` before a valid resolution;
- exactly one open review Pull Request exists per `sourceId`, repeated upstream revisions update that same Pull Request on the cumulative `comparisonBaseline → latest observed` diff, and an unchanged pending fingerprint triggers no further AI call;
- a merged reviewed Pull Request advances the baseline only to the fingerprint that was actually reviewed, and a closed-unmerged Pull Request advances nothing;
- the Evidence Watch Pull Request freshness check blocks a merge against a known stale reviewed fingerprint;
- `comparisonDigest` semantics are deterministic and exclude observation-only fields, and `checkedAt` never affects fingerprint equality;
- a `checkedAt` change alone leaves `comparisonDigest` unchanged, and the same normalized material always produces the identical `sha256-v1` digest;
- a digest algorithm/version mismatch produces `REBASELINE_REQUIRED`, never a diff result;
- a never-initialized source produces `BOOTSTRAP_REQUIRED`; an initialized source with missing state produces `STATE_MISSING` and is never bootstrapped;
- a supported state schema migration preserves the meaning and digest of `comparisonBaseline`, and an unsupported one raises `STATE_SCHEMA_MIGRATION_REQUIRED` without classifying or advancing anything;
- a crash after the review reservation but before Pull Request creation resumes safely; a crash after creation but before the `prNumber` state sync adopts the existing Pull Request; neither ever creates a duplicate;
- a human commit on the review branch syncs `reviewHeadSha` and invalidates the old freshness acceptance; automation never overwrites human canonical edits; a conflict raises `REVIEW_BRANCH_CONFLICT`;
- a new upstream digest changes the Pull Request head SHA, the old approval becomes stale, and the latest head requires human approval again;
- `main` advancing while the Pull Request is open syncs the branch and recomputes the impact payload, and a `reviewPayloadDigest` mismatch blocks the merge;
- a source going A→B→A while the Pull Request is open follows the `REVIEW_REVERTED_TO_BASELINE` path: the baseline stays A and a valid human close raises no recovery error;
- an AI failure for a digest triggers no automatic AI call on every subsequent cron, `retry-ai` works, and an older digest's summary can never be presented as the current review;
- a configuration/URL change resolved in the reviewed Pull Request leaves the finalizer installing the exact reviewed config/parser/digest-version state, so no fake `REBASELINE_REQUIRED` follows;
- a merged Pull Request whose state write failed is reconciled by retry without a duplicate evidence Pull Request;
- concurrent or stale-head state writes lose no update and never force-push;
- populated `evidence/state` files on `main` fail the repository gate;
- a stale human approval and a stale freshness check can never authorize a merge;
- an unsafe fetch — private-network destination or an unsafe redirect — is rejected, and response-size/timeout limits hold;
- an initialized source can never be bootstrapped again as a state-recovery mechanism;
- lost or corrupt state restores from `evidence-watch/state` history, or — when no valid baseline survives — requires explicit maintainer source verification before a rebaseline bound to that canonical merge;
- post-merge reconciliation is deterministic, idempotent and retryable, and baseline advancement is bound to the exact merged Pull Request head SHA and its freshness-accepted `comparisonDigest`;
- a state-sync failure fails closed: the canonical merge stands, the baseline does not advance, `pendingReview` is not cleared, and no duplicate evidence review is opened;
- a closed-unmerged Pull Request advances no baseline and puts the source into an explicit recovery state until the monitor is fixed;
- writes to `evidence-watch/state` are serialized, atomic per state update and never force-pushed, and the branch is protected against force-push and deletion;
- an unavailable or failed AI review is reported as such and carries no synthesized semantic assessment or summary;
- a detected source change never mutates `Claim.reviewStatus`; dependent claims carry only the derived review signal from `SourceRecord.status`;
- `main` enforcement is configured and verified: the Evidence Watch identity cannot push semantic evidence changes directly to `main`, cannot bypass the Draft PR review path, and cannot bypass required approval/status checks, so only a reviewed merge reaches the production pipeline;
- semantic changes cannot auto-deploy canonical medical prose and cannot reach production before required human review and merge;
- changed source preserves prior provenance/history and enters review-required workflow;
- watcher does not commit full third-party source documents by default.

## Phase 10 — Trust, public discoverability, print, accessibility hardening

**Goal:** make the site credible and usable outside the personalized app flow.

Deliverables:

- Methodology;
- Sources registry view;
- Evidence detail pages/revision history;
- Editorial Policy;
- Medical Disclaimer;
- Changelog/Corrections;
- public age/topic metadata;
- sitemap/robots strategy;
- Letter/A4 QA;
- accessibility pass;
- performance pass;
- optional production-quality third-party theme integration proof if a licensed theme has been selected.

Gate:

- trust pages, original-source links, and evidence detail routes are discoverable;
- no child data is indexable;
- public content is generated from canonical graph;
- no unsupported SEO-strengthened claims.

## Phase 11 — Release hardening / public v1

Deliverables:

- full source audit;
- content-version freeze;
- EN/VI parity complete for shipped scope;
- unit/E2E/visual/print build green;
- rollback procedure tested;
- production deployment automation;
- privacy/security review;
- content correction workflow documented.

Release gate:

- no known safety-critical `review-required` claim ships as approved;
- no known superseded source is marked current;
- every release-approved health/safety claim passes provenance validation and original-source link/status checks;
- all v1 routes/tools/themes build deterministically.

## Phase 12 — Post-v1 optional capabilities

Candidate work, not required for launch:

- PWA/offline audio/content packs;
- more Tools;
- optional logs/reminders;
- multi-child/sync;
- real-time recall alerts;
- AI-generated canonical EN/VI patch drafting on existing Evidence Watch review PR branches;
- source-grounded Ask HowToBaby;
- additional evidence domains/locales.

## Cross-phase rules

- Do not build the final Now composer before domain resolvers are stable.
- Do not let Tools hard-code duplicate medical prose or evidence URLs.
- Do not maintain page References separately from claim provenance.
- Do not commit fetched third-party source documents as routine evidence state; use metadata/hash/locator + temporary cache by default.
- Do not implement AI-assisted evidence rewriting before deterministic monitoring/provenance exists.
- Do not add a user backend merely to run Evidence Watch or because knowledge-file count grows.
- Do not use Git/GitHub as bulk media, crawler-cache, downloaded-source, or generated-database storage; enforce `REPOSITORY_HEALTH.md` continuously.
- Git/YAML remains canonical knowledge in every phase; SQLite/PostgreSQL/generated stores are disposable projections.
- Do not couple domain components directly to purchased/third-party theme packages; integrate through `THEME_SYSTEM.md`.
- Every phase must leave production code cleaner than the prototype architecture it replaces.
