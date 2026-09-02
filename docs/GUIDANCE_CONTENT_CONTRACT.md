# GUIDANCE_CONTENT_CONTRACT — HowToBaby

> Canonical detailed contract for evidence-backed guidance domains. Product-level invariants live in `PROJECT_PROFILE_v0.8.0.md`; this document owns age logic, domain stages, content structure, evidence classes, and safety behavior.

## 1. Evidence-to-action model

The canonical graph is:

```text
SourceRecord
  → ClaimSourceRef + SourceLocator
  → Claim
  → Applicability
  → GuidanceBlock / Action
  → Translation
  → Presentation
```

A source is not a UI card. A card is not automatically official guidance.

### Guidance classes

```ts
type GuidanceClass =
  | "official-guidance"
  | "evidence-synthesis"
  | "typical-pattern"
  | "example-plan"
  | "practical-interpretation"
  | "product-heuristic";
```

### Precision classes

```ts
type PrecisionClass =
  | "source-exact"
  | "source-approximate"
  | "source-range"
  | "product-heuristic";
```

`source-approximate` and `source-range` must retain their uncertainty/range in parent-facing rendering. Resolver bins may be exact internally without being presented as medical thresholds.

## 2. Age/context model

- Dates are calendar dates, not timestamps.
- Parse year/month/day explicitly.
- Use timezone-independent day serials for comparisons.
- Use half-open ranges `[min,max)`.
- Test leap day, month end, DST/timezone changes, stage boundaries.

### Corrected-development proxy

```text
earlyByDays = estimatedDueDate - dateOfBirth
likelyPretermByDueDateProxy = earlyByDays > 21
useCorrectedDevelopmentAge = likelyPretermByDueDateProxy
  AND chronologicalAge < 24 months
correctedDevelopmentAge = planDate - estimatedDueDate
```

This is an implementation proxy, not a prematurity diagnosis.

### Age basis by domain

| Domain | Primary basis |
|---|---|
| Development/milestone | corrected development age when eligible; otherwise chronological |
| Play | same as development + observed ability |
| Feeding | chronological age + readiness/skills |
| Sleep duration | chronological |
| Safe sleep | actual chronological infant scope + current abilities |
| Sleep heuristics | chronological by default |
| Behavioral sleep method | chronological + method prerequisites + relevant context |

## 3. Development/Play stages

| Stage | Range |
|---|---|
| `dev-00-02m` | 0–<2m |
| `dev-02-04m` | 2–<4m |
| `dev-04-06m` | 4–<6m |
| `dev-06-09m` | 6–<9m |
| `dev-09-12m` | 9–<12m |
| `dev-12-15m` | 12–<15m |
| `dev-15-18m` | 15–<18m |
| `dev-18-24m` | 18–<24m |
| `dev-24-30m` | 24–<30m |
| `dev-30-36m` | 30–<36m |
| `dev-36-48m` | 3–<4y |
| `dev-48-60m` | 4–<5y |

When using CDC milestone checklists and a child falls between checklist ages, resolve to the younger checklist rather than interpolating a new threshold.

Every stage includes: at-a-glance, milestone context, development focus, gross motor, fine motor/hand-eye, communication, cognitive/problem solving, social-emotional, activities, easier/harder variants, safety/environment, what not to force, what to observe, clinician discussion cues, sources.

Milestones are references, not deadlines or pass/fail scores.

## 4. Feeding stages

| Stage | Range | Primary focus |
|---|---|---|
| `feed-00-04m` | 0–<4m | human milk/formula, responsive feeding, bottle/formula safety, cues |
| `feed-04-06m` | 4–<6m | pre-complementary/readiness education; age 4m does not unlock solids |
| `feed-06-08m` | about 6–<8m | complementary foods when ready, iron-rich foods, allergens, safe textures |
| `feed-08-12m` | 8–<12m | texture progression, finger foods, cups, self-feeding |
| `feed-12-24m` | 12–<24m | family foods, meal/snack rhythm, milk transition |
| `feed-24-36m` | 2–<3y | toddler nutrition, repeated exposure, self-feeding |
| `feed-36-60m` | 3–<5y | preschool family meals, independence, food neutrality |

Feeding stage boundaries are resolver/editorial bins; they are not automatically medical thresholds.

### Feeding invariants

