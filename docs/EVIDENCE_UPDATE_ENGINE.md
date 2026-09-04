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

### Classification boundary: URL change vs moved source

`SOURCE_MOVED` means the source's location actually changed. It is always an actionable evidence change (§11) and never a metadata-only outcome.

A URL difference that an explicitly approved deterministic rule proves is **identity-preserving** — canonical URL normalization, a stable protocol/host redirect, or a tracking-parameter difference — where the same monitored material resolves and source identity and provenance are unchanged, is classified as `METADATA_CHANGED`, not `SOURCE_MOVED`.

The rule runs one way only: a deterministic identity proof keeps a URL difference out of `SOURCE_MOVED`. Nothing may downgrade a `SOURCE_MOVED` result into a metadata-only outcome afterwards. Any doubt about source identity classifies as `SOURCE_MOVED`.

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
SourceRecord.status = changed-review-required
  + source→claim dependency mapping
  → dependent claims carry a derived review-required signal
  → affected pages/tools listed in the review payload
```

### What "review-required" means for a dependent claim

`review-required` here is a **derived review signal**, not a canonical field write. It is an unresolved review condition computed from `SourceRecord.status = changed-review-required` plus the source→claim dependency mapping — the same propagation `EVIDENCE_PROVENANCE.md` §16 already defines for validation and public surfaces. It says the claim's support is under review; it does not say the claim's own review state changed.

`Claim.reviewStatus` has no `review-required` value, and this contract does not introduce one.

> **Evidence Watch MUST NOT mutate `Claim.reviewStatus` merely because a source change was detected.**

Canonical `Claim.reviewStatus` is reviewed content state owned by `GUIDANCE_CONTENT_CONTRACT.md`. It changes only inside a reviewed canonical content change, through the existing content/review contract — in practice, in the reviewed result of the Draft PR path (§12, §17, §19), decided by a human. Evidence Watch on its own writes watcher state and the review artifact, and proposes the `SourceRecord` lifecycle transition in §13.

This is the core mechanism that makes the system maintainable without AI.

## 11. Actionable-change classification and outcome policy

Every check resolves into exactly one of four operational outcomes. The outcome is decided deterministically, before any AI call, and it decides what the workflow creates.

### State ownership: watcher operational state vs canonical Git state

Two different kinds of state are involved, and no outcome may blur them:

```text
watcher operational state
  → owned by Evidence Watch
  → ETag, Last-Modified, fingerprints, monitored-section hashes,
    check/fetch timestamps, normalized fetch metadata, parser version,
    adapter and cache state, last deterministic classification
  → may be updated automatically by a watcher run
  → not canonical product knowledge and never a public evidence statement

canonical Git knowledge/provenance state
  → owned by the canonical content/review contract
  → `SourceRecord` and every other canonical authored file
  → changes only through the reviewed merge path (§19)
  → Evidence Watch never writes it directly to `main`
```

Storage for watcher operational state is defined in `REPOSITORY_STRUCTURE.md` §9. Every outcome below may refresh that state; none of them may read that permission as permission to edit canonical authored files.

### `UNCHANGED`

- update watcher operational state as needed;
- do not call AI;
- do not create a Pull Request;
- do not create an Issue;
- produce no maintainer-facing noise.

### Deterministic metadata-only change

A `METADATA_CHANGED` result that an explicitly approved deterministic rule proves does not affect monitored content, medical meaning, or provenance — for example an irrelevant publication timestamp with no monitored-section difference, or an identity-preserving URL normalization/redirect that satisfies the deterministic rule in §9.

- handle deterministically;
- do not call AI;
- do not create a Draft Pull Request;
- do not create an Issue;
- watcher operational state may update automatically;
- MUST NOT automatically write canonical `SourceRecord` metadata — or any other canonical authored file — to `main`;
- must never alter medical meaning;
- must never absorb a `SOURCE_MOVED` result.

Any unresolved doubt promotes the change to actionable.

When a metadata-only detection shows that a canonical `SourceRecord` itself genuinely needs to change:

```text
non-material canonical metadata change
  → recorded in watcher operational state and observability output
  → left for a maintainer to apply in a later normal reviewed Pull Request

