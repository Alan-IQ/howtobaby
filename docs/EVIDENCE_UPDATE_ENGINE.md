# EVIDENCE_UPDATE_ENGINE — HowToBaby

> Canonical design for monitoring authoritative sources, detecting meaningful changes, tracing impact to HowToBaby claims, and carrying every actionable change through a mandatory human review path. Detection, classification, scoping and the review artifact are deterministic and never depend on AI. AI Review Summary is a first-class part of that review artifact, but it never becomes evidence and never holds approval, merge, or release authority.

Central invariant of this contract:

```text
Deterministic Evidence Watch detects and scopes the change.
AI explains and assists.
GitHub Draft PR carries the review.
A human retains approval authority.
Semantic medical changes never publish themselves.
```

## 1. Goal

Replace the fragile workflow:

```text
maintainer remembers to revisit every source manually
```

with the mandatory workflow:

```text
official source
  → scheduled/manual fetch
  → deterministic fingerprint/diff
  → deterministic impact analysis
  → actionable change classification
  → Draft Pull Request
  → AI Review Summary
  → human/source verification
  → approved canonical change
  → CI validation
  → merge
  → deployment
```

The engine's primary job is **change detection, impact analysis, and review routing**, not autonomous medical authorship.

The engine monitors the same `SourceRecord` objects used by public provenance. Canonical source/claim relationship, locator, and public citation rules live in `EVIDENCE_PROVENANCE.md`; the watcher must not create a parallel source model.

## 2. Deterministic detection does not depend on AI

Most update monitoring is deterministic:

- HTTP `ETag`/`Last-Modified` changes;
- RSS/Atom entry changes;
- API response changes;
- page metadata/date changes;
- normalized section hash changes;
- PDF checksum/text changes;
- source-title/status/supersession changes;
- dependency graph lookup from source IDs to claims.

Detection, classification, impact analysis, and the deterministic review artifact MUST remain fully functional when no AI provider is configured, reachable, or affordable.

AI becomes useful only after a meaningful deterministic diff exists: explaining what changed in meaning, assessing affected claims, and reducing maintainer review workload. AI never detects a change, never decides that a change is actionable, and never decides the review outcome (§14–§17).

## 3. Source adapter hierarchy

Prefer the most structured/official channel available:

1. `api` / official content syndication;
2. `rss` / `atom`;
3. `structured-index` / publication listing;
4. `sitemap`;
5. `html-section`;
6. `pdf`;
7. `manual`.

Do not use browser automation as the default when a stable feed/API/index exists.

## 4. Source-monitor schema

```ts
type MonitorAdapter =
  | "api"
  | "rss"
  | "atom"
  | "structured-index"
  | "sitemap"
  | "html-section"
  | "pdf"
  | "manual";

interface SourceMonitor {
  sourceId: string;
  adapter: MonitorAdapter;
  url: string;
  interval: "daily" | "weekly" | "monthly" | "manual";
  selector?: string;
  includePatterns?: string[];
  excludePatterns?: string[];
  canonicalizationProfile?: string;
  compareMode: "metadata" | "hash" | "section-diff" | "entry-set";
  licenseMode: "metadata-only" | "monitor-only" | "approved-syndication" | "manual-review";
}
```

## 5. Current official-source adapter opportunities

As of 2026-08-26, the architecture can take advantage of source-specific structured channels where available:

### CDC

CDC provides Public Health Media Library/content syndication APIs and feeds for supported content. Use those when the relevant source exists there. CDC syndication has specific usage/attribution/redistribution rules, so **monitoring/syndication behavior and HowToBaby-authored interpretation must remain separate concepts**.

Suggested adapter priority:

```text
CDC syndication/API → CDC feed → page-section monitor
```

### FDA

FDA exposes RSS for some safety streams such as MedWatch and publishes structured recall/safety listings. Use RSS/structured listings for alert detection; use page monitors for evergreen guidance not represented in a feed.

### AAP

AAP exposes public policy/index pages containing titles, document types, and release dates. These are suitable for discovering new/revised policies. Do not bypass subscriber/paywall restrictions or copy restricted full text. Use metadata/index monitoring to trigger review of relevant AAP sources.

### WHO

WHO provides RSS in some properties/regions and structured publication/news pages. Because coverage is not universal, support RSS where available and page/index/PDF monitoring elsewhere.

## 6. Fetch pipeline

