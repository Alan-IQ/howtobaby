# PROJECT_PROFILE — HowToBaby

> Canonical product contract for **HowToBaby** — a bilingual, evidence-to-action parent guidance **and utility platform** that helps caregivers understand what matters at a child's current stage, act on trusted guidance, and use practical parent-facing tools without turning convenience features into medical claims.

| Field | Value |
|---|---|
| Document status | Canonical product contract |
| Profile version | 0.8.0 |
| Last updated | 2026-08-26 |
| Product name | HowToBaby |
| Primary domain | `howtobaby.com` |
| Repository slug | `howtobaby` |
| Product type | Evidence-to-action guidance + parent utility platform |
| Coverage | Birth through `< 5 years` initially |
| Primary jurisdiction | United States |
| Global cross-check | WHO where applicable |
| Authoritative evidence source of truth | Current approved original sources |
| Canonical product-content language | English |
| Supported UI/content languages | English and Vietnamese |
| Current access model | Free |
| Public web runtime | Static-first; no request-time backend required for v1 |
| Internal update automation | Build/CI or scheduled worker allowed; not a user-profile backend |
| Preferred web implementation | Next.js + TypeScript; static-first and server-capable |
| Canonical knowledge store | Git-tracked YAML/structured text; remains canonical even after a backend is introduced |
| Derived knowledge indexes | Rebuildable SQLite + generated JSON/manifests; never canonical |
| Software license | `AGPL-3.0-only` for original software |
| Original knowledge/docs license | `CC-BY-NC-SA-4.0` where HowToBaby has licensing rights |
| Brand/trademark | Reserved; no trademark license granted by repository licenses |
| Detailed contracts | See `DOCS_INDEX.md` |

---

## 1. Mission

HowToBaby exists to reduce the gap between **authoritative guidance** and **what a parent can actually use today**.

The product does not compete with CDC, AAP, FDA, USDA/HHS, NIH, WHO, or other approved authorities by inventing more medical information. It adds value by:

- detecting and organizing relevant authoritative guidance;
- preserving source meaning, uncertainty, jurisdiction, and scope;
- resolving what is relevant to the child's age/context;
- translating evidence into practical parent-facing actions;
- keeping provenance and freshness visible;
- providing practical tools that make daily parenting easier.

Public-facing promise:

> **Know what your child needs. Right now.**

HowToBaby is not a medical record, diagnosis engine, developmental screening test, emergency service, or substitute for pediatric care.

---

## 2. Product pillars

### 2.1 Guidance

Evidence-to-action content organized around the child's current stage. Initial domains:

- Feeding
- Play & Development
- Sleep
- Safety

Future evidence domains may include oral health, preventive-care preparation, physical activity, media use, or other age-relevant topics without changing the core evidence architecture.

### 2.2 Tools

Practical utilities are a first-class part of HowToBaby, not an afterthought.

Examples may include:

- lullaby/music player;
- ambient sound or tone generator, including a user-selectable 432 Hz option;
- routine/timer tools;
- age calculators;
- printable planners;
- feeding/sleep/activity helpers;
- future logs or caregiver workflow tools.

A tool does **not** become evidence-based merely because it appears beside evidence-based guidance. Tool claims and tool functionality must remain separate.

Example: a 432 Hz player may be offered as an audio preference/relaxation utility, but HowToBaby must not state that 432 Hz improves infant sleep, development, health, or nervous-system regulation unless an approved source genuinely supports that claim.

Detailed contract: `TOOL_PLATFORM.md`.

### 2.3 Evidence operations

HowToBaby should be maintainable as a living reference rather than a manually frozen website.

The platform architecture must support an internal **Evidence Update Engine** that can:

- monitor approved sources;
- detect metadata/content changes;
- map changed sources to dependent claims;
- invalidate or flag affected content;
- prepare review artifacts or pull requests;
- publish only after the required validation/review gate.

The change-detection core is deterministic and rule-based and must keep working with no AI configured. AI assists the review of a detected change; it is never the authority or approval mechanism.

Detailed contract: `EVIDENCE_UPDATE_ENGINE.md`.

---

## 3. Core interaction model

HowToBaby supports two complementary user experiences.

### 3.1 Browse

No child profile required. A user can browse public guidance by age/topic and use non-personalized tools.

### 3.2 Personalized Now

A user may provide a date of birth and optional estimated due date to resolve current context locally. Name is optional and display-only.