material provenance, freshness, or source-identity change
  → no longer metadata-only
  → promoted to an actionable evidence change
  → Draft Pull Request
```

Phase 9 v1 introduces no auto-merge metadata Pull Request mechanism, and no other automated write path into `main`. A deterministic rule can keep a detection out of the actionable class; it can never grant the watcher canonical write authority.

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

`SOURCE_MOVED` is always actionable, whatever the monitored-section diff shows. A real location change can also mean re-publication, replacement, retirement, or a locator that no longer resolves, and only human review settles which. It is never handled as a deterministic metadata-only change (§9, §13).

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

GitHub Issues are reserved for operational failures only. No other outcome creates one: `UNCHANGED` and deterministic metadata-only results create no Issue, and an actionable evidence change is carried by the Draft Pull Request, never by an Issue.

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

Like any other canonical change, that transition is proposed on the Evidence Watch branch and carried by the Draft Pull Request; it reaches `main` only through the review path (§12, §19, §20).

Dependent claims are flagged by the derived review signal defined in §10 — Evidence Watch does not write `Claim.reviewStatus`. Their existing approved provenance/history is preserved until review resolves the change. A detected change must never silently remove a citation, replace a source, or invalidate prior provenance.

After review:

```text
source unchanged in meaning → current + refreshed verification
source meaning changed → revise affected claims + current
source superseded → superseded + replacement source mapping
```

### Pending review vs public production state

```text
Evidence Watch detects an actionable change
  → the Draft Pull Request becomes the canonical maintainer-facing pending-review signal
  → production canonical state does not change before the reviewed merge
