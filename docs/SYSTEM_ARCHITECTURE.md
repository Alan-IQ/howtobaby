# SYSTEM_ARCHITECTURE — HowToBaby

> Canonical software architecture for the public web app, content build system, tools platform, and evidence operations.

## 1. Architectural goals

- Keep the public product static-first and privacy-preserving without permanently disabling server capabilities.
- Keep reviewed knowledge canonical in Git-tracked YAML/structured text regardless of future backend adoption.
- Compile canonical knowledge into rebuildable SQLite/index artifacts for efficient validation, joins, dependency analysis, and build-time lookup.
- Make guidance, tools, themes, translations, and source provenance schema-driven.
- Allow source monitoring to run independently of user traffic.
- Make every published content version reproducible and rollbackable.
- Allow first-party and purchased/third-party React themes through a vendor-neutral adapter boundary.
- Avoid a future rewrite when Tools, Evidence Update Engine, optional sync, accounts, APIs, or server-side features are added.

## 2. Three-plane architecture

```text
┌───────────────────────────────────────────────────────────────┐
│  PUBLIC RUNTIME                                               │
│  Next.js static-first routes + optional server runtime + tools│
└───────────────────────────────────────────────────────────────┘
                         ▲ compiled artifacts
                         │
┌───────────────────────────────────────────────────────────────┐
│  BUILD / CONTENT PLANE                                        │
│  schemas → source registry → content graph → i18n → pages     │
└───────────────────────────────────────────────────────────────┘
                         ▲ reviewed changes
                         │
┌───────────────────────────────────────────────────────────────┐
│  EVIDENCE OPERATIONS                                          │
│  scheduled adapters → fingerprints/diffs → impact → PR/review │
└───────────────────────────────────────────────────────────────┘
```

The Evidence Operations plane may run in GitHub Actions or a small scheduled worker. It is not a request-time backend for child profiles.

## 3. Repository/package boundaries

The detailed folder tree, package ownership, dependency direction, authored/generated/cache boundaries, and workflow ownership live in `REPOSITORY_STRUCTURE.md`.

Architecture-level requirements:

- `apps/web` renders product surfaces and owns no canonical medical prose;
- `packages/core` owns deterministic age/context/applicability logic;
- `packages/knowledge` owns the canonical SourceRecord → ClaimSourceRef → Claim → Guidance graph;
- `packages/ui` owns reusable presentation/evidence primitives;
- `packages/themes` owns the theme contract, first-party theme packs, and vendor adapters;
- `packages/tool-platform` and `tools/*` own utility modules;
- `evidence/*` owns monitoring/diff/impact operations and temporary source cache;
- no public runtime bundle may include internal evidence cache, canonical authoring YAML that is not needed at runtime, or unnecessary third-party source snapshots.

A single repository is preferred for v1. Physical package boundaries may be introduced incrementally, but logical ownership is required from Phase 0.

## 4. Public web runtime

### 4.1 Static-first, server-capable

- Generate public age/topic/trust pages statically whenever the route does not require request-time data.
- Client JavaScript is used for local profile personalization, theme/language preferences, interactive Tools, and preview state.
- No child profile is sent to a server in v1.
- Do not make `output: "export"` or an equivalent full-static mode a permanent product constraint. It may be used for a deployment target that needs it, but the codebase must remain compatible with normal Next.js server/runtime features.
- Future dynamic routes/API handlers may be added for accounts, sync, notifications, subscriptions, or a source-grounded assistant without moving canonical knowledge out of Git/YAML.

### 4.2 Route families

Conceptual routes:

```text
/
/now
/feeding/...
/play/...
/sleep/...
/safety/...
/tools
/tools/lullaby
/tools/audio
/sources
/evidence/...
/methodology
/editorial-policy
/medical-disclaimer
/changelog
```

Exact slugs can change without changing architecture.

### 4.3 Public and personalized content

Both resolve from the same compiled content graph. Do not fork medical prose into SEO-only copies.

## 5. Content build pipeline

Canonical authoring remains YAML/structured text in Git. SQLite and JSON are **derived read models**, never authoring sources.

```text
Git-tracked YAML/structured knowledge
  + source registry
  + claim source references/locators
  + canonical English claims
  + applicability rules
  + VI translations
  + tool metadata
  + theme registry
      ↓
schema validation
      ↓
source/provenance validation
      ↓
compile normalized knowledge projection
      ↓
SQLite derived index + JSON/manifests
      ↓
claim↔source↔route/tool reverse-index generation
      ↓
EN/VI parity validation
      ↓
precision/safety invariants
      ↓
route/tool bundles + public evidence indexes
      ↓
static pages + client/runtime bundles
```

