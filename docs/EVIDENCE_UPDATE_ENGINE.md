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
  canonicalizationProfileVersion?: string;
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
  → resolve the configured source locators
  → canonicalize monitored material when it is available
  → fingerprint when material is available
  → build the complete SourceObservation
  → compare the observed sourceObservationDigest against acceptedObservation
  → compare comparisonDigest against comparisonBaseline for content/section diff
  → classify deterministically
  → persist CheckResult / operational state according to §21
```

Use conditional requests (`If-None-Match`, `If-Modified-Since`) where supported.

Nothing in this pipeline compares "the previous fingerprint". Every comparison names a stored baseline: the observed `sourceObservationDigest` against the source's `acceptedObservation`, and — for content and section material only — the observed `comparisonDigest` against the named `comparisonBaseline` (§8, §21).

A failed fetch is not a source condition. `availability = "confirmed-missing"` is only ever the deterministic absence result defined in §9; transport, TLS, authentication, rate-limit and parser failures stay operational failures (§11).

### Fetch security contract

Evidence Watch is a network fetcher running with repository credentials, so its fetch layer has a fixed minimum safety contract:

- fetch only the `http` and `https` schemes, and prefer HTTPS wherever the source offers it;
- reject `file:`, `data:`, `ftp:` and every other scheme;
- block loopback, link-local, private and otherwise reserved network destinations unless a future explicit contract authorizes a specific one;
- validate every redirect target against the same policy as the original URL, and bound the redirect chain;
- bound the response size, and give every request a timeout;
- validate the adapter's expected content type where that is practical for its channel;
- never replay credentials or authorization headers to a redirect target on an unapproved host;
- keep every credential in the secret or ephemeral request context: no credential-bearing or signed request URL, and no other secret, may reach persisted observation/review state, a digest input, a Pull Request body, an AI prompt or the workflow logs (§8);
- a normal scheduled fetch uses the canonical reviewed monitor configuration only;
- a proposed URL or monitor configuration that exists only on an Evidence Watch review branch MAY be fetched by the freshness and review-integrity checks (§21), but only after passing exactly the same URL and network-safety validation.

Phase 9 tests cover redirect handling, private-network rejection, and the response-size/timeout limits (`IMPLEMENTATION_ROADMAP.md`).

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

  comparisonDigest: string;
}
```

For copyrighted/restricted sources, hashes + metadata + locators may be preferable to storing large source snapshots.

### Comparison identity

A fingerprint carries both observation metadata and the material being compared, so equality needs one explicit definition. `comparisonDigest` is that definition — for the monitored material, and for nothing else:

```text
comparisonDigest is the only identity used for equality of normalized
monitored material.

It is NOT the identity of the complete observed source condition.
```

It therefore continues to decide, and only decides:

```text
content/material equality
section/content comparison
content-side cumulative diff
```

Phase 9 also has actionable conditions that do not necessarily change the monitored material, and some that produce no `SourceFingerprint` at all — `SOURCE_MISSING`, `SOURCE_MOVED`, a locator that stops resolving. `comparisonDigest` on its own MUST NOT decide any of:

```text
SOURCE_MISSING
SOURCE_MOVED
SOURCE_RETURNED
locator-resolution state
review freshness
REVIEW_REVERTED_TO_BASELINE
AI attempt identity
whether an open review needs a new review generation
```

Each of those is decided on the complete source-side observation identity defined later in this section.

`comparisonDigest` MUST:

- be deterministic;
- be computed from the normalized compare-relevant material selected by the adapter and the monitor's `compareMode` (§4, §7);
- exclude `checkedAt`, fetch timestamps, retry metadata, workflow run identifiers, AI state, and Git state;
- stay identical when the watcher re-runs against the same monitored material;
- use the same canonicalization, monitor configuration and parser semantics for the baseline, the observed fingerprint, and the pre-merge freshness check (§21).

`checkedAt` is an observation timestamp and never participates in equality. `ETag`/`Last-Modified` are fetch and change signals; they enter the comparison identity only where an explicitly approved adapter/compare rule says so, and by default they never move a semantic/content digest on their own.

### Frozen digest algorithm — `sha256-v1`

Phase 9 v1 does not leave the hash algorithm or the serialization to the implementation. Both are fixed here.

```text
comparisonDigestVersion = "sha256-v1"
```

`comparisonDigest` has the format:

```text
sha256-v1:<lowercase-hex-sha256>
```

The hashed input is the UTF-8 canonical JSON of:

```text
{
  digestVersion: "1",
  sourceId,
  monitorConfigHash,
  parserVersion,
  material: normalizedComparePayload
}
```

`material` is the normalized compare-relevant payload the adapter produced for the monitor's `compareMode` (§4, §7).

**Canonical JSON v1** is the single serialization every digest in this contract uses — `comparisonDigest`, `monitorConfigHash`, `sourceObservationDigest` and `reviewPayloadDigest` — and it leaves no significant serialization choice to the implementation:

- object keys are sorted lexicographically;
- no insignificant whitespace;
- an absent optional field is **omitted**, never serialized as `null`;
- `undefined` is never a valid value anywhere in a hashed payload;
- `null` appears only where the schema or input contract requires an explicit null;
- arrays that carry a real semantic order keep that semantic order;
- set-like arrays of stable identifiers are sorted lexicographically **before** serialization, so serialization never has to invent an order;
- impacted `claimIds`, `guidanceIds`, routes, tools, locator keys, changed-section keys and every other set-like review list therefore have a deterministic order;
- no timestamps, workflow run identifiers, AI state, or Git SHAs anywhere in `material`;
- the same logical payload MUST always produce the identical byte sequence.

`reviewPayloadDigest` (§12) uses these same ordering rules.

The hash is SHA-256, rendered as lowercase hex.

Operational state records the version the digest was produced with:

```ts
comparisonDigestVersion: "sha256-v1";
```

Changing the digest algorithm or version changes how HowToBaby measures the source; it never means the source changed:

```text
comparisonDigestVersion mismatch
→ REBASELINE_REQUIRED
```

Such a mismatch is never classified as `CONTENT_CHANGED`, `METADATA_CHANGED` or any other diff result (§21). `parserVersion` versions adapter/parser semantics only. It MUST NOT be relied on to implicitly version the digest algorithm, and the two are recorded and compared separately.

### `monitorConfigHash`

`monitorConfigHash` is a deterministic SHA-256 over the same canonical JSON v1 encoding, covering only the monitor configuration that can affect what is fetched, how it is normalized, or which source identity is being monitored:

```text
{
  sourceId,
  adapter,
  url,
  selector,
  includePatterns,
  excludePatterns,
  canonicalizationProfile,
  canonicalizationProfileVersion,
  compareMode
}
```

Scheduling-only and retention-only properties are deliberately excluded, because changing them does not change the bytes being compared:

```text
interval
licenseMode
```

They enter the hash only if a later contract makes them materially affect the fetched or compared material.

A change in any of:

```text
monitorConfigHash
parserVersion
comparisonDigestVersion
sourceObservationDigestVersion
```

that makes the stored baselines and a newly observed source condition non-comparable produces `REBASELINE_REQUIRED` (§21) — never a fabricated evidence diff.

### Source observation identity — `SourceObservation`

`comparisonDigest` identifies the monitored material. Phase 9 v1 also needs one deterministic identity for the **complete source-side condition** a run observed, because an actionable evidence change does not always change that material — and sometimes there is no material to hash at all.

`SourceObservation` is that compact deterministic record:

```ts
type SourceAvailability =
  | "available"
  | "confirmed-missing";

type LocatorObservationStatus =
  | "resolved"
  | "moved"
  | "missing";

/** Derived operational locator identity — see "Locator identity" below. */
type LocatorKey = string;

interface SourceObservation {
  schemaVersion: "1";
  sourceId: string;

  observedAt: string; // observation metadata only

  availability: SourceAvailability;

  normalizedEffectiveUrl?: string;

  fingerprint?: SourceFingerprint; // present only when material is available

  locatorSetDigest: string;

  locatorStates: Record<LocatorKey, {
    status: LocatorObservationStatus;
    resolvedLocatorDigest?: string;
  }>;

  classificationSignals: JsonValue;

  sourceObservationDigest: string;
}
```

Semantics:

- `observedAt` is observation metadata and never participates in equality;
- `fingerprint` carries the current `comparisonDigest` whenever the source material could be fetched and canonicalized, and is **absent** otherwise;
- `availability = "confirmed-missing"` needs no fabricated `SourceFingerprint` and no fabricated `comparisonDigest`;
- `normalizedEffectiveUrl` is produced by the approved URL-identity normalization of §9 — the same rule that decides whether a URL difference is identity-preserving — and must be public-safe (below);
- `locatorSetDigest` identifies **which** locators HowToBaby currently monitors for this source (below);
- `locatorStates` is keyed by the derived operational `locatorKey` defined below — never by array position, and never by a canonical identifier that does not exist;
- `classificationSignals` carries only bounded, deterministic, adapter-specific facts the classifier actually consumes. It never carries a fetched source body, a long third-party excerpt, any AI output (§21), or any secret (below).

> **Every source-side fact used to produce an evidence-change classification MUST be represented in `SourceObservation`, and therefore in `sourceObservationDigest`.**

A classifier may not depend on a source-side fact that the freshness check and the revert logic cannot reproduce from the observation. If a signal matters enough to change a classification, it belongs in the observation.

### Locator identity: the derived `locatorKey`

Canonical `SourceLocator` records carry **no identifier**. The canonical schema is `heading?`, `section?`, `anchor?`, `page?`, `table?`, `figure?`, `paragraphHint?`, `sourceVersionHint?` (`EVIDENCE_PROVENANCE.md` §3), and Phase 9 does not add one — canonical authored knowledge gains no field for the watcher's convenience. Evidence Watch therefore derives a deterministic **operational** key:

```text
locatorKey = locator-v1:<lowercase-hex-sha256>
```

hashed over the canonical JSON v1 of:

```text
{
  sourceId,
  heading,
  section,
  anchor,
  page,
  table,
  figure,
  sourceVersionHint
}
```

Rules:

- absent optional locator fields are omitted, exactly as canonical JSON v1 requires;
- `paragraphHint` does **not** participate. It is concise paraphrased context (`EVIDENCE_PROVENANCE.md` §3), so editing it must never look like a locator change;
- `supportNoteKey` does **not** participate. It belongs to `ClaimSourceRef`, not to the structural locator;
- two claims referencing exactly the same structural locator of the same source share one `locatorKey`, and the watcher resolves that locator once;
- a `locatorKey` is an operational derived identity: never written into canonical authored files, never citable as provenance, and never a canonical `SourceLocator` field.

### Locator monitoring scope: `locatorSetDigest`

Which locators HowToBaby monitors for a source is itself a fact that changes — through a reviewed canonical Pull Request that adds, removes or edits a `ClaimSourceRef.locator`. That scope needs its own deterministic identity, so a canonical edit is never mistaken for an upstream source change (§9):

```text
locatorSetDigest = sha256-v1:<lowercase-hex-sha256>
```

hashed over the canonical JSON v1 of the sorted, de-duplicated list of `locatorKey` values the canonical claim graph currently maps to this `sourceId`.

`SourceObservation` carries `locatorSetDigest`, and `sourceObservationDigest` binds it. An observation therefore records both *what the source looked like* and *what HowToBaby was looking at*.

### Frozen source-observation digest — `sha256-v1`

`sourceObservationDigest` uses the same canonical JSON v1 and SHA-256 discipline as `comparisonDigest`, domain-separated so the two can never be confused:

```text
sourceObservationDigestVersion = "sha256-v1"
```

Format:

```text
sha256-v1:<lowercase-hex-sha256>
```

