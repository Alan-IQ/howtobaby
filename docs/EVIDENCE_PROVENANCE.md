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
  nextReviewAt?: string;
  status: SourceStatus;
  supersededBy?: string;
  accessMode: SourceAccessMode;
  notes?: string;
}
```

A source record identifies the original authority. It is not permission to reproduce the full work.

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

Locators should be specific enough for a maintainer or parent to find the supporting portion without HowToBaby copying large source passages.

## 4. Minimum provenance rules by guidance class

### `official-guidance`

Requires at least one `primary` or `direct-support` reference to an approved authority whose source scope actually covers the claim.

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

Opening the source chip should show, for each supporting source:

- organization;
- source title;
- relationship to the claim;
- source locator when useful;
- jurisdiction/context;
- last verified date;
- current/change/superseded status;
- **View original** link;
- concise HowToBaby interpretation note where necessary;
- meaningful conflict/uncertainty note.

Do not imply the authority reviewed or endorsed HowToBaby.

### Layer C — page References

Every guidance page should provide a deduplicated **Sources used on this page** section containing all sources actually used by rendered claims.

A page-level reference list is generated from claim provenance, not manually maintained separately.

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
- last verification date;
- status;
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

- **Verified [date]** — current and reviewed;
- **Reviewing an update** — monitored source changed and the relevant claim is being re-reviewed;
- **Superseded** — normally not shown as current advice; visible in history when useful.

Internal states remain more granular.

A changed source does not automatically mean the existing recommendation is wrong. Wording should avoid unnecessary alarm.

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
- EN/VI versions materially diverge on source-sensitive qualifiers.

Warnings or review-required states should be generated when:

- a locator can no longer be found;
- a source changed since claim review;
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