- Do not unlock complementary feeding simply because the child turned 4 months.
- Introduce foods other than milk/formula at about 6 months when developmentally ready, preserving source wording.
- Readiness cues are education, not a diagnostic all-checkbox gate.
- Texture progression follows observed skill as well as age.
- Responsive feeding is the default behavioral frame.
- Allergy architecture distinguishes known/immediate reaction, severe eczema/egg allergy context, mild/moderate eczema, and no known allergy risk where source-specific rules require it.
- Food examples with choking relevance require preparation metadata.
- Formula/breast-milk handling is first-class safety content.

## 5. Sleep stages

| Stage | Range | Planning default |
|---|---|---|
| `sleep-00-02m` | 0–<2m | responsive rhythm |
| `sleep-02-03m` | 2–<3m | responsive/flexible; optional 5-nap example |
| `sleep-03-04m` | 3–<4m | flexible 4-nap example |
| `sleep-04-05m` | 4–<5m | 4-nap example |
| `sleep-05-06m` | 5–<6m | 3-nap example |
| `sleep-06-07m` | 6–<7m | 3-nap example |
| `sleep-07-08m` | 7–<8m | 3→2 transition context |
| `sleep-08-10m` | 8–<10m | 2-nap example |
| `sleep-10-12m` | 10–<12m | 2-nap example |
| `sleep-12-15m` | 12–<15m | 2-nap example |
| `sleep-15-18m` | 15–<18m | 2→1 transition context |
| `sleep-18-24m` | 18–<24m | 1 midday nap example |
| `sleep-24-36m` | 2–<3y | 1 nap gradually shortening |
| `sleep-36-60m` | 3–<5y | nap optional; quiet time may replace nap |

Separate six layers:

1. official sleep-duration guidance;
2. safe-sleep guidance;
3. typical nap-transition patterns;
4. heuristic wake windows/exact example schedules;
5. settling education;
6. behavioral sleep methods.

Nap counts, wake windows, and exact nap durations are `typical-pattern`, `example-plan`, or `product-heuristic`, never official guidance unless a source explicitly supports the exact claim.

### Sleep-method policy

- `<4m`: responsive settling, routine, safe sleep; no formal behavioral protocol.
- `>=4m`: independent-settling education may appear when appropriate.
- Turning 4 months does not automatically approve every formal method.
- Each behavioral method defines minimum context, prerequisites, contraindications/not-for conditions, steps, stop conditions, source support, and review status.

## 6. Safe-sleep and safety scope

```text
fullInfantSafeSleepScope = birth to <12 months
```

Claim-specific scope may differ according to source. Rolling, corrected age, sleep training, or browsed stage never automatically relaxes actual-child safe-sleep rules.

Safety levels:

```ts
type SafetyLevel =
  | "info"
  | "caution"
  | "clinician"
  | "urgent"
  | "emergency";
```

Only source-reviewed content may use `urgent` or `emergency` language.

## 7. Actual vs browsed vs preview context

```ts
interface GuidanceContext {
  actualChildContext?: ChildAgeContext;
  browsedContentContext?: BrowsedStageContext;
  previewPlanDateContext?: PlanDateContext;
}
```

Invariants:

- manual browsing never mutates profile;
- older browsed stages never unlock safety-sensitive guidance for a younger actual child;
- future preview never replaces present safety context;
- actual and browsed stages are visually distinct.

## 8. Now composer

Now combines independent domain recommendations.

```text
Sleep events may provide temporal structure.
Sleep events MUST NOT determine medical feeding frequency.
Responsive feeding overrides aesthetic spacing.
Safety can interrupt or override an example plan.
```

For newborns, default cue-led flow:

```text
Feed → brief awake interaction → sleep opportunity → repeat by cues
```

No false fixed clock schedule by default.

## 9. Content schema

```ts
interface Claim {
  id: string;
  textKey: string;
  guidanceClass: GuidanceClass;
  precisionClass: PrecisionClass;
  safetyLevel: SafetyLevel;
  sourceRefs: ClaimSourceRef[];
  applicability?: string[];
  exclusions?: string[];
  uncertaintyNoteKey?: string;
  reviewedAt: string;
  reviewStatus:
    | "draft"
    | "source-verified"
    | "clinical-review-required"
    | "clinically-reviewed"
    | "release-approved"
    | "superseded";
}
```

A source-supplied evidence grade may be stored only if the source itself grades the recommendation.

`ClaimSourceRef` and `SourceLocator` are defined canonically in `EVIDENCE_PROVENANCE.md`. This document owns the claim's medical/editorial classification; the provenance document owns how supporting sources, locators, original links, and citation surfaces are represented.