The SQLite projection SHOULD be introduced early (Phase 2) once the claim/source schemas are stable enough to query. It is intended for build scripts, validation, dependency analysis, Evidence Watch impact queries, and future authoring/report tooling. Public browser runtime must not depend on shipping the entire SQLite database unless a later design explicitly justifies it.

Recommended generated artifacts:

```text
packages/knowledge/generated/knowledge.sqlite
packages/knowledge/generated/content-manifest.json
packages/knowledge/generated/source-manifest.json
packages/knowledge/generated/evidence-manifest.json
packages/knowledge/generated/claim-evidence-index.json
packages/knowledge/generated/source-claim-index.json
packages/knowledge/generated/route-evidence-index.json
packages/knowledge/generated/tool-evidence-index.json
packages/knowledge/generated/tool-manifest.json
packages/knowledge/generated/theme-manifest.json
packages/knowledge/generated/content-version.json
```

Generated files are build products, not canonical authoring sources.

### Public provenance compilation

The build must derive citation surfaces from canonical provenance rather than maintain separate page reference lists:

```text
ClaimSourceRef/SourceLocator
  → claim-evidence index
  → route/tool evidence index
  → SourceChip / EvidenceDrawer / References / Print
```

Evidence detail pages and `/sources` consume the same generated indexes. They are read models, not a second authoring store.

Detailed contract: `EVIDENCE_PROVENANCE.md`.

### 5.1 Knowledge repository abstraction

Domain/application code must not assume that canonical knowledge is read directly from YAML files. Use a repository/read-model boundary such as:

```ts
interface KnowledgeRepository {
  getClaim(id: ClaimId): Promise<Claim | null>;
  getSource(id: SourceId): Promise<SourceRecord | null>;
  findGuidance(query: GuidanceQuery): Promise<GuidanceBlock[]>;
  findClaimsBySource(sourceId: SourceId): Promise<Claim[]>;
}
```

Expected implementations may include:

- `GeneratedKnowledgeRepository` for production route/runtime bundles;
- `SQLiteKnowledgeRepository` for build, validation, reports, and Evidence Watch;
- future server-side projections if needed.

None of these implementations may become the canonical authoring source. The rebuild invariant is:

```text
delete all derived indexes/databases
  → checkout canonical Git/YAML + schemas/code
  → rebuild
  → equivalent knowledge projection
```

### 5.2 Suggested SQLite projection

The exact schema is implementation-owned and may evolve, but the first projection will likely normalize stable string IDs into tables/read models conceptually equivalent to:

```text
sources
claims
claim_source_refs
source_locators
guidance_blocks
guidance_block_claims
translations
applicability_rules
routes
route_claims
tools
tool_claims
content_release_metadata
```

Use canonical string IDs (`feeding.solids.start`, source IDs, route/tool IDs) as durable references. SQLite row IDs, if used internally, must not become public/canonical identifiers.

The projection generator should run in one transaction and only replace the previous database after validation succeeds, so a failed compile does not leave a partially valid index.

## 6. Domain/resolver layer

Pure functions only where practical.

```ts
resolveAgeContext(profile, planDate)
resolveDevelopmentGuidance(context, content)
resolveFeedingGuidance(context, content)
resolveSleepGuidance(context, preferences, content)
resolveSafetyGuidance(actualContext, content)
composeNow(domainOutputs)
```

Rules:

- no date math in UI components;
- no prose in resolver logic;
- no theme behavior in domain logic;
- no tool-specific medical rules outside shared guidance contracts;
- deterministic input + content version = deterministic output.

## 7. Theme/UI layer

UI consumes semantic tokens from the active theme definition. Components must not import Baby Modern Glass-specific colors directly.

Theme details: `GUI_DESIGN.md` and `THEME_SYSTEM.md`.

## 8. Tools layer

Tool discovery is registry-driven:

```text
ToolRegistry
  → route/navigation metadata
  → lazy-loaded tool module
  → optional guidance dependencies
  → safety/evidence labels
```

Tools may be fully client-side. Guidance-linked tools reference canonical claim IDs rather than duplicating medical prose.

Details: `TOOL_PLATFORM.md`.

## 9. Evidence Operations layer

Evidence watcher responsibilities:

- scheduled checking;
- conditional fetch/caching;
- canonicalization/fingerprinting;
- source-specific extraction;
- diff generation;
- dependency impact mapping;
- review-required state/PR generation;
- audit log.

It must not directly mutate release-approved health guidance in production as a side effect of a detected source change.

Details: `EVIDENCE_UPDATE_ENGINE.md`.

## 10. Storage model

