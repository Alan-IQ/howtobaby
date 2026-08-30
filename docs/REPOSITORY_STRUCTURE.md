# REPOSITORY_STRUCTURE — HowToBaby

> Canonical repository-layout and code-ownership contract. This document defines where authored knowledge, runtime code, themes, tools, evidence-monitoring code, generated artifacts, and temporary source material belong.

## 1. Goals

The repository structure must make these boundaries obvious:

- the web UI **renders** knowledge; it does not own medical prose;
- canonical guidance is authored as Git-tracked YAML/structured text and remains canonical permanently;
- source provenance is stored beside the knowledge model, not scattered through pages;
- evidence monitoring is operational infrastructure, not part of the user-profile runtime;
- Tools can reuse canonical guidance without duplicating it;
- first-party or purchased/third-party themes can change without rewriting product/domain components;
- SQLite, generated indexes, route bundles, and future database projections can always be rebuilt from authored sources;
- copyrighted/restricted source material is not casually committed to the public repository.
- license scope is path-explicit so code, knowledge, docs, brand, vendor assets, media, and authoritative source material do not inherit the wrong terms.

A single repository is preferred for v1. Separate repositories or services should be introduced only when operational scale or access-control requirements justify them.

## 2. Recommended top-level layout

```text
howtobaby/
├─ apps/
│  └─ web/                         # Next.js public application
│     ├─ src/
│     │  ├─ app/                   # Routes/layouts only
│     │  ├─ components/            # App-specific composition components
│     │  ├─ features/
│     │  │  ├─ now/
│     │  │  ├─ feeding/
│     │  │  ├─ development/
│     │  │  ├─ sleep/
│     │  │  ├─ safety/
│     │  │  └─ tools/
│     │  ├─ storage/
│     │  └─ print/
│     └─ public/
│        ├─ icons/
│        └─ audio/
│
├─ packages/
│  ├─ core/                        # Pure age/context/applicability logic
│  │  ├─ src/age/
│  │  ├─ src/context/
│  │  ├─ src/applicability/
│  │  └─ src/types/
│  │
│  ├─ knowledge/                   # Canonical YAML/Git + derived read models
│  │  ├─ src/                      # CANONICAL authored knowledge
│  │  │  ├─ sources/
│  │  │  │  └─ registry.yaml
│  │  │  ├─ claims/
│  │  │  │  ├─ feeding/
│  │  │  │  ├─ development/
│  │  │  │  ├─ sleep/
│  │  │  │  └─ safety/
│  │  │  ├─ guidance/
│  │  │  ├─ translations/
│  │  │  │  └─ vi/
│  │  │  ├─ coverage/
│  │  │  └─ schemas/
│  │  ├─ repository/               # KnowledgeRepository interfaces/adapters
│  │  └─ generated/                # Rebuildable; never canonical authoring
│  │     ├─ knowledge.sqlite
│  │     ├─ manifests/
│  │     └─ route-bundles/
│  │
│  ├─ ui/                          # Reusable presentation primitives/components
│  │  ├─ src/primitives/
│  │  ├─ src/components/
│  │  ├─ src/evidence/
│  │  └─ src/accessibility/
│  │
│  ├─ themes/
│  │  ├─ src/contract/             # Vendor-neutral theme contract
│  │  ├─ src/adapters/             # CSS/Tailwind/shadcn/MUI/vendor adapters
│  │  ├─ src/registry/
│  │  └─ src/baby-modern-glass/    # First-party theme pack
│  │     ├─ shared.ts
│  │     ├─ light.ts
│  │     └─ dark.ts
│  │
│  ├─ tool-platform/
│  │  ├─ src/registry/
│  │  ├─ src/runtime/
│  │  ├─ src/audio/
│  │  └─ src/safety/
│  │
│  ├─ i18n/
│  └─ validation/
│
├─ vendor-themes/                  # Optional licensed theme source; private/gitignored unless redistribution permits
│  ├─ README.md                     # Installation/license instructions only in public repo
│  └─ .gitkeep                      # Actual commercial code may live outside public history
│
├─ tools/                           # Tool feature modules
│  ├─ lullaby-player/
│  ├─ ambient-audio/
│  └─ ...
│
├─ evidence/                        # Internal evidence-operations code/state
│  ├─ adapters/
│  │  ├─ cdc/
│  │  ├─ aap/
│  │  ├─ fda/
│  │  ├─ who/
│  │  └─ generic-web/
│  ├─ watcher/
│  ├─ diff/
│  ├─ dependency-graph/
│  ├─ reports/
│  ├─ state/                        # Fingerprints/metadata only where appropriate
│  ├─ cache/                        # Temporary fetched material; gitignored
│  └─ schemas/
│
├─ scripts/
│  ├─ validate-content.ts
│  ├─ validate-sources.ts
│  ├─ validate-provenance.ts
│  ├─ validate-translations.ts
│  ├─ build-knowledge-index.ts
│  ├─ check-repo-baseline.ts        # Layout/workspace/workflow/doc-link baseline gate
│  ├─ check-repo-health.ts          # Large-blob guard, deny patterns, size reporting
│  ├─ report-licenses.ts            # Dependency + tracked-asset license report
│  ├─ lib/                          # Shared git/glob/report helpers for scripts
│  ├─ build-evidence-index.ts
│  ├─ generate-public-pages.ts
│  └─ evidence-watch.ts
│
├─ docs/
│  ├─ PROJECT_PROFILE_v0.8.0.md
│  ├─ DOCS_INDEX.md
│  ├─ REPOSITORY_STRUCTURE.md
│  ├─ REPOSITORY_HEALTH.md
│  ├─ LICENSING_POLICY.md
│  ├─ GUIDANCE_CONTENT_CONTRACT.md
│  ├─ EVIDENCE_PROVENANCE.md
│  ├─ SYSTEM_ARCHITECTURE.md
│  ├─ GUI_DESIGN.md
│  ├─ THEME_SYSTEM.md
│  ├─ TOOL_PLATFORM.md
│  ├─ EVIDENCE_UPDATE_ENGINE.md
│  └─ IMPLEMENTATION_ROADMAP.md
│
├─ tests/
│  ├─ content/
│  ├─ integration/
│  ├─ e2e/
│  └─ visual/
│
├─ .github/
│  ├─ PULL_REQUEST_TEMPLATE.md
│  └─ workflows/
│     ├─ ci.yml
│     ├─ repo-health.yml            # Dedicated health workflow (push/PR/weekly)
│     ├─ deploy.yml
│     └─ evidence-watch.yml
│
├─ LICENSE.md                     # Multi-license scope map
├─ LICENSES/                      # Full standard license texts
│  ├─ AGPL-3.0-only.txt
│  └─ CC-BY-NC-SA-4.0.txt
├─ THIRD_PARTY_NOTICES.md
├─ CONTRIBUTING.md
├─ repo-health.config.json        # Health thresholds, deny patterns, reviewed exceptions
├─ licenses.policy.json           # Dependency-license classes and review decisions
├─ asset-rights.json              # Rights metadata for tracked media/font/icon assets
├─ package.json
├─ pnpm-workspace.yaml
├─ pnpm-lock.yaml
├─ tsconfig.json
├─ CLAUDE.md                      # AI instruction entry point; routes to canonical docs
└─ README.md
```

