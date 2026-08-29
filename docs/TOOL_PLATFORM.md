# TOOL_PLATFORM — HowToBaby

> Canonical contract for practical parent-facing utilities. Tools are first-class product features but remain distinct from evidence-backed guidance.

## 1. Principle

HowToBaby may be useful even when a feature is not a medical recommendation.

A **Tool** is functionality that helps a caregiver perform, organize, calculate, play, time, plan, track, or consume something. Its presence in HowToBaby does not imply a health benefit.

## 2. Tool safety/evidence classes

```ts
type ToolClass =
  | "utility"
  | "guidance-linked"
  | "safety-sensitive";
```

### `utility`

No health-benefit claim is required for the tool to be useful.

Examples: lullaby player, ambient sound player, timer, printable routine builder.

### `guidance-linked`

Tool output depends on canonical guidance claims.

Examples: age-aware solids-readiness explainer, stage-specific printable checklist, schedule planner that references official sleep-duration context.

### `safety-sensitive`

Incorrect output could materially change safety behavior.

Examples: future choking-preparation helper or escalation decision flow. These require stricter source/review/test gates and may be excluded from early releases.

## 3. Tool Registry

```ts
interface ToolDefinition {
  id: string;
  slug: string;
  titleKey: string;
  descriptionKey: string;
  category: "sound" | "planning" | "calculator" | "tracking" | "print" | string;
  toolClass: ToolClass;
  ageApplicability?: AgeRange[];
  requiresProfile: boolean;
  worksOffline?: boolean;
  guidanceClaimIds?: string[];
  safetyClaimIds?: string[];
  featureFlags?: string[];
  module: string;
}
```

The Tools hub and navigation are generated from the registry, not hard-coded per tool.

## 4. Initial audio tool family

Suggested early tools:

1. **Lullaby Player**
2. **Ambient / Frequency Player**

These can share one audio engine.

### 4.1 Lullaby Player

Capabilities may include:

- curated/local audio tracks;
- play/pause/stop;
- queue or favorites;
- timer;
- fade-out;
- persistent mini-player;
- optional offline caching/PWA later.

### 4.2 Ambient / Frequency Player

May include:

- continuous tone or mixed ambient sound;
- user-selectable frequencies including 432 Hz;
- presets;
- timer/fade-out.

Product wording must describe 432 Hz as an **audio preference/preset**, not as scientifically proven sleep therapy unless future approved evidence supports a specific claim.

## 5. Audio architecture

Preferred client-side options:

- HTMLMediaElement for encoded tracks;
- Web Audio API for generated tones/mixing/fades;
- AudioContext created/resumed only after user gesture;
- shared `AudioSession` so navigation does not accidentally create multiple concurrent players.

Conceptual API:

```ts
interface AudioSession {
  play(source: AudioSource): Promise<void>;
  pause(): void;
  stop(): void;
  setVolume(value: number): void;
  setTimer(ms?: number): void;
  fadeOut(ms: number): Promise<void>;
}
```

## 6. Audio safety contract

- no autoplay on first visit;
- default UI should encourage moderate device volume without claiming a guaranteed safe sound-pressure level;
- device volume percentage is not equivalent to dB at the child's ear;
- never state that a frequency is medically superior without approved evidence;
- if HowToBaby provides infant sound-exposure/sleep-environment safety guidance, it must come from the canonical guidance graph and cite approved sources;
- audio continues only because the user explicitly started it and should always have an obvious stop path.

## 7. Guidance-linked tools

A guidance-linked tool references canonical claim IDs.

Bad:

```text
Tool hard-codes: "Babies at 6 months should ..."
```

Good:

```text
Tool requests applicable canonical claims
  → resolver selects claims
  → tool renders/organizes output
```

This prevents tool logic from drifting away from public guidance pages.

A guidance-linked Tool also inherits the claim's provenance. If the Tool renders or acts on a health/safety statement, it must be able to expose the same `SourceChip`/`EvidenceDrawer` data as the equivalent guidance page. The Tool must not maintain a separate citation list.

Conceptual dependency:

```text
ToolDefinition.guidanceClaimIds
  → canonical claims
  → ClaimSourceRef/SourceLocator
  → Tool evidence UI
```

If a depended-on source enters `changed-review-required` and the claim is safety-sensitive, the Tool must follow the claim's release/safety policy rather than continuing with a hidden stale copy.

## 8. Calculator tools

Calculators must separate arithmetic from medical interpretation.

Example:

```text
Age Calculator
  → can calculate chronological/corrected context
  → may explain what those ages mean using canonical guidance
  → must not diagnose prematurity or developmental delay
```

## 9. Planning tools

Planning tools may create exact values only when clearly labeled as user settings, examples, or product heuristics.

Examples:

- sleep schedule planner;
- routine builder;
- nap timer;
- meal idea organizer.

Exact output must not be visually mislabeled as official medical targets.

## 10. Tracking tools — future

If logs are added later:

- logging is descriptive, not compliance scoring;
- no automatic diagnosis from patterns;
- profile/log data remains local until an explicit sync architecture is approved;
- streaks and guilt-inducing gamification are discouraged.

## 11. Tool UX contract

Every tool page has:

- purpose;
- controls/output;
- optional age/context relevance;
- tool class/evidence context where needed;
- relevant safety note;
- related guidance links;
- privacy behavior if it stores anything.

## 12. Tool testing

Minimum tests:

- registry schema/slug uniqueness;
- lazy module resolves;
- no tool references missing claim IDs;
- profile-free tools work without profile;
- safety-sensitive tools fail closed if required content is unavailable;
- audio lifecycle survives route changes correctly;
- timer/fade behavior deterministic;
- accessibility of player controls;
- no unsupported medical wording in tool metadata.

## 13. Monetization boundary

A paid tool may be acceptable later if it sells convenience/functionality. A user must not have to pay to access core safety guidance needed to use the tool responsibly.

## Theme independence — v0.6.0

Tool surfaces consume HowToBaby UI primitives and the Theme Contract. Individual tools must not import purchased/third-party theme packages directly. A theme adapter may change presentation, but must not change Tool semantics, safety classification, guidance dependencies, or evidence provenance.


## Media storage boundary — v0.7.0

Tool definitions and audio metadata are canonical Git data; a growing audio/video asset library is not. Tiny license-compatible fixtures may live under the web/tool package for development or an MVP, but production media collections should move to object storage/CDN once they become material in size. Git LFS is not the default media architecture. Asset metadata should preserve stable IDs, source/license/attribution where relevant, and deployment URLs independent from canonical guidance. Repository limits follow `REPOSITORY_HEALTH.md`.


## Asset licensing cross-reference — v0.8.0

Tool code may be AGPL-licensed while audio/images/fonts/other media remain asset-specific. Every production media asset must carry explicit rights metadata and comply with `LICENSING_POLICY.md`; public availability is not proof of redistribution or commercial-use permission.