### User-side v1

`localStorage` may store:

- optional child profile;
- UI language;
- theme family/mode;
- sleep planner preferences;
- tool-specific non-sensitive preferences;
- content version last seen.

Do not store data in cookies when local storage is sufficient. Avoid exact child data in URLs.

### Repository/build-side

Git-tracked YAML/structured text is the **permanent canonical source of truth** for reviewed knowledge/configuration. This remains true after a user-facing backend, CMS, PostgreSQL database, or other runtime persistence is introduced.

Canonical versioned state includes:

- source registry;
- claim-source relationships and locators;
- canonical claims/actions;
- translations;
- applicability/guidance metadata;
- review metadata;
- tool definitions and guidance dependencies;
- first-party theme definitions and adapter metadata that licensing permits;
- source-monitor configurations.

Derived/rebuildable state may include:

- `knowledge.sqlite`;
- generated JSON/manifests;
- reverse indexes/search indexes;
- static route bundles;
- server/database projections;
- caches.

A production database may cache or project knowledge for query performance, but a database-only edit is not a canonical content change and must not be treated as publishable reviewed guidance.

## 11. Content versions and release artifacts

Every production build gets:

```ts
interface ContentRelease {
  contentVersion: string;
  builtAt: string;
  gitSha: string;
  sourceRegistryVersion: string;
  localeVersions: Record<string, string>;
}
```

Meaningful guidance changes should be rollbackable independently from unrelated UI code where feasible.

## 12. CI pipeline

Minimum checks:

1. install / dependency integrity;
2. type-check;
3. lint;
4. unit tests;
5. content-schema validation;
6. source-ID + claim-source relationship/locator validation;
7. official-guidance direct-source requirement;
8. claim/source/route/tool reverse-index validation;
9. original-source link/public-source metadata validation;
10. EN/VI key + semantic-critical parity checks;
11. coverage matrix;
12. safety/precision invariants;
13. guidance-linked Tool provenance validation;
14. theme contract + first-party/adapter manifest completeness;
15. canonical-vs-derived knowledge invariant (no authored data exists only in SQLite/generated output);
16. deterministic SQLite/index rebuild check where enabled;
17. static route/evidence-page generation;
18. production build;
19. optional E2E/visual/print checks.

## 13. Deployment topology

### v1

```text
GitHub
  → CI/build
  → Next.js static-first build
  → host/CDN capable of serving pre-rendered routes
```

A full static export may be produced for compatible shared-hosting targets, but it is a deployment profile rather than the canonical application architecture. The same repository should remain deployable to a normal Next.js runtime later without redesigning knowledge ownership.

### Evidence watcher

```text
GitHub Actions scheduled workflow
  OR small cron worker
    → outbound fetch only
    → diff/report/PR
```

The watcher does not need inbound public endpoints.

## 14. Future backend boundary

Only add a user-facing backend when a feature truly needs it, such as:

- encrypted sync;
- account recovery;
- cross-device history;
- notification delivery;
- multi-caregiver collaboration;
- subscriptions/entitlements;
- protected server-side AI/API gateways.

Backend persistence owns **user/runtime state**, not canonical reviewed knowledge. If PostgreSQL or another database contains a knowledge projection, it must be generated/synchronized from canonical Git/YAML and be replaceable.

Do not introduce a backend solely because evidence monitoring needs scheduled compute or because the number of knowledge files grows.

## 15. Security boundaries

- Treat external source HTML/PDF as untrusted input.
- Keep fetched monitoring documents in temporary/restricted cache by default; do not expose them in public bundles or commit them merely for convenience.
- Never render fetched source HTML directly into the app without sanitization/approved syndication behavior.
- No arbitrary script execution from source content.
- Do not bypass authentication/paywalls/robots/terms.
- Validate generated content before commit/release.
- Lock dependency/tool versions where practical.
- Use least-privilege credentials for automation.
- External evidence links must use canonical authority URLs and safe link handling; evidence links must not use affiliate/tracking redirects.

## 16. Architectural decision summary

| Decision | Choice |
|---|---|
| Public runtime | static-first, server-capable |
| User profile | local-only in v1 |
| Canonical content | permanent Git-tracked YAML/structured data |
| Derived knowledge store | rebuildable SQLite + JSON/manifests |
| Public/personalized content | one compiled graph |
| Tools | registry-driven client modules |
| Themes | vendor-neutral theme contract + first/third-party adapters |
| Evidence watcher | separate scheduled operational plane |
| Public provenance | generated from canonical claim-source graph |
| Full third-party source storage | temporary/minimized by default; not canonical repo content |
| AI dependency | none required for core architecture |
