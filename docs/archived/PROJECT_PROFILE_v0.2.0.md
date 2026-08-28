# PROJECT_PROFILE — Baby Feed · Play · Sleep Guide

> Canonical project and product contract for a local-first, bilingual web application that provides age-appropriate feeding, play/development, sleep, and safety guidance from birth through the period before age 5.

| Field | Value |
|---|---|
| Document status | Canonical working baseline |
| Profile version | 0.2.0 |
| Last updated | 2026-08-26 |
| Working product name | Baby Feed · Play · Sleep Guide |
| Working repository slug | `baby-guide` |
| Product type | Local-first, static-first responsive web application |
| Coverage | Birth through `< 5 years` |
| Primary jurisdiction | United States |
| Global cross-check | WHO guidance where applicable |
| Canonical medical-content language | English |
| Supported UI/content languages | English and Vietnamese |
| Backend requirement for v1 | None |
| Preferred implementation | Next.js + TypeScript + static export |
| Primary reference prototypes | `Baby-Sleep-Schedule-v33.html`; `ke_hoach_phat_trien_theo_do_tuoi_cho_be_v31_clean_refactor.html` |

---

## 1. Project identity

Baby Feed · Play · Sleep Guide is an evidence-informed parent guidance application. A parent enters the child's name, date of birth, and optional estimated due date once. The app stores the profile locally, calculates relevant age contexts, and presents a structured plan covering:

- feeding: what to offer, how to offer it, developmental readiness, texture progression, responsive feeding, formula/breast-milk handling, allergens, and choking prevention;
- play and development: what skills are emerging, what parents can do during wake periods, and how to adapt activities to the child's observed ability;
- sleep: sleep-duration context, naps, daily rhythm, bedtime routines, settling education, and age-appropriate behavioral sleep methods where appropriate;
- safety: safe sleep, feeding safety, choking, product-independent environmental safety, and reviewed red flags;
- evidence: source attribution, content classification, review status, and last verification date.

The product is a practical guide. It is not a medical record, diagnosis engine, developmental screening test, calorie calculator, emergency service, or substitute for pediatric care.

### 1.1 Product promise

The app should answer five parent questions clearly:

1. **What matters most at my child's current age?**
2. **What can I feed, how should I offer it, and what safety rules apply?**
3. **What should we play or practice now, and why?**
4. **What sleep rhythm is reasonable, and how can we improve sleep safely?**
5. **Which parts are official guidance, typical patterns, or merely example plans?**

### 1.2 Product positioning

The product should feel more trustworthy and structured than a parenting blog while remaining easier to use than clinical guidelines. It translates current official recommendations into practical actions without implying that every child follows an exact schedule or developmental sequence.

---

## 2. Product principles

### 2.1 Evidence before convenience

Health and safety claims must be traceable to approved sources. Simplification must preserve qualifiers, contraindications, uncertainty, and safety conditions.

### 2.2 English is the medical-content source of truth

English content is canonical. Vietnamese content is a paired translation attached to the same stable IDs. Medical meaning, severity, exceptions, quantities, ages, and stop conditions must remain equivalent.

### 2.3 Local-first and private by default

Child profile data and preferences remain in the browser on the current device. v1 has no account, cloud child profile, advertising tracker, or third-party behavioral analytics.

### 2.4 Age-aware, not age-deterministic

Age selects candidate guidance. Age alone never proves feeding readiness, developmental ability, sleep readiness, or medical suitability.

### 2.5 Module-specific age logic

Feeding, play/development, sleep, and safety may use different age bases and boundaries. A universal stage map is prohibited.

### 2.6 Guidance, not compliance scoring

Schedules, activities, wake windows, menus, and routines are planning aids. Do not grade parents or children, calculate stage-completion percentages, or label a child as “behind” from app interaction alone.

### 2.7 Safety overrides optimization

Safe sleep, choking prevention, allergy precautions, formula handling, responsive feeding, and reviewed red flags override schedule neatness or behavioral-training goals.

### 2.8 Progressive disclosure

The first screen is scannable. Detailed rationale, steps, variations, evidence, and sources are expandable.

### 2.9 Explicit evidence labels

Parent-facing content must make it easy to distinguish:

- **Official guidance** — directly supported by an approved authority;
- **Typical pattern** — common developmental or schedule pattern, not a requirement;
- **Example plan** — product-generated practical example;
- **Source-aligned suggestion** — practical advice consistent with sources but not an official directive.

### 2.10 One design system

Light, Dark, responsive, and print layouts share geometry and component behavior. Theme layers change surfaces/colors, not structure.

### 2.11 No silent medical inference

The app must not infer diagnosis, allergy, feeding disorder, developmental delay, sleep disorder, prematurity diagnosis, or medical contraindication from dates or settings.

### 2.12 Actual-child safety context is immutable during browsing

Browsing another stage or previewing a future plan date must never replace safety guidance that applies to the child's actual current context.

---

## 3. Target users

### 3.1 Primary users

- Parents and caregivers of children from birth to before age 5.
- English/Vietnamese bilingual households.
- Parents who want practical daily guidance plus evidence and safety rationale.
- Parents of children born before an estimated due date who need chronological and corrected-development-age context.

### 3.2 Secondary users

- Grandparents and caregivers using a printed plan.
- Parents previewing the next stage.
- Parents preparing questions for a pediatric clinician.

### 3.3 Usage assumptions

- The user may have limited medical knowledge.
- The user may be on a phone while actively caring for a child.
- The app may be printed or saved to PDF.
- The app should remain useful if JavaScript storage is blocked, with graceful degradation.

---

## 4. Product scope

### 4.1 In scope for v1