```text
scheduler
  → adapter.fetch()
  → HTTP cache/conditional request
  → validate response/source identity
  → canonicalize monitored material
  → fingerprint
  → compare with previous fingerprint
  → persist CheckResult
```

Use conditional requests (`If-None-Match`, `If-Modified-Since`) where supported.

## 7. Canonicalization

Avoid false positives from navigation, timestamps, cookie banners, or unrelated page chrome.

Profiles may:

- select a known content container;
- remove scripts/styles/navigation;
- normalize whitespace;
- normalize known dynamic timestamps;
- preserve headings/list/table structure;
- extract metadata separately from body.

Never canonicalize so aggressively that clinically meaningful qualifier changes disappear.

When a canonical claim has a `SourceLocator`, the adapter should attempt to confirm that the locator still resolves. A moved/missing heading or PDF page mapping is a review signal even if the whole-page hash is difficult to interpret.

## 8. Fingerprints

Maintain at least:

```ts
interface SourceFingerprint {
  sourceId: string;
  checkedAt: string;
  etag?: string;
  lastModified?: string;
  metadataHash?: string;
  contentHash?: string;
  sectionHashes?: Record<string, string>;
}
```

For copyrighted/restricted sources, hashes + metadata + locators may be preferable to storing large source snapshots.

## 9. Diff classification

Deterministic categories:

```text
UNCHANGED
METADATA_CHANGED
CONTENT_CHANGED
SOURCE_MOVED
SOURCE_MISSING
NEW_EDITION_OR_POLICY
POSSIBLE_SUPERSESSION
FETCH_ERROR
PARSER_ERROR
```

A content change is not automatically a recommendation change.

Each category resolves deterministically into exactly one operational outcome (§11), which decides what the workflow creates.

## 10. Dependency graph

Every canonical claim has structured `ClaimSourceRef` records. Build reverse indexes from those canonical relationships:

```text
sourceId → claimIds
claimId → guidanceBlockIds
claimId → public routes
claimId → tools that depend on it
```

When a source changes:

```text
changed SourceRecord
  → dependent claims become review-required
  → affected pages/tools listed in the review payload
```

This is the core mechanism that makes the system maintainable without AI.

## 11. Actionable-change classification and outcome policy

Every check resolves into exactly one of four operational outcomes. The outcome is decided deterministically, before any AI call, and it decides what the workflow creates.

### `UNCHANGED`

- update watcher state as needed;
- do not call AI;
- do not create a Pull Request;
- do not create an Issue;
- produce no maintainer-facing noise.

### Deterministic metadata-only change

A `METADATA_CHANGED` result that an explicitly approved deterministic rule proves does not affect monitored content, medical meaning, or provenance — for example an irrelevant publication timestamp with no monitored-section difference.

- handle deterministically;
- do not call AI by default;
- watcher state may update automatically;
- canonical source metadata may update automatically only where an explicitly approved deterministic rule permits it, and only through the normal validation gates;
- must never alter medical meaning.

Any unresolved doubt promotes the change to actionable.

### Actionable evidence change

Includes, at minimum:

```text
CONTENT_CHANGED
SOURCE_MOVED
SOURCE_MISSING
NEW_EDITION_OR_POLICY
POSSIBLE_SUPERSESSION
material SourceLocator resolution failure
material provenance change
```

An actionable evidence change MUST:

- create or update **exactly one** Draft Pull Request representing that unresolved change (§12);
- move the monitored source and its dependent claims into the unresolved review-required state (§13);
- preserve prior provenance, citations, and review history until a human resolves the change.

A GitHub Issue is never a substitute for the evidence-review Draft Pull Request.

### Operational failure

Includes:

```text
FETCH_ERROR
PARSER_ERROR
authentication/access failure
persistent adapter failure
```

Operational failures do not represent evidence changes. They MAY fail the workflow and/or create/update a GitHub Issue according to the retry/escalation policy.

They MUST NOT create an evidence-change Pull Request unless an actual evidence/provenance change has also been determined. A transport or parser failure must be distinguished deterministically from a genuine `SOURCE_MISSING`/`SOURCE_MOVED` result before an outcome is chosen.

## 12. Draft Pull Request contract

Every actionable evidence change produces a Draft Pull Request. The Draft PR is the canonical human review surface for that change; the machine-readable report (JSON) and its deterministically rendered Markdown are the payload it carries.

The Draft Pull Request MUST contain:

- source ID and source title;
- canonical official-source URL;
- deterministic change classification;
- previous and current fingerprints/metadata as applicable;
- deterministic diff summary;
- changed sections or locators;
- impacted claim IDs;
- impacted guidance blocks;
- impacted public routes;
- impacted Tools;
- deterministic policy risk;
- current source/review state;
- recommended review action;
- direct official-source links needed for verification;
- the AI Review Summary, or an explicit AI-unavailable/AI-failed status (§16).

The Pull Request SHOULD use stable labels such as:

```text
evidence-watch
review-required
risk-low | risk-medium | risk-high | risk-critical
```

Evidence Watch MUST be idempotent:

- one unresolved source change maps to one branch and one Draft Pull Request;
- a later run for the same unresolved change updates that existing Draft PR instead of opening another;
- overlapping scheduled/manual runs must not create duplicate branches or Pull Requests;
- workflow concurrency control is required (§20).

The deterministic renderer, not the model, produces the Pull Request body. Every required deterministic field must be present even when AI is unavailable.

The Evidence Watch automation credentials MUST NOT be able to bypass the required review path or publish semantic medical changes directly to `main` (§17, §20).

## 13. Risk-based workflow

### Provenance state transition

An actionable detected change transitions the monitored source to:

```text
current → changed-review-required
```

Dependent claims are flagged for review, but their existing approved provenance/history is preserved until review resolves the change. A detected change must never silently remove a citation, replace a source, or invalidate prior provenance.

After review:

```text
source unchanged in meaning → current + refreshed verification
source meaning changed → revise affected claims + current
source superseded → superseded + replacement source mapping
```

Public UI may surface the simplified state `Reviewing an update` where appropriate.

### Low-risk metadata-only

Examples: URL moved with no monitored-section difference, publication timestamp changed with no monitored-section difference.

May update source metadata automatically after validation, under the deterministic rule described in §11.

### Content change with no approved deterministic mapping

Mark dependent claims `review-required`; do not rewrite canonical prose automatically.

### Structured exact-source data

If a source provides machine-readable structured data and HowToBaby merely mirrors a non-interpretive field under an approved rule, automatic draft updates may be allowed. The change still travels the Draft PR review path, and release still runs validation gates.

### Safety-critical / urgent / contraindication changes

Always require human review; clinician review when the content contract requires it.

## 14. AI Review Summary

AI Review Summary is a first-class Phase 9 review capability, not a cosmetic or deferred extra. Whenever AI is configured and available, an actionable evidence change receives one.

AI MUST run only **after** deterministic diff, classification, and impact analysis have produced a bounded review context. AI never triggers a run, never decides whether a change is actionable, and never widens the scope beyond the detected source change.

AI SHOULD receive only the material required for review, such as:

- the deterministic source diff;
- changed source sections;
- relevant `SourceRecord` metadata;
- affected canonical claims;
- relevant source locators;
- related canonical guidance;
- relevant conflicting/supporting sources where available.

AI MAY:

- summarize the semantic change;
- explain the likely meaning impact;
- assess each affected claim individually;
- identify changed qualifiers, age boundaries, quantities, urgency, contraindications, or applicability;
- identify possible contradictions;
- identify affected claims that a purely structural dependency list presents weakly;
- recommend claims to verify, revise, or supersede;
- recommend a next action for the maintainer.

AI MUST NOT:

- act as source evidence;
- invent evidence, quotes, thresholds, or dates;
- silently expand the scope beyond the detected source change;
- determine canonical approval state;
- downgrade a deterministic safety/risk requirement;
- mark itself as `maintainer`;
- assert `clinically-reviewed` or `release-approved`;
- approve a Pull Request;
- merge a Pull Request;
- publish a semantic medical change;
- bypass source verification.

The effective review requirement is determined by project policy, never by model confidence.

## 15. Structured AI review output

AI output MUST use a versioned structured schema and pass schema validation before anything is rendered into Markdown.

Conceptually:

```ts
interface EvidenceAIReview {
  schemaVersion: string;
  status: "completed" | "unavailable" | "failed";

  semanticAssessment:
    | "no_meaning_change"
    | "possible_meaning_change"
    | "meaning_change"
    | "uncertain";

  summary: string;

  changedMeaning?: string[];
  affectedClaimAssessments?: Array<{
    claimId: string;
    assessment: string;
    recommendedAction:
      | "no_change"
      | "verify"
      | "revise"
      | "supersede"
      | "uncertain";
  }>;

  qualifierChanges?: string[];
  contradictions?: string[];
  recommendedActions?: string[];

  aiRiskAssessment?:
    | "low"
    | "medium"
    | "high"
    | "critical";
}
```