## 2.1 License boundaries in the tree

Path placement does not override explicit file notices, but the default mapping is:

```text
software code                     -> AGPL-3.0-only
original knowledge/docs           -> CC-BY-NC-SA-4.0
authoritative source bodies       -> upstream rights; not relicensed
vendor themes/media/fonts/icons   -> vendor/asset-specific rights
brand/trademark                   -> reserved outside repo licenses
```

Canonical details: `LICENSING_POLICY.md`.

The repository must not solve a licensing conflict by moving a restricted file into an otherwise open directory and assuming the directory license now controls it.

## 3. Canonical ownership

### `apps/web`

Owns routing, composition, browser interaction, local storage integration, and product-shell behavior.

Must not own:

- canonical health/safety prose;
- source URLs embedded ad hoc in page components;
- age/stage business rules;
- raw theme palettes.

### `packages/core`

Owns deterministic logic such as:

- date/age calculation;
- corrected-development context;
- actual/browsed/preview context;
- applicability predicates;
- pure resolver primitives.

Must not contain user-facing medical prose.

### `packages/knowledge`

Owns the reviewed content graph:

```text
SourceRecord
  → ClaimSourceRef
  → Claim
  → Applicability
  → GuidanceBlock / Action
  → Translation
```

It is the only canonical location for evidence-backed HowToBaby knowledge.

