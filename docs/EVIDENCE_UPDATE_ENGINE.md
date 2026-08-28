# EVIDENCE_UPDATE_ENGINE — HowToBaby

> Canonical design for monitoring authoritative sources, detecting meaningful changes, tracing impact to HowToBaby claims, and preparing safe updates. The engine is designed to work **without AI**; AI may be added only as an optional review assistant.

## 1. Goal

Replace the fragile workflow:

```text
maintainer remembers to revisit every source manually
```

with:

```text
registered source
  → scheduled check
  → deterministic change detection
  → impacted-claim mapping
  → review artifact
  → approved content change
  → validation/build/deploy
```

The engine's primary job is **change detection and impact analysis**, not autonomous medical authorship.

The engine monitors the same `SourceRecord` objects used by public provenance. Canonical source/claim relationship, locator, and public citation rules live in `EVIDENCE_PROVENANCE.md`; the watcher must not create a parallel source model.

## 2. Why AI is not required

Most update monitoring is deterministic:

- HTTP `ETag`/`Last-Modified` changes;
- RSS/Atom entry changes;
- API response changes;
- page metadata/date changes;
- normalized section hash changes;
- PDF checksum/text changes;
- source-title/status/supersession changes;
- dependency graph lookup from source IDs to claims.

AI becomes useful only after a meaningful diff exists: summarizing what changed, proposing affected claim edits, or assisting translation.

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
  → affected pages/tools listed in report
```

This is the core mechanism that makes the system maintainable without AI.

## 11. Review artifact

For every meaningful source change, generate a machine-readable report plus human-readable Markdown:

```text
source + canonical URL
previous metadata/status/fingerprint
new metadata/status/fingerprint
diff summary/sections
known claim locators that moved/changed
impacted claim IDs
impacted public routes
impacted tools
risk level
recommended next action
```

Optionally open a GitHub issue or PR containing the report.

## 12. Risk-based workflow

### Provenance state transition

A meaningful detected change may transition the monitored source to:

```text
current → changed-review-required
```

Dependent claims are flagged for review, but their existing approved provenance/history is preserved until review resolves the change. A detected change must not silently remove a citation or substitute a new source.

After review:

```text
source unchanged in meaning → current + refreshed verification
source meaning changed → revise affected claims + current
source superseded → superseded + replacement source mapping
```

Public UI may surface the simplified state `Reviewing an update` where appropriate.


### Low-risk metadata-only

Examples: URL moved, publication timestamp changed with no monitored-section difference.

May update source metadata automatically after validation.

### Content change with no approved deterministic mapping

Mark dependent claims `review-required`; do not rewrite canonical prose automatically.

### Structured exact-source data

If a source provides machine-readable structured data and HowToBaby merely mirrors a non-interpretive field under an approved rule, automatic draft updates may be allowed. Release still runs validation gates.

### Safety-critical / urgent / contraindication changes

Always require human review; clinician review when the content contract requires it.

## 13. Optional AI assist

AI may be inserted **after deterministic diff generation**:

```text
diff
  → optional AI summary
  → optional proposed claim edits
  → optional VI draft
  → human/source verification
```

Allowed uses:

- classify likely relevance;
- summarize a long diff;
- map changed sections to likely claim IDs;
- draft canonical English changes;
- draft Vietnamese translation;
- identify possible contradictions.

Not allowed:

- treating model output as source evidence;
- inventing a recommendation absent from source;
- automatically approving safety-critical changes;
- auto-publishing a semantic medical change solely because the model is confident.

## 14. Deployment workflow

Recommended initial workflow:

```text
scheduled watcher
  → report/issue/PR
  → maintainer reviews official source
  → edit canonical English
  → review status update
  → VI parity
  → CI validation
  → merge
  → static deployment
```

This is already highly automated even without AI.

## 15. GitHub Actions implementation option

A scheduled workflow can:

- run daily/weekly adapters;
- cache last fingerprints in the repo or workflow artifact/store;
- create/update a branch containing source metadata changes;
- open issues for semantic changes;
- never require an inbound web service.

Use concurrency controls so overlapping watcher runs do not create duplicate reports.

Repository locations and cache/state ownership are defined in `REPOSITORY_STRUCTURE.md`. Generated impact indexes should reuse `source-claim-index`/`route-evidence-index` rather than build an unrelated mapping format.

## 16. Source/legal/operational rules

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
- treat source HTML/PDF as untrusted input;
- rate-limit and cache aggressively.

## 17. Observability

Track:

- last successful check per source;
- consecutive failures;
- changed/unchanged counts;
- parser failures;
- sources overdue for review;
- claims currently blocked by changed/superseded sources;
- time from detected source change to reviewed release.

## 18. MVP for the engine

**Evidence Watch v1** should do only:

1. registry + adapters;
2. fetch/fingerprint;
3. diff;
4. source-locator resolution/move detection where configured;
5. source→claim impact mapping through canonical provenance indexes;
6. Markdown/JSON report;
7. GitHub issue/PR notification;
8. no automatic semantic rewriting.

This provides most of the safety/maintenance benefit with much lower complexity than an AI-first crawler.

## 19. Later evolution

- adapter library per authority;
- PDF section extraction;
- automatic supersession clues;
- optional AI semantic diff;
- reviewer UI/dashboard;
- auto-draft PRs;
- translation-assisted update;
- controlled exact-data ingestion for recalls/alerts.

## Derived knowledge query store — v0.6.0

Evidence Watch SHOULD use the generated SQLite knowledge projection when it materially simplifies source→claim→route/tool impact queries. The SQLite file is a disposable read model built from canonical Git/YAML; watcher state or a future backend database must never become a second canonical knowledge store. A database-only content mutation is not a reviewed HowToBaby content change.