`affectedClaimAssessments` entries map to canonical `claimId` values; an assessment that cannot be mapped to a canonical claim is informational only.

Deterministic project policy computes policy risk and the required review state **outside** the AI response.

AI MAY propose a higher risk. AI MUST NOT reduce a deterministic policy risk or remove a required human/clinical review requirement.

A deterministic renderer converts the validated structured result into the human-readable Review Summary section of the Draft Pull Request.

## 16. AI failure and unavailability

The evidence-monitoring pipeline MUST remain functional and safe without AI.

If the AI request times out, exhausts quota, lacks credentials, returns invalid or unparsable structured output, fails schema validation, or returns otherwise unusable output, Evidence Watch MUST still create/update the Draft Pull Request from the deterministic report.

The Pull Request MUST clearly show:

```text
AI Review: unavailable
```

or:

```text
AI Review: failed
```

together with enough deterministic evidence for a maintainer to perform the review manually.

AI failure MUST NOT:

- suppress the detected change;
- mark the source unchanged;
- close or resolve the review;
- auto-approve anything;
- block creation of the deterministic review artifact.

## 17. Human approval boundary

For an actionable semantic or provenance change:

```text
AI review
   ≠ source verification
   ≠ human approval
   ≠ clinical review
   ≠ release approval
```

The maintainer reviews the Draft Pull Request against the official source and may:

```text
Approve
Request changes
Close as no semantic impact
Update canonical content
Request stronger/clinical review
Merge after all required gates pass
```

Safety-critical, urgent, contraindication, emergency, or otherwise policy-designated high-risk content always requires human review, and clinician review when required by `GUIDANCE_CONTENT_CONTRACT.md`.

The Evidence Watch bot and the AI reviewer can never satisfy a required human reviewer gate.

## 18. Canonical mutation boundary

Phase 9 v1 requires the AI Review Summary; it does not require AI-generated canonical content patches.

Phase 9 v1 behavior is:

```text
deterministic detection
  → Draft PR
  → AI Review Summary
  → human decides/edits
```

A later capability may allow AI to draft canonical English claim changes, guidance changes, Vietnamese parity changes, and test/provenance updates directly on the existing Evidence Watch review PR branch.

Such changes remain drafts. AI-authored commits gain no review authority by passing CI, and no semantic medical change becomes approved merely because AI produced it or CI is green.

## 19. Merge and deployment contract

An actionable evidence change MUST NOT reach production merely because Evidence Watch detected it or AI reviewed it.

The release path is:

```text
Draft PR
  → required human/source review
  → canonical English changes completed
  → EN/VI parity completed when applicable
  → CI validation
  → required approval
  → merge to main
  → existing production pipeline
  → deploy
```

Merge to `main`, not Evidence Watch itself, is the event that may enter the normal deployment pipeline (`REPOSITORY_STRUCTURE.md` §12).

## 20. GitHub Actions implementation and security contract

A scheduled/manual workflow can:

- run daily/weekly adapters;
- cache last fingerprints in the repo or workflow artifact/store;
- create/update the Evidence Watch branch for an unresolved change;
- create/update exactly one Draft Pull Request per actionable evidence change;
- create/update operational Issues for operational failures only;
- never require an inbound web service.

Use concurrency controls so overlapping watcher runs do not create duplicate branches, Pull Requests, or reports.

Security contract:

- declare explicit least-privilege `permissions`;
- grant only what is needed to read repository content, create/update Evidence Watch branches, create/update Draft Pull Requests, and optionally manage operational Issues;
- store AI provider credentials in GitHub Secrets or another approved secret store;
- never expose secrets in workflow logs, generated reports, Pull Request bodies, or committed files;
- never grant the Evidence Watch identity permission to bypass branch/ruleset review requirements.

Repository locations and cache/state ownership are defined in `REPOSITORY_STRUCTURE.md`. Generated impact indexes should reuse `source-claim-index`/`route-evidence-index` rather than build an unrelated mapping format.

## 21. Initial corpus review policy

The initial HowToBaby knowledge corpus may use an AI-first workflow so that the maintainer does not have to review every seed claim manually during construction:

```text
AI/Claude authors grounded canonical content
  → independent AI review
  → corrections
  → source-verified / ai-assisted state
```

This applies to building the initial corpus. It does not weaken the Evidence Watch review path defined above.