- One locally stored active child profile.
- Child name and date of birth required.
- Estimated due date optional.
- Plan-date preview.
- Chronological age and corrected-development-age context.
- Independent feeding, development/play, and sleep stage engines.
- Combined Today view.
- Feeding guidance from milk feeding through preschool family eating.
- Play/development guidance through `<5 years`.
- Sleep planning with editable wake time, nap pattern, nap durations, and planning style.
- Responsive newborn rhythm mode.
- Safe-sleep guidance.
- Settling education and method-specific behavioral sleep education.
- Formula and breast-milk handling safety content.
- English/Vietnamese content.
- Light/Dark themes.
- Responsive and print layouts.
- Visible evidence classification, sources, and review metadata.
- Static deployment and GitHub-driven release flow.

### 4.2 Explicit non-goals for v1

- Diagnosis or symptom checker.
- Medication/supplement dosing.
- Growth percentile interpretation.
- Vaccine scheduling.
- Personalized therapeutic diets.
- Allergy treatment plans.
- Management of failure to thrive, swallowing disorder, complex prematurity, or chronic disease.
- Exact calorie or ounce enforcement.
- Live sleep/feeding logging, streaks, gamification, or scoring.
- Automated cry/video/audio analysis.
- Community/social features.
- Product recommendations or affiliate links.
- Cloud sync or accounts.
- Multiple children in initial release.
- Live AI-generated medical advice.

### 4.3 Future-compatible but deferred

- Multiple child profiles.
- Optional encrypted sync.
- PWA/offline packs.
- Caregiver share packages.
- Optional logs.
- Clinician-reviewed specialized content packs.
- Additional locales and jurisdictions.
- Optional real-time recall data integration if a reliable source and maintenance plan are approved.

---

## 5. Canonical vocabulary

| Term | Canonical meaning |
|---|---|
| Child profile | Locally stored child name, date of birth, and optional estimated due date. |
| Actual-child context | Real current profile context used for safety and current recommendations. |
| Browsed-content context | Stage the parent manually browses; never replaces actual-child safety context. |
| Plan date | Date used to preview age-specific guidance; defaults to today. |
| Chronological age | Calendar age from birth date to selected plan date. |
| Corrected development age | Developmental age adjusted from estimated due date when the app's preterm proxy is eligible. |
| Likely-preterm due-date proxy | Implementation approximation based on birth occurring more than 21 days before estimated due date; not a diagnosis. |
| Development stage | Range used for milestone context and play suggestions. |
| Feeding stage | Age/readiness/skill context used for feeding guidance. |
| Sleep stage | Age range used for sleep-duration context and schedule defaults. |
| Readiness cue | Observable ability relevant to applying a recommendation. |
| Responsive feeding | Feeding that responds to hunger/fullness and developmental ability without pressure. |
| Wake window | Product planning interval between waking and the next sleep opportunity; a heuristic. |
| Responsive rhythm | Cue-led newborn/young-infant sequence rather than a fixed clock schedule. |
| Safe sleep | Practices intended to reduce sleep-related infant death and injury. |
| Settling education | General routines and parent responses that support sleep without formal behavioral intervention. |
| Behavioral sleep intervention | A structured method intended to reduce assistance needed to fall or return asleep. |
| Official guidance | Claim directly supported by an approved authority. |
| Typical pattern | Common pattern, not a medical requirement. |
| Example plan | Product-generated implementation example. |
| Source-aligned suggestion | Practical advice consistent with sources but not represented as official wording. |
| Red flag | Source-reviewed observation prompting professional advice. |

---

## 6. Child profile and local privacy contract

### 6.1 Profile fields

| Field | Type | Rule |
|---|---|---|
| `name` | string | Required; trim; max 40 chars; render as text only. |
| `dateOfBirth` | local date | Required; valid `YYYY-MM-DD`; cannot be future when saved. |
| `estimatedDueDate` | local date/null | Optional; used only for corrected-development context and explanatory prematurity proxy. |

### 6.2 UI/preferences

| Field | Persistence | Purpose |
|---|---|---|
| `planDate` | session/UI | Preview age-specific guidance; reset to today on fresh visit. |
| `language` | local | `en` or `vi`. |
| `theme` | local | `light` or `dark`. |
| `wakeTimeMinutes` | local | Sleep-plan anchor. |
| `napMode` | local | auto/manual nap count. |
| `napDurations` | local | User-adjusted example nap durations. |
| `wakeWindowAdjustment` | local | shorter/standard/longer heuristic style. |

### 6.3 Privacy rules

- Use `localStorage` for v1.
- Do not use cookies for child data.
- If storage fails, continue for the current session and warn that persistence is unavailable.
- Provide **Clear local data** with confirmation.
- Do not put child data in URLs, telemetry, share parameters, server logs, or third-party analytics.
- Escape all profile strings; never use raw `innerHTML` for user data.

### 6.4 Suggested storage keys

```text
baby-guide.profile.v1
baby-guide.preferences.v1
baby-guide.sleep-settings.v1
baby-guide.content-version.v1
```

### 6.5 Legacy migration candidates

```text
baby-sleep-planner.profile.v1
baby-sleep-planner.settings.v1:*
baby-sleep-planner.settings.v2:*
baby-sleep-planner.settings.v3:*
baby-development-plan-profile-v1
baby-development-plan-theme-v1
baby-development-plan-language-v1
```

---

## 7. Date, age, and stage engine

### 7.1 Date model

Profile dates are calendar dates, not timestamps.

Implementation must:

- parse explicit year/month/day parts;
- avoid timezone-sensitive parsing of bare `YYYY-MM-DD` strings;
- use timezone-independent day serials for date comparisons;
- use clamped calendar-month arithmetic for age;
- use half-open stage ranges `[min, max)`;
- test leap years, February 29, end-of-month dates, DST, and timezone changes.