Minimum release rule: an `official-guidance` health/safety claim must resolve to at least one approved `primary` or `direct-support` source reference whose scope actually supports the claim.

## 10. Translation contract

Pipeline:

```text
English authoring → source verification → review → Vietnamese translation → parity validation → release
```

Vietnamese must preserve age boundaries, approximate/range language, negation, urgency, quantities, contraindications, stop conditions, applicability conditions, and evidence meaning.

### Vietnamese writing quality

Semantic parity is necessary but not sufficient. Parent-facing Vietnamese must read as natural, professional Vietnamese written for Vietnamese-speaking parents, not as English syntax translated word by word.

- Translate from the canonical English meaning and context, not by polishing a previous machine-like Vietnamese rendering.
- Sentence structure may be reordered, split, or combined when needed for idiomatic Vietnamese, provided the medical/editorial meaning remains unchanged.
- Prefer familiar parent-facing language. Use technical terminology only when it materially improves accuracy and remains understandable to a non-clinical reader.
- Avoid English calques and one-to-one glossary thinking. Terms such as `source`, `claim`, `readiness`, `practical`, and `development` must be translated according to context.
- In **parent-facing Vietnamese evidence/provenance copy**, the generic concept `source` defaults to **`tài liệu`**, not bare **`nguồn`**:
  - `Sources` → `Tài liệu tham khảo`
  - `Original source` → `Tài liệu gốc`
  - `Primary source` → `Tài liệu chính`
  - `Direct support` → `Tài liệu hỗ trợ trực tiếp`
  - `Corroborating source` → `Tài liệu đối chiếu`
  - `Contextual source` → `Tài liệu bổ trợ`
  - `Conflicting source/view` → `Tài liệu có khuyến nghị khác`
  - `Current source version` → `Phiên bản tài liệu hiện tại`
  - `View original source` → `Xem tài liệu gốc`
  - `Why this source is used` → `Vì sao HowToBaby sử dụng tài liệu này`
- This parent-facing rule MUST NOT be applied as a global search-and-replace. Internal identifiers and technical concepts such as `SourceRecord`, `SourceLocator`, `sourceId`, `sourceRefs`, `source of truth`, and `data source` retain their technical meaning/identifier; Vietnamese technical prose may still use `nguồn dữ liệu`, `nguồn chuẩn`, or another context-appropriate term.
- Exact upstream titles, organization names, URLs, canonical IDs, schema identifiers, and the `/sources` route are not translated or renamed by this rule.
- `readiness` should normally read as `dấu hiệu sẵn sàng` or `mức độ sẵn sàng của bé` according to context. `developmental readiness` should use natural wording such as `sẵn sàng về mặt phát triển`, never a literal calque such as `sẵn sàng về phát triển`.
- `practical` should be rendered by meaning — for example `thiết thực`, `dễ áp dụng`, or `áp dụng thực tế` — rather than by a fixed dictionary substitution.
- Never add reassurance, certainty, advice, urgency, or medical meaning that the canonical English does not contain.
- Review Vietnamese in two separate passes: first as standalone native Vietnamese for fluency/clarity, then against English for semantic parity.

A translation that is semantically correct but visibly machine-like is not release-ready. A fluent translation that loses a qualifier, negation, quantity, age boundary, contraindication, applicability condition, or stop condition is also not release-ready.

## 11. Content coverage validation

CI should validate at minimum:

```text
stage × domain × required section × EN × VI × source coverage × review status
```