The hashed input is the UTF-8 canonical JSON v1 of:

```text
{
  digestType: "source-observation-v1",
  sourceId,
  monitorConfigHash,
  parserVersion,
  comparisonDigestVersion,

  availability,
  normalizedEffectiveUrl: <string-or-null>,
  comparisonDigest: <string-or-null>,

  locatorSetDigest,
  locatorStates,
  classificationSignals
}
```

`normalizedEffectiveUrl` and `comparisonDigest` are the two positions where canonical JSON v1 requires an **explicit null** instead of an omitted field: "no resolvable effective URL" and "no comparable material" are observed conditions, not missing data.

Never hashed:

```text
observedAt
checkedAt
retry state
workflow/run identifiers
AI state
Git SHA
fetch timing
```

`classificationSignals`, `locatorSetDigest` and `locatorStates` MUST be deterministic. A signal that differs between two runs against the same source condition and the same monitored locator set does not belong in any of them.

Changing the observation digest version changes how HowToBaby measures the source condition; it never means the source changed:

```text
sourceObservationDigestVersion mismatch
→ REBASELINE_REQUIRED
```

never an evidence diff.

### Public-safe observation state

The HowToBaby repository is public and `evidence-watch/state` is a readable branch on it, so everything an observation persists is public-facing:

```text
normalizedEffectiveUrl persisted in SourceObservation
MUST be a public-safe identity URL.
```

None of the following may ever be persisted into observation or review state, hashed into any digest, rendered into a Pull Request body or report, sent to an AI provider, or written to workflow logs:

```text
URL userinfo (user:password@)
Authorization headers or other credential material
cookies
signed download tokens
session identifiers
secret query parameters
temporary credential-bearing URLs
```

Where policy permits an authenticated fetch (§6, §25), the credential stays in the secret or ephemeral request context. If the effective request URL carries sensitive query data, the adapter derives a sanitized public-safe identity URL **before** the observation is built, and the secret-bearing request URL itself never enters state, the review payload, the AI prompt or the logs. `classificationSignals` is bound by the same rule and MUST NOT carry secrets. The direct official-source links a Draft Pull Request renders for verification (§12) are safe canonical/public links, never authenticated or signed request URLs.

### Which digest decides what

No comparison ever compares serialized `SourceFingerprint` or `SourceObservation` objects. Every comparison names the digest it uses:

```text
content/section diff               → comparisonDigest
cumulative content diff identity   → comparisonDigest

UNCHANGED classification           → sourceObservationDigest
deterministic classification       → sourceObservationDigest
AI attempt identity                → sourceObservationDigest
new review generation / head bump  → sourceObservationDigest
pre-merge freshness gate           → sourceObservationDigest
REVIEW_REVERTED_TO_BASELINE        → sourceObservationDigest
baseline advancement               → both, under the rules in §21
```

An observation on its own also says nothing until it is compared against a named baseline. Every source therefore keeps three distinct stored facts — the `acceptedObservation` (the complete accepted source-side condition), the `comparisonBaseline` (the last accepted **available** monitored material), and the `lastObservedObservation` it most recently observed. They are never automatically equated, and this contract never says "previous fingerprint". The state schema, its store, and every rule that moves either baseline are defined in §21.

## 9. Diff classification

Deterministic categories:

```text
UNCHANGED
METADATA_CHANGED
CONTENT_CHANGED
SOURCE_MOVED
SOURCE_MISSING
SOURCE_RETURNED
NEW_EDITION_OR_POLICY
POSSIBLE_SUPERSESSION
FETCH_ERROR
PARSER_ERROR
```

Plus the operational conditions that are not diff results at all:

```text
BOOTSTRAP_REQUIRED
STATE_MISSING
STATE_CORRUPT
STATE_SYNC_ERROR
STATE_SCHEMA_MIGRATION_REQUIRED
REBASELINE_REQUIRED
REVIEW_ARTIFACT_MISSING
REVIEW_STATE_MISMATCH
REVIEW_BRANCH_CONFLICT
REVIEW_CLOSED_UNMERGED
```

Two further conditions are in neither list, and neither is a statement about source content:

- `REVIEW_REVERTED_TO_BASELINE` is a deterministic **review resolution** condition for an open review whose upstream returned to the accepted observation, not an operational failure and not a diff result (§21);
- `REVIEW_RESOLUTION_INCOMPLETE` is a **review-gate** condition: the evidence event carried by an Evidence Watch review Pull Request has not reached a terminal reviewed canonical result, so the merge is blocked and the baseline does not advance (§19, §21).

A content change is not automatically a recommendation change.

Each category resolves deterministically into exactly one operational outcome (§11), which decides what the workflow creates. A source whose state is missing, corrupt or no longer comparable is not classified as a diff result at all (§21).

### Classification boundary: URL change vs moved source

`SOURCE_MOVED` means the source's location actually changed. It is always an actionable evidence change (§11) and never a metadata-only outcome.

A URL difference that an explicitly approved deterministic rule proves is **identity-preserving** — canonical URL normalization, a stable protocol/host redirect, or a tracking-parameter difference — where the same monitored material resolves and source identity and provenance are unchanged, is classified as `METADATA_CHANGED`, not `SOURCE_MOVED`.

The rule runs one way only: a deterministic identity proof keeps a URL difference out of `SOURCE_MOVED`. Nothing may downgrade a `SOURCE_MOVED` result into a metadata-only outcome afterwards. Any doubt about source identity classifies as `SOURCE_MOVED`.

A real location change is decided on observation identity, never on content bytes:

```text
same content bytes
old effective URL → new real source location
→ sourceObservationDigest changes
→ SOURCE_MOVED
```

Identical monitored material never proves a source did not move. The only thing that keeps a URL difference out of `SOURCE_MOVED` is the identity-preserving normalization rule above, applied to `normalizedEffectiveUrl` (§8).

### Locator resolution is part of the source condition

A configured `SourceLocator` that stops resolving, or resolves somewhere else, is a source-side fact recorded in `SourceObservation.locatorStates` (§8). It therefore changes `sourceObservationDigest` even when the content digest is identical:

```text
locator resolved → locator missing
locator resolved → locator moved
→ sourceObservationDigest changes
→ material SourceLocator resolution failure
→ actionable evidence change (§11)
```

A locator failure is never absorbed into a metadata-only outcome because the monitored page hash happened not to move.

### Canonical locator scope change is not an upstream change

`locatorSetDigest` (§8) can also change because a reviewed canonical Pull Request added, removed or edited a `ClaimSourceRef.locator`: HowToBaby changed what it monitors, upstream changed nothing. Before normal source classification, a run therefore separates

```text
source condition changed
```

from

```text
canonical locator monitoring scope changed
```

When the scope changed and everything still resolves:

```text
canonical locator set changed
+ every newly monitored locator resolves
+ every still-monitored locator retains a valid state
→ deterministic monitoring-scope sync
→ no AI
→ no evidence Pull Request
→ no Issue
→ acceptedObservation MAY advance operationally
```

That travels the existing deterministic metadata-only path (§11, §21); it creates no new evidence category.

When it does not all resolve:

```text
a newly monitored locator fails to resolve
OR a still-monitored locator went resolved → missing/moved
→ actionable locator-resolution change
→ the normal Draft Pull Request path (§11, §12)
```

A locator that a reviewed canonical edit **removed** from the claim graph is out of monitoring scope from that moment. Its disappearance from `locatorStates` is a scope change and is never read as an upstream source change.

### Deterministic source absence: `SOURCE_MISSING`

`SOURCE_MISSING` MUST NOT require a fabricated content digest. It is classified only when the adapter confirms **deterministic source absence** under policy — for example a stable authoritative `404`/`410` after the applicable redirect and retry handling of the fetch contract (§6).

These remain operational failures and are never `SOURCE_MISSING`:

```text
timeout
DNS failure
TLS failure
403 / authentication failure
429
5xx
parser failure
```

A missing observation has the shape:

```text
availability     = confirmed-missing
fingerprint      = absent
comparisonDigest = null inside the observation digest input
```

and still carries a valid `sourceObservationDigest`. The Draft Pull Request, the pre-merge freshness check and the post-merge finalizer all operate normally on it (§12, §19, §21).

### `SOURCE_RETURNED`

When the accepted state is a confirmed absence and the source becomes available again:

```text
acceptedObservation.availability = confirmed-missing
current observation.availability = available
→ SOURCE_RETURNED
```

`SOURCE_RETURNED` is an **actionable** evidence change (§11). The canonical source may have been accepted as `temporarily-unreachable`, `retired` or `superseded`, and dependent claims may have been adjusted in the review that accepted the absence, so a URL that starts answering again is never automatically `UNCHANGED`.

Where the previous `comparisonBaseline` still exists, the review payload uses it to tell the maintainer whether the returned material differs from the last accepted available material (§21).

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

Watcher operational state is persisted on the dedicated non-canonical `evidence-watch/state` branch, in `evidence/state/manifest.json` and `evidence/state/sources/<sourceId>.json`; that branch is never merged into `main` and never deploys (§21, `REPOSITORY_STRUCTURE.md` §9). Every outcome below may refresh that state; none of them may read that permission as permission to edit canonical authored files.

### `UNCHANGED`

- update check timestamps and other watcher operational state as needed;
- leave `acceptedObservation` and `comparisonBaseline` unchanged as meaning baselines (§21);
- do not call AI;
- do not create a Pull Request;
- do not create an Issue;
- produce no maintainer-facing noise.

### Deterministic metadata-only change

A `METADATA_CHANGED` result that an explicitly approved deterministic rule proves does not affect monitored content, medical meaning, or provenance — for example an irrelevant publication timestamp with no monitored-section difference, an identity-preserving URL normalization/redirect that satisfies the deterministic rule in §9, or a canonical locator monitoring-scope change in which every monitored locator still resolves (§9).