### 7.2 Chronological age

```text
chronologicalAge = planDate - dateOfBirth
```

Show exact years/months/days plus each module's stage.

### 7.3 Corrected-development-age proxy

Because v1 does not collect gestational age at birth, estimated due date is only an implementation proxy.

```text
earlyByDays = estimatedDueDate - dateOfBirth
likelyPretermByDueDateProxy = earlyByDays > 21
useCorrectedDevelopmentAge = likelyPretermByDueDateProxy
  AND chronologicalAge < 24 months

correctedDevelopmentAge = planDate - estimatedDueDate
```

Rules:

- `>21 days` is a due-date proxy approximating birth before 37 completed weeks; it is **not a diagnosis of prematurity**.
- Do not label the child clinically as premature from this proxy.
- If plan date is before estimated due date, display `before due date` rather than a negative age.
- Show both chronological and corrected ages whenever corrected development age is active.
- Return development/play stage resolution to chronological age at 24 chronological months.
- Future versions may optionally accept clinician-provided gestational age at birth for more precise calculation.

### 7.4 Age basis by domain

| Domain | Primary basis | Rule |
|---|---|---|
| Development/milestone context | corrected development age when eligible; otherwise chronological | Show both ages when corrected age is active. |
| Play | same as development | Respect observed ability and safety. |
| Feeding | chronological age + readiness/skills | Corrected age may be context only, never the sole trigger for solids/texture changes. |
| Sleep duration | chronological age | Use age-specific official source mapping. |
| Safe sleep | actual chronological infant scope + current abilities | Never relaxed because corrected age is lower. |
| Sleep schedule heuristics | chronological age by default | For likely-preterm proxy, show context instead of silently shifting schedules. |
| Behavioral sleep method | chronological age + method prerequisites + medical/feeding context | No universal age alone guarantees suitability. |

### 7.5 Actual vs browsed context

Maintain separate state:

```ts
interface GuidanceContext {
  actualChildContext: ChildAgeContext;
  browsedContentContext?: BrowsedStageContext;
  previewPlanDateContext?: PlanDateContext;
}
```

Invariants:

- Manual browsing never mutates the profile.
- Browsing an older stage never unlocks safety-sensitive recommendations for the actual child.
- Future plan-date preview never replaces real-time safety context.
- Current stage and browsed stage remain visually distinct.

### 7.6 Plan-date preview

- Defaults to today.
- May preview past/future date on or after birth within supported coverage.
- Clearly show a **Previewing guidance for [date]** banner when not today.
- Offer a compact reset-to-today action only when needed.

---

## 8. Domain-specific stage maps

### 8.1 Development/play

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

### 8.2 Feeding

| Stage | Range | Primary focus |
|---|---|---|
| `feed-00-04m` | 0–<4m | Human milk/formula, responsive feeding, bottle/formula safety, hunger/fullness cues. |
| `feed-04-06m` | 4–<6m | **Pre-complementary/readiness education**; milk remains primary; age 4m does not unlock solids. |
| `feed-06-08m` | about 6–<8m | Complementary foods when developmentally ready, iron-rich foods, allergen context, safe textures. |
| `feed-08-12m` | 8–<12m | Texture progression, finger foods, cups, self-feeding, variety. |
| `feed-12-24m` | 12–<24m | Family foods, meals/snacks, milk transition context, cups/utensils. |
| `feed-24-36m` | 2–<3y | Toddler nutrition, picky eating, repeated exposure, self-feeding. |
| `feed-36-60m` | 3–<5y | Preschool family meals, independence, food neutrality, practical portions as examples. |

**Feeding invariant:** crossing 4 months MUST NOT automatically activate solid-food recommendations. Complementary-food guidance begins around 6 months when developmentally ready.

### 8.3 Sleep

| Stage | Range | Planning mode/default |
|---|---|---|
| `sleep-00-02m` | 0–<2m | `responsive-rhythm`; no fixed clock schedule by default. |
| `sleep-02-03m` | 2–<3m | responsive/flexible rhythm; optional example 5-nap pattern. |
| `sleep-03-04m` | 3–<4m | transitional/flexible 4-nap example. |
| `sleep-04-05m` | 4–<5m | 4-nap example. |
| `sleep-05-06m` | 5–<6m | 3-nap example. |
| `sleep-06-07m` | 6–<7m | 3-nap example. |
| `sleep-07-08m` | 7–<8m | 3→2 transition context. |
| `sleep-08-10m` | 8–<10m | 2-nap example. |
| `sleep-10-12m` | 10–<12m | 2-nap example. |
| `sleep-12-15m` | 12–<15m | 2-nap example. |
| `sleep-15-18m` | 15–<18m | 2→1 transition context. |
| `sleep-18-24m` | 18–<24m | 1 midday nap example. |
| `sleep-24-36m` | 2–<3y | 1 nap, gradually shortening. |
| `sleep-36-60m` | 3–<5y | nap optional; quiet time may replace nap. |

Exact nap counts, wake windows, and durations are product heuristics and MUST display **Typical pattern** or **Example plan**, never **Official guidance**.

---

## 9. Information architecture

Primary destinations:

1. **Today**
2. **Feeding**
3. **Play & Development**
4. **Sleep**
5. **Safety & Sources**

Persistent header includes product title, compact child summary, age context, EN/VI, Light/Dark, print, and edit-profile controls.

Use a horizontal navigation row on desktop and compact sticky tabs/segmented navigation on small screens.

---

## 10. Today experience

### 10.1 Purpose