Personalization selects and organizes approved guidance; it does not create personalized medicine.

Whenever useful, guidance follows:

- **Know** — what matters;
- **Do** — practical action;
- **Why** — rationale;
- **Watch** — variation, readiness, limitations, escalation;
- **Source** — provenance and freshness.

---

## 4. Product principles

1. **Evidence before convenience.** Health/safety claims must be traceable to approved sources.
2. **External authorities are authoritative.** English is HowToBaby's canonical product interpretation, not medical authority itself.
3. **No invented precision.** Exact child age must never create medical precision absent from the source.
4. **Age-aware, not age-deterministic.** Age selects candidate guidance; age alone does not prove readiness or suitability.
5. **Domain-specific age logic.** Feeding, development, sleep, safety, and future domains may use different age bases.
6. **Personalized context is not personalized medicine.** No diagnosis, treatment prescription, or silent contraindication inference.
7. **Tools are claim-neutral by default.** A utility may exist without asserting a health benefit.
8. **Safety overrides optimization and engagement.** Safety content can interrupt example plans or tool flows.
9. **Source disagreement is not silently averaged.** Preserve meaningful differences and jurisdiction.
10. **Trust outranks monetization.** Commercial relationships cannot change canonical evidence or safety ranking.
11. **Local-first and private by default.** Child profile data remains in-browser in v1.
12. **Browse without profile.** Public information is not gated by personal data.
13. **One content graph.** Public pages, personalized views, print, tools that cite guidance, and future assistant retrieval use the same canonical claim graph.
14. **One design system, multiple theme packs.** Components consume a stable semantic theme contract, never hard-coded theme colors or vendor-specific styling APIs.
15. **Canonical knowledge stays in Git.** Reviewed YAML/structured source files remain the authoritative HowToBaby knowledge store even if SQLite, PostgreSQL, a CMS, or a user backend is added later.
16. **Derived stores are disposable.** SQLite, generated JSON, search indexes, caches, and future database projections must be rebuildable from canonical Git knowledge plus code/schema versions.
17. **Third-party themes are adapters, not architecture.** Purchased/open-source React themes may provide tokens, primitives, layouts, and assets only through the HowToBaby Theme Integration Contract; domain logic must not depend on vendor APIs.
18. **Automation may detect and draft; review controls publication.** A source change must not silently rewrite safety-critical parent-facing guidance.
19. **Nonjudgmental tone.** No fear, shame, competitive milestone framing, or compliance scoring.
20. **Prove provenance, not just authority names.** Every health/safety claim must be traceable to the exact approved source relationship and, where practical, a source locator; parents must be able to open the original source.
21. **Interpret + cite + link by default.** HowToBaby should not republish full third-party source works unless the specific license/permission or approved syndication mode allows it.
22. **Git stores authored knowledge, not bulk artifacts.** Canonical text/provenance belongs in Git; generated databases, crawler caches, downloaded source bodies, and bulk media do not.
23. **Repository health is an enforced contract.** CI must detect accidental large blobs, generated databases, fetched evidence material, or media that would make the canonical repository unhealthy.

---

## 5. Scope

### 5.1 In scope for v1

- Public age/topic browsing.
- Optional local child profile.
- Personalized **Now** view.
- Chronological and corrected-development-age context where appropriate.
- Feeding, Play & Development, Sleep, and Safety guidance.
- English/Vietnamese content.
- Source/evidence/freshness transparency.
- Public Methodology, Sources, Editorial Policy, Disclaimer, and Changelog/Corrections pages.
- Light/Dark modes through a reusable theme engine.
- Responsive and print layouts.
- Extensible Tools hub and registry.
- At least one non-medical utility tool may ship in the initial release; audio utilities are valid early candidates.
- Static age/topic pages generated from canonical content.
- GitHub-driven build/deployment.
- Repository-health guardrails that keep canonical knowledge text auditable and prevent Git from becoming a media/cache/object store.
- Internal source monitoring may run on a schedule without changing the public app's static-first architecture.

### 5.2 Explicit non-goals for v1

- Diagnosis or symptom checker.
- Medication/supplement dosing.
- Growth percentile interpretation.
- Personalized therapeutic diets or allergy treatment.
- Management of complex disease/prematurity.
- Automated cry/video/audio diagnosis.
- Community/social features.
- Behavioral advertising or selling child-profile data.
- Live AI medical advice.
- Automatic publication of unreviewed semantic changes from external sources.
- Claims that a music frequency, lullaby, ambient sound, or other utility has a medical/developmental benefit without approved evidence.