Constraints:

- metadata must represent the work honestly as `ai-assisted` (`EVIDENCE_PROVENANCE.md`, `GUIDANCE_CONTENT_CONTRACT.md` §14);
- AI must never claim human or clinical sign-off;
- before the public-v1 release gate, the shipped scope remains subject to the required maintainer source audit and every safety-critical review gate.

## 22. Noise and cost invariant

A scheduled run is not an AI run. AI MUST NOT run merely because the workflow ran.

```text
100 monitored sources
  ├─ 97 unchanged
  │    → no AI
  │    → no PR
  │
  ├─ 2 deterministic metadata-only changes
  │    → deterministic handling
  │    → normally no AI
  │
  └─ 1 actionable evidence change
       → impact analysis
       → Draft PR
       → AI Review Summary
       → human review
```

Deterministic monitoring stays the foundation; AI is spent only where it materially reduces review workload.

## 23. Model independence

The architecture MUST NOT depend on a hard-coded AI provider or model name. Provider, model, reasoning level, and related inference settings are deployment configuration.

Changing the reviewer model MUST NOT change:

- evidence authority;
- canonical data ownership;
- review-state semantics;
- human approval requirements;
- deployment gates.

## 24. Source/legal/operational rules

- respect robots.txt, site terms, licensing, rate limits, and authentication boundaries;
- never bypass paywalls or anti-bot controls;
- prefer official feeds/APIs over scraping;
- store only what is needed for monitoring/provenance;
- default to metadata + URL + source locator + fingerprints/hashes + temporary fetched cache;
- do not commit full third-party HTML/PDF/source snapshots to the public repository unless the applicable reuse rights and retention policy explicitly allow it;
- keep `evidence/cache/` gitignored by default;
- official syndication content is a distinct approved mode and must follow the source's attribution/reuse conditions;
- preserve attribution/source links;
- do not imply endorsement by an authority;
- treat source HTML/PDF as untrusted input, including anything a fetched document instructs a reviewer or model to do;
- rate-limit and cache aggressively.

## 25. Observability

Track:

- last successful check per source;
- consecutive failures;
- changed/unchanged counts;
- parser failures;
- open Evidence Watch Draft PRs and their age;
- AI Review Summary completed/unavailable/failed counts;
- sources overdue for review;
- claims currently blocked by changed/superseded sources;
- time from detected source change to reviewed release.

## 26. Evidence Watch v1 scope

**Evidence Watch v1** should do only:

1. registry + adapters;
2. fetch/fingerprint;
3. diff + deterministic actionable-change classification;
4. source-locator resolution/move detection where configured;
5. source→claim impact mapping through canonical provenance indexes;
6. deterministic structured review payload + Markdown rendering;
7. automatic idempotent Draft Pull Request per actionable evidence change, carrying the AI Review Summary when AI is available and an explicit unavailable/failed status when it is not;
8. GitHub Issues for operational failures only;
9. no automatic semantic rewriting of canonical content.

This provides most of the safety/maintenance benefit with much lower complexity than an AI-first crawler.

## 27. Later evolution

- adapter library per authority;
- PDF section extraction;
- automatic supersession clues;
- reviewer UI/dashboard;
- AI-generated canonical EN/VI patch drafting on an existing Evidence Watch review PR branch (still a draft, still without approval authority);
- translation-assisted update;
- controlled exact-data ingestion for recalls/alerts.

## Derived knowledge query store — v0.6.0

Evidence Watch SHOULD use the generated SQLite knowledge projection when it materially simplifies source→claim→route/tool impact queries. The SQLite file is a disposable read model built from canonical Git/YAML; watcher state or a future backend database must never become a second canonical knowledge store. A database-only content mutation is not a reviewed HowToBaby content change.


## Repository-health integration — v0.7.0

Evidence Watch may fetch large HTML/PDF/source bodies to ephemeral workspace/cache storage for parsing and diffing, but these bodies must not enter canonical Git history by default. Persistent Git state should remain compact metadata such as URLs, locators, timestamps, parser versions, ETag/Last-Modified values, fingerprints, classifications, and reviewed change records. CI repository-health checks must catch accidental cache/source-body commits. See `REPOSITORY_HEALTH.md`.

## Final invariant

> **Deterministic Evidence Watch detects and scopes the change.
> AI explains and assists.
> GitHub Draft PR carries the review.
> A human retains approval authority.
> Semantic medical changes never publish themselves.**