- handle deterministically;
- do not call AI;
- do not create a Draft Pull Request;
- do not create an Issue;
- watcher operational state may update automatically, and `acceptedObservation` MAY advance operationally with `authority = deterministic-metadata` so the same event does not repeat every run; where the comparison material also changed and the approved rule still proves the change non-actionable, `comparisonBaseline` MAY advance with it (§21);
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
SOURCE_RETURNED
NEW_EDITION_OR_POLICY
POSSIBLE_SUPERSESSION
material SourceLocator resolution failure
material provenance change
```

`SOURCE_MOVED` is always actionable, whatever the monitored-section diff shows. A real location change can also mean re-publication, replacement, retirement, or a locator that no longer resolves, and only human review settles which. It is never handled as a deterministic metadata-only change (§9, §13).

An actionable evidence change MUST:

- create or update **exactly one** Draft Pull Request representing that unresolved change (§12);
- keep **both** `acceptedObservation` and `comparisonBaseline` fixed while updating `lastObservedObservation` and `pendingReview` (§21) — detecting, classifying or reporting an actionable change never advances either baseline;
- move the monitored source and its dependent claims into the unresolved review-required state (§13);
- preserve prior provenance, citations, and review history until a human resolves the change.

A GitHub Issue is never a substitute for the evidence-review Draft Pull Request.

### Operational failure

Includes:

```text
BOOTSTRAP_REQUIRED
FETCH_ERROR
PARSER_ERROR
STATE_MISSING
STATE_CORRUPT
STATE_SYNC_ERROR
STATE_SCHEMA_MIGRATION_REQUIRED
REBASELINE_REQUIRED
REVIEW_ARTIFACT_MISSING
REVIEW_STATE_MISMATCH
REVIEW_BRANCH_CONFLICT
REVIEW_CLOSED_UNMERGED
authentication/access failure
persistent adapter failure
```

Operational failures do not represent evidence changes. They MAY fail the workflow and/or create/update a GitHub Issue according to the retry/escalation policy. None of them advances `acceptedObservation` or `comparisonBaseline`, establishes a baseline automatically, or reports the source as `UNCHANGED` (§21).

GitHub Issues are reserved for operational failures only. No other outcome creates one: `UNCHANGED` and deterministic metadata-only results create no Issue, and an actionable evidence change is carried by the Draft Pull Request, never by an Issue.

`REVIEW_RESOLUTION_INCOMPLETE` is deliberately not in this class either. It is a merge-blocking review-gate condition on an existing Evidence Watch review Pull Request, not a watcher defect and not a source content classification (§19, §21).

`BOOTSTRAP_REQUIRED` is the exception inside this class: it is an expected initialization condition for a monitor that has never been initialized, not a defect. It appears in the workflow summary and observability output and does not automatically create an Issue (§21).

They MUST NOT create an evidence-change Pull Request unless an actual evidence/provenance change has also been determined. A transport or parser failure must be distinguished deterministically from a genuine `SOURCE_MISSING`/`SOURCE_MOVED` result before an outcome is chosen.

## 12. Draft Pull Request contract

Every actionable evidence change produces a Draft Pull Request. The Draft PR is the canonical human review surface for that change; the machine-readable report (JSON) and its deterministically rendered Markdown are the payload it carries.

The Draft Pull Request MUST contain:

- source ID and source title;
- canonical official-source URL;
- deterministic change classification;
- the accepted source observation and the latest observed source observation, each identified by its `sourceObservationDigest` (§8), with the source-condition facts that differ;
- the `comparisonBaseline` fingerprint and the latest observed fingerprint where material is available, each identified by its `comparisonDigest` (§8), with the metadata that differs;
- deterministic diff summary, together with its diff basis (`diffEvidence`, below);
- changed sections, locator states, availability and effective location;
- impacted claim IDs;
- impacted guidance blocks;
- impacted public routes;
- impacted Tools;
- deterministic policy risk;
- current source/review state;
- recommended review action;
- direct official-source links needed for verification — safe canonical/public links only, never an authenticated or signed request URL (§8);
- the AI Review Summary, or an explicit AI-unavailable/AI-failed status (§16).

The Pull Request SHOULD use stable labels such as:

```text
evidence-watch
review-required
risk-low | risk-medium | risk-high | risk-critical
```

Phase 9 v1's unresolved review unit is the `sourceId`. Multiple upstream revisions observed before the review resolves are folded into the same open Evidence Watch review Pull Request rather than split across several (§21).

### Review payload identity

The deterministic payload a review Pull Request carries is itself identified, so a merge can prove it merged what was actually reviewed:

```ts
reviewBaseSha: string;
reviewPayloadDigest: string;
```

`reviewBaseSha` is the `main` commit the review payload was computed against. `reviewPayloadDigest` is a SHA-256 over the canonical JSON v1 encoding (§8) of at minimum:

```text
sourceId
reviewBaseSha

baselineSourceObservationDigest
latestObservedSourceObservationDigest

baselineComparisonDigest          (when available)
latestObservedComparisonDigest    (when available)

deterministic classification
changed locator/source-condition facts
changed sections/content facts    (when available)

impacted claim IDs
impacted guidance IDs
impacted routes/tools

deterministic policy risk
diffEvidence

monitorConfigHash
locatorSetDigest
parserVersion
comparisonDigestVersion
sourceObservationDigestVersion
```

Every set-like list in that payload — impacted claim IDs, guidance IDs, routes, tools, locator keys, changed-section keys — is deterministically sorted before serialization under the canonical JSON v1 ordering rules (§8).

It deliberately excludes anything that is not the deterministic review substance:

```text
AI Review Summary
checkedAt / fetch timestamps
workflow run identifiers
cosmetic Markdown rendering
```

A **required deterministic review-integrity status check**, bound to the exact Pull Request head SHA, verifies:

```text
PR head SHA                      == pendingReview.reviewHeadSha
PR is current with the required `main` base
recomputed deterministic payload == reviewPayloadDigest
latest source review identity    == pendingReview.latestObservedSourceObservationDigest
```

That check is separate from the other two required checks (§19, §21): review-integrity proves the review artifact still describes this head against current `main`, source freshness proves upstream has not moved past the reviewed source observation, and review-resolution proves the reviewed canonical result is terminal for this evidence event. **All three must pass before merge.**

Evidence Watch MUST be idempotent:

- one unresolved source maps to one review branch `evidence-watch/review/<sourceId>` and one Draft Pull Request, and never to parallel Pull Requests;
- a later run for that unresolved source updates that existing branch and Draft PR instead of opening another, recomputing the cumulative `acceptedObservation → latest observed observation` source-condition diff and, where material is available, the `comparisonBaseline → latest observed fingerprint` content diff (§21);
- overlapping scheduled/manual runs must not create duplicate branches or Pull Requests;
- before creating anything, a run looks the review up by its deterministic identity — `sourceId`, `reviewKey`, and the branch `evidence-watch/review/<sourceId>` — and adopts what already exists (§21);
- a run that died between the GitHub write and the state write never causes a second Pull Request; the reserve-first review saga in §21 is what resumes it;
- workflow concurrency control is required (§20), and is scheduling assistance only — it is not the transactional correctness mechanism (§21).

The deterministic renderer, not the model, produces the Pull Request body. Every required deterministic field must be present even when AI is unavailable.

The Evidence Watch automation credentials MUST NOT be able to bypass the required review path or publish semantic medical changes directly to `main` (§17, §20).

### Prior source material and the diff basis (`diffEvidence`)

Phase 9 correctness MUST NOT depend on permanently retaining full third-party source bodies. Licensing, retention and repository-health rules already forbid keeping most of them (§25, `REPOSITORY_HEALTH.md`, `LICENSING_POLICY.md`), so the review payload states its own evidential basis rather than pretending an exact textual delta always exists:

```text
diffEvidence:
  | "before-after"
  | "structural-hash-only"
  | "current-source-vs-canonical"
```

`before-after` — the prior normalized material is legally and operationally available:

```text
→ a bounded exact source delta may be computed and shown
```

`structural-hash-only` — only hashes, section identities and locator states survived:

```text
→ report exactly which deterministic hashes/sections/locators changed
→ never fabricate the previous wording
```

`current-source-vs-canonical` — current official material is available but the prior source text is not:

```text
→ the reviewer and AI may assess whether the CURRENT source still supports
  the CURRENT canonical claims
→ they MUST NOT assert an exact old → new wording difference without evidence
```

`diffEvidence` is part of the deterministic payload and is stated explicitly to the AI reviewer (§14). Nothing in this contract requires committing full source snapshots merely to make a semantic diff possible, and the existing license/cache rules stay in force either way.

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
source meaning changed      → revise affected claims + current
source superseded           → superseded + replacement source mapping
source confirmed gone       → retired, or temporarily-unreachable
source available again      → the reviewed outcome for the returned source
```

Each of those outcomes is a **terminal** reviewed result for that evidence event, is recorded on the review Pull Request, and is merged; that merge is what lets the finalizer advance the watcher's baselines to the exact observation that was reviewed (§19, §21). A Pull Request that would merge with the same event still sitting in `changed-review-required` is not a resolution and does not merge (`REVIEW_RESOLUTION_INCOMPLETE`, §19).

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

Whether a run calls AI again for an already-open review is decided deterministically from the recorded attempt state, `pendingReview.aiAttempt`, which pins an attempt to the exact `sourceObservationDigest` it was made for (§8, §21):

```text
new sourceObservationDigest
→ at most ONE automatic AI attempt

same sourceObservationDigest + status = completed
→ no AI

same sourceObservationDigest + status = unavailable | failed
→ NO automatic retry on subsequent scheduled runs
```

The attempt is keyed to the observation, not to the content digest, because the source location, a locator state or availability can change while the monitored material stays byte-identical. A summary written for the old source condition would then be presented as a review of the new one.

A failed or unavailable attempt is therefore not retried by every cron. Retrying the current `sourceObservationDigest` is an explicit manual operation:

```text
workflow_dispatch:
  mode     = retry-ai
  sourceId = <id>
```

When the observed source condition changes, a previous `completed` summary becomes stale immediately. It MUST NOT continue to be presented as the current AI assessment: the renderer shows the status recorded for the **current** observation, and when AI failed or was unavailable for it the Pull Request shows

```text
AI Review: failed | unavailable for <current sourceObservationDigest>
```

A previous successful summary MAY be retained only as clearly labelled historical/stale context, never as the current review.

The deterministic wrapper around the AI call records the input `sourceObservationDigest` itself. The model is never asked to self-assert what it reviewed.

AI SHOULD receive only the material required for review, such as:

- the deterministic source diff, together with its explicit `diffEvidence` basis (§12);
- the deterministic source-condition facts: availability, normalized effective URL, locator states;
- the deterministic content diff and `comparisonDigest` values where material is available;
- changed source sections;
- relevant `SourceRecord` metadata;
- affected canonical claims;
- relevant source locators;
- related canonical guidance;
- relevant conflicting/supporting sources where available.

### Source-material boundary for AI (`licenseMode`)

The monitor's `licenseMode` (§4) constrains what may leave the repository for an external AI reviewer:

- never send a full third-party source document to an AI provider merely because Evidence Watch fetched it;
- send only the bounded changed/relevant material the semantic review actually needs;
- for restricted, paywalled or otherwise licensed material, raw source text may be sent to an external AI provider **only** when the applicable access/usage policy permits it;
- otherwise AI receives permitted metadata and deterministic diff information, or is marked `unavailable` for semantic review and human review proceeds on the deterministic payload;
- AI unavailability caused by this restriction MUST NEVER suppress the deterministic Draft Pull Request (§16).