### 5.3 Future-compatible

- Multiple children.
- Optional encrypted sync/accounts.
- PWA/offline packs.
- Caregiver sharing.
- Optional logs/history/reminders.
- More evidence domains.
- More utility tools.
- Recall/safety alert integration.
- Source-grounded Ask HowToBaby.
- Paid convenience features that do not paywall core evidence/safety.

---

## 6. User/profile/privacy contract

Two modes:

1. **Browse mode** — no profile required.
2. **Personalized mode** — DOB required; name and EDD optional.

Profile data remains local for v1. Do not place exact child data in URLs, metadata, analytics, logs, or share parameters. If local persistence fails, continue for the current session and explain that persistence is unavailable.

Public URLs may encode broad age/topic state only, not a child's identity or exact profile.

---

## 7. Guidance and evidence contract

Detailed age/stage/domain rules live in `GUIDANCE_CONTENT_CONTRACT.md`.

Product-level invariants:

- corrected-development context may affect development/play when eligible but must not silently propagate into feeding/safety;
- solids are not unlocked by turning 4 months old;
- newborn sleep defaults to responsive rhythm rather than a false fixed schedule;
- sleep planning does not dictate medical feeding frequency;
- infant safe-sleep guidance resolves from the actual-child context, not the browsed stage;
- claims carry guidance class, precision class, review state, applicability, and structured `ClaimSourceRef` provenance;
- every release-approved health/safety claim can resolve claim → source relationship → source locator → original source URL;
- `official-guidance` requires approved primary/direct source support;
- parent-facing guidance exposes compact claim/card source attribution, an Evidence Drawer, and deduplicated page References generated from the same provenance graph;
- original source links are available where technically possible and are not routed through advertising/affiliate tracking;
- any source-derived evidence grade must come from the source's own grading system;
- Vietnamese must preserve semantic parity with canonical English.

Detailed provenance/citation contract: `EVIDENCE_PROVENANCE.md`.

---

## 8. Tools contract

Tools are registered through a common platform and classified by safety/evidence behavior.

Minimum categories:

- `utility` — convenience/functionality with no health-benefit claim required;
- `guidance-linked` — uses approved claims to inform output;
- `safety-sensitive` — output can materially influence safety behavior and therefore requires stricter review.

Tool implementation must never bypass the guidance/evidence layer to make medical claims.

Audio tools:

- require explicit user start; no surprise autoplay;
- separate audio preference from health claims;
- avoid promising that a particular frequency induces sleep or has therapeutic benefit;
- surface relevant safe-use guidance only when backed by approved sources;
- work independently of child-profile persistence where possible.

Detailed contract: `TOOL_PLATFORM.md`.

---

## 9. Information architecture

Primary top-level destinations:

1. **Now**
2. **Feeding**
3. **Play & Development**
4. **Sleep**
5. **Safety**
6. **Tools**

Sources/Methodology/Editorial/Disclaimer/Changelog are globally discoverable trust destinations and contextually linked from claims.

A tool may deep-link to relevant guidance, but the user must be able to distinguish the tool surface from official/source-backed guidance.

---

## 10. Theme and GUI contract

The first visual family is **Baby Modern Glass**, with coordinated Light and Dark modes.

HowToBaby must support both **first-party theme packs** and **third-party React themes/templates** purchased or adopted later. Third-party visual systems are integrated through a stable Theme Integration Contract rather than copied directly into domain features. Theme ownership is delegated to `GUI_DESIGN.md` and `THEME_SYSTEM.md`.

Non-negotiable rules:

- product/domain components consume HowToBaby semantic tokens and approved UI primitives only;
- Light/Dark share geometry and hierarchy unless a theme explicitly declares a reviewed capability difference;
- a theme may override tokens, decorative assets, approved primitives, or shell/layout slots, but may not own age logic, guidance prose, evidence logic, routing semantics, or Tool safety behavior;
- vendor-specific APIs must be isolated behind adapters/wrappers;
- purchased theme code/assets must obey their license and must not be committed to a public repository when redistribution is prohibited;
- glass effects degrade gracefully when blur/transparency is unsupported;
- print uses a dedicated print rendering profile rather than trying to print screen glass literally;
- evidence/safety status never relies on color alone;
- Tools use the same design system but may define tool-specific component tokens.

---

## 11. Architecture contract

The platform has three architectural planes:

1. **Public web runtime** — Next.js static-first routes plus client personalization; request-time/server capabilities remain available for future features without being required for v1.
2. **Content/tool build system** — canonical YAML/Git authoring, schema validation, provenance validation, deterministic compilation to rebuildable SQLite/index artifacts, i18n parity, and public-page generation.
3. **Evidence operations** — scheduled source monitoring/change detection and review automation.

The third plane may run in GitHub Actions or a small worker and does not mean the public v1 app needs a user-facing backend. A future backend may own accounts, sync, subscriptions, notifications, or user history, but **must not replace Git/YAML as the canonical knowledge source**.

`output: "export"` or equivalent full-static export is an optional deployment mode, not a permanent architectural constraint. Public routes should be statically rendered whenever appropriate, while the application remains server-capable.

Detailed contracts: `SYSTEM_ARCHITECTURE.md` and `REPOSITORY_STRUCTURE.md`.

---

## 12. Evidence Update Engine policy

The engine should prefer, in order:

1. official API/syndication/feed;
2. official RSS/Atom;
3. structured index/sitemap;
4. deterministic page/section monitoring;
5. PDF metadata/text monitoring;
6. manual-only review for sources that cannot be safely/legally automated.

Core state transition:

```text
source checked
  → unchanged: record check
  → changed: create diff + identify dependent claims
  → dependent claims carry a derived review signal
  → reviewer approves/revises canonical English
  → VI parity/update
  → validation/build
  → deploy
```

AI reviews and explains a detected change inside that review path, but it cannot turn a detected source change directly into production medical guidance without the required review gate.

Monitoring state must align with public provenance: a detected material source change can move the source to `changed-review-required` — proposed on the review branch and reaching production only through the reviewed merge — and propagate a derived review signal to its dependent claims, but it must not erase prior provenance, write claim review state, or silently replace the parent-facing claim. Watcher operational state is separate from that canonical state: it lives on its own non-canonical branch and may update automatically, while canonical `SourceRecord` metadata never does, and a pending Draft Pull Request alone changes nothing on the public site. Full fetched third-party documents are temporary monitoring inputs by default, not canonical Git content.

Detailed contracts: `EVIDENCE_UPDATE_ENGINE.md` and `EVIDENCE_PROVENANCE.md`.

---

## 13. Monetization and trust

v1 is free.

Core evidence, safety, source citations, escalation guidance, methodology, and corrections remain free.

If monetization is introduced, prefer convenience/workflow value such as sync, multi-child, caregiver sharing, history, reminders, or advanced export. Commercial relationships cannot alter guidance or safety ranking.

Tools may eventually participate in paid plans only when core safety/evidence access remains unaffected.

---

## 14. AI policy

No live AI medical advice in v1.

Evidence Watch AI Review Summary is a first-class Phase 9 review capability: it explains a deterministically detected source change inside the mandatory Draft-PR review path. Deterministic Evidence Watch must keep working when AI is unavailable or fails (`EVIDENCE_UPDATE_ENGINE.md` §14–§16).

Later AI capabilities may:

- propose claim mappings and draft canonical EN/VI patches on an existing Evidence Watch review PR branch;
- assist translation with parity checks;
- power a source-grounded assistant after the content graph is stable.

AI output is never automatically authoritative or canonical. Every substantive health answer must retain provenance and uncertainty.

---

## 15. Functional requirements summary

- **FR-001** Browse public age/topic content without profile.
- **FR-002** Create/edit/clear local personalized profile.
- **FR-003** Resolve chronological/corrected contexts deterministically.
- **FR-004** Resolve guidance domains independently.
- **FR-005** Keep actual/browsed/preview contexts isolated.
- **FR-006** Render claim-level evidence/provenance/freshness.
- **FR-007** Provide Feeding guidance per domain contract.
- **FR-008** Provide Play & Development guidance per domain contract.
- **FR-009** Provide Sleep guidance per domain contract.
- **FR-010** Provide Safety/escalation guidance per domain contract.
- **FR-011** Compose personalized Now without false precision.
- **FR-012** Support EN/VI parity, Light/Dark, responsive and print.
- **FR-013** Render Tools hub from a common Tool Registry.
- **FR-014** Allow utility tools without falsely implying medical evidence.
- **FR-015** Generate public static pages from the same content graph.
- **FR-016** Expose Methodology/Sources/Editorial/Disclaimer/Corrections.
- **FR-017** Support source-monitoring metadata and dependency invalidation even if the watcher ships after the public MVP.
- **FR-018** Generate claim/card source chips, Evidence Drawer data, and page-level References from canonical provenance rather than manually maintained citation lists.
- **FR-019** Provide safe original-source links and support evidence/source detail pages without creating a second content store.
- **FR-020** Keep guidance-linked Tool health claims traceable to canonical claim IDs and inherited source provenance.