```

`changed-review-required` is a canonical source lifecycle state that can exist in reviewed canonical history; it stays in `SourceStatus` (`EVIDENCE_PROVENANCE.md` §2) and Evidence Watch may propose the transition into it on the review branch. What Phase 9 v1 fixes is *where an unresolved change is visible before that proposal is reviewed*:

- the Draft Pull Request is the immediate review surface, and the only pending-review signal Phase 9 v1 requires;
- Phase 9 v1 does NOT require the public production site to reflect pending watcher state before the Pull Request is merged;
- public UI must not promise a real-time `Reviewing an update` merely because a watcher run detected a change. That public state renders from deployed canonical content, so it appears only after the corresponding lifecycle state reached production through the reviewed merge path (`EVIDENCE_PROVENANCE.md` §14);
- publishing pending operational freshness state to the public site before canonical merge would be a separate capability needing its own contract and publication path. It is not part of Phase 9 v1, and Evidence Watch has no side channel for it.

### Low-risk metadata-only

Examples: publication timestamp changed with no monitored-section difference; an identity-preserving canonical URL normalization or redirect that satisfies the deterministic rule in §9, with no monitored-section difference.

Watcher operational state may refresh automatically under the deterministic rule described in §11. Canonical `SourceRecord` metadata is not written automatically: where the canonical record itself needs correcting, a maintainer applies it in a normal reviewed Pull Request, and anything material to provenance, freshness, or source identity is promoted to an actionable evidence change instead.

`SOURCE_MOVED` is not part of this category. A moved source is always an actionable evidence change and always travels the Draft PR review path (§9, §11).

### Content change with no approved deterministic mapping

Raise the derived review-required signal on dependent claims (§10); do not rewrite canonical prose automatically and do not write `Claim.reviewStatus`.

### Structured exact-source data

If a source provides machine-readable structured data and HowToBaby merely mirrors a non-interpretive field under an approved rule, the watcher may prepare that update automatically **as a draft on the review branch**. It is never written directly to `main`: the change still travels the Draft PR review path, and release still runs validation gates.

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

The contract is a discriminated union on `status`. A semantic assessment exists only when AI actually completed a review.

Conceptually:

```ts
type EvidenceAIReview =
  | {
      schemaVersion: string;
      status: "completed";

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
  | {
      schemaVersion: string;
      status: "unavailable" | "failed";
      reason?: string;
    };
```

Only the `completed` variant carries `semanticAssessment`, `summary`, and the optional review fields. The `unavailable`/`failed` variant carries nothing beyond `schemaVersion`, `status`, and an optional operational `reason` — a short factual explanation such as a timeout, exhausted quota, a missing credential, or a schema-validation failure. `reason` is never a statement about the source change.

Evidence Watch MUST NOT synthesize `semanticAssessment`, `summary`, or any other review field when AI is unavailable or failed. A placeholder `uncertain` assessment or a generated stand-in summary would be indistinguishable from a real AI review and would misrepresent what was actually reviewed. The absence of a semantic assessment is itself the accurate signal.

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

together with the optional `reason`, and enough deterministic evidence for a maintainer to perform the review manually.

AI status changes only the Review Summary section. Every deterministic field required by §12 is rendered in full for `unavailable` and `failed` exactly as for `completed`; the deterministic renderer must not degrade, abbreviate, or omit the evidence payload because AI produced nothing.

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

Merge to `main`, not Evidence Watch itself, is the event that may enter the normal deployment pipeline (`REPOSITORY_STRUCTURE.md` §12). Because production deploys on push to `main`, `main` must be protected so that this reviewed merge is the only way an evidence change can reach it (§20).

Until that merge, the Draft Pull Request — not the public site — is where an unresolved evidence change is visible (§13). Public provenance state, including every source freshness label, changes only as a consequence of merged canonical content passing through this pipeline.

## 20. GitHub Actions implementation and security contract

A scheduled/manual workflow can:

- run daily/weekly adapters;
- persist watcher operational state (last fingerprints, check metadata) in a workflow artifact/state store, on the Evidence Watch branch, or in a non-canonical repository location the `main` ruleset actually permits that identity to write — never mixed into canonical authored files;
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

### Branch protection and ruleset requirement

The production pipeline deploys on push to `main` (`REPOSITORY_STRUCTURE.md` §12). Workflow `permissions` alone cannot constrain what an identity may do outside that workflow, so repository-level enforcement is required, not optional hardening.

Phase 9 MUST configure a GitHub Ruleset, branch protection, or equivalent enforcement on `main` such that the Evidence Watch identity:

- cannot push semantic evidence changes directly to `main`;
- cannot bypass the Draft Pull Request review path;
- cannot bypass required approvals or required status checks;
- cannot self-approve its own evidence Pull Request, force-push to `main`, or delete the protected branch;
- cannot write canonical `SourceRecord` metadata or any other canonical authored file to `main` outside that reviewed path, including for a deterministic metadata-only result (§11).

Only a merge into `main` after the required review may enter the production pipeline (§19).

This enforcement is a Phase 9 deliverable and part of the Phase 9 gate (`IMPLEMENTATION_ROADMAP.md`). Evidence Watch MUST NOT be enabled against real sources on a repository where `main` still accepts unreviewed pushes.

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
  │    → no AI
  │    → no canonical write to `main`
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
- deterministic metadata-only results, including any that suggest a canonical `SourceRecord` correction a maintainer still has to apply in a normal reviewed Pull Request (§11);
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
9. no automatic semantic rewriting of canonical content, and no automatic canonical write into `main` for any outcome — watcher runs persist operational state and the review artifact only;
10. no requirement that the public production site reflect pending watcher state before the reviewed merge.

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

Three states, never interchangeable:

```text
1. watcher operational state
   → auto-updatable by Evidence Watch
   → not canonical product knowledge

2. pending Evidence Watch review
   → represented by the Draft Pull Request
   → not production state

3. canonical production provenance
   → reviewed Git/YAML state
   → changes only through reviewed merge + the existing deployment pipeline
```

> **Deterministic Evidence Watch detects and scopes the change.
> AI explains and assists.
> GitHub Draft PR carries the review.
> A human retains approval authority.
> Semantic medical changes never publish themselves.**
