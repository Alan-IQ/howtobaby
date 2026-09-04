# EVIDENCE_PROVENANCE — HowToBaby

> Canonical contract for proving where HowToBaby knowledge comes from. This document owns claim-to-source traceability, source locators, public citations, original-source links, evidence detail surfaces, audit history, and source-material handling.

## 1. Principle: prove, do not merely claim

HowToBaby must not rely on a generic statement such as “based on CDC, AAP, WHO, and FDA.”

For health/safety knowledge, the system should be able to answer:

1. Which exact HowToBaby claim is being shown?
2. Which original source(s) support it?
3. What part of the source supports it?
4. Is the source primary, corroborating, contextual, or conflicting?
5. When was that source last verified?
6. Has the source changed or been superseded?
7. What wording is HowToBaby's interpretation versus source wording?
8. Can the parent open the original source?

Canonical provenance chain:

```text
Original authority
  → SourceRecord
  → ClaimSourceRef + SourceLocator
  → Claim
  → GuidanceBlock / Action
  → Route / Now / Print / Tool
  → SourceChip / EvidenceDrawer / References
```

## 2. Source records

```ts
type SourceStatus =
  | "current"
  | "changed-review-required"
  | "superseded"
  | "retired"
  | "temporarily-unreachable";

type SourceAccessMode =
  | "link-only"
  | "monitor-only"
  | "approved-syndication"
  | "public-domain-or-compatible-reuse";

type SourceApprovalLevel =
  | "approved-primary"      // may back primary/direct-support relationships, inside approvedScopes
  | "approved-supporting"   // approved for corroborating/contextual roles only
  | "unapproved";           // recorded but never citable as primary health support

interface SourceRecord {
  id: string;
  organization: string;
  title: string;
  canonicalUrl: string;
  jurisdiction: "US" | "global" | string;
  sourceType: string;
  publishedAt?: string;
  updatedAt?: string;
  lastVerifiedAt: string;
  verifiedBy: ReviewActor;
  nextReviewAt?: string;
  status: SourceStatus;
  supersededBy?: string;
  accessMode: SourceAccessMode;
  approvalLevel: SourceApprovalLevel;
  approvedScopes?: KnowledgeDomain[]; // required for approved tiers
  notes?: string;
}
```

A source record identifies the original authority. It is not permission to reproduce the full work.

Date fields carry three distinct meanings and must never be conflated:

- `publishedAt` — the publication date, only when the authority provides one and it can be determined;
- `updatedAt` — the source's current revision/update date, only when the authority provides one (CDC "last reviewed/updated", WHO fact-sheet revision date, …). Authorities label these dates differently, so HowToBaby never calls every date "Published";
- `lastVerifiedAt` — the date HowToBaby's maintainer/review workflow actually opened, checked and confirmed the source. This is HowToBaby's verification, entirely separate from the source dates: it is **not** a crawl/fetch time (Evidence Watch snapshots record their own `fetchedAt`) and **not** a deploy/build time. When an Evidence Watch review resolves, `lastVerifiedAt` and `verifiedBy` are updated by the maintainer inside that reviewed Pull Request, together with the source's lifecycle state — never by the watcher, and never by closing the Pull Request (`EVIDENCE_UPDATE_ENGINE.md` §21);
- `verifiedBy` — **who** performed that verification: `maintainer` or `ai-assisted`. A date alone can never imply a human sign-off, and AI-assisted retrieval is a legitimate recorded state (CLAUDE.md §5) that validation keeps out of the clinician-asserting review states (GUIDANCE_CONTENT_CONTRACT.md §14).

An authority's calendar date is copied **exactly as the authority prints it to readers**, and never
re-derived from machine metadata. Pages routinely publish the same instant twice at different
precisions: CDC's "Learn the Signs. Act Early." pages state "Content last reviewed on Feb. 16, 2026"
in the visible date bar while `og:updated_time`, `cdc:last_reviewed` and the desktop
`<time datetime>` attribute carry that instant shifted into UTC (`2026-02-17T00:00`). Reading the
machine value silently moves an authority's date by a day, so the human-readable date on the page
is the one that goes into the registry — never a timezone conversion of it, and never a summariser's
report of it.