Today is the practical home screen. It combines independent domain outputs without pretending to track actual behavior.

### 10.2 Summary

Show:

- chronological age;
- corrected development age when active;
- development stage;
- feeding stage;
- sleep stage;
- concise “what matters now” summary;
- **Why this stage?** explainer when module stages differ.

Example explanation:

> Play uses corrected development age because the due-date proxy suggests the child was born early. Feeding uses chronological age plus readiness. Sleep planning uses chronological age.

### 10.3 Daily focus cards

Three large baby-modern glass cards:

- **Feed today**
- **Play today**
- **Sleep today**

Each card includes a visible evidence label where appropriate.

### 10.4 Composer rule

The Today composer combines **independent domain recommendations**.

```text
Sleep events may provide temporal structure.
Sleep events MUST NOT determine medical feeding frequency.
Responsive feeding rules override aesthetic timeline spacing.
```

For newborns, the default flow is cue-led:

```text
Feed → brief awake interaction → sleep opportunity → repeat by cues
```

Do not manufacture a strict clock schedule.

For older stages, example events may include wake, milk/meal/snack, play, nap, outdoor/social play, calm play, bedtime routine, and night sleep.

### 10.5 Adjustment drawer

Optional controls:

- wake time;
- automatic/manual nap count;
- nap durations;
- shorter/standard/longer wake-window heuristic;
- active/calm play preference.

Changes update the example plan and persist locally.

---

## 11. Feeding domain contract

### 11.1 Required stage structure

Every stage includes:

1. At a glance
2. Primary nutrition source
3. What to offer
4. How to offer it
5. Frequency/amount context, clearly distinguishing guidance from examples
6. Texture and skill progression
7. Hunger/fullness cues
8. Iron/nutrient priorities where relevant
9. Allergen context where relevant
10. Choking prevention
11. Drinks
12. Foods/drinks to avoid or limit
13. Formula/breast-milk handling where relevant
14. Practical examples
15. When to ask a clinician
16. Sources and review metadata

### 11.2 Complementary-food readiness

Do not implement a simple “all boxes true = medically ready” gate.

Content should distinguish:

**Core official readiness signs**

- sits upright alone or with support;
- controls head and neck;
- opens mouth when food is offered;
- swallows food rather than consistently pushing it back out.

**Additional developmental observations**

- brings objects to mouth;
- reaches/grabs food or objects;
- transfers food toward the back of the tongue to swallow.

The UI presents these as education, not a diagnostic test.

### 11.3 Complementary-food timing

- Introduce foods other than breast milk or infant formula at about 6 months when developmentally ready.
- Do not recommend introduction before 4 months.
- The `feed-04-06m` stage teaches readiness and preparation; it does not automatically prescribe solids.

### 11.4 Texture progression

Progress by observed feeding skill, not date alone. Content must support smooth/mashed, thicker/lumpy, finely chopped/ground, and safe finger-food progression where appropriate.

### 11.5 Responsive feeding

- Recognize hunger/fullness cues.
- Parent/caregiver decides what, when, and where food is offered within age/safety guidance.
- Child decides whether and how much to eat.
- Avoid pressure, forcing, distraction-based coercion, or treating refusal as failure.

### 11.6 Allergen architecture

Do not use one generic “high-risk allergy” switch.

At minimum distinguish:

```text
previous immediate food reaction / known food allergy
severe eczema and/or egg allergy (peanut-specific higher-risk context)
mild-to-moderate eczema
no known eczema/food allergy
```

Rules:

- known allergy or previous immediate reaction → clinician-directed guidance;
- severe eczema and/or egg allergy → peanut-specific clinician/evaluation guidance according to current source;
- mild/moderate eczema does not automatically prohibit home introduction;
- allergen guidance must be source-specific and may differ by allergen.

### 11.7 Choking architecture

Every food example with age-relevant choking risk requires:

- preparation form;
- texture/shape notes;
- seated upright supervision reminder where relevant;
- explicit distinction between gagging education and choking emergency content.

### 11.8 Formula and milk-handling safety

Create a first-class **Feeding Safety** content family:

- powdered infant formula handling;
- ready-to-feed/liquid formula context;
- bottle and preparation hygiene;
- storage/discard rules;
- breast-milk storage/handling;
- contamination/Cronobacter context;
- higher-risk infant context (young infants, preterm, low birthweight, immunocompromised) only when supported by current official sources;
- recall architecture capable of linking to current official FDA information without hard-coding transient recall details into evergreen content.

### 11.9 Feeding content must never do

- prescribe a therapeutic diet;
- diagnose allergy/intolerance;
- demand a fixed ounce/calorie target for all children;
- tell parents to add cereal/food to a bottle for sleep;
- equate gagging with choking;
- imply exact age alone proves readiness.

---

## 12. Play & Development domain contract

### 12.1 Required structure

Every stage includes:

1. At a glance
2. Milestone context
3. Current development focus
4. Gross motor
5. Fine motor/hand-eye
6. Communication/language
7. Cognitive/problem-solving
8. Social-emotional
9. Suggested activities by wake period
10. Easier variation
11. More challenging variation
12. Safety/environment
13. What not to force
14. What to observe
15. When to discuss with a clinician
16. Sources

### 12.2 Milestones are references, not deadlines

Use wording such as “developing toward,” “many children can,” or “reference milestone.” Never turn a stage list into a pass/fail checklist.

### 12.3 Corrected age

When active, development/play stage selection may use corrected development age through chronological age 24 months. Display chronological age beside it.

### 12.4 Activity principles

- Prioritize floor play, back-and-forth interaction, language exposure, movement opportunities, outdoor/social experience, and age-appropriate independence.
- Short repeated sessions are preferred over forced long practice.
- Respect fatigue, distress, and child interest.
- Do not require a specific sequence for variable skills unless an official milestone source supports it.