---

## 16. Non-functional requirements summary

- Privacy: local-first user profile.
- Traceability: claim → source → status → review → translation → render.
- Determinism: same content version/context/preferences → same resolver output.
- Maintainability: schema-driven content/tools/themes; canonical YAML/Git knowledge; rebuildable derived indexes; no monolithic production HTML.
- Accessibility: keyboard, screen reader, contrast, reduced motion, semantic structure.
- Performance: static-first page delivery where appropriate, generated indexes/bundles, minimal unnecessary third-party JavaScript.
- Security: no unsafe HTML injection; safe external links; dependency scanning; CSP where practical.
- Auditability: meaningful content/tool/source changes produce reviewable diffs.
- Verifiability: a maintainer and parent can trace a published health/safety claim to the supporting original authority and verification date.
- Source-material minimization: monitoring stores metadata/hash/locators and temporary cache by default rather than unnecessary full third-party copies.
- Reversibility: source/content releases are versioned and can be rolled back.

---

## 17. Documentation ownership

See `DOCS_INDEX.md`.

This Project Profile intentionally does **not** own detailed:

- stage tables and domain content rules;
- component-by-component GUI specifications;
- CSS token values and third-party theme adapter internals;
- repository/package layout, dependency boundaries, and repository-size/storage budgets;
- claim-level citation/provenance UI/data rules;
- crawler adapters/selectors;
- phase-by-phase implementation tasks.

Those belong to their specialist documents so the product contract stays stable and readable.

---

## 18. Decision log — v0.6.0

| Decision | Status | Rationale |
|---|---|---|
| HowToBaby is both a guidance and utility platform | Accepted | Prevents the brand from being structurally limited to knowledge pages. |
| Tools are first-class but claim-neutral by default | Accepted | Allows useful utilities without laundering weak claims into medical guidance. |
| Tools becomes a top-level destination | Accepted | Makes future utility expansion discoverable and coherent. |
| Baby Modern Glass is a theme family, not hard-coded component styling | Accepted | Enables future visual redesign without component rewrites. |
| Public app remains static-first | Retained | Privacy, performance, simple hosting. |
| Scheduled evidence monitoring is allowed outside request-time runtime | Accepted | A source watcher is operational infrastructure, not a user-profile backend. |
| Evidence change detection should work without AI | Accepted | Deterministic monitoring is safer, auditable, cheaper, and sufficient for change detection. |
| AI Review Summary is a first-class Phase 9 capability, not optional assistance | Revised in v0.8.0 | Supersedes “AI is optional for semantic triage/drafting”. AI review belongs inside the mandatory Draft-PR path, while deterministic Evidence Watch still works with no AI configured and an unavailable/failed AI review never breaks it or fabricates an assessment. |
| AI-generated canonical EN/VI patch drafting remains a later/post-v1 capability | Revised in v0.8.0 | Explaining a deterministically detected change is Phase 9 work; drafting canonical medical prose is separate and later. |
| Source changes do not silently auto-publish semantic medical changes | Accepted | Protects safety and traceability. |
| 432 Hz/audio tools may exist without therapeutic claims | Accepted | Utility value is separable from evidence of health benefit. |
| Detailed contracts are split into specialist docs | Accepted | Reduces duplication and drift in Project Profile. |
| Repo structure gets a canonical ownership contract | Accepted in v0.6.0 | Prevents UI, knowledge, evidence operations, themes, and Tools from collapsing into a monolith. |
| Every health/safety claim is publicly traceable to original sources | Accepted in v0.6.0 | “Evidence-based” must be verifiable, not just a branding statement. |
| Claim citations are generated from one provenance graph | Accepted in v0.6.0 | Prevents inline citations, page references, Tools, print, and Evidence Watch from drifting apart. |
| Original authority links are exposed where possible | Accepted in v0.6.0 | Lets parents independently verify HowToBaby interpretation. |
| Interpret + cite + link is the default reuse mode | Accepted in v0.6.0 | Minimizes copyright/licensing risk and avoids maintaining copied source documents. |
| Canonical knowledge remains Git/YAML permanently | Accepted in v0.6.0 | Preserves reviewable history, deterministic builds, rollback, and source-of-truth independence from runtime infrastructure. |
| SQLite is an early derived knowledge index, not an authoring store | Accepted in v0.6.0 | Makes validation, joins, reverse indexes, watcher impact queries, and build-time lookup efficient while remaining fully rebuildable. |
| Future backend databases cannot become canonical knowledge by accident | Accepted in v0.6.0 | User/runtime persistence and reviewed knowledge have different lifecycle and audit requirements. |
| Next.js is static-first but server-capable; full static export is optional | Accepted in v0.6.0 | Keeps current hosting/privacy benefits without constraining future accounts, APIs, sync, or AI gateways. |
| Third-party React themes integrate through a vendor-neutral adapter contract | Accepted in v0.6.0 | Allows purchased themes without coupling product logic to a specific UI kit/template. |
| Licensed theme code is isolated according to redistribution rights | Accepted in v0.6.0 | Prevents accidental publication of commercial theme assets/code. |