`publishedAt` and `updatedAt` are **different upstream facts** and are never inferred from each other: a missing `publishedAt` is never filled from `updatedAt`, a missing `updatedAt` never from `publishedAt`, and neither is ever guessed from a crawl, a copyright line or a deploy. Both are copied verbatim from the original source page into canonical YAML and propagate unchanged through every derived read model (`knowledge.sqlite`, `source-public-index.json`, `PublicSourceEntry`) to the evidence presenters — no UI layer keeps its own copy of source dates. Their public presentation follows one deterministic matrix (§14, "Source date provenance contract").

`status: current` is a machine lifecycle state used by validation and Evidence Watch. A healthy `current` source carries **no** public badge; the source date rows plus `lastVerifiedAt` are its public trust information (§14).

`approvalLevel`/`approvedScopes` are the machine-checkable approval boundary: build validation
only accepts a `primary`/`direct-support` relationship when the source is `approved-primary` and
its `approvedScopes` cover the claim's domain. Declaring `relationship: primary` therefore can
never promote a blog, retailer/manufacturer, influencer, or otherwise unapproved source into a
canonical primary health source (see GUIDANCE_CONTENT_CONTRACT.md §12 for the governance list).

## 3. Claim-to-source relationship

Do not store only `sourceIds: string[]` when the relationship matters.

```ts
type SourceRelationship =
  | "primary"
  | "direct-support"
  | "corroborating"
  | "contextual"
  | "conflicting";

interface SourceLocator {
  heading?: string;
  section?: string;
  anchor?: string;
  page?: number;
  table?: string;
  figure?: string;
  paragraphHint?: string;
  sourceVersionHint?: string;
}

interface ClaimSourceRef {
  sourceId: string;
  relationship: SourceRelationship;
  locator?: SourceLocator;
  supportNoteKey?: string;
  verifiedAt: string;
}
```

Locators should be specific enough for a maintainer or parent to find the supporting portion without HowToBaby copying large source passages. `paragraphHint` is concise paraphrased locator/context, never a stored long verbatim quotation — validation warns on quote-length hints (`verbatim-locator-hint`).

`SourceLocator` carries **no identifier**, and Phase 9 adds none. To track locator resolution per locator, Evidence Watch derives its own operational `locatorKey` from the structural locator fields — `sourceId`, `heading`, `section`, `anchor`, `page`, `table`, `figure`, `sourceVersionHint` — deliberately excluding `paragraphHint` and `supportNoteKey`, so editing a hint or a support note never reads as a locator change. That key, and the `locatorSetDigest` over the locators currently monitored for a source, are watcher operational identities: never authored into canonical files, never citable as provenance, and never a canonical `SourceLocator` field (`EVIDENCE_UPDATE_ENGINE.md` §8). A reviewed canonical edit that adds or removes a locator changes HowToBaby's monitoring scope, not the upstream source (`EVIDENCE_UPDATE_ENGINE.md` §9).

## 4. Minimum provenance rules by guidance class

### `official-guidance`

Requires at least one `primary` or `direct-support` reference to an approved authority whose source scope actually covers the claim. Machine-checked: the referenced source must be `approvalLevel: approved-primary`, its `approvedScopes` must include the claim's domain, and its status must still be usable (not superseded/retired).

### `evidence-synthesis`

Requires all material source references used in the synthesis. If authorities differ, the disagreement must not be hidden.

### `practical-interpretation`

Must point to the claim(s)/source(s) it interprets and clearly remain HowToBaby wording rather than quoted authority wording.

### `typical-pattern`

May use professional/observational references where appropriate but must never be visually promoted to official guidance merely because a source exists.

### `example-plan` / `product-heuristic`

Source citation is optional unless a health/safety claim is embedded. The UI must identify the output as an example/heuristic.

### Tool descriptions

Pure utility descriptions need no medical citation. A guidance-linked or safety-sensitive Tool must resolve any health claims through canonical claim IDs and inherit their provenance.

## 5. Example canonical claim

```yaml
id: feeding.solids.start
textKey: feeding.solids.start

guidanceClass: official-guidance
precisionClass: source-approximate
safetyLevel: info

sourceRefs:
  - sourceId: cdc-introduction-solid-foods
    relationship: primary
    locator:
      heading: When to introduce solid foods
    verifiedAt: 2026-08-26

  - sourceId: who-complementary-feeding
    relationship: corroborating
    locator:
      heading: Introduction of complementary foods
    verifiedAt: 2026-08-26

reviewStatus: source-verified
reviewedAt: 2026-08-26
reviewedBy: maintainer
```