The machine contract lives in the coverage matrix (packages/knowledge/src/coverage): each
stage × domain cell declares required sections, and each section pins its `requiredClaimIds`, a
`minimumReviewStatus` floor (default `source-verified`; `superseded` never passes), the
`requiredLocales` that must carry the text, and `requireApprovedPrimarySource` for the source
coverage axis (an approved primary/direct source covering the cell's domain).

Separately from coverage, the public release gate is validated on guidance blocks themselves:
any claim rendered by a GuidanceBlock must be in a release-eligible review state, so an
unreviewed claim cannot reach a public route by staying out of the coverage matrix.

Public pages, Personalized Now, print, any guidance-linked tool, and future assistant retrieval must resolve from the same canonical claim IDs.

## 12. Source hierarchy and governance

For U.S.-oriented guidance, prefer applicable sources in this order:

1. current U.S. primary/public-health sources such as CDC, FDA, USDA/HHS, NIH/NICHD or the responsible federal authority;
2. AAP official policy/clinical reports and official parent guidance where AAP is the relevant authority;
3. other U.S. professional-society/consensus guidance when needed and explicitly approved;
4. WHO official guidance for global normative guidance, cross-checking, or when it is the most appropriate authority;
5. high-quality systematic reviews/peer-reviewed evidence only when official guidance does not adequately cover the claim and the evidence is explicitly reviewed for use.

Blogs, retailer/manufacturer marketing, influencer content, search snippets, and unsourced summaries cannot be canonical health sources.

Do not silently merge materially different U.S. and WHO recommendations. For U.S. users, use the applicable U.S. authority as primary and expose meaningful global differences when useful.

Canonical `SourceRecord`, `ClaimSourceRef`, `SourceLocator`, source status, original-link, reuse/syndication, and public citation rules live in `EVIDENCE_PROVENANCE.md`.

This guidance contract adds these domain-level requirements:

- source scope must actually cover the claim's age/context;
- `official-guidance` cannot rely only on contextual/corroborating sources;
- evidence synthesis must record all materially used authorities;
- meaningful U.S./WHO disagreement is preserved, not averaged;
- parent-facing qualifiers and uncertainty must remain faithful to the cited support.

Seed registry should cover at minimum the current applicable CDC developmental/nutrition resources, Dietary Guidelines for Americans 2025–2030, FDA infant-formula/Cronobacter guidance, AAP corrected-age and safe-sleep guidance, WHO infant/young-child feeding and under-5 activity/sleep guidance where used, and approved allergy-prevention guidance such as NIAID peanut guidance when relevant.

## 13. Freshness and supersession

- Safety-critical sources: verify at least every 6 months and before a major release.
- Other health guidance: verify at least annually and before substantive content changes.
- A known new edition/superseding policy triggers prompt review even if the scheduled date has not arrived.
- Automated monitoring can detect change but does not replace semantic review.

Supersession flow:

```text
source superseded
  → dependent claims review-required
  → affected pages/tools flagged
  → replacement source verified
  → claims revised/approved
```

Never keep a known superseded source marked `current`.

Source lifecycle/public status representation is defined in `EVIDENCE_PROVENANCE.md`; automated change detection is defined in `EVIDENCE_UPDATE_ENGINE.md`.

## 14. Honest review states

Do not claim clinical review unless a qualified clinician actually performed it.

For a solo-maintained product:

- faithful restatements of current official guidance may ship as `source-verified` after normal release checks;
- original synthesis that materially changes interpretation, contraindication branching, or urgent/emergency wording should become `clinical-review-required` unless it maps directly and unambiguously to an approved official instruction;
- content awaiting required review must not be presented as clinician-approved.

## 15. Definition of done for a content change

A health-content change is not done until:

- canonical English is updated;
- evidence/guidance/precision/safety classes are correct;
- source URL/title/scope/status are re-verified;
- claim source relationships and practical source locators are captured/updated;
- original-source link resolves or its unavailable status is explicitly recorded;
- qualifiers, uncertainty, contraindications, and stop conditions are preserved;
- relevant source conflicts are checked;
- review timestamps/status are updated;
- Vietnamese semantic parity is updated;
- Evidence Drawer/page References can be generated from the same claim provenance without a manually maintained second citation list;
- source/provenance/coverage/precision validations pass;
- affected public, personalized, print, and guidance-linked Tool surfaces are checked;
- required qualified review is complete before release;
- meaningful recommendation changes are recorded in changelog/release notes.


## Storage invariant — v0.6.0

Canonical provenance/guidance authoring remains in Git-tracked YAML/structured text as defined by `REPOSITORY_STRUCTURE.md`. Generated SQLite/JSON indexes may be used to validate, query, and render this model, but they are disposable projections and must not become an independent editing source of truth.


## Repository storage note — v0.7.0

Canonical claims/provenance remain compact authored Git data. Generated SQLite/indexes and full fetched third-party source bodies are not canonical content and follow `REPOSITORY_HEALTH.md`.

## Licensing boundary — v0.8.0

Canonical claim text authored by HowToBaby may be licensed under `CC-BY-NC-SA-4.0`, but claim provenance must keep upstream source rights distinct. Do not copy authoritative source wording into canonical content merely to make citation easier. Interpretation, quotation, syndication, and copied source material have different rights implications. Canonical details: `LICENSING_POLICY.md`.