### `packages/ui`

Owns reusable visual components and evidence/safety presentation primitives. It receives structured data; it does not decide what is medically applicable.

### `packages/themes`

Owns the **vendor-neutral Theme Contract**, theme registry, first-party theme packs, and adapters that translate approved third-party React themes/UI kits into HowToBaby primitives/tokens. Product/domain components consume HowToBaby semantic tokens and approved primitives only; they must not import a vendor theme directly.

Actual commercial theme source code/assets may live in `vendor-themes/`, a private package registry, a private Git submodule/repository, or another license-compliant location. The public repo should contain only adapter code/metadata that the license permits.

Detailed contract: `THEME_SYSTEM.md`.

### `packages/tool-platform` and `tools/*`

Own utility runtime contracts and individual tools. Guidance-linked tools depend on canonical claim IDs rather than duplicating medical guidance.

### `evidence/*`

Owns scheduled source monitoring, normalization, fingerprinting, diffing, and impact analysis. It may create reports/PRs but must not silently become the canonical medical author.

## 4. Dependency direction

Allowed conceptual direction:

```text
apps/web
  → core
  → knowledge
  → ui
  → tool-platform
  → themes contract/registry

tools/*
  → tool-platform
  → themes contract/registry
  → core
  → knowledge public APIs
  → ui

evidence/*
  → knowledge schemas/registry
  → evidence state
  → reports
```

Disallowed examples:

- `knowledge` importing from `apps/web`;
- `core` importing React/UI code;
- a Tool importing arbitrary page prose;
- evidence adapters modifying JSX;
- themes importing domain resolvers;
- product/domain components importing `vendor-themes/*` directly;
- vendor theme packages importing canonical knowledge/domain resolvers;
- page components defining source records inline.

Avoid circular package dependencies. CI should enforce dependency boundaries when practical.

## 5. Authored vs generated vs temporary data

### Authored and Git-tracked

- source registry metadata;
- canonical English claims;
- claim-to-source references and locators;
- applicability rules;
- Vietnamese translations;
- Tool definitions;
- first-party theme definitions, theme manifests/adapters, and license metadata permitted in Git;
- monitor configuration;
- review metadata;
- changelog/corrections.

### Generated and rebuildable

Examples:

```text
packages/knowledge/generated/knowledge.sqlite
packages/knowledge/generated/content-manifest.json
packages/knowledge/generated/source-manifest.json
packages/knowledge/generated/evidence-manifest.json
packages/knowledge/generated/route-evidence-index.json
packages/knowledge/generated/content-version.json
```

Generated files are never the editing source of truth. `knowledge.sqlite` is intentionally disposable: deleting it must not lose knowledge or review history.

By default, `packages/knowledge/generated/` SHOULD be generated locally/CI and gitignored rather than reviewed as authored content. CI may cache or publish these files as build artifacts. Commit a generated artifact only when a documented deployment/tooling requirement makes that beneficial; even then, canonical ownership does not change.

### Temporary / normally gitignored

- fetched HTML/PDF used only for comparison;
- parser scratch files;
- screenshots of external sources;
- large source snapshots unless reuse rights and retention policy explicitly allow them;
- browser/cache state.

Default location:

```text
evidence/cache/
```

## 6. Canonical knowledge and derived SQLite

### Permanent canonical rule

`packages/knowledge/src/**` is the permanent canonical HowToBaby knowledge source. Reviewed changes happen through Git-tracked YAML/structured text, even after a backend/CMS/database exists.

A future PostgreSQL/CMS record may be a projection or editing aid only if the resulting approved change is materialized back into canonical Git/YAML before becoming an authoritative release. Database-only edits must never bypass the Git review/provenance pipeline.

### SQLite derived read model

Introduce SQLite early once schemas are stable enough (target: Phase 2). Recommended uses:

- normalized joins across claims/sources/locators/translations/applicability;
- content/provenance validation queries;
- source→claim→route/tool reverse dependency lookup;
- Evidence Watch impact analysis;
- report generation and future local authoring/search tooling;
- build-time route bundle generation.

Not recommended by default:

- browser shipping of the entire database;
- manual canonical editing inside SQLite;
- treating SQLite row state as a substitute for Git history/review metadata.

Rebuild test:

```text
rm packages/knowledge/generated/knowledge.sqlite
  → build-knowledge-index
  → deterministic equivalent projection
```

## 7. Knowledge file organization

Prefer small domain-oriented files over one giant YAML file.

Example:

```text
packages/knowledge/src/claims/feeding/
  milk.yaml
  solids-readiness.yaml
  allergens.yaml
  choking.yaml
  formula-safety.yaml
```

Stable IDs must survive file moves.

Example:

```text
feeding.solids.start
sleep.safe.back_to_sleep
development.6m.social.laughs
```

Do not derive canonical IDs from filenames or display titles.

## 8. Source registry organization

Start with one registry if manageable:

```text
packages/knowledge/src/sources/registry.yaml
```

Split only when needed, for example:

```text
sources/
  cdc.yaml
  aap.yaml
  fda.yaml
  who.yaml
  other.yaml
```

A build step must merge and validate all source IDs globally.

## 9. Evidence-monitor state

The monitor may persist:

- ETag;
- Last-Modified;
- source metadata hash;
- monitored-section hashes;
- check timestamps;
- parser version;
- prior normalized fingerprints;
- change classification.

Do not assume the public Git repository is an appropriate archive for full third-party source documents.

For restricted/copyrighted sources, prefer:

```text
metadata + URL + locator + hash + temporary cache
```

over full retained copies.

## 10. Public evidence output

The build may generate indexes used by the web app:

```text
claimId → sourceRefs
sourceId → claimIds
route → claimIds → sourceIds
sourceId → public source metadata
```

The public app must receive only the metadata needed for transparency and navigation; internal monitor state or copyrighted cached source content must not leak into the client bundle.

## 11. Git and review model

A health-content pull request should make the provenance change reviewable in one diff whenever possible:

```text
claim text
+ claim source refs/locators
+ source metadata if changed
+ EN/VI update
+ review status/date
+ changelog entry when parent-facing meaning changes
```

Git history is part of the audit trail but does not replace the explicit provenance model.

## 12. Workflow ownership

### `ci.yml`

Runs product/content validation and build checks.

### `deploy.yml`

Deploys an approved static-first Next.js build/deployment profile only after required gates pass.

### `evidence-watch.yml`

Runs source monitoring and creates reports/issues/PRs. It must not bypass release review.

## 13. Initial implementation simplification

The physical package split may be introduced incrementally, but the logical boundaries are required from Phase 0.

If early development benefits from fewer packages, use aliases/directories that mirror the final ownership. Do not build a monolithic `src/data.ts` or embed knowledge directly in components with the intention of “cleaning it up later.”

## 14. Repository definition of done

The repository baseline is acceptable when:

- every canonical artifact has one obvious owner;
- medical prose is absent from UI/business-logic files except display-only labels;
- source records and claim source references are schema-validated;
- temporary external-source material is gitignored by default;
- generated manifests and `knowledge.sqlite` can be deleted and deterministically rebuilt;
- package/import boundaries have no known circular dependency;
- public build does not expose child-profile data or internal evidence cache;
- theme vendor code is isolated behind adapters and license boundaries;
- no canonical knowledge exists only in SQLite/PostgreSQL/generated outputs;
- docs in `DOCS_INDEX.md` agree on ownership.

## Repository storage/health boundary — v0.7.0

Git is the permanent audit trail for **authored** knowledge, provenance, code, schemas, review metadata, and documentation. It is not an object store.

Keep in normal Git:

- YAML/Markdown/JSON source knowledge and translations;
- source metadata, locators, fingerprints, and review records;
- schemas, code, tests, first-party theme code, permitted adapters, and documentation.

Keep out of normal Git by default:

- `knowledge.sqlite` and other generated databases/indexes;
- `evidence/cache/**`, downloaded HTML/PDF/source bodies, parser scratch, and screenshots used only for monitoring;
- generated route bundles/build output;
- large audio/video/image libraries;
- dependency/vendor caches and redistributable third-party packages that belong in package/object storage.

Small development fixtures may remain in Git when they are genuinely useful, license-compatible, and comfortably inside `REPOSITORY_HEALTH.md` limits. Bulk media must move to object storage/CDN. Git LFS is an exception path for justified binary collaboration, not a solution for canonical text knowledge.

Detailed budgets, CI gates, and future split-repo criteria: `REPOSITORY_HEALTH.md`.