The parent-facing wording may be simplified, but qualifiers such as “about” must remain when the source is approximate.

## 6. Public citation model: three layers

HowToBaby should use all three layers instead of choosing between inline citations and a bibliography.

### Layer A — compact claim/card source chips

Example:

```text
Official guidance · CDC · WHO
```

The default scan path remains clean. Organization names are interactive when evidence details exist.

### Layer B — Evidence Drawer

Opening the source chip should show, for each supporting source, the organization, the exact source title, the relationship to the claim (role badge), then the metadata **in this order**:

1. **Relevant section** — source locator, when useful;
2. **Applies to / Scope** — jurisdiction/context;
3. **source publication/version metadata** — per the source date provenance contract (§14): `Published` only, `Current source version`, `Published` + `Updated` (only when the update is later), or nothing;
4. **Last verified by HowToBaby** — `lastVerifiedAt`, always after the source dates;
5. **Relationship to the guidance above** — derived from the canonical relationship;
6. **View original source** link.

Relationship explanations name the source organization and refer explicitly to the HowToBaby guidance displayed above. They must not rely on ambiguous wording such as “this guidance”, “this statement” or “this organization”.

A status badge is rendered only for a non-current source (reviewing an update / superseded / retired / temporarily unavailable); a healthy `current` source shows no status UI at all. A concise HowToBaby interpretation note and a meaningful conflict/uncertainty note follow where necessary.

Do not imply the authority reviewed or endorsed HowToBaby.

### Layer C — page References

Every guidance page should provide a deduplicated **Sources used on this page** section containing all sources actually used by rendered claims.

A page-level reference list is generated from claim provenance, not manually maintained separately.

### Vietnamese public evidence vocabulary

The canonical provenance model remains source-oriented (`SourceRecord`, `ClaimSourceRef`, `SourceLocator`, source IDs and `/sources`). Vietnamese parent-facing presentation is document-oriented and MUST NOT rename the underlying model.

Use:

- `Sources` → `Tài liệu tham khảo`
- `Original source` → `Tài liệu gốc`
- `Primary source` → `Tài liệu tham khảo chính`
- `Direct support` → `Tài liệu hỗ trợ trực tiếp`
- `Corroborating source` → `Tài liệu đối chiếu`
- `Contextual source` → `Tài liệu bổ trợ`
- `Conflicting source/view` → `Tài liệu có khuyến nghị khác`
- `Current source version` → `Phiên bản tài liệu hiện tại`
- `Source status` → `Trạng thái tài liệu`
- `Relationship to the guidance above` → `Mối liên hệ với nội dung hướng dẫn ở trên`
- `View original source` → `Xem tài liệu gốc`
- `/sources` page heading → `Tài liệu tham khảo`
- page References heading → `Tài liệu tham khảo trên trang này`

Do not mechanically replace technical `source` terminology. `SourceRecord`, `SourceLocator`, `sourceId`, source relationships, source indexes, `source of truth`, `data source`, and the `/sources` route retain their existing technical identity.

The source-date contract (§14) is unchanged except for Vietnamese presentation: only `publishedAt` → `Ngày xuất bản`; only `updatedAt` → `Phiên bản tài liệu hiện tại`; equal published/updated → only `Ngày xuất bản`; later update → `Ngày xuất bản` + `Ngày cập nhật`; neither → omit.

## 7. Original-source links

Yes: parents should be able to open the original authority.

Rules:

- prefer canonical source URL;
- label the action **View original source** or equivalent;
- make external-domain behavior clear;
- use safe external-link attributes where applicable;
- do not route users through affiliate/tracking redirects for evidence sources;
- if the source moved, update the canonical URL while preserving provenance history;
- if the source is unavailable, show the status honestly rather than silently dropping it.

The design goal is:

> HowToBaby does not ask parents to trust a brand claim that something is evidence-based; it gives them a path to verify it.

## 8. Evidence detail pages

The architecture should support a public or semi-public evidence detail route for a claim, for example:

```text
/evidence/feeding-solids-start
```

The public slug is mapped to the stable internal claim ID; do not expose unsafe raw IDs directly if routing constraints change.