This bounds what is shared; it changes no evidence authority (`LICENSING_POLICY.md`, §25).

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
Record the reviewed outcome on the same Pull Request and merge it
Update canonical content
Request stronger/clinical review
Merge after all required gates pass
Close without merging — only for a false positive, monitor defect, invalid detection, or a verified `REVIEW_REVERTED_TO_BASELINE` (§21)
```

A real source change the maintainer judges to carry no meaning change is **not** resolved by closing the Pull Request. The maintainer records the minimal canonical review result on that same Pull Request (`SourceRecord.status`, `lastVerifiedAt`, `verifiedBy`, and other canonical metadata only where appropriate) and merges it, so canonical history and the watcher baselines share one resolution point. Closing without merging is not an acceptance and never advances either baseline (§21).

Whichever outcome the maintainer records, it must be **terminal** for that evidence event before the Pull Request can merge. A merge that would leave the same event sitting in `changed-review-required` is blocked by the required review-resolution check (`REVIEW_RESOLUTION_INCOMPLETE`, §19).

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

A reviewed merge must also be a merge of what was actually reviewed, by a review that actually reached a conclusion. Three required status checks enforce that, and all three are bound to the exact Pull Request head SHA:

- the **deterministic review-integrity check** (§12): the head is the one state records, the branch is current with the required `main` base, the recomputed deterministic payload still equals `reviewPayloadDigest`, and the review identity still equals `pendingReview.latestObservedSourceObservationDigest`;
- the **source freshness check**: it re-observes the source with the same monitor configuration, parser version and digest versions, rebuilds the complete `SourceObservation`, recomputes its `sourceObservationDigest` (§8), and fails the merge when the observed source condition has moved past what the maintainer reviewed;
- the **review-resolution check**: it verifies that the canonical result carried by the branch is a terminal reviewed state for this evidence event, and fails the merge with `REVIEW_RESOLUTION_INCOMPLETE` when it is not (below).

All three are invalidated whenever the review branch head moves, for any reason (§20, §21).

An Evidence Watch review Pull Request MUST also be **up to date with `main`** before merge, under repository enforcement. A Pull Request can stay open while canonical claims and dependencies on `main` change, and impact analysis computed against a stale base is not the impact analysis of the merge. When `main` advances, the review branch is synced non-destructively, maintainer edits are preserved, source→claim→route/tool impact and the deterministic review payload are recomputed, and the resulting new head invalidates the old approval and freshness acceptance (§21).

Required human approval must apply to the **latest reviewable head**. Repository enforcement MUST dismiss stale approvals when new commits are pushed, require approval of the most recent reviewable push, or both; the Evidence Watch automation identity can never satisfy that approval (§20).

### Merging an Evidence Watch review is a terminal resolution

Merging an Evidence Watch review Pull Request means the evidence event it carries has been **resolved**. Phase 9 v1 has no partially resolved merge.

Phase 9 v1 MUST NOT merge a review Pull Request that leaves the same unresolved event in the interim state

```text
SourceRecord.status = changed-review-required
```

while the finalizer advances the baselines. Before merge, the required review-resolution validation must prove that the canonical result reached a terminal reviewed state appropriate to the event — for example:

```text
current
superseded
retired
temporarily-unreachable
```

together with every claim and review change the content contract requires for that outcome (`GUIDANCE_CONTENT_CONTRACT.md`, `EVIDENCE_PROVENANCE.md` §2, §14).

If the source or its dependent claims are still unresolved for that event:

```text
REVIEW_RESOLUTION_INCOMPLETE
→ merge blocked
→ baselines unchanged
```

`REVIEW_RESOLUTION_INCOMPLETE` is a review-gate condition — not a source content classification and not an operational failure (§9, §11).

`REVIEW_REVERTED_TO_BASELINE` is unaffected by this gate: it still resolves through a verified human close without merging (§21).

Intentionally merging an interim public `Reviewing an update` state and continuing the review in a separate Pull Request would be a different capability with its own contract and publication path. It is not part of Phase 9 v1.

Merging resolves the review; a separate idempotent finalizer then advances the watcher's baselines, only after verifying the merged Pull Request against the recorded pending review and its freshness acceptance. A merge whose state update fails leaves the canonical merge intact and the baselines unadvanced (`STATE_SYNC_ERROR`, §21).

## 20. GitHub Actions implementation and security contract

A scheduled/manual workflow can:

- run daily/weekly adapters;
- persist watcher operational state on the dedicated `evidence-watch/state` branch, in `evidence/state/**` (§21) — artifacts and caches only as a transient optimization, never as the authoritative store, and never mixed into canonical authored files;
- create/update the `evidence-watch/review/<sourceId>` branch for an unresolved change;
- create/update exactly one Draft Pull Request per unresolved source;
- create/update operational Issues for operational failures only;
- run the three required checks for an open Evidence Watch review Pull Request — deterministic review-integrity (§12), pre-merge source freshness, and review-resolution validation (§19, §21);
- reconcile the actual Pull Request head with `pendingReview.reviewHeadSha` on every Evidence Watch review Pull Request head change — the events equivalent to `pull_request` `opened`, `synchronize` and `reopened` (§21);
- reconcile a merged review Pull Request into watcher state, idempotently, on the fixed post-merge event (§21);
- expose explicit manual modes for initialization and recovery, separate from the scheduled run:

```text
workflow_dispatch:
  mode = bootstrap  | sourceId = <id | all>
  mode = rebaseline | sourceId = <id>
  mode = reconcile  | sourceId = <id | all>
  mode = retry-ai   | sourceId = <id>
```

- never require an inbound web service.

A scheduled run performs neither bootstrap nor rebaseline: both are manual operations, and a scheduled run that finds missing, corrupt or non-comparable state reports an operational condition instead (§21). It does reconcile outstanding merged reviews before normal classification.

Use concurrency controls so overlapping watcher runs do not create duplicate branches, Pull Requests, or reports, and serialize every write to `evidence-watch/state` behind a single state-writer concurrency group; the watcher never force-pushes that branch (§21). Workflow `concurrency` is scheduling assistance, not a transactional lock: correctness comes from the fast-forward compare-and-swap state writes and the reserve-first review saga in §21, so a canceled or replaced run can never lose an already-required review or state transition.

Security contract:

- declare explicit least-privilege `permissions`;
- grant only what is needed to read repository content, create/update Evidence Watch branches, create/update Draft Pull Requests, and optionally manage operational Issues;
- store AI provider credentials in GitHub Secrets or another approved secret store;
- never expose secrets in workflow logs, generated reports, Pull Request bodies, or committed files;
- never grant the Evidence Watch identity permission to bypass branch/ruleset review requirements;
- treat monitor configuration that exists only on a review branch as **validated data**, never as code: the trusted Evidence Watch implementation parses and schema-validates it and applies the §6 fetch-security checks before using it, and no arbitrary code from a review branch executes in the privileged workflow (§21);
- keep credentials, signed request URLs, session identifiers and secret query parameters out of state, review payloads, AI prompts and logs (§8).

### Branch protection and ruleset requirement

The production pipeline deploys on push to `main` (`REPOSITORY_STRUCTURE.md` §12). Workflow `permissions` alone cannot constrain what an identity may do outside that workflow, so repository-level enforcement is required, not optional hardening.

Phase 9 MUST configure a GitHub Ruleset, branch protection, or equivalent enforcement on `main` such that the Evidence Watch identity:

- cannot push semantic evidence changes directly to `main`;
- cannot bypass the Draft Pull Request review path;
- cannot bypass required approvals or required status checks;
- cannot self-approve its own evidence Pull Request, force-push to `main`, or delete the protected branch;
- cannot write canonical `SourceRecord` metadata or any other canonical authored file to `main` outside that reviewed path, including for a deterministic metadata-only result (§11);
- cannot merge an Evidence Watch review Pull Request that has not passed **all three** required checks: deterministic review-integrity (§12), source freshness, and review-resolution validation (§19, §21);
- cannot merge an Evidence Watch review Pull Request that is behind the required `main` base (§19);
- cannot merge on the strength of an approval given to an older head: enforcement dismisses stale approvals when new commits are pushed and/or requires approval of the most recent reviewable push, so required human/clinical review always applies to the latest reviewable head (§19, §21).

### Repository enforcement: no populated state files on `main`

Watcher operational state lives only on `evidence-watch/state`. Phase 9 MUST extend repository-health/baseline enforcement so populated operational state cannot reach `main` by accident:

```text
main:
  evidence/state/.gitkeep         → allowed
  optional small README           → allowed if documented
  evidence/state/manifest.json    → forbidden
  evidence/state/sources/**       → forbidden
```

The `evidence-watch/state` branch is intentionally exempt from this `main`-branch content rule — it is where those files are supposed to be. This check is a Phase 9 deliverable and part of the Phase 9 gate (`IMPLEMENTATION_ROADMAP.md`, `REPOSITORY_HEALTH.md`).

`evidence-watch/state` is a non-canonical operational branch: it is never merged into `main`, never opened as a review Pull Request, and never triggers a deployment (§21). Because it is nevertheless the authoritative durable operational store, Phase 9 MUST also configure its own ruleset/branch protection on that branch — blocking force-push and deletion, and restricting writes to the approved Evidence Watch identity and an explicit maintainer recovery path. That protection is separate from the `main` ruleset above.

Only a merge into `main` after the required review may enter the production pipeline (§19).

This enforcement is a Phase 9 deliverable and part of the Phase 9 gate (`IMPLEMENTATION_ROADMAP.md`). Evidence Watch MUST NOT be enabled against real sources on a repository where `main` still accepts unreviewed pushes.

Repository locations and cache/state ownership are defined in `REPOSITORY_STRUCTURE.md`. Generated impact indexes should reuse `source-claim-index`/`route-evidence-index` rather than build an unrelated mapping format.

## 21. Evidence Watch operational state machine

Deterministic classification (§9, §11) only means something if the watcher knows exactly what it is comparing against, where that answer is stored, and who is allowed to move it. Phase 9 v1 fixes all three.

### Durable operational store: the `evidence-watch/state` branch

Phase 9 v1 persists watcher operational state on one dedicated non-canonical Git branch:

```text
evidence-watch/state
```

That branch is the single authoritative durable store. GitHub Actions artifacts and caches MAY be used as a transient optimization only; they are never authoritative persistent state, and state missing from an artifact or cache is recovered from the branch, never re-invented (`STATE_MISSING`, below).

`evidence-watch/state`:

- is not canonical knowledge;
- is never merged into `main`;
- is never used as an Evidence Watch review Pull Request;
- never triggers a production deployment;
- carries only compact operational metadata, status values, hashes and compact `SourceObservation` records;
- carries no fetched HTML/PDF/source bodies;
- carries no secrets;
- carries no AI prompts, no AI output and no long third-party source excerpts.

State files on that branch:

```text
evidence/state/manifest.json
evidence/state/sources/<sourceId>.json
```

On `main`, `evidence/state/` stays the empty placeholder directory that owns this path convention (`REPOSITORY_STRUCTURE.md` §2); the populated state files exist only on `evidence-watch/state`.

Review branches are a separate namespace:

```text
evidence-watch/review/<sourceId>
```

A review branch carries a proposed canonical change under review; it is never the persistent watcher state store, and `evidence-watch/state` never carries a review.

### State-branch writes: serialization and atomicity

`evidence-watch/state` is the authoritative durable store, so Phase 9 v1 keeps its write model deliberately simple:

```text
All writes to evidence-watch/state are serialized.
```

Fetching and diffing may run in parallel; committing to the state branch may not. A single state-writer critical section — one workflow concurrency group — owns every update, and it is a scheduling boundary rather than the correctness guarantee (below).

- two workflow runs must never race non-fast-forward writes;
- no update to one source's state may be lost behind another's;
- a per-source state file and any related `manifest.json` change commit atomically in the same state update;
- a writer reads the latest state-branch head immediately before writing;
- a stale write retries from the latest head, or fails as an operational condition — it never resolves the race by overwriting.

GitHub Actions `concurrency` is **scheduling assistance, not the transactional correctness mechanism**. A canceled or replaced workflow run must never be able to lose an already-required review or state transition, so every state mutation additionally uses fast-forward compare-and-swap semantics:

```text
read the latest evidence-watch/state head
→ compute the mutation against that exact head
→ attempt a fast-forward write
→ if the head moved, reload the latest state and reapply/revalidate the mutation
→ retry boundedly, or fail as an operational condition
```

The reserve-first review saga below is the recovery mechanism for the one transition that cannot be a single write: durable state and the GitHub Pull Request.

> **Evidence Watch MUST NOT force-push `evidence-watch/state`.**

### State-branch history and recovery

The Git history of `evidence-watch/state` is the watcher's recovery history, so it stays append-only:

- normal updates are fast-forward commits;
- no squashing, resetting, or force-rewriting of state history;
- `STATE_MISSING`/`STATE_CORRUPT` recovery starts from the most recent prior valid state commit (see "Operational conditions");
- a restore is itself a new commit — it never rewrites history to make the loss disappear.

This history is an operational and audit trail for the watcher. It is not canonical medical history, and nothing in it is citable as provenance (§11).

### Branch protection for `evidence-watch/state`

Because it is the authoritative durable operational store, the state branch needs its own protection — separate from, and weaker in purpose than, the `main` ruleset (§20). Phase 9 MUST configure a ruleset/branch protection on `evidence-watch/state` that at least:

- blocks force-push;
- blocks deletion;
- restricts write access to the approved Evidence Watch automation identity and an explicit maintainer recovery path;
- keeps the branch out of `main` (never merged into it);
- keeps the branch out of the production deployment trigger.

### Source registry and initialization lifecycle: `manifest.json`

`evidence/state/manifest.json` is not an unspecified file. It is the watcher's registry of which sources have ever been initialized, and it is what distinguishes a brand-new monitor from an initialized source whose state was lost.

```ts
interface EvidenceWatchManifest {
  schemaVersion: "1";

  sources: Record<string, {
    statePath: string;

    lifecycle:
      | "bootstrap-required"
      | "active"
      | "review-pending"
      | "recovery"
      | "inactive";

    everInitialized: boolean;
    initializedAt?: string;
  }>;
}
```

The manifest and every affected per-source state file update **atomically** in the same state commit (write model above).

There is deliberately **no** `lastStateCommit` field. The Git commit that contains the manifest is itself the state revision and audit identity, so a commit-SHA field stored inside that same commit would be self-referential and unresolvable. Git history is sufficient for Phase 9 v1. If a later contract genuinely needs parent compare-and-swap provenance, it must use an unambiguous name and meaning — for example `basedOnStateHeadSha`, the state-branch head that was **read before** the mutation — and never the SHA of the commit being created.

#### Lifecycle transitions

The lifecycle is a closed transition set, not a label the implementation may choose:

```text
new monitor
→ bootstrap-required

successful bootstrap
→ active

active + review reservation
→ review-pending

review-pending + valid merged/finalized resolution
→ active
  OR inactive if the merged canonical monitor registry no longer
     schedules that source

review-pending + verified REVIEW_REVERTED_TO_BASELINE human close
→ active

review-pending + closed-unmerged / REVIEW_BRANCH_CONFLICT /
                 REVIEW_STATE_MISMATCH / REVIEW_ARTIFACT_MISSING
→ recovery

successful explicit recovery or rebaseline
→ active
  OR inactive according to the canonical monitor registry

canonical monitor removed or disabled, no unresolved review
→ inactive

inactive source reactivated
→ explicit validation/rebaseline
→ active
```

A canonical monitor that disappears from `main` while an Evidence Watch review is still pending is never a silent cleanup:

```text
canonical monitor removed while a review is pending
→ do NOT clear the review
→ REVIEW_STATE_MISMATCH
→ explicit maintainer resolution
```

**New monitor that has never been initialized.** A canonical monitor exists but the manifest carries no `everInitialized = true` entry for it:

```text
BOOTSTRAP_REQUIRED
→ lifecycle = bootstrap-required
→ a scheduled run does not invent a baseline
→ no AI
→ no evidence Pull Request
→ an explicit `bootstrap` dispatch is required
```

`BOOTSTRAP_REQUIRED` is an expected operational initialization condition — not an evidence change, and not a defect (§11).

**Previously initialized source whose state was lost.** The manifest says `everInitialized = true` but the per-source state file is missing or unreadable:

```text
STATE_MISSING / STATE_CORRUPT
```

The recovery rules under "Operational conditions" apply, and `bootstrap` is forbidden.

**Monitor removed or disabled in the canonical registry.** Retained state for a monitor canonical configuration no longer carries is not corruption:

```text
canonical monitor removed/disabled
→ lifecycle = inactive
→ stop scheduled fetching
→ preserve state and history
```

Reactivating the same initialized `sourceId` never uses `bootstrap`; it uses explicit validation and, where comparison semantics have moved on, an explicit `rebaseline`.

### State schema version migration

A `schemaVersion` mismatch must not silently become corruption or a rebaseline:

```text
supported deterministic state migration
→ migrate without changing the meaning or the digests of
   acceptedObservation and comparisonBaseline
→ append a new state-branch commit

unsupported migration
→ STATE_SCHEMA_MIGRATION_REQUIRED
→ no normal classification
→ no baseline advancement
→ no bootstrap
```

A state schema migration alone never authorizes a new evidence baseline: it re-encodes what is already recorded, it does not re-observe the source.

### Per-source operational state

Every monitored source has at least:

```ts
interface EvidenceWatchSourceState {
  schemaVersion: string;
  sourceId: string;

  monitorConfigHash: string;
  parserVersion: string;
  comparisonDigestVersion: string;
  sourceObservationDigestVersion: string;

  // The complete accepted source-side condition.
  acceptedObservation: {
    observation: SourceObservation;
    establishedAt: string;

    authority:
      | "bootstrap"
      | "deterministic-metadata"
      | "reviewed-pr"
      | "manual-rebaseline";

    canonicalGitSha?: string;
    prNumber?: number;
  };

  // Last accepted AVAILABLE material.
  // May stay unchanged while acceptedObservation is confirmed-missing.
  comparisonBaseline: {
    fingerprint: SourceFingerprint;
    establishedAt: string;

    authority:
      | "bootstrap"
      | "deterministic-metadata"
      | "reviewed-pr"
      | "manual-rebaseline";

    canonicalGitSha?: string;
    prNumber?: number;
  };

  lastObservedObservation?: SourceObservation;

  pendingReview?: {
    reviewKey: string; // deterministic from sourceId
    phase:
      | "reserved"
      | "open"
      | "merged-awaiting-reconcile"
      | "recovery";

    branch: string;
    prNumber?: number;

    reviewBaseSha: string;
    reviewHeadSha?: string;

    // The observation semantics every artifact of THIS review is produced under.
    reviewObservationSemantics: {
      monitorConfigHash: string;
      locatorSetDigest: string;
      parserVersion: string;
      comparisonDigestVersion: string;
      sourceObservationDigestVersion: string;
    };

    baselineSourceObservationDigest: string;
    latestObservedSourceObservationDigest: string;

    baselineComparisonDigest?: string;
    latestObservedComparisonDigest?: string;

    reviewPayloadDigest?: string;

    aiAttempt?: {
      sourceObservationDigest: string;
      status: "completed" | "unavailable" | "failed";
      attemptedAt: string;
    };

    freshnessAccepted?: {
      prHeadSha: string;

      sourceObservation: SourceObservation;

      sourceObservationDigest: string;
      reviewPayloadDigest: string;

      monitorConfigHash: string;
      locatorSetDigest: string;
      parserVersion: string;
      comparisonDigestVersion: string;
      sourceObservationDigestVersion: string;

      checkedAt: string;
    };

    detectedAt: string;
    updatedAt: string;
  };
}
```

`baselineComparisonDigest` and `latestObservedComparisonDigest` are optional because an actionable condition can exist with no material at all: a `SOURCE_MISSING` observation has no `SourceFingerprint` and therefore no `comparisonDigest` (§8, §9).

Each digest field is the digest its name states — a `comparisonDigest` or a `sourceObservationDigest` as defined in §8, except `reviewPayloadDigest`, which is the deterministic review-payload digest of §12. State comparisons therefore never depend on observation metadata or on serialized fingerprint/observation objects. `reviewKey` is derived deterministically from the `sourceId`, so the same unresolved review is always addressable without consulting state that may not have been written yet. `reviewBaseSha` is the `main` commit the payload was computed against, and `reviewHeadSha` is the review branch head the open Pull Request currently carries — absent only while the review is still `reserved`.

`freshnessAccepted` retains the exact compact `SourceObservation` it accepted, not only its digest, because the finalizer installs that observation as the new `acceptedObservation` (below). Like everything else on this branch it stays compact and public-safe (§8): operational fields, status values and hashes only — never a fetched source body, a long third-party excerpt, an AI prompt, AI output, or any credential-bearing URL or other secret.

### Observation semantics are pinned to the open review

A normal scheduled fetch uses the canonical reviewed monitor configuration on `main`, while the freshness and review-integrity checks may fetch a URL or configuration that so far exists only on the review branch (§6). That is exactly what a review of a `SOURCE_MOVED`, a new URL, a selector change, a canonicalization-profile change or a locator-set change is *for* — and it means one open review must never end up mixing observations produced under two different sets of semantics.

`pendingReview.reviewObservationSemantics` is the pin:

> **Every `latestObservedSourceObservationDigest`, AI attempt, deterministic review payload and freshness acceptance belonging to one open review MUST be produced under that review's `reviewObservationSemantics`.**

When the review is created:

```text
reviewObservationSemantics = the current reviewed monitor/locator semantics
```

When a maintainer or the bot changes anything on the review branch that affects observation semantics —

```text
url
adapter
selector
include/exclude patterns
canonicalization profile / version
compareMode
the monitored locator set
```

— the review is repinned rather than left comparing two things:

```text
→ derive new reviewObservationSemantics from the current Pull Request head
→ invalidate the review's current latest observed observation
→ invalidate aiAttempt as the current attempt
→ invalidate freshnessAccepted
→ re-observe the source under the NEW review semantics
→ recompute sourceObservationDigest
→ recompute reviewPayloadDigest
→ produce a new review head generation
→ require review and both head-bound checks on the latest head again
```

That is a change of **review semantics**, not an upstream source change. It is never classified as `CONTENT_CHANGED`, `SOURCE_MOVED` or any other evidence category merely because a configuration hash moved, and it never advances a baseline.

#### Scheduled runs while a review carries proposed semantics

If a source has an open `pendingReview` whose

```text
pendingReview.reviewObservationSemantics.monitorConfigHash
```

or `locatorSetDigest` differs from the accepted/current-`main` semantics, a scheduled run MUST NOT overwrite that review's observation with one produced from the older `main` configuration. Phase 9 v1 fixes the behavior:

```text
source has an open pendingReview
→ every source refresh for THAT review uses the current review Pull Request
  semantics
→ trusted Evidence Watch code observes using the monitor configuration data
  read from the current review head, after schema validation and the
  fetch-security validation of §6
→ a scheduled run MAY invoke that same review-refresh path
→ it MUST NOT write a pending observation produced under the older
  `main` semantics
```

Review-branch monitor configuration is **data**, not code: it is parsed and validated by the trusted Evidence Watch implementation, and no arbitrary code from a review branch runs in the privileged workflow (§20).

The pre-merge freshness check uses exactly the same `reviewObservationSemantics`, and the post-merge finalizer installs only the semantics bound to the accepted freshness snapshot (below).

`phase` tracks where the review actually is, so a crashed or half-finished transition is recoverable rather than ambiguous:

```text
reserved                   state written, Pull Request not yet confirmed
open                       Draft Pull Request exists and state knows it
merged-awaiting-reconcile  the Pull Request merged, the baseline has not
                           been advanced yet (STATE_SYNC_ERROR territory)
recovery                   REVIEW_CLOSED_UNMERGED, REVIEW_ARTIFACT_MISSING,
                           REVIEW_STATE_MISMATCH or REVIEW_BRANCH_CONFLICT
                           is holding this review open
```

The manifest `lifecycle` for the source moves with it (`review-pending` while a review is open, `recovery` while one of those conditions holds).

The stored facts are distinct and are never automatically equated:

```text
acceptedObservation
= the complete accepted source-side condition — availability, effective
  location, locator states, classification signals, and the accepted
  material fingerprint when material was available.

comparisonBaseline
= the last accepted AVAILABLE monitored material, used for content and
  section comparison. It does not move when the accepted observation is
  a confirmed absence.

lastObservedObservation
= the newest complete source condition the watcher actually observed.
```

The two baselines are never merged into one. `acceptedObservation` answers "what source condition did HowToBaby accept?"; `comparisonBaseline` answers "what material was the last accepted available material?". A confirmed-missing source has an accepted observation with no fingerprint, while its `comparisonBaseline` still holds the last available material — which is exactly what makes a later `SOURCE_RETURNED` reviewable.

"Previous fingerprint" is not a term of this contract: every comparison names one of the facts above. Every unresolved review diff is computed as

```text
acceptedObservation → latest observed observation
```

with the content-side diff, where material is available, computed as

```text
comparisonBaseline → latest observed fingerprint
```

and never as

```text
previous cron observation → current cron observation
```

so a change detected across several runs is never split into fragments that each look harmless.

### Deterministic classification inputs

A normal run classifies from the two complete observations, never from content bytes alone:

```text
acceptedObservation.observation
vs
lastObservedObservation
→ deterministic classification
```

The content-side comparison is a second, narrower question, answered only when both sides carry material:

```text
comparisonBaseline.fingerprint.comparisonDigest
vs
current observation.fingerprint.comparisonDigest
→ content/section diff
```

### Baseline advancement rules

`UNCHANGED`:

```text
observe
→ current sourceObservationDigest
     == acceptedObservation.observation.sourceObservationDigest
→ update check timestamps and operational metadata
→ acceptedObservation and comparisonBaseline unchanged as meaning baselines
→ no AI / no PR / no Issue
```

An identical confirmed-missing observation is `UNCHANGED` under exactly this rule: a source whose absence HowToBaby has already accepted does not re-raise a review on every cron.

Deterministic `METADATA_CHANGED` that an approved deterministic rule proves non-actionable (§11):

```text
→ no AI
→ no PR
→ no Issue
→ canonical Git unchanged
→ watcher MAY advance acceptedObservation operationally
   so the same metadata-only event does not repeat every run
→ where the comparison material also changed and the approved rule still
   proves the change non-actionable, comparisonBaseline MAY advance with it
→ authority = deterministic-metadata
```

That is an operational baseline advancement only. It is never a canonical approval, and it never writes canonical `SourceRecord` metadata (§11).

Actionable evidence change:

```text
acceptedObservation     = KEEP FIXED
comparisonBaseline      = KEEP FIXED
lastObservedObservation = update to the newest observed source condition
pendingReview           = create/update
Draft PR                = create/update
```

> **The watcher MUST NOT advance `acceptedObservation` or `comparisonBaseline` merely because an actionable change was observed, classified, or reported.** Only a valid resolution moves either of them (below).

### Repeated upstream revisions while a review is open

Phase 9 v1's unresolved review unit is the `sourceId`:

```text
one open Evidence Watch review PR per sourceId
```

An unresolved source never produces parallel Pull Requests, and multiple upstream revisions observed before resolution are folded into that same open review.

When the source condition changes again while the Draft PR is open:

```text
acceptedObservation and comparisonBaseline stay fixed
→ observe the newest source condition
→ recompute the cumulative deterministic diff:
   acceptedObservation → newest observed observation
   comparisonBaseline  → newest observed fingerprint (when available)
→ update the SAME review branch
→ update the SAME Draft Pull Request
```

The AI decision is deterministic, driven by `pendingReview.aiAttempt` (§14):

```text
newest observed sourceObservationDigest == aiAttempt.sourceObservationDigest
   + aiAttempt.status = completed
   → do not call AI again

newest observed sourceObservationDigest == aiAttempt.sourceObservationDigest
   + aiAttempt.status = unavailable | failed
   → do not call AI again automatically
   → an explicit `retry-ai` dispatch is the only automatic-free retry

newest observed sourceObservationDigest changed
   → at most one automatic AI attempt for the new observation
   → replace the AI Review Summary in the SAME Pull Request
   → any previous summary is stale and is never rendered as the current review
```

A changed source condition with an unchanged `comparisonDigest` therefore makes the current AI attempt stale: the summary was written for a source that has since moved, gone missing, come back, or lost a locator. AI still receives the content diff and `comparisonDigest` values when material is available (§14).

Any run that updates the open review also updates `latestObservedSourceObservationDigest` — and `latestObservedComparisonDigest` when material is available — recomputes `reviewPayloadDigest`, produces a new review head (below), records the new `reviewHeadSha`, and invalidates a stale `freshnessAccepted`.

Re-running AI never changes the deterministic payload requirements of §12, and a re-run that is unavailable or fails follows §16 without erasing the previous deterministic report.

### Review creation: the reserve-first saga

The state branch and the GitHub Pull Request cannot be written atomically, so review creation is an explicit recoverable saga rather than an assumed single step. Its order is fixed:

```text
1. persist pendingReview with phase = reserved on evidence-watch/state
2. create or find the deterministic review branch
3. create or find the Draft Pull Request
4. persist prNumber + reviewHeadSha + phase = open
```

Before creating any Pull Request, a run always looks first, by deterministic identity only:

```text
sourceId
reviewKey
evidence-watch/review/<sourceId>
```

`reviewKey` is the **deduplication key of the current unresolved review**, derived from `sourceId`. It is deliberately not a globally unique identifier for every historical review event: the same `sourceId` produces the same `reviewKey` again for the next evidence event. Historical review identity is carried by the Pull Request number and Git history, never by `reviewKey`.

A run may therefore adopt an existing Pull Request only when all of:

```text
state      = open
base       = main
head branch = evidence-watch/review/<sourceId>
it matches the currently reserved pendingReview / reviewKey
```

> **A merged or closed Pull Request MUST NEVER be adopted as the current review**, however well its branch name or `reviewKey` matches.

If more than one open Pull Request matches the same source:

```text
REVIEW_STATE_MISMATCH
→ fail closed
```

Crash recovery is therefore deterministic:

```text
reserved state + no open Pull Request
→ resume creation

reserved state + a matching OPEN Pull Request already exists
→ adopt that Pull Request and finish the state sync

state says open + the Pull Request is missing
→ REVIEW_ARTIFACT_MISSING

a Pull Request exists but durable state cannot be reconciled safely
→ REVIEW_STATE_MISMATCH
→ fail closed
```

> **Evidence Watch MUST NEVER create a second Pull Request merely because a previous run died between the GitHub write and the state write.**

### The review branch must preserve human edits

`evidence-watch/review/<sourceId>` carries a proposed canonical change, and a maintainer may have authored canonical edits on it. Automation is a co-author there, never the owner:

- always fetch the latest review branch head before automation writes;
- automation updates preserve human commits and edits;
- no reset to generated state;
- no force-push;
- no rebuilding the branch from `main` in a way that discards human work.

When an automated refresh conflicts with maintainer edits:

```text
REVIEW_BRANCH_CONFLICT
→ fail closed
→ preserve the branch exactly as it is
→ request maintainer resolution
```

> **Evidence Watch MUST NOT reset or force-push `evidence-watch/review/<sourceId>`.**

### Review branch lifecycle across successive evidence events

The branch name `evidence-watch/review/<sourceId>` is reused across evidence events, so its lifecycle has to be explicit. The invariants above — no reset, no force-push, preserve human edits — apply while a review is **unresolved**. They are not a prohibition on cleaning up a branch whose review has terminally resolved.

**After a merged, reconciled review.** Cleanup never runs before state reconciliation succeeds. Once the finalizer has

```text
installed acceptedObservation
cleared pendingReview
moved the manifest lifecycle to active (or inactive)
```

automation MAY — and SHOULD — delete `evidence-watch/review/<sourceId>` idempotently. If GitHub already auto-deleted the head branch on merge, that delete is a no-op, not an error.

**After a verified `REVIEW_REVERTED_TO_BASELINE` close.** Once the human close is verified, `pendingReview` is cleared and the manifest lifecycle is back to `active`, the branch is cleaned up idempotently in the same way.

**While recovery is outstanding.** The branch MUST be preserved for as long as any of

```text
REVIEW_CLOSED_UNMERGED
REVIEW_BRANCH_CONFLICT
REVIEW_STATE_MISMATCH
REVIEW_ARTIFACT_MISSING
```

is unresolved, so maintainer edits and recovery evidence are never lost. Cleanup happens only after the explicit recovery completes.

**Starting the next evidence event.** When

```text
pendingReview absent
manifest lifecycle = active
a new actionable observation is detected
```

the new review MUST start from a branch freshly based on current `main`, targeting `evidence-watch/review/<sourceId>`:

```text
the branch does not exist
→ create it from current main
```

If a stale historical branch of that name still exists, automation may delete and recreate it **only** when deterministic verification proves all of:

```text
no pendingReview for this source
no open Evidence Watch Pull Request for that branch or source
the branch belongs to a terminally resolved historical review
no unresolved human work exists on it
```

If that cannot be proven:

```text
REVIEW_STATE_MISMATCH
→ fail closed
```

A stale historical branch is never force-reset or rebased into a new review. Because each event's branch is created afresh from `main` rather than reused, this contract behaves identically whether the repository merges with merge commits, squash merges or rebase merges.

### Every new source observation must produce a new review head SHA

GitHub status checks and approvals attach to a commit SHA, so changing only the Pull Request body or state is not enough. Whenever an open Evidence Watch review observes a change in

```text
latestObservedSourceObservationDigest
```

the review branch head MUST change. That is the observation digest, not the content digest: a source that moved, went missing, came back, or lost a locator while its bytes stayed identical must still produce a new review generation, so no old check, approval or freshness acceptance survives a changed source condition.

The deterministic `reviewPayloadDigest` can also change for reasons that are not upstream at all — a new `main` base, a changed impact mapping, changed deterministic policy risk, or maintainer canonical edits that change the deterministic impact. Those already move the head through a real commit or base sync, and the required checks and stale-approval rules apply to the resulting head exactly as above. When the refreshed review has no natural file change to commit, automation creates one bot-owned empty review-refresh commit:

```text
chore(evidence-watch): refresh <sourceId> review
```

Report files are never added to canonical `main` merely to force a head change. The head bump is what guarantees that:

- an old freshness acceptance cannot remain valid;
- old required checks cannot remain attached to the current review;
- a stale human approval is invalidated;
- `reviewHeadSha` identifies the exact review generation.

No force-push is used to achieve it.

### Synchronizing every Pull Request head change, including human commits

Head changes are not only watcher-driven. On the Evidence Watch review Pull Request events equivalent to

```text
pull_request opened
pull_request synchronize
pull_request reopened
```

the workflow reconciles

```text
actual Pull Request head SHA  ↔  pendingReview.reviewHeadSha
```

Any head change:

```text
→ update reviewHeadSha
→ invalidate freshnessAccepted
→ rerun the required deterministic review-integrity check (§12)
→ rerun the required source freshness check
```

A maintainer-authored commit does **not** re-run AI merely because the Git SHA changed: the AI decision depends on the current `sourceObservationDigest`, never on the branch SHA. The exception is a commit that changes the review's observation semantics — URL, adapter, selector, include/exclude patterns, canonicalization profile/version, `compareMode` or the monitored locator set — which repins the review, re-observes the source and therefore produces a new observation to decide on (above). If canonical edits on the branch change the affected claim/source mapping, the deterministic impact payload is recomputed and `reviewPayloadDigest` is updated with it.

### Keeping the review branch current with `main`

An Evidence Watch review Pull Request must be up to date with the required `main` base before merge (§19, §20). When `main` advances while the review is open:

```text
→ non-destructively sync the latest main into the review branch
→ preserve maintainer edits
→ recompute source→claim→route/tool impact
→ recompute the deterministic review payload and reviewPayloadDigest
→ record the new reviewBaseSha and the new review head SHA
→ the old approval and the old freshness acceptance are invalid
```

If that sync conflicts:

```text
REVIEW_BRANCH_CONFLICT
```

A merge must never proceed on stale impact analysis.

### Upstream reverting to the accepted baseline while a review is open

Upstream can move away from the baseline and then back to it before the review resolves:

```text
baseline = A
upstream A → B
Draft Pull Request opens
upstream B → A before review completes
```

That is not a monitor defect and MUST NOT be pushed through the `REVIEW_CLOSED_UNMERGED` recovery path. It is a deterministic review resolution condition:

```text
REVIEW_REVERTED_TO_BASELINE
```

recognized when all of:

```text
pendingReview exists

lastObservedObservation.sourceObservationDigest
  == acceptedObservation.observation.sourceObservationDigest

AND a deterministic classification recomputation produces no remaining
    actionable condition
```

The condition is the **complete observation**, never content equality. Content bytes equal to the baseline prove nothing on their own, so none of

```text
SOURCE_MOVED with identical content
a locator failure with identical content
a missing source
a provenance / source-condition change
```

can be mistaken for a revert.

Behavior:

```text
→ update the SAME Pull Request with the deterministic
   "upstream reverted to the accepted baseline" result
→ no AI is required for the reverted state
→ invalidate the old freshness acceptance and the old approval
→ make a review-refresh head commit
→ a human MAY close the Pull Request without merging
```

Evidence Watch never closes that Pull Request itself. When a human closes it and the condition is verified:

```text
acceptedObservation  unchanged
comparisonBaseline   unchanged
pendingReview        cleared
manifest lifecycle   → active
review branch        cleaned up idempotently (above)
canonical Git        unchanged
no REVIEW_CLOSED_UNMERGED recovery
operational/audit history preserved
```

Any other close-without-merge still follows `REVIEW_CLOSED_UNMERGED` below.

### Bootstrap

A normal scheduled run MUST NOT invent a baseline when no state exists. Establishing the first baseline for a source is an explicit manual operation:

```text
workflow_dispatch:
  mode = bootstrap
  sourceId = <id | all>
```

A successful bootstrap:

```text
canonical reviewed monitor config
→ fetch source
→ validate source identity
→ resolve the configured locator/section where applicable
→ generate the first fingerprint
→ build the first complete SourceObservation
→ acceptedObservation     = that observation
→ comparisonBaseline      = that observation's fingerprint
→ lastObservedObservation = that observation
→ authority = bootstrap
→ record the canonical `main` SHA + monitorConfigHash + parserVersion
   + comparisonDigestVersion + sourceObservationDigestVersion
→ manifest: everInitialized = true, initializedAt, lifecycle = active
→ no AI
→ no evidence Pull Request
```

Bootstrap requires an available source. A first observation that is a confirmed absence establishes no `comparisonBaseline`, so bootstrap aborts and the maintainer resolves the monitor or the source before the source is initialized at all.

A scheduled run that meets a canonical monitor with no `everInitialized` entry reports `BOOTSTRAP_REQUIRED` and stops there (see the manifest lifecycle above).

Bootstrap is initialization, not an evidence change, and it applies only to a source that has never been initialized. A monitor added later is bootstrapped explicitly too, after its monitor configuration has been reviewed and merged.

> **Once a source has been initialized, `bootstrap` MUST NEVER be used again — in particular never to replace a lost or corrupt baseline.** Recovering an initialized source follows the recovery path in "Operational conditions" below, not a fresh baseline taken from whatever upstream happens to serve today.

### Rebaseline: monitor configuration and parser changes

Operational state pins `monitorConfigHash`, `parserVersion`, `comparisonDigestVersion` and `sourceObservationDigestVersion`. When configuration, selector, canonicalization profile, parser version or a digest version changes so that the stored baselines are no longer comparable:

```text
REBASELINE_REQUIRED
→ operational condition
→ do not classify the source as UNCHANGED / METADATA_CHANGED / CONTENT_CHANGED
→ do not overwrite the old acceptedObservation or comparisonBaseline
→ do not silently rebaseline
```

Rebaselining is an explicit manual operation:

```text
workflow_dispatch:
  mode = rebaseline
  sourceId = <id>
```

A manual rebaseline MUST verify source identity and the configured locators before replacing the baselines. Identity and locators alone are not sufficient: when the old and new semantics are **not comparable** — a changed `monitorConfigHash`, `locatorSetDigest`, `parserVersion`, `comparisonDigestVersion` or `sourceObservationDigestVersion` means the two digests describe different measurements, so no diff can prove the meaning is unchanged — the maintainer must additionally verify that the current official source's meaning and support are still consistent with the canonical claims that rely on it.

A monitor-configuration or locator-scope change is never presented as an upstream evidence diff. Where the locator monitoring scope alone moved and every monitored locator still resolves, the deterministic monitoring-scope sync of §9 applies instead of a rebaseline.

If that verification finds a material change to source identity, provenance, meaning or content:

```text
→ abort the rebaseline
→ promote to an actionable evidence change
→ Draft Pull Request
```

A successful manual rebaseline records `authority = manual-rebaseline` together with operational audit metadata equivalent to:

```text
{
  authority: "manual-rebaseline",
  verifiedBy: "maintainer",
  verifiedAt: string,
  canonicalGitSha: string,
  monitorConfigHash: string,
  locatorSetDigest: string,
  parserVersion: string,
  comparisonDigestVersion: string,
  sourceObservationDigestVersion: string
}
```

That operational `verifiedBy` records who moved a watcher baseline. It is **not** canonical `SourceRecord.verifiedBy` and never substitutes for it (`EVIDENCE_PROVENANCE.md` §2, §11).

### Resolution and baseline advancement

An actionable change advances `acceptedObservation` — and `comparisonBaseline` where the accepted observation carries material — only after a valid resolution.

**Reviewed Pull Request merged.** The merge is what resolves the review, and a separate deterministic finalizer — not the merge itself — moves the watcher's baseline. That path is fixed below; neither baseline is ever advanced to a newer source condition the maintainer did not review, and never to `lastObservedObservation` simply because it is the newest thing the watcher has seen.

**A real source change the maintainer judges to carry no meaning change.** This is not resolved by closing the Pull Request. The maintainer completes the minimal canonical review result on that same Pull Request — for example:

```text
SourceRecord.status → current
lastVerifiedAt      → the actual human verification date
verifiedBy          → maintainer
other canonical metadata only where appropriate
```

and merges it through the normal reviewed path, so the canonical audit trail and the watcher baseline share one explicit resolution point.

**Pull Request closed without merging.** A closed-unmerged Pull Request is not an acceptance, unless it is a verified `REVIEW_REVERTED_TO_BASELINE` close (above), which resolves the review with the baseline unchanged and no recovery state:

```text
closed + unmerged
→ acceptedObservation and comparisonBaseline unchanged
→ not accepted
→ REVIEW_CLOSED_UNMERGED
→ the source enters an explicit operational recovery state
```

The unresolved state is not silently cleared and the watcher does not simply carry on as if nothing had happened. Because closing without merging is otherwise reserved for a false positive, a monitor defect, or an invalid detection — a verified `REVIEW_REVERTED_TO_BASELINE` close being the one exception, which resolves the review cleanly and never enters this path — the source stays in that recovery state until the monitor/configuration is actually fixed and either an explicit `rebaseline` or a valid detection path completes. A scheduled run must never respond to a closed-unmerged review by reopening, re-closing, or re-creating Pull Requests in a loop without that monitor recovery.

### Post-merge state reconciliation

Baseline advancement after a merge happens in one fixed path, not one the implementation may choose:

```text
pull_request closed
+ merged == true
+ base == main
+ head matches evidence-watch/review/<sourceId>
→ Evidence Watch state reconciliation/finalization
```

The finalizer MUST be idempotent: running it again for an already-reconciled merge changes nothing and is not an error.

It advances the baselines only when it can verify all of:

```text
merged PR number  == pendingReview.prNumber
merged PR head    == pendingReview.reviewHeadSha

freshnessAccepted.prHeadSha == merged PR head
freshnessAccepted.sourceObservationDigest
                  == pendingReview.latestObservedSourceObservationDigest
freshnessAccepted.reviewPayloadDigest
                  == pendingReview.reviewPayloadDigest

required review-integrity check   passed for that same head
required freshness check          passed for that same head
required review-resolution check  passed for that same head
```

Then, and only then:

```text
acceptedObservation = freshnessAccepted.sourceObservation
authority           = reviewed-pr
prNumber            = merged Pull Request number
canonicalGitSha     = the canonical merge commit
pendingReview       = cleared
```

Only after that state write succeeds may automation clean up `evidence-watch/review/<sourceId>`, idempotently (above).

The accepted observation is installed from that retained snapshot, never rebuilt from a fresh fetch: the finalizer accepts exactly the source condition that passed the freshness gate for that head.

What happens to `comparisonBaseline` depends on the accepted observation.

**Accepted observation is `available`:**

```text
comparisonBaseline = freshnessAccepted.sourceObservation.fingerprint
authority          = reviewed-pr
```

and the finalizer installs the exact reviewed observation semantics that were bound to the accepted freshness snapshot — never a fresher set read from `main` at reconciliation time:

```text
monitorConfigHash
locatorSetDigest
parserVersion
comparisonDigestVersion
sourceObservationDigestVersion
```

**Accepted observation is `confirmed-missing`:**

```text
acceptedObservation advances to the missing observation
comparisonBaseline  remains the last accepted AVAILABLE fingerprint
```

The finalizer MUST NOT fabricate a `SourceFingerprint` for a missing source, and MUST NOT discard the last available one. That is exactly what makes the following two runs correct:

```text
the same missing observation on the next cron
→ UNCHANGED

the source later returns
→ SOURCE_RETURNED
→ the retained comparisonBaseline still supports a useful comparison
  against the last accepted available material
```

This matters most when the Pull Request is what resolved a `SOURCE_MOVED`, a new URL or selector, a canonicalization change, or any other monitor-configuration change. A successfully reviewed source-move or configuration change must not immediately produce a fake `REBASELINE_REQUIRED` on the next run because operational state still carries the old configuration hash.

If any of those checks fails, the finalizer does not advance either baseline; it raises an operational condition and leaves `pendingReview` intact.

**Fail closed when state cannot be written.** If the canonical Pull Request merged but the `evidence-watch/state` update failed:

```text
STATE_SYNC_ERROR
```

That is an operational failure, and:

- the canonical merge is never rolled back;
- `acceptedObservation` and `comparisonBaseline` must not pretend to have advanced;
- `pendingReview` must not be silently cleared;
- a scheduled run must not open a new evidence Pull Request for the same accepted revision merely because finalization has not synced yet;
- reconciliation is retried idempotently until it succeeds or a maintainer intervenes.

Every scheduled or manual Evidence Watch run therefore reconciles outstanding merged reviews **before** normal classification, so a source with an unsynced accepted resolution is never re-detected as a fresh change. An explicit recovery mode exists for the same work:

```text
workflow_dispatch:
  mode = reconcile
  sourceId = <id | all>
```

`reconcile` never starts a new source review. It only completes deterministic operational state synchronisation from a reviewed, merged resolution it has verified.

### Pre-merge source freshness gate

An Evidence Watch review Pull Request must not merge when the source has changed again after the fingerprint the maintainer reviewed. Phase 9 requires a deterministic freshness check as a required status check on Evidence Watch review Pull Requests (§19, §20):

```text
re-observe the source with the reviewed monitor configuration
→ validate source identity
→ resolve the configured locators
→ canonicalize the material when it is available
→ build the complete SourceObservation
→ recompute sourceObservationDigest
→ compare against pendingReview.latestObservedSourceObservationDigest
```

The gate is the whole observation, never content alone, so it behaves identically for `CONTENT_CHANGED`, `SOURCE_MOVED`, `SOURCE_MISSING`, `SOURCE_RETURNED`, a locator failure and every other deterministic source-side actionable condition. A review whose source content is unchanged but whose availability, effective URL or locator state has moved **fails** freshness.

```text
equal     → the source condition still matches the reviewed one
          → durably record freshnessAccepted {
              prHeadSha,
              sourceObservation,
              sourceObservationDigest, reviewPayloadDigest,
              monitorConfigHash, parserVersion,
              comparisonDigestVersion, sourceObservationDigestVersion,
              checkedAt
            }
          → then report the required check as SUCCESS

different → freshness check FAIL
          → the SAME Draft Pull Request is refreshed
          → the cumulative diff is recomputed
          → AI re-runs only for a NEW sourceObservationDigest,
            and at most once automatically (§14)
          → human review is required again
```

#### A freshness PASS is reported only after it is durable

The order is part of the contract, because a GitHub success that no state backs would let a merge proceed on an acceptance the finalizer cannot verify:

```text
compute a matching SourceObservation
→ CAS-write freshnessAccepted to evidence-watch/state
→ verify the write succeeded for that exact Pull Request head
→ THEN report the required freshness status check as SUCCESS
```

If that state write fails:

```text
freshness check FAIL
→ merge blocked
```

The check never reports success first and tries to persist the acceptance afterwards.

A PASS is bound to an exact pair — the Pull Request head SHA it ran against and the `sourceObservationDigest` it accepted — and is worth nothing outside that pair:

- if the review branch head changes for any reason, the recorded acceptance is invalid and the required check must run again;
- if a scheduled run observes a further upstream revision, it updates the same review Pull Request, updates `reviewHeadSha` and `latestObservedSourceObservationDigest`, invalidates the old `freshnessAccepted`, and human review plus a fresh freshness check are required again;
- the post-merge finalizer may use `freshnessAccepted` only when `merged PR head SHA == freshnessAccepted.prHeadSha`.

This does not promise that upstream cannot change a moment after the check. The requirement is narrower and enforceable: a Pull Request must not merge against a known stale reviewed source observation.

### Operational conditions

Beyond transport and parser errors, these conditions are operational, not evidence changes. This is the final Phase 9 v1 set:

```text
BOOTSTRAP_REQUIRED                 canonical monitor never initialized;
                                   explicit bootstrap required
FETCH_ERROR                        transport/HTTP failure
PARSER_ERROR                       adapter could not parse the response
STATE_MISSING                      initialized source, state file absent
STATE_CORRUPT                      initialized source, state unreadable/invalid
STATE_SYNC_ERROR                   canonical merge stands, state write failed
STATE_SCHEMA_MIGRATION_REQUIRED    state schemaVersion cannot be migrated
                                   deterministically
REBASELINE_REQUIRED                monitorConfigHash / parserVersion /
                                   comparisonDigestVersion /
                                   sourceObservationDigestVersion makes the
                                   stored baselines non-comparable
REVIEW_ARTIFACT_MISSING            state says a review is open, the Pull
                                   Request is gone
REVIEW_STATE_MISMATCH              a Pull Request exists but durable state
                                   cannot be reconciled with it safely
REVIEW_BRANCH_CONFLICT             automated refresh/base sync conflicts with
                                   maintainer edits on the review branch
REVIEW_CLOSED_UNMERGED             review closed without merging, and not a
                                   verified REVIEW_REVERTED_TO_BASELINE
authentication/access failure
persistent adapter failure
```

None of them is a statement about the source's content. Each names a fact about the watcher, its configuration, its state store, or its review artifact, and none may be rendered, reported or classified as an evidence content change.

For every one of them:

- do not advance `acceptedObservation` or `comparisonBaseline`;
- do not establish a new baseline automatically;
- do not report the source as `UNCHANGED`;
- do not report a diff classification for that run;
- they MAY fail the workflow and MAY create/update an operational Issue (§11) — except `BOOTSTRAP_REQUIRED`, which is an expected initialization condition and appears in the workflow summary and observability output without automatically creating an Issue;
- they never create an evidence-change Pull Request unless a real evidence change has also been determined.

`REVIEW_REVERTED_TO_BASELINE` is deliberately **not** in this set. It is a valid deterministic review resolution condition (above), not an operational failure.

`REVIEW_RESOLUTION_INCOMPLETE` is not in this set either. It is a merge-blocking review-gate condition raised by the required review-resolution check when a review Pull Request would merge while the same evidence event is still unresolved (§19). It blocks the merge and leaves both baselines untouched; it is not a watcher defect and never a statement about source content.

#### Recovering missing or corrupt state

`STATE_MISSING` and `STATE_CORRUPT` mean the expected state for an **already-initialized** source is absent or unreadable. Recovery is explicit and ordered:

1. restore the most recent valid state from the Git history of `evidence-watch/state`;
2. validate the restored record for compatibility across **every** semantics field, not just two of them:

```text
schemaVersion
sourceId
monitorConfigHash
locator monitoring semantics (locatorSetDigest)
parserVersion
comparisonDigestVersion
sourceObservationDigestVersion
```

   an incompatible digest version, parser version, monitor configuration or locator scope makes the restored record non-comparable — that is `REBASELINE_REQUIRED`, never a fabricated evidence diff;
3. never derive a new baseline from current upstream merely because the current state was lost.

If no valid baseline can be recovered from that history:

```text
→ hard operational recovery condition
→ no normal source classification
→ no UNCHANGED
→ no bootstrap
→ no baseline advancement
```

Recovery then requires explicit maintainer source verification. Only after the maintainer has verified the current official source against canonical content through the normal reviewed path may an explicit `rebaseline` establish a new baseline, and that baseline is bound to that canonical merge SHA (`authority = manual-rebaseline`, `canonicalGitSha` recorded).

`bootstrap` is never a recovery mechanism for an initialized source. Neither is a state schema migration: `STATE_SCHEMA_MIGRATION_REQUIRED` is resolved by making the migration deterministic, never by re-observing the source and calling the result a baseline (see "State schema version migration" above).

## 22. Initial corpus review policy

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

## 23. Noise and cost invariant

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

## 24. Model independence

The architecture MUST NOT depend on a hard-coded AI provider or model name. Provider, model, reasoning level, and related inference settings are deployment configuration.

Changing the reviewer model MUST NOT change:

- evidence authority;
- canonical data ownership;
- review-state semantics;
- human approval requirements;
- deployment gates.

## 25. Source/legal/operational rules

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

## 26. Observability

Track:

- last successful check per source;
- consecutive failures;
- changed/unchanged counts;
- deterministic metadata-only results, including any that suggest a canonical `SourceRecord` correction a maintainer still has to apply in a normal reviewed Pull Request (§11);
- baseline age and `authority` per source, and sources still awaiting an explicit bootstrap (`BOOTSTRAP_REQUIRED`) or rebaseline;
- manifest lifecycle per source, including `inactive` monitors and sources blocked on `STATE_SCHEMA_MIGRATION_REQUIRED`;
- reviews stuck in the `reserved` phase, and `REVIEW_STATE_MISMATCH` / `REVIEW_BRANCH_CONFLICT` occurrences;
- reviews resolved as `REVIEW_REVERTED_TO_BASELINE`;
- reviews whose branch is behind `main`, and review-integrity check failures;
- AI attempts recorded as `unavailable`/`failed` for the current `sourceObservationDigest` and awaiting an explicit `retry-ai`;
- open `pendingReview` entries whose observed source condition has moved past the last reviewed one;
- reviews repinned because their observation semantics changed on the review branch, and scheduled runs that declined to overwrite a pending observation produced under older `main` semantics;
- deterministic locator monitoring-scope syncs, and locator resolutions that turned actionable;
- review branches awaiting cleanup after a terminal resolution, and stale historical branches that could not be proven safe (`REVIEW_STATE_MISMATCH`);
- source freshness check failures on Evidence Watch review Pull Requests, and freshness acceptances that could not be persisted;
- sources whose accepted observation is a confirmed absence, and `SOURCE_RETURNED` detections;
- source-condition changes detected with an unchanged content digest (moves, locator failures), and the `diffEvidence` basis each open review is running on;
- reviews blocked by `REVIEW_RESOLUTION_INCOMPLETE`;
- merged reviews still awaiting state reconciliation, and `STATE_SYNC_ERROR` occurrences;
- sources parked in an operational recovery state (`REVIEW_CLOSED_UNMERGED`, unrecoverable `STATE_MISSING`/`STATE_CORRUPT`);
- parser failures;
- open Evidence Watch Draft PRs and their age;
- AI Review Summary completed/unavailable/failed counts;
- sources overdue for review;
- claims currently blocked by changed/superseded sources;
- time from detected source change to reviewed release.

## 27. Evidence Watch v1 scope

**Evidence Watch v1** should do only:

1. registry + adapters;
2. durable watcher operational state on the `evidence-watch/state` branch — a `manifest.json` initialization registry plus per-source state — with explicit manual `bootstrap`, `rebaseline`, `reconcile` and `retry-ai` modes (§21);
3. observe the complete source condition into a compact `SourceObservation` identified by the frozen `sha256-v1` `sourceObservationDigest` over canonical JSON v1, compared against a named `acceptedObservation`; plus monitored material compared through the frozen `sha256-v1` `comparisonDigest` against a `comparisonBaseline` kept distinct from it, with `monitorConfigHash` defined over comparison/identity-affecting monitor configuration only (§8);
4. diff + deterministic actionable-change classification, including the conditions that do not depend on a content digest — deterministic source absence (`SOURCE_MISSING`), return (`SOURCE_RETURNED`), moves and locator-resolution failures;
5. source-locator resolution/move detection where configured, over a derived operational `locatorKey` and a `locatorSetDigest` that separates a canonical monitoring-scope change from an upstream source change;
6. source→claim impact mapping through canonical provenance indexes;
7. deterministic structured review payload + Markdown rendering;
8. one idempotent Draft Pull Request per unresolved source, updated in place as further revisions arrive, carrying the AI Review Summary when AI is available and an explicit unavailable/failed status when it is not;
9. three required checks on that Pull Request, each bound to its exact head SHA — deterministic review-integrity, a pre-merge source freshness check over the complete `SourceObservation` whose PASS is reported only after the acceptance is durably written, and a review-resolution check that blocks a merge leaving the evidence event unresolved (`REVIEW_RESOLUTION_INCOMPLETE`) — with the branch required to be current with `main` and human approval required on the latest reviewable head, plus an idempotent post-merge reconciliation that installs the exact accepted observation and the reviewed `monitorConfigHash`/`parserVersion`/`comparisonDigestVersion`/`sourceObservationDigestVersion`, advancing `comparisonBaseline` only when that accepted observation carries material;
10. GitHub Issues for operational failures only;
11. no automatic semantic rewriting of canonical content, and no automatic canonical write into `main` for any outcome — watcher runs persist operational state and the review artifact only;
12. no baseline advancement without a valid resolution, and no silent bootstrap or rebaseline — an initialized source is never re-bootstrapped, and lost state is recovered from state-branch history or by explicit maintainer verification;
13. serialized compare-and-swap writes to a protected `evidence-watch/state` branch, never force-pushed, with state-sync failure failing closed instead of duplicating a review, and a reserve-first review saga so a crash between the GitHub and state writes resumes instead of opening a second Pull Request;
14. review branches that preserve maintainer canonical edits while a review is unresolved — never reset, never force-pushed — with `REVIEW_BRANCH_CONFLICT` failing closed, a new review head SHA for every new `sourceObservationDigest`, observation semantics pinned per open review and repinned when the branch changes them, idempotent branch cleanup after a terminal resolution with each next event branching afresh from `main`, adoption restricted to an open matching Pull Request, and a deterministic `REVIEW_REVERTED_TO_BASELINE` path when upstream returns to the accepted observation;
15. a fetch security contract (scheme/private-network/redirect/size/timeout limits), a public-safe boundary that keeps credentials, signed tokens, session identifiers and secret query parameters out of persisted state, digests, review payloads, AI prompts and logs, and a `licenseMode` boundary on what source material may reach an external AI provider (§6, §8, §14);
16. repository enforcement that keeps populated `evidence/state/**` files off `main` (§20);
17. no requirement that the public production site reflect pending watcher state before the reviewed merge.

This provides most of the safety/maintenance benefit with much lower complexity than an AI-first crawler.

## 28. Later evolution

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
   → auto-updatable by Evidence Watch, on the `evidence-watch/state` branch
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