### 12.5 Red flags

Only include source-reviewed red flags. They are not diagnoses. Loss of previously acquired skills should be treated as an important reason to contact a clinician according to current source wording.

---

## 13. Sleep domain contract

### 13.1 Separate evidence classes

The sleep module must clearly separate:

1. **Official sleep-duration guidance**
2. **Safe-sleep guidance**
3. **Typical nap-transition patterns**
4. **Product heuristic wake windows and exact example schedules**
5. **Settling education**
6. **Behavioral sleep methods**

### 13.2 Official sleep-duration source matrix

Do not attach one generic source to all ages. Maintain an age/claim matrix, for example:

```text
0–3m   → approved newborn/young-infant source(s)
4–11m  → approved infant sleep-duration source(s)
1–2y   → approved toddler source(s)
3–4y   → approved preschool source(s)
```

Each displayed range must resolve to a source that actually covers that age.

### 13.3 Sleep planning modes

```ts
type SleepPlanMode = "responsive-rhythm" | "flexible-example" | "clock-example";
```

Defaults:

- 0–2m → `responsive-rhythm`;
- 2–4m → `responsive-rhythm` or `flexible-example`;
- older infants/toddlers → `clock-example` may be offered as planning aid.

### 13.4 Newborn rule

For newborns/young infants, cue-led sleep and feeding take priority over a neat clock schedule. Exact clock events may be shown only if the parent explicitly requests an example, with a prominent **Example plan** label.

### 13.5 Wake windows and nap durations

Wake windows, nap counts, and exact nap durations are heuristics seeded from the prototype and must never be represented as official medical targets.

### 13.6 Settling education vs behavioral intervention

Maintain two distinct content families.

**Settling education** may include:

- consistent routines;
- reducing stimulation;
- age-appropriate opportunities for independent settling;
- responsive soothing;
- sleep-environment setup.

**Behavioral sleep intervention** includes named/structured methods with explicit prerequisites, steps, stop conditions, and evidence classification.

### 13.7 Age policy

- `<4 months`: responsive settling, routine, and safe sleep only; no formal behavioral protocol.
- `>=4 months`: age-appropriate independent-settling education may appear.
- Formal behavioral methods do **not** receive universal approval merely because the child turned 4 months.
- Each method defines its own minimum age/context, prerequisites, contraindications, and stop conditions.

### 13.8 Method schema

```ts
interface SleepMethod {
  id: string;
  titleKey: string;
  category: "settling" | "behavioral";
  minChronologicalAgeMonths?: number;
  prerequisites: string[];
  notFor: string[];
  steps: string[];
  stopConditions: string[];
  evidenceStrength: EvidenceStrength;
  sourceIds: string[];
  reviewStatus: ReviewStatus;
}
```

### 13.9 Safe sleep scope

Define explicit scope:

```text
fullInfantSafeSleepScope = birth to <12 months
```

Individual safe-sleep claims may have narrower or wider applicability according to their source. The app must not infer “safe to relax” from rolling, corrected age, sleep-training status, or manual browsing.

---

## 14. Safety and escalation contract

### 14.1 Safety content families

- infant safe sleep;
- choking prevention;
- allergen reaction awareness;
- formula/milk handling;
- food preparation;
- developmental/environmental safety;
- reviewed feeding/development/sleep red flags.

### 14.2 Severity levels

```ts
type SafetyLevel = "info" | "caution" | "clinician" | "urgent" | "emergency";
```

Only content with reviewed source support may use `urgent` or `emergency` language.

### 14.3 Escalation rules

- Do not diagnose.
- Use source-aligned language such as “contact your child's clinician” or “seek emergency help” only when supported.
- Do not bury urgent safety content behind optional detail drawers.
- Never let a browsed stage suppress current safety alerts.

---

## 15. Content architecture

### 15.1 Content is data, not component prose

Production health guidance must live in structured content files, not hard-coded JSX/HTML paragraphs.

Suggested layout:

```text
content/
  sources.yaml
  coverage.yaml
  feeding/
    en.yaml
    vi.yaml
  development/
    en.yaml
    vi.yaml
  sleep/
    en.yaml
    vi.yaml
  safety/
    en.yaml
    vi.yaml
```

### 15.2 Claim-level source model

```ts
type GuidanceClass =
  | "official-guidance"
  | "typical-pattern"
  | "example-plan"
  | "source-aligned-suggestion"
  | "product-heuristic";

type EvidenceStrength =
  | "strong"
  | "moderate"
  | "limited"
  | "consensus"
  | "not-applicable";

type ReviewStatus =
  | "draft"
  | "source-verified"
  | "clinical-review-required"
  | "approved"
  | "superseded";

interface Claim {
  id: string;
  textKey: string;
  guidanceClass: GuidanceClass;
  evidenceStrength: EvidenceStrength;
  safetyLevel: SafetyLevel;
  sourceIds: string[];
  reviewedAt: string;
  reviewStatus: ReviewStatus;
}

interface GuidanceBlock {
  id: string;
  titleKey?: string;
  claimIds: string[];
  ageRange?: AgeRange;
  readinessRequirements?: string[];
  tags?: string[];
}
```

### 15.3 Why claim-level citations

A paragraph may contain several claims supported by different authorities. Source attribution belongs at the claim level so an editor can identify exactly what must be re-reviewed when a source changes.

### 15.4 Content coverage matrix

`content/coverage.yaml` must describe required sections for every supported stage/domain/language.

CI fails when a required cell is missing.

Minimum dimensions:

```text
stage × domain × required section × EN × VI × source coverage × review status
```

---

## 16. Internationalization contract

### 16.1 Canonical direction

```text
English authoring → source verification → review → Vietnamese translation → parity validation → release
```

### 16.2 Translation rules

Vietnamese must preserve:

- quantities and units;
- age boundaries;
- negation;
- urgency;
- qualifiers such as “about,” “may,” “when ready,” “not recommended”;
- stop conditions and contraindications;
- evidence labels.

### 16.3 Stable keys

Use semantic IDs, not opaque generated hashes.

Example:

```text
feeding.solids.readiness.head_control
sleep.safe.back_to_sleep
play.4_6m.gross_motor.floor_reach
```

### 16.4 Independent UI language

Language selection must not change profile settings, stage choice, schedule values, or content version.

---

## 17. Evidence and source governance

### 17.1 Source hierarchy

Preferred order:

1. US federal/public-health guidance and primary official publications relevant to the claim.
2. AAP official policy/parent guidance where appropriate.
3. WHO official guidance for global cross-check or where it is the most applicable source.
4. Other professional society or consensus guidance only when needed and explicitly approved.

Blogs, commercial parenting sites, influencer content, and unsourced summaries cannot be canonical medical sources.

### 17.2 Source record

```ts
interface SourceRecord {
  id: string;
  organization: string;
  title: string;
  url: string;
  jurisdiction: "US" | "global" | string;
  publishedAt?: string;
  updatedAt?: string;
  lastVerifiedAt: string;
  status: "current" | "superseded" | "retired";
  supersededBy?: string;
  verifiedTitle?: string;
  contentFingerprint?: string;
  notes?: string;
}
```

### 17.3 Supersession behavior

```text
source becomes superseded
  → dependent claims become review-required
  → CI/release report flags affected content
  → new source is verified
  → claims are revised/approved
```

Never silently keep a superseded source marked current.

### 17.4 Seed source registry

At minimum include and verify current official resources for:

- CDC developmental milestones;
- CDC Infant and Toddler Nutrition;
- Dietary Guidelines for Americans **2025–2030**;
- FDA infant-formula handling/Cronobacter guidance;
- AAP/HealthyChildren corrected age for preterm development;
- AAP safe sleep;
- AAP sleep/settling parent guidance;
- WHO complementary feeding;
- WHO physical activity/sedentary behavior/sleep for children under 5;
- approved allergy-prevention guidance (e.g. NIAID peanut guidance) where used.

### 17.5 Source freshness policy

- Safety-critical sources: verify at least every 6 months and before major release.
- Other medical guidance: verify at least annually and before substantive content changes.
- Automated link checking does not replace human source verification.
- Verification records title, status, update date where available, and whether claim meaning changed.

### 17.6 Current-source correction adopted in v0.2.0

`Dietary Guidelines for Americans, 2025–2030` is the current federal edition. `2020–2025` must be marked superseded and retained only for historical traceability if still referenced by old content.

---

## 18. GUI and design-system contract

### 18.1 Visual direction

Use the sleep prototype as the primary visual reference:

- baby-modern pastel palette;
- translucent/glass surfaces;
- soft blue, peach, green, lavender accents;
- circles and dot motifs;
- restrained shadows;
- friendly but professional typography;
- no cartoon overload.

### 18.2 Theme parity

Light and Dark must have:

- same component geometry;
- equivalent hierarchy;
- equivalent contrast/readability;
- shared spacing/radii;
- theme-specific color tokens only.

### 18.3 Core reusable components

- AppHeader
- ProfileEditor
- ChildSummary
- DomainTabs
- StageNavigator
- GuidanceLabel
- WhyThisStage
- FocusCard
- SafetyCallout
- SourceDrawer
- Timeline
- SleepSummaryBadge
- ActivityCard
- FeedingCard
- MethodCard
- PreviewBanner

### 18.4 Evidence labels in UI

Use compact, non-alarming visual labels:

```text
Official guidance
Typical pattern
Example plan
Practical suggestion
```

Do not hide all classification only inside a source drawer.

### 18.5 Stage navigation

- horizontal stage chips;
- hidden scrollbar;
- left/right arrows;
- touch swipe/drag;
- current-child stage marked separately from manually browsed stage;
- no browsing action changes the actual child stage.

---

## 19. Responsive, print, and accessibility requirements

### 19.1 Responsive

- Mobile-first usable controls.
- No essential hover-only interaction.
- Forms become single-column on narrow screens.
- Long timelines remain readable without horizontal page overflow.

### 19.2 Print

Support Letter and A4.

Print may include:

- current Today plan;
- current feeding/development/sleep stage;
- all stages for reference.

Rules:

- remove controls/navigation;
- preserve meaningful pastel differentiation with print-safe contrast;
- avoid unnecessary page backgrounds/gradients;
- preserve decorative motifs only when they do not waste ink or cause clipped visuals;
- keep logical cards together when practical;
- repeat context headings where multi-page output needs them.

### 19.3 Accessibility

- WCAG-oriented semantic structure.
- Keyboard-operable toggles, tabs, stage navigation, and drawers.
- Visible focus states.
- Proper labels and ARIA only where native semantics are insufficient.
- Screen-reader announcements for changed stage/context, not every decorative update.
- Respect `prefers-reduced-motion`.
- Do not rely on color alone for safety or evidence classification.

---

## 20. Technical architecture

### 20.1 Architecture contract

v1 is static-first and client-personalized.

**Preferred implementation:** Next.js + TypeScript with static export.

Framework choice itself is not an immutable product contract. A replacement is acceptable only if it preserves:

- static deployment;
- strict type safety equivalent to TypeScript;
- build-time content/schema validation;
- client-only child personalization;
- no backend requirement for v1;
- deterministic age/stage engines;
- bilingual build integrity;
- print support.

### 20.2 Suggested modules

```text
src/
  app/
  components/
  domain/
    age/
    feeding/
    development/
    sleep/
    safety/
  content/
  i18n/
  storage/
  styles/
  print/
  tests/
```

### 20.3 Separation rules

- Date/age math cannot live in UI components.
- Content prose cannot be embedded in business logic.
- Translation selection cannot duplicate domain logic.
- Sleep heuristics cannot be stored as medical claims.
- Actual-child safety context cannot be derived from the currently browsed stage component state.

### 20.4 Deployment

Target static hosts, including shared hosting capable of serving generated static files. GitHub-driven deployment is preferred.

---

## 21. Functional requirements

### FR-001 Profile

Create, save, edit, cancel, restore, and clear a local child profile.

### FR-002 Age engine

Calculate chronological and corrected-development-age contexts accurately.

### FR-003 Independent stage resolution

Resolve feeding, development/play, and sleep independently.

### FR-004 Stage explanation

Show **Why this stage?** when domain stage bases differ or corrected age is active.

### FR-005 Browsing isolation

Manual browsing and future preview never change actual-child safety context.

### FR-006 Feeding

Provide what/how/readiness/texture/nutrients/allergens/choking/drinks/formula handling/clinician guidance with claim-level source traceability.

### FR-007 Development

Provide milestone context and practical activity progression without pass/fail framing.

### FR-008 Sleep

Provide official duration context separately from typical patterns and example schedules.

### FR-009 Newborn rhythm

Use responsive-rhythm by default for 0–2 months.

### FR-010 Sleep methods

Separate settling education from formal behavioral methods; enforce method-specific eligibility.

### FR-011 Safe sleep

Always resolve safe-sleep content from actual-child infant scope/current ability, not browsed stage.

### FR-012 Today composer

Combine independent domain outputs; sleep timeline must not dictate medical feeding frequency.

### FR-013 Language/theme

Persist EN/VI and Light/Dark independently of child content state.

### FR-014 Sources

Expose source and review metadata for health-related claims.

### FR-015 Print

Print current plan/stage and supported all-stage references cleanly.

---

## 22. Non-functional requirements

### NFR-001 Privacy

No child profile leaves the browser in v1.

### NFR-002 Performance

Fast static load, minimal JS for initial rendering, no unnecessary third-party scripts.

### NFR-003 Reliability

Graceful operation if local storage is blocked; deterministic output for identical inputs/content version.

### NFR-004 Accessibility

Keyboard, screen reader, contrast, reduced motion, semantic structure, print readability.

### NFR-005 Security

No raw HTML injection of profile data, safe external links, CSP where deployment permits, dependency scanning.

### NFR-006 Maintainability

Strict types, central date utilities, schema-driven content, no duplicated theme geometry, no duplicated EN/VI logic, no production monolithic HTML.

### NFR-007 Traceability

A maintainer can identify claim → source → source status → review → translation state.

### NFR-008 Determinism

Same actual profile, plan date, content version, and preferences produce the same domain stages and example plan.

---

## 23. Testing and verification contract

### 23.1 Date/age tests

Cover:

- same-day birth;
- future birth rejection;
- leap day;
- month-end arithmetic;
- due date before/after birth;
- exactly 21 and 22 days early;
- corrected age before due date;
- transition at 24 chronological months;
- every stage boundary;
- timezone/DST changes;
- invalid plan dates.

### 23.2 Context-isolation tests

- Manual browsing never changes actual-child stage or safety context.
- Future plan preview never changes real-time safety scope.
- Older browsed feeding stage cannot unlock solids/allergens for a younger actual child.
- Browsed toddler sleep stage cannot suppress infant safe-sleep guidance.

### 23.3 Feeding tests

- 4-month birthday alone does not unlock complementary foods.
- Readiness checklist is educational, not an all-true gate.
- Allergy risk branches remain distinct.
- Formula-safety content resolves by relevant age/risk metadata only when source supports it.
- Food examples with choking relevance contain preparation metadata.

### 23.4 Sleep tests

- 0–2m defaults to responsive rhythm.
- Exact newborn schedule requires explicit example mode.
- Sleep events do not set feeding frequency.
- Nap modes 0–6 remain valid where available.
- Wake-window adjustments cannot produce invalid intervals.
- Total sleep math is consistent.
- Heuristic outputs display non-official labels.
- Behavioral methods enforce method-specific prerequisites.

### 23.5 Source/content tests

- Every medical claim has approved source(s).
- Every source ID resolves.
- Superseded sources cannot satisfy a “current source required” rule.
- Dependent claims are flagged when a source becomes superseded.
- Every safety-critical claim has review metadata.
- Coverage matrix is complete.
- EN/VI keys and placeholders match.
- Safety translation parity passes.
- No unsupported HTML.

### 23.6 End-to-end

- First visit/save/return/edit/cancel/clear.
- Storage blocked.
- EN/VI.
- Light/Dark.
- Plan-date preview/reset.
- Stage arrows/swipe.
- Why-this-stage explanation.
- Today adjustments.
- Responsive newborn view.
- Print current and all supported stages.

### 23.7 Visual/accessibility

Capture Light/Dark desktop/mobile, profile states, feeding stage, development stage, newborn rhythm, 6/3/1/0-nap examples, safety callouts, source drawer, Letter print, and A4 print.

---

## 24. MVP completion criteria

Release v1 only when:

1. Local profile works and degrades gracefully without persistence.
2. Age math and corrected-development proxy are boundary-tested.
3. Domain stage engines are independent.
4. Actual/browsed/preview contexts are isolated.
5. Today combines independent domains without turning sleep into a feeding prescription.
6. Newborn mode defaults to responsive rhythm.
7. Every supported stage has complete English content.
8. Vietnamese parity is complete.
9. Feeding covers what, how, readiness, texture, responsive feeding, choking, allergens, and formula/milk handling.
10. Play guidance covers skills, activities, variations, safety, and observations.
11. Sleep separates official ranges, typical patterns, heuristics, settling, and behavioral methods.
12. Full infant safe-sleep content is enforced through `<12 months` unless claim-specific source scope differs.
13. Claim-level sources and review status are visible/traceable.
14. Current source registry contains no known superseded source marked current.
15. Coverage matrix passes.
16. Light/Dark/mobile/Letter/A4 are visually verified.
17. Accessibility, type-check, lint, unit/E2E/content validation, and production build pass.
18. Safety-critical English and Vietnamese content has qualified review before production.

---

## 25. Implementation order

1. Project shell, design tokens, static export, CI.
2. Profile/storage/date utilities/age engine.
3. Actual vs browsed vs preview context model.
4. Source registry, source lifecycle, claim schema, content coverage validation.
5. i18n infrastructure and parity checks.
6. Header/profile/stage navigator/print framework.
7. Development/play migration and source audit.
8. Sleep duration/safe-sleep content and sleep engine migration.
9. Newborn responsive-rhythm mode.
10. Feeding domain including feeding safety/formula handling.
11. Today composer.
12. Settling education and method-specific behavioral sleep library.
13. Full medical-content/source audit, accessibility, visual QA, deployment automation.

Do not build the final Today composer before the independent domain resolvers and safety context isolation are stable.

---

## 26. Prototype inheritance

### 26.1 Inherit from Baby Sleep Schedule v33

- baby-modern glass visual language;
- Light/Dark parity;
- EN/VI controls;
- local profile concept;
- compact header controls;
- age-based nap-pattern seed data;
- editable wake time/nap count/nap duration/wake-window style;
- timeline and sleep summary cards;
- print compaction;
- storage-warning and settings-migration concepts.

### 26.2 Inherit from Development Plan v31

- estimated due date;
- chronological/corrected-age display;
- corrected-development stage context through age 2;
- plan-date preview;
- compact saved-profile summary;
- 0–5 development structure;
- stage arrows/drag/swipe;
- current-stage marker;
- per-stage and all-stage print;
- focus cards and activity slots;
- milestone-as-reference framing;
- bilingual paired content and source notes.

### 26.3 Do not inherit unchanged

- monolithic HTML architecture;
- medical prose embedded in HTML/JS;
- opaque generated i18n keys as the canonical taxonomy;
- fixed newborn clock schedules;
- exact wake windows presented as official guidance;
- a universal stage map;
- source lists attached only at page level;
- outdated/unverified medical text;
- browsed-stage state reused as safety context;
- raw `innerHTML` with profile data.

---

## 27. Decision log

| Decision | Status | Rationale |
|---|---|---|
| English medical content is canonical; Vietnamese is paired | Accepted | Prevents divergent medical meaning. |
| Birth through `<5 years` | Accepted | Matches intended product range. |
| One local child profile in v1 | Accepted | Simpler privacy/UX. |
| No backend required in v1 | Accepted | Personalization is local and deterministic. |
| Domain-specific stage engines | Accepted | Different domains need different rules. |
| Corrected age applies automatically only to development/play | Accepted | Prevents inappropriate propagation into feeding/safety. |
| Due-date `>21 days` rule is a proxy, not diagnosis | Accepted in v0.2.0 | Clarifies clinical meaning. |
| 4–6m feeding stage is readiness education, not automatic solids | Accepted in v0.2.0 | Prevents age-only activation. |
| Newborn sleep defaults to responsive rhythm | Accepted in v0.2.0 | Avoids false clock precision. |
| Sleep does not determine feeding frequency | Accepted in v0.2.0 | Preserves responsive feeding. |
| Settling education and behavioral intervention are separate | Accepted in v0.2.0 | Avoids treating 4 months as universal method approval. |
| Full infant safe-sleep scope is birth to `<12m` | Accepted in v0.2.0 | Makes safety scope explicit. |
| Claim-level source attribution | Accepted in v0.2.0 | Enables precise review. |
| Source lifecycle current/superseded/retired | Accepted in v0.2.0 | Prevents stale guidance from silently persisting. |
| Dietary Guidelines 2025–2030 is current | Accepted in v0.2.0 | Replaces superseded 2020–2025 baseline. |
| Next.js + TypeScript is preferred, not immutable | Accepted in v0.2.0 | Keeps product contract framework-independent. |
| No live AI medical advice | Accepted | Preserves safety and traceability. |
| Baby-modern glass Light/Dark style | Accepted | Explicit design requirement. |

---

## 28. Definition of done for any content change

A content change is not done until:

- English claim text is updated;
- source URL is opened and verified;
- source status is current or intentionally historical;
- claim classification/evidence strength/safety level are correct;
- qualifiers and contraindications are preserved;
- `reviewedAt` and `reviewStatus` are updated;
- Vietnamese translation is updated with semantic parity;
- content coverage and source checks pass;
- affected responsive/print views are reviewed;
- safety-critical changes receive qualified review;
- release notes identify any parent-facing recommendation change.

---

## 29. Final product statement

Baby Feed · Play · Sleep Guide should become a durable local-first parent reference: detailed enough to answer everyday questions, structured enough to remain usable as content grows, transparent enough to show the evidence behind recommendations, and cautious enough to keep examples and generalized guidance from becoming individualized medical advice.