Suggested content:

- current HowToBaby claim text;
- guidance class;
- precision/safety classification;
- applicability summary;
- primary and supporting sources;
- source locators;
- last reviewed date;
- source status;
- meaningful revision history;
- links to original sources;
- disclaimer that HowToBaby is summarizing/interpreting unless content is explicitly syndicated.

Evidence pages are a trust/audit surface, not a second canonical content store.

## 9. Global trust surfaces

### `/sources`

Shows the authorities and exact source records currently used by HowToBaby, grouped by organization/domain/status.

Useful metadata:

- source count;
- source publication/version metadata (same contract as §14: `Published`, `Current source version`, `Published`/`Updated` when the update is later, or omitted);
- last verification date (HowToBaby);
- status — rendered only for non-current sources, with the same attention treatment as the Evidence Drawer;
- topics/claims using the source;
- original-source link.

### `/methodology`

Explains:

- source hierarchy;
- how claims are selected;
- how age/applicability works;
- how HowToBaby distinguishes official guidance from interpretation/heuristics;
- how corrected age is handled;
- how sources are monitored and reviewed;
- how translations preserve canonical meaning.

### `/changelog` or `/corrections`

Records meaningful parent-facing changes, corrections, and superseded recommendations.

## 10. Public audit metadata

Each published claim should be able to expose or internally resolve:

```ts
interface PublishedClaimAudit {
  claimId: string;
  claimRevision: string;
  contentVersion: string;
  reviewedAt: string;
  reviewStatus: string;
  reviewedBy: ReviewActor;
  sourceRefs: ClaimSourceRef[];
}
```

Do not publish private reviewer identity unless there is a deliberate editorial policy for it. Reviewer role/status is more important than personal metadata.

## 11. Git history and revision history

Git provides useful evidence of when/how content changed, but raw commit history alone is not enough.

For meaningful recommendation changes, record a structured changelog item such as:

```yaml
claimId: feeding.solids.start
changedAt: 2026-08-26
changeType: wording-precision
summary: Preserved the source qualifier "about 6 months".
sourceIds:
  - cdc-introduction-solid-foods
  - who-complementary-feeding
```

The build may generate revision history from explicit changelog records plus Git metadata.

## 12. Source material and copyright/reuse boundary

Default mode is **interpret + cite + link**, not **copy + host**.

HowToBaby should normally store:

- source metadata;
- canonical URL;
- locator;
- fingerprints/hashes needed for monitoring;
- brief internal notes where legally appropriate;
- HowToBaby-authored canonical interpretation.

HowToBaby should not automatically commit or republish full AAP/WHO/other third-party articles or PDFs merely because the watcher fetched them.

Full or substantial source reproduction is allowed only when the specific source/license/permission supports it and the implementation follows those terms.

### Approved syndication

If an authority offers an official syndication mechanism, treat syndicated content as a distinct source mode:

```text
approved-syndication
```

Syndicated material must keep required attribution/links and must not be silently edited into HowToBaby-authored prose.

## 13. Quotes

Prefer paraphrase plus source locator. Direct quotations should be short, purposeful, accurately attributed, and compatible with applicable permissions/copyright rules.

Do not use long quotations as a shortcut for writing canonical HowToBaby guidance.

## 14. Source freshness states in UI

Public UI should normally show simple trust signals rather than internal workflow noise.

Recommended display:

- healthy `current` source — **no status badge**. Its trust information is the source date metadata (contract below) plus **Last verified by HowToBaby: [date]** / VI **HowToBaby kiểm chứng lần cuối: [date]**;
- **Reviewing an update** / VI **Đang rà soát bản cập nhật** — monitored source changed and the relevant claim is being re-reviewed;
- **Superseded** — normally not shown as current advice; visible in history when useful;
- **Retired** and **Source temporarily unavailable** — shown honestly rather than silently removing the evidence.

Every non-current state uses the same semantic attention treatment and the same label vocabulary on the Evidence Drawer, `/sources`, evidence detail pages and page References. `current` stays in `SourceStatus` and the canonical model for validation/lifecycle logic; only its public presentation is silent.

Internal states remain more granular.

**Phase 9 v1 publication boundary.** Every public source state renders from deployed canonical content, so `Reviewing an update` — like every other non-current label — appears only when the corresponding canonical source lifecycle state has reached the deployed content through the normal reviewed merge path.