---

## 18.1 Decision log additions — v0.7.0

| Decision | Status | Rationale |
|---|---|---|
| GitHub/Git stores authored knowledge and provenance, not bulk artifacts | Accepted in v0.7.0 | Keeps the permanent evidence history small, diffable, portable, and independent of GitHub storage growth. |
| `knowledge.sqlite` and other generated read models remain gitignored | Accepted in v0.7.0 | Derived stores are reproducible and should not create noisy binary history. |
| Fetched HTML/PDF/source snapshots remain temporary by default | Accepted in v0.7.0 | Monitoring needs content for comparison, but the public canonical repo does not need to republish or permanently retain source bodies. |
| Bulk audio/video/images use object storage/CDN when they outgrow tiny MVP fixtures | Accepted in v0.7.0 | Git is not a media distribution layer; large binary history would dominate repository size. |
| Git LFS is not the default solution for canonical knowledge | Accepted in v0.7.0 | YAML/Markdown/JSON should stay ordinary Git text; LFS is reserved for explicitly justified binary assets. |
| Repository health is checked in CI with conservative internal limits | Accepted in v0.7.0 | Catching growth early is easier than rewriting Git history later. |
| Repo splitting is a future escape hatch, not a v1 requirement | Accepted in v0.7.0 | A single repo remains simpler until size, access control, or operational scale proves separation is valuable. |

Detailed storage budgets and CI gates belong to `REPOSITORY_HEALTH.md`.

---


## 18.2 Decision log additions — v0.8.0

| Decision | Status | Rationale |
|---|---|---|
| Original HowToBaby software uses `AGPL-3.0-only` | Accepted in v0.8.0 | Keeps software genuinely open while requiring source availability for modified covered network services. |
| Original HowToBaby knowledge and documentation use `CC-BY-NC-SA-4.0` | Accepted in v0.8.0 | Allows attributed noncommercial reuse and adaptation while reserving commercial reuse for separate permission. |
| Authoritative third-party source material is never relicensed by HowToBaby by default | Accepted in v0.8.0 | Provenance/citation does not transfer copyright or reuse rights. |
| HowToBaby brand/trademark rights remain outside code/content licenses | Accepted in v0.8.0 | Open-source/content permissions must not imply permission to impersonate or rebrand as HowToBaby. |
| Vendor themes, media, fonts, icons, and other third-party assets remain license-specific | Accepted in v0.8.0 | Prevents repository licenses from overriding commercial/restricted asset terms. |
| External canonical knowledge contributions remain closed by default until contribution-rights/CLA policy is deliberate | Accepted in v0.8.0 | Preserves future commercial/relicensing flexibility and avoids fragmented rights in the canonical knowledge base. |
| License scope changes require explicit maintainer approval | Accepted in v0.8.0 | Licensing is a product/legal decision, not an implementation convenience. |

Detailed rights boundaries belong to `LICENSING_POLICY.md`.

---

## 19. Final product statement

HowToBaby should become a durable parent platform with two equally legitimate user-facing strengths:

1. **trusted, current evidence translated into context and action**, and
2. **practical tools that help families act, plan, soothe, organize, and learn**.

Its internal evidence operations should make the site progressively easier to keep current. The ideal future workflow is not “AI writes parenting advice”; it is **authoritative sources change → deterministic system detects impact → structured review updates the canonical content graph → every public/personalized surface updates consistently**.