A pending Evidence Watch Draft Pull Request alone does not mutate production provenance state. While a detected change is still awaiting review, the Draft Pull Request is the maintainer-facing pending-review signal and the public site keeps showing the last reviewed state; Evidence Watch has no side channel that changes public source status outside canonical Git and the existing deployment pipeline (`EVIDENCE_UPDATE_ENGINE.md` §13, §19). Publishing pending watcher freshness state to the public site ahead of canonical merge would be a separate capability with its own contract and publication path, and is not part of Phase 9 v1.

Nor does an Evidence Watch merge carry the interim state to production. Merging an Evidence Watch review Pull Request means that evidence event has been **resolved**: a required review-resolution check blocks the merge while the same event is still in `changed-review-required`, so a Phase 9 v1 Evidence Watch merge always lands a terminal reviewed source state — `current`, `superseded`, `retired` or `temporarily-unreachable` — together with the claim and review changes the content contract requires (`EVIDENCE_UPDATE_ENGINE.md` §19, §21). `changed-review-required` remains a legitimate canonical state a maintainer may author and merge in a normal reviewed Pull Request, and `Reviewing an update` renders from it in the ordinary way; what Phase 9 v1 forbids is an Evidence Watch review merging its own unresolved event while the watcher advances its baselines.

`temporarily-unreachable` is also the canonical state a reviewed deterministic source absence normally resolves into when the authority is expected to restore the document; `retired` and `superseded` cover the other outcomes. A source that later becomes reachable again re-enters review through `SOURCE_RETURNED` rather than silently returning to `current` (`EVIDENCE_UPDATE_ENGINE.md` §9).

A changed source does not automatically mean the existing recommendation is wrong. Wording should avoid unnecessary alarm.

### Source date provenance contract

`publishedAt` and `updatedAt` are distinct upstream metadata (§2) and are never inferred from each other. Every surface that shows source dates (Evidence Drawer, `/sources`, `/evidence/[slug]`, page References) renders the same deterministic matrix from the same canonical fields:

| Canonical fields | EN presentation | VI presentation |
| --- | --- | --- |
| A. `publishedAt` only | `Published: <publishedAt>` | `Ngày xuất bản: <publishedAt>` |
| B. `updatedAt` only | `Current source version: <updatedAt>` | `Phiên bản tài liệu hiện tại: <updatedAt>` |
| C. both, `updatedAt === publishedAt` | `Published: <publishedAt>` only | `Ngày xuất bản: <publishedAt>` only |
| D. both, `updatedAt > publishedAt` | `Published: <publishedAt>` then `Updated: <updatedAt>` | `Ngày xuất bản: <publishedAt>` then `Ngày cập nhật: <updatedAt>` |
| E. neither | source-date metadata omitted entirely | bỏ hẳn metadata ngày nguồn |

Rules:

- case B never presents `updatedAt` as a publication date, and case A never presents `publishedAt` as an update;
- case C is one source version: the same date is never repeated as `Updated`/source-version information;
- case E never infers, guesses or substitutes a date (no crawl time, no copyright year, no deploy date);
- `sourceDateMeta()` (`apps/web/src/features/evidence/labels.ts`) is the single presentation source of this matrix; consumers render its rows and never re-branch on the raw fields;
- canonical validation (`packages/knowledge/src/validate.ts`, `pnpm validate:knowledge`) fails when `publishedAt`/`updatedAt` is not a valid calendar date, is in the future, or when `updatedAt < publishedAt` (`source-date-order`); equal dates are valid. The UI never masks invalid canonical metadata — the fix belongs in the source registry;
- `publishedAt`/`updatedAt` remain the authority's metadata; `lastVerifiedAt` remains HowToBaby's own verification date and is validated separately (never in the future);
- after the source date metadata — and only after it — comes **Last verified by HowToBaby: <lastVerifiedAt>** / VI **HowToBaby kiểm chứng lần cuối: <lastVerifiedAt>**, the date the HowToBaby maintainer/review workflow actually confirmed the source (never a crawl/fetch time, never a deploy time);
- dates are calendar dates (`YYYY-MM-DD` in YAML), formatted `Apr 14, 2026` in EN and `14/04/2026` in VI;
- list surfaces (`/sources`, References) join the same rows on one line (`Published: Jan 10, 2025 · Updated: Apr 14, 2026 · Last verified by HowToBaby: Aug 31, 2026`) rather than inventing a shorter variant.

Regression tests cover all five presentation cases plus the non-current status states (`apps/web/src/features/evidence/labels.test.ts`, `load.test.ts`, `presenters.test.ts`, `packages/ui/src/evidence/evidence.test.tsx`) and the validation outcomes — published only, updated only, equal, updated later, updated earlier (fails), future dates (fail), neither (`packages/knowledge/tests/validate.test.ts`).

## 15. Source disagreement

When approved authorities materially disagree:

- do not average numbers or erase qualifiers;
- identify jurisdiction and source relationship;
- choose the applicable U.S. authority as primary for the U.S. product when appropriate;
- expose the meaningful difference when it would affect parent action;
- record the decision rationale in the claim/review notes.

## 16. Build-time provenance validation

CI must fail when:

- an `official-guidance` claim has no approved direct/primary source;
- a referenced source ID does not exist;
- a source marked superseded is the only current support for a release-approved claim;
- a source reference has impossible/invalid metadata;
- a guidance-linked Tool renders a health claim not traceable to a canonical claim;
- a page manually declares a source that none of its claims use;
- a required public source link is missing;
- a `primary`/`direct-support` reference points at a source that is not `approved-primary`, or whose `approvedScopes` do not cover the claim's domain;
- a GuidanceBlock renders a claim that is not release-eligible (`draft`, `clinical-review-required`, `superseded`) — the public release gate is enforced at build time and cannot be bypassed by omitting the claim from the coverage matrix;
- a release-approved claim keeps relying on a `changed-review-required` source that was not re-verified after the change;
- EN/VI versions materially diverge on source-sensitive qualifiers — quantities are compared in order together with their units and boundary qualifiers (before/after/about), so swapped age boundaries, changed units, dropped qualifiers, and lost negation all fail.

Warnings or review-required states should be generated when:

- a locator can no longer be found;
- a source changed since claim review (`changed-review-required` propagates a review signal to every dependent claim; the claim's support is no longer presented as fully current);
- a locator `paragraphHint` looks like a long verbatim quotation;
- a source is temporarily unreachable;
- a monitored heading/section moved.

## 17. Generated provenance indexes

Recommended build artifacts:

```text
claim-evidence-index.json
source-claim-index.json
route-evidence-index.json
tool-evidence-index.json
source-public-index.json
```

These are derived from canonical records and make Evidence Drawer, References, Evidence Watch impact analysis, print references, and future source-grounded assistant retrieval consistent.

## 18. Print/PDF provenance

Printed guidance should retain enough provenance to remain useful when detached from the website.

At minimum include:

- source organization/title list;
- verification date or content version;
- short source URLs or a stable HowToBaby evidence URL where practical.

Do not print every long URL inline next to every sentence if it destroys readability.

## 19. Evidence provenance definition of done

A new health/safety claim is not release-ready until:

- stable claim ID exists;
- guidance/precision/safety classes are assigned;
- primary/direct source support exists where required;
- source locator is captured when practical;
- source was opened and verified;
- parent-facing wording preserves source qualifiers;
- original source link resolves;
- review state/date are current;
- VI semantic parity is complete;
- Evidence Drawer/Page References can be generated without manually adding a second citation list;
- the claim participates in the reverse dependency graph for Evidence Watch.

## Storage invariant — v0.6.0

Canonical provenance/guidance authoring remains in Git-tracked YAML/structured text as defined by `REPOSITORY_STRUCTURE.md`. Generated SQLite/JSON indexes may be used to validate, query, and render this model, but they are disposable projections and must not become an independent editing source of truth.


## Repository storage note — v0.7.0

Canonical claims/provenance remain compact authored Git data. Generated SQLite/indexes and full fetched third-party source bodies are not canonical content and follow `REPOSITORY_HEALTH.md`.


## Licensing boundary — v0.8.0

Provenance records attribution and support; it does not transfer copyright. Original HowToBaby interpretation may be CC-BY-NC-SA-4.0 while the cited source body remains governed by its upstream rights. Store enough metadata to verify and link to the source without assuming the right to republish it. See `LICENSING_POLICY.md`.
