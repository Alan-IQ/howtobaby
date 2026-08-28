# PROJECT_PROFILE — HowToBaby

> Canonical project and product contract for **HowToBaby** — an evidence-to-action, local-first, bilingual parent guidance platform that organizes current authoritative guidance by the child's actual age and context, then turns it into practical, source-traceable actions.

| Field | Value |
|---|---|
| Document status | Canonical working baseline |
| Profile version | 0.3.0 |
| Last updated | 2026-08-26 |
| Product name | HowToBaby |
| Primary domain | `howtobaby.com` |
| Working repository slug | `howtobaby` |
| Product type | Evidence-to-action, local-first, static-first responsive web application |
| Coverage | Birth through `< 5 years` |
| Primary jurisdiction | United States |
| Global cross-check | WHO guidance where applicable |
| Authoritative evidence source of truth | Current approved original sources; HowToBaby does not create medical authority |
| Canonical product-content language | English |
| Supported UI/content languages | English and Vietnamese |
| Current access model | Free |
| Backend requirement for v1 | None |
| Preferred implementation | Next.js + TypeScript + static export |
| Primary reference prototypes | `Baby-Sleep-Schedule-v33.html`; `ke_hoach_phat_trien_theo_do_tuoi_cho_be_v31_clean_refactor.html` |

---

## 1. Project identity

HowToBaby is an **evidence-to-action parent guidance platform**. Its job is not to replace CDC, AAP, FDA, USDA/HHS, NIH, WHO, or other approved authorities. Its job is to make their current guidance usable in real life: select what is relevant to the child's current age/context, preserve the original meaning and uncertainty, organize it, and turn it into practical actions a parent can understand quickly.

A parent may browse general age/topic guidance without creating a profile. For personalized **Now** guidance, the parent may provide the child's date of birth, an optional display name, and an optional estimated due date. The app stores the profile locally, calculates the relevant age contexts, and resolves guidance independently across domains.

Initial domains are:

- **feeding** — what to offer, how to offer it, developmental readiness, texture progression, responsive feeding, formula/breast-milk handling, allergens, and choking prevention;
- **play and development** — what skills are emerging, what parents can do during wake periods, and how to adapt activities to observed ability;
- **sleep** — sleep-duration context, naps, daily rhythm, bedtime routines, settling education, and age-appropriate behavioral sleep methods where appropriate;
- **safety** — safe sleep, feeding/choking safety, environmental safety, and source-reviewed escalation guidance;
- **evidence** — claim provenance, source attribution, content classification, review status, and last verification date.

The domain model must remain extensible. Future areas such as oral health, preventive-care preparation, physical activity, media use, or other age-relevant guidance may be added without changing the core evidence/provenance architecture.

HowToBaby is a practical guide. It is not a medical record, diagnosis engine, developmental screening test, calorie calculator, emergency service, or substitute for pediatric care.

### 1.1 Product promise

Public-facing promise:

> **Know what your child needs. Right now.**

The product should answer these questions clearly:

1. **What matters most at my child's current stage?**
2. **What can I do now?**
3. **Why does this matter?**
4. **What is official guidance, what is a typical pattern, and what is only an example or product heuristic?**
5. **What should I observe without turning normal variation into a pass/fail test?**
6. **When should I ask a clinician or seek urgent help?**
7. **Where did this guidance come from, and when was it last verified?**

### 1.2 Product positioning

HowToBaby should feel more trustworthy and structured than a parenting blog while remaining substantially easier to use than reading multiple clinical/public-health sources independently.

The product advantage is **context and organization, not invented medical knowledge**:

```text
authoritative source
  → verified claim
  → canonical English interpretation
  → age/context applicability
  → practical action
  → parent-facing explanation
  → Vietnamese translation
```

HowToBaby must never imply that it is itself the medical authority behind an official recommendation.

### 1.3 Core interaction model

Whenever practical, guidance should be renderable through five parent-facing layers:

- **Know** — what matters at this stage;
- **Do** — practical action the parent can take;
- **Why** — concise rationale, without overstating evidence;
- **Watch** — normal variability, readiness, limitations, and escalation cues;
- **Source** — authority, source link, evidence class, and last verification date.

This model is a presentation contract, not a requirement to force every small claim into five separate cards.

---

## 2. Product principles

### 2.1 Evidence before convenience

Health and safety claims must be traceable to approved sources. Simplification must preserve qualifiers, contraindications, uncertainty, applicability, and safety conditions.

### 2.2 External authorities are the evidence source of truth; English is the canonical product interpretation

Approved original sources are authoritative for the claims they support. HowToBaby's English content is the canonical **product interpretation** of those sources. Vietnamese content is a paired translation attached to the same stable IDs.

Do not describe HowToBaby-authored prose as the medical source of truth.

### 2.3 Local-first and private by default

Child profile data and preferences remain in the browser on the current device. v1 has no account, cloud child profile, advertising tracker, or third-party behavioral analytics.

### 2.4 Browsing does not require a child profile

General age/topic guidance must remain available without entering a child's name or date of birth. Personalization is an enhancement, not an access gate.

### 2.5 Age-aware, not age-deterministic

Age selects candidate guidance. Age alone never proves feeding readiness, developmental ability, sleep readiness, or medical suitability.

### 2.6 Domain-specific age logic

Feeding, play/development, sleep, safety, and future domains may use different age bases and boundaries. A universal stage map is prohibited.

### 2.7 Personalized context is not personalized medicine

HowToBaby may personalize **which approved guidance is shown and how it is organized** from low-risk profile/context inputs. It must not infer diagnoses, prescribe treatment, or convert generalized guidance into individualized medical orders.

### 2.8 No invented precision

The app must preserve the precision of the source.

If a source says **“around 6 months,”** the product must not transform that into a precise day threshold. If a source provides a broad range, HowToBaby must not create a narrower medical range merely because the child's exact age is known.

Exact schedule times, wake windows, food amounts, stage boundaries, and other product-generated planning values must be clearly classified when they are heuristics or examples.

### 2.9 Guidance, not compliance scoring

Schedules, activities, wake windows, menus, and routines are planning aids. Do not grade parents or children, calculate stage-completion percentages, or label a child as “behind” from app interaction alone.

### 2.10 Safety overrides optimization

Safe sleep, choking prevention, allergy precautions, formula handling, responsive feeding, and reviewed red flags override schedule neatness, engagement optimization, or behavioral-training goals.

### 2.11 Progressive disclosure

The first screen is scannable. Detailed rationale, steps, variations, uncertainty, evidence, and sources are expandable.

### 2.12 Explicit evidence labels

Parent-facing content must make it easy to distinguish:

- **Official guidance** — directly supported by an approved authority;
- **Evidence synthesis** — a transparent synthesis of multiple approved sources;
- **Typical pattern** — common developmental or schedule pattern, not a requirement;
- **Example plan** — product-generated practical example;
- **Practical interpretation** — actionable translation consistent with sources but not represented as official wording;
- **Product heuristic** — planning logic created by HowToBaby and not a medical recommendation.

### 2.13 One design system

Light, Dark, responsive, and print layouts share geometry and component behavior. Theme layers change surfaces/colors, not structure.

### 2.14 No silent medical inference

The app must not infer diagnosis, allergy, feeding disorder, developmental delay, sleep disorder, prematurity diagnosis, or medical contraindication from dates, settings, or interaction patterns.

### 2.15 Actual-child safety context is immutable during browsing

Browsing another stage or previewing a future plan date must never replace safety guidance that applies to the child's actual current context.

### 2.16 Do not silently resolve authoritative disagreement

When credible approved sources differ materially, HowToBaby must not average them into a fabricated consensus. For U.S. guidance, use the approved U.S. source hierarchy and explain meaningful differences when relevant; WHO may be shown as global context.

### 2.17 Trust outranks monetization

Commercial relationships, sponsorship, affiliate revenue, or future paid features must never change canonical evidence, safety wording, source selection, or recommendation ranking.

### 2.18 Nonjudgmental, parent-respecting tone

Avoid fear-based copy, shame, competitive milestone framing, and language that implies a parent has failed because a child does not follow an example schedule or typical pattern.

---

## 3. Target users

### 3.1 Primary users

- Parents and caregivers in the United States with children from birth to before age 5.
- Parents who want an immediate practical answer without reading multiple official documents themselves.
- Parents who want to understand both **what to do** and **why the recommendation exists**.
- English/Vietnamese bilingual households or Vietnamese-speaking caregivers who want content semantically paired to the English canonical version.
- Parents of children born before an estimated due date who need chronological and corrected-development-age context.

### 3.2 Secondary users

- Grandparents and caregivers using a printed plan.
- Parents browsing by age without creating a profile.
- Parents previewing the next stage.
- Parents preparing questions for a pediatric clinician.

### 3.3 Usage assumptions

- The user may have limited medical knowledge.
- The user may be on a phone while actively caring for a child.
- The user may arrive from search directly on an age/topic page, not through the home page.
- The app may be printed or saved to PDF.
- The app should remain useful if local persistence is unavailable, with graceful degradation.
- The user should never need to understand HowToBaby's internal stage model to obtain useful guidance.

---

## 4. Product scope

### 4.1 In scope for v1

- Public browsing by age/topic without a saved child profile.
- One optional locally stored active child profile for personalized **Now** guidance.
- Date of birth required only for personalized age resolution.
- Child display name optional.
- Estimated due date optional.
- Plan-date preview.
- Chronological age and corrected-development-age context.
- Independent feeding, development/play, sleep, and safety resolvers.
- Combined **Now** view.
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
- Visible evidence classification, sources, applicability, and review metadata.
- Public methodology/source/editorial pages.
- Static age/topic pages generated from the same canonical content used by the personalized app.
- Static deployment and GitHub-driven release flow.

### 4.2 Explicit non-goals for v1

- Diagnosis or symptom checker.
- Medication/supplement dosing.
- Growth percentile interpretation.
- Personalized vaccine scheduling.
- Personalized therapeutic diets.
- Allergy treatment plans.
- Management of failure to thrive, swallowing disorder, complex prematurity, or chronic disease.
- Exact calorie or ounce enforcement.
- Live sleep/feeding logging, streaks, gamification, or scoring.
- Automated cry/video/audio analysis.
- Community/social features.
- Product recommendations, sponsored recommendations, or affiliate links.
- Cloud sync or accounts.
- Multiple saved children in initial release.
- Live AI-generated medical advice.
- Monetization as a requirement for v1.

### 4.3 Future-compatible but deferred

- Multiple child profiles.
- Optional encrypted sync.
- PWA/offline packs.
- Caregiver share packages.
- Optional sleep/feed/activity logs.
- Preventive-care/oral-health/media-use/physical-activity domains after source and scope review.
- Clinician-reviewed specialized content packs.
- Additional locales and jurisdictions.
- Optional real-time recall data integration if a reliable source and maintenance plan are approved.
- A source-grounded HowToBaby assistant under the policy in §31.
- Paid convenience features that do not place core evidence or safety guidance behind a paywall.

---

## 5. Canonical vocabulary

| Term | Canonical meaning |
|---|---|
| Authoritative source | Approved external organization/publication that supports a claim. |
| Canonical English interpretation | HowToBaby's reviewed English rendering of source meaning; canonical for product content and translation, but not itself the external medical authority. |
| Child profile | Optional locally stored display name, date of birth, and optional estimated due date. |
| Actual-child context | Real current profile context used for current recommendations and safety. |
| Browsed-content context | Stage/age the parent manually browses; never replaces actual-child safety context. |
| Plan date | Date used to preview age-specific guidance; defaults to today. |
| Chronological age | Calendar age from birth date to selected plan date. |
| Corrected development age | Developmental age adjusted from estimated due date when the app's due-date proxy is eligible. |
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
| Evidence synthesis | Product statement transparently combining compatible approved sources. |
| Typical pattern | Common pattern, not a medical requirement. |
| Example plan | Product-generated implementation example. |
| Practical interpretation | Actionable product wording consistent with a source but not represented as the source's official wording. |
| Product heuristic | HowToBaby-created planning logic that is not a medical recommendation. |
| Red flag | Source-reviewed observation prompting professional advice or escalation. |
| Source conflict | Material difference between approved sources that cannot be safely collapsed into one statement. |
| Content version | Immutable identifier for the reviewed content dataset used to generate a page/output. |

---

## 6. Child profile and local privacy contract

### 6.1 Profile modes

HowToBaby supports two modes:

1. **Browse mode** — no child profile required; user chooses an age/stage/topic manually.
2. **Personalized mode** — date of birth resolves the child's current context and powers the **Now** view.

### 6.2 Profile fields

| Field | Type | Rule |
|---|---|---|
| `name` | string/null | Optional display-only personalization; trim; max 40 chars; render as text only. |
| `dateOfBirth` | local date/null | Required for personalized mode; valid `YYYY-MM-DD`; cannot be future when saved. |
| `estimatedDueDate` | local date/null | Optional; used only for corrected-development context and explanatory prematurity proxy. |

If no name is provided, use neutral copy such as **your baby/your child** rather than forcing a name.

### 6.3 UI/preferences

| Field | Persistence | Purpose |
|---|---|---|
| `planDate` | session/UI | Preview age-specific guidance; reset to today on fresh visit. |
| `language` | local | `en` or `vi`. |
| `theme` | local | `light` or `dark`. |
| `wakeTimeMinutes` | local | Sleep-plan anchor. |
| `napMode` | local | auto/manual nap count. |
| `napDurations` | local | User-adjusted example nap durations. |
| `wakeWindowAdjustment` | local | shorter/standard/longer heuristic style. |

### 6.4 Privacy rules

- Use `localStorage` for v1 personalized persistence.
- Do not use cookies for child data.
- Do not require a profile to access public guidance.
- If storage fails, continue for the current session and warn that persistence is unavailable.
- Provide **Clear local data** with confirmation.
- Do not put child name, date of birth, estimated due date, or derived exact age in URLs, telemetry, share parameters, server logs, or third-party analytics.
- Public share/deep-link URLs may encode a broad age/topic slug only when it does not reveal a child's profile.
- Escape all profile strings; never use raw `innerHTML` for user data.
- Do not sell or expose child profile data to advertisers or commercial partners.

### 6.5 Suggested storage keys

```text
howtobaby.profile.v1
howtobaby.preferences.v1
howtobaby.sleep-settings.v1
howtobaby.content-version.v1
```

### 6.6 Legacy migration candidates

```text
baby-guide.profile.v1
baby-guide.preferences.v1
baby-guide.sleep-settings.v1
baby-guide.content-version.v1
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

Show exact years/months/days plus each module's stage in personalized mode. Public browse pages may show only the selected age/stage.

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
- When using CDC milestone checklists and the child falls between two checklist ages, resolve to the younger checklist as CDC instructs; do not interpolate a new milestone threshold.
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

**Feeding invariant:** crossing 4 months MUST NOT automatically activate solid-food recommendations. Complementary-food guidance begins around 6 months when developmentally ready. Feeding-stage ranges are editorial/resolver bins; they must not be presented as proof that a medical recommendation changes at an exact birthday unless the underlying source defines that threshold.

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

1. **Now** — personalized current-stage guidance when a profile is available; otherwise an invitation to choose age or personalize.
2. **Feeding**
3. **Play & Development**
4. **Sleep**
5. **Safety**

Sources are available contextually from every claim/block and through dedicated **Sources / Methodology** pages; source transparency must not depend on a single navigation destination.

Persistent header includes product name, compact child summary when available, age context, EN/VI, Light/Dark, print, and edit-profile controls.

Use a horizontal navigation row on desktop and compact sticky tabs/segmented navigation on small screens.

Public age/topic routes must be usable without a profile and must render from the same canonical content dataset as personalized views.

---

## 10. Now experience

### 10.1 Purpose

**Now** is the practical home screen for personalized mode. It answers: **“Given my child's current stage, what matters now and what can I do?”** It combines independent domain outputs without pretending to track actual behavior or provide individualized medical care.

When no profile exists, the page offers two clear paths: **Browse by age** or **Personalize locally**.

### 10.2 Summary

Show:

- chronological age;
- corrected development age when active;
- development stage;
- feeding stage;
- sleep stage;
- concise **What matters now** summary;
- **Why this stage?** explainer when module stages differ;
- content review/freshness summary with links to sources/methodology.

Example explanation:

> Play uses corrected development age because the due-date proxy indicates corrected-age context is applicable. Feeding uses chronological age plus readiness. Sleep planning uses chronological age.

Do not label the child clinically as premature from the due-date proxy.

### 10.3 Current-focus cards

Use four prominent cards:

- **Feed now**
- **Play & develop now**
- **Sleep now**
- **Safety now**

Cards should prioritize a small number of high-value actions. They are entry points into deeper domain content, not a complete dump of everything relevant to the age.

Where useful, each action supports the **Know → Do → Why → Watch → Source** pattern.

### 10.4 Composer rule

The Now composer combines **independent domain recommendations**.

```text
Sleep events may provide temporal structure.
Sleep events MUST NOT determine medical feeding frequency.
Responsive feeding rules override aesthetic timeline spacing.
Safety guidance can interrupt or override an example plan.
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

Changes update the **Example plan** only and persist locally. They must not rewrite official guidance, safety rules, or claim applicability.

### 10.6 No false personalization

Personalized copy may say **“At this stage”** or **“For a child around this age”** when that is what the evidence supports. Do not use an exact age to create an impression of precision that is absent from the source.

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
  methodology.yaml
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

### 15.2 Evidence-to-action layers

Keep these concepts distinct:

```text
SourceRecord
  → Claim
  → Applicability
  → GuidanceBlock / Action
  → Translation
  → Presentation
```

A source is not a UI card. A UI card is not automatically an official recommendation. The model must preserve that distinction.

### 15.3 Claim-level source model

```ts
type GuidanceClass =
  | "official-guidance"
  | "evidence-synthesis"
  | "typical-pattern"
  | "example-plan"
  | "practical-interpretation"
  | "product-heuristic";

type EvidenceStrength =
  | "source-graded"
  | "consensus"
  | "not-rated"
  | "not-applicable";

type ReviewStatus =
  | "draft"
  | "source-verified"
  | "clinical-review-required"
  | "clinically-reviewed"
  | "release-approved"
  | "superseded";

type PrecisionClass =
  | "source-exact"
  | "source-approximate"
  | "source-range"
  | "product-heuristic";

interface Claim {
  id: string;
  textKey: string;
  guidanceClass: GuidanceClass;
  evidenceStrength: EvidenceStrength;
  evidenceGrade?: string;
  evidenceGradeSourceId?: string;
  precisionClass: PrecisionClass;
  safetyLevel: SafetyLevel;
  sourceIds: string[];
  sourceSupport: "direct" | "synthesized" | "contextual";
  applicability?: string[];
  exclusions?: string[];
  uncertaintyNoteKey?: string;
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
  actionKeys?: string[];
  rationaleKeys?: string[];
  watchKeys?: string[];
}
```

`evidenceGrade` may only reproduce or normalize a grading system actually supplied by an approved source. HowToBaby must not invent a Strong/Moderate/Weak evidence grade when the source did not grade the recommendation.

### 15.4 Precision preservation rule

`precisionClass` constrains rendering and resolver behavior.

Examples:

- `source-approximate` such as **around 6 months** may not become an exact day boundary in parent-facing medical guidance;
- `source-range` must retain the supported range;
- `product-heuristic` may produce exact planning values only when clearly labeled as a heuristic/example;
- a resolver may use technical boundaries internally but must not misrepresent them as external medical thresholds unless the source actually defines them.

### 15.5 Why claim-level citations

A paragraph may contain several claims supported by different authorities. Source attribution belongs at the claim level so an editor can identify exactly what must be re-reviewed when a source changes.

### 15.6 Content coverage matrix

`content/coverage.yaml` must describe required sections for every supported stage/domain/language.

CI fails when a required cell is missing.

Minimum dimensions:

```text
stage × domain × required section × EN × VI × source coverage × review status
```

### 15.7 Public and personalized views share one content graph

Do not maintain separate medical prose for SEO pages and the personalized app. Public age/topic pages, the Now experience, print views, and future assistant retrieval must resolve from the same reviewed claim/content graph.

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

For U.S.-oriented guidance, prefer sources in this order when they are applicable to the claim:

1. **Current U.S. primary/public-health sources** — e.g. CDC, FDA, USDA/HHS, NIH/NICHD or other responsible federal source.
2. **AAP official policy/clinical reports and official parent guidance** where the AAP is the relevant authority.
3. **Other U.S. professional-society or consensus guidance** only when needed and explicitly approved.
4. **WHO official guidance** for global normative guidance, cross-checking, or where it is the most appropriate authority.
5. **High-quality systematic reviews/peer-reviewed evidence** when official guidance does not adequately cover a claim and the evidence is explicitly reviewed for product use.

Blogs, commercial parenting sites, influencer content, retailer/manufacturer marketing, search snippets, and unsourced summaries cannot be canonical medical sources.

### 17.2 Jurisdiction and source-conflict policy

- The primary user-facing jurisdiction is the United States.
- Do not silently merge materially different U.S. and WHO recommendations.
- Prefer the current, in-scope U.S. authority for U.S.-specific user guidance when a conflict exists.
- WHO may be shown as **Global guidance** where useful.
- When two approved authorities remain materially different and both are relevant, represent the difference explicitly or withhold a simplified recommendation until reviewed.
- More recent is not automatically more authoritative; source scope, authority, supersession status, and applicability all matter.

### 17.3 Source record

```ts
type SourceTier =
  | "us-primary"
  | "professional-authority"
  | "global-authority"
  | "evidence-review";

interface SourceRecord {
  id: string;
  organization: string;
  title: string;
  url: string;
  tier: SourceTier;
  jurisdiction: "US" | "global" | string;
  publishedAt?: string;
  updatedAt?: string;
  lastVerifiedAt: string;
  nextReviewAt?: string;
  status: "current" | "superseded" | "retired";
  supersededBy?: string;
  verifiedTitle?: string;
  sourceLocator?: string;
  contentFingerprint?: string;
  notes?: string;
}
```

`sourceLocator` may identify a section, table, recommendation number, or page where useful. Avoid storing unnecessary long copyrighted excerpts merely to prove provenance.

### 17.4 Supersession behavior

```text
source becomes superseded
  → dependent claims become review-required
  → CI/release report flags affected content
  → new source is verified
  → claims are revised/approved
```

Never silently keep a superseded source marked current.

### 17.5 Seed source registry

At minimum include and verify current official resources for:

- CDC **Learn the Signs. Act Early.** developmental milestones/checklists;
- CDC Infant and Toddler Nutrition;
- Dietary Guidelines for Americans **2025–2030**;
- FDA infant-formula handling/Cronobacter guidance;
- AAP/HealthyChildren corrected-age guidance where used;
- AAP safe-sleep policy/technical guidance;
- AAP sleep/settling parent guidance where used;
- WHO complementary feeding / infant and young child feeding;
- WHO physical activity/sedentary behavior/sleep for children under 5 where used;
- approved allergy-prevention guidance such as NIAID peanut guidance when relevant.

### 17.6 Source freshness policy

- Safety-critical sources: verify at least every 6 months and before a major release.
- Other health guidance: verify at least annually and before substantive content changes.
- A source with a known newer edition or superseding policy must be reviewed promptly even if the scheduled verification date has not arrived.
- Automated link/update checking may flag changes but does not replace semantic human verification.
- Verification records title, status, update date where available, relevant scope, and whether claim meaning changed.

### 17.7 Review claims honestly

Do not label content **clinically reviewed** unless a qualified clinician actually reviewed it.

For a solo-maintained product:

- direct, faithful restatements of current official guidance may ship as `source-verified` when all normal release checks pass;
- original synthesis that materially changes interpretation, safety-critical branching, contraindication logic, or `urgent`/`emergency` wording should be marked `clinical-review-required` unless it maps directly and unambiguously to an approved official instruction;
- content awaiting required review must not be presented as clinician-approved.

This keeps the launch standard rigorous without falsely claiming a clinical review process that does not exist.

### 17.8 Current-source correction retained from v0.2.0

`Dietary Guidelines for Americans, 2025–2030` is the current federal edition. `2020–2025` must be marked superseded and retained only for historical traceability if old content still references it.

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
Evidence synthesis
Typical pattern
Example plan
Practical interpretation
Product heuristic
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

- current Now plan;
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
- public profile-free age/topic pages;
- no backend requirement for v1;
- deterministic age/stage/domain resolvers;
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

### 20.3 Domain registry

Avoid hard-wiring the entire product to exactly three guidance domains.

```ts
type GuidanceDomainId =
  | "feeding"
  | "development"
  | "sleep"
  | "safety";

interface GuidanceDomainDefinition {
  id: GuidanceDomainId | string;
  resolveContext: string;
  contentCoverageKey: string;
  navPlacement?: string;
}
```

Future domains should be addable through the same content/provenance contract rather than requiring a new parallel architecture.

### 20.4 Separation rules

- Date/age math cannot live in UI components.
- Content prose cannot be embedded in business logic.
- Translation selection cannot duplicate domain logic.
- Sleep heuristics cannot be stored as medical claims.
- Actual-child safety context cannot be derived from the currently browsed stage component state.
- SEO/public pages cannot fork or rewrite medical guidance separately from the canonical content graph.
- Monetization code cannot alter claim resolution or evidence ranking.

### 20.5 Deployment

Target static hosts, including shared hosting capable of serving generated static files. GitHub-driven deployment is preferred.

Public age/topic pages should be pre-rendered where practical. Personalized profile data is applied only in the client and must never be required at build time or sent to the server.

---

## 21. Functional requirements

### FR-001 Browse without profile

Allow useful age/topic guidance without collecting child data.

### FR-002 Profile

Create, save, edit, cancel, restore, and clear an optional local child profile. Date of birth is required only for personalized mode; display name is optional.

### FR-003 Age engine

Calculate chronological and corrected-development-age contexts accurately.

### FR-004 Independent domain resolution

Resolve feeding, development/play, sleep, and safety independently.

### FR-005 Stage explanation

Show **Why this stage?** when domain age bases differ or corrected age is active.

### FR-006 Browsing isolation

Manual browsing and future preview never change actual-child safety context.

### FR-007 Feeding

Provide what/how/readiness/texture/nutrients/allergens/choking/drinks/formula handling/clinician guidance with claim-level source traceability.

### FR-008 Development

Provide milestone context and practical activity progression without pass/fail framing.

### FR-009 Sleep

Provide official duration context separately from typical patterns and example schedules.

### FR-010 Newborn rhythm

Use responsive-rhythm by default for 0–2 months.

### FR-011 Sleep methods

Separate settling education from formal behavioral methods; enforce method-specific eligibility.

### FR-012 Safe sleep

Always resolve safe-sleep content from actual-child infant scope/current ability, not browsed stage.

### FR-013 Now composer

Combine independent domain outputs; sleep timeline must not dictate medical feeding frequency; safety may override example-plan composition.

### FR-014 Evidence-to-action presentation

Support Know/Do/Why/Watch/Source presentation where appropriate without changing claim meaning or precision.

### FR-015 Language/theme

Persist EN/VI and Light/Dark independently of child content state.

### FR-016 Sources and trust metadata

Expose source, evidence class, applicability, review date/status, and methodology entry points for health-related claims.

### FR-017 Public content routes

Generate profile-free age/topic pages from the same canonical content graph used by personalized views.

### FR-018 Print

Print current plan/stage and supported all-stage references cleanly.

---

## 22. Non-functional requirements

### NFR-001 Privacy

No child profile leaves the browser in v1. General guidance must be usable without a profile.

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

A maintainer can identify presentation → action/guidance block → claim → source → source status → review → translation state.

### NFR-008 Determinism

Same actual profile, plan date, content version, and preferences produce the same domain stages and example plan.

### NFR-009 Precision integrity

No renderer, resolver, localization layer, or personalized composer may increase medical precision beyond what the underlying claim/source supports.

### NFR-010 Commercial independence

Ads, sponsorships, affiliate metadata, or paid entitlements must not affect medical/safety content, claim ranking, or source resolution.

### NFR-011 Content consistency

Public SEO pages, personalized views, print views, and future retrieval interfaces must not maintain divergent canonical health guidance.

---

## 23. Testing and verification contract

### 23.1 Date/age tests

Cover:

- same-day birth;
- future birth rejection;
- browse mode with no DOB;
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
- Browse mode never accidentally creates/stores a child profile.

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

### 23.5 Precision and provenance tests

- `source-approximate` claims cannot render as exact medical thresholds.
- `source-range` claims retain the supported range.
- `product-heuristic` exact values always display a non-official label.
- `Official guidance` cannot be assigned without direct approved-source support.
- `Evidence synthesis` retains all required source IDs.
- Source conflict fixtures cannot silently collapse into one fabricated official claim.

### 23.6 Source/content tests

- Every health/medical claim has approved source(s) or an explicit non-medical heuristic classification.
- Every source ID resolves.
- Superseded sources cannot satisfy a `current source required` rule.
- Dependent claims are flagged when a source becomes superseded.
- Every safety-critical claim has review metadata.
- No claim is labeled clinically reviewed without corresponding review metadata.
- Coverage matrix is complete.
- EN/VI keys and placeholders match.
- Safety translation parity passes.
- No unsupported HTML.

### 23.7 Public/personalized consistency tests

- Public age/topic page and personalized view resolve the same canonical claim IDs for equivalent context.
- No child profile values appear in generated URLs or static output.
- Search/SEO metadata does not introduce unsupported health claims.

### 23.8 End-to-end

- Browse without profile.
- First personalized visit/save/return/edit/cancel/clear.
- Storage blocked.
- EN/VI.
- Light/Dark.
- Plan-date preview/reset.
- Stage arrows/swipe.
- Why-this-stage explanation.
- Now adjustments.
- Responsive newborn view.
- Sources/methodology access.
- Print current and all supported stages.

### 23.9 Visual/accessibility

Capture Light/Dark desktop/mobile, browse/no-profile state, saved-profile states, feeding stage, development stage, newborn rhythm, 6/3/1/0-nap examples, safety callouts, source drawer, Letter print, and A4 print.

---

## 24. MVP completion criteria

Release v1 only when:

1. Profile-free browsing is useful and does not require child data.
2. Optional local profile works and degrades gracefully without persistence.
3. Age math and corrected-development proxy are boundary-tested.
4. Domain resolvers are independent.
5. Actual/browsed/preview contexts are isolated.
6. Now combines independent domains without turning sleep into a feeding prescription.
7. Newborn mode defaults to responsive rhythm.
8. Every supported stage has complete English content.
9. Vietnamese parity is complete.
10. Feeding covers what, how, readiness, texture, responsive feeding, choking, allergens, and formula/milk handling.
11. Play guidance covers skills, activities, variations, safety, and observations.
12. Sleep separates official ranges, typical patterns, heuristics, settling, and behavioral methods.
13. Full infant safe-sleep content is enforced through `<12 months` unless claim-specific source scope differs.
14. Claim-level sources, evidence class, precision, and review status are visible/traceable.
15. No known superseded source is marked current.
16. Source-conflict and no-invented-precision tests pass.
17. Public age/topic pages and personalized views resolve from the same canonical content graph.
18. Methodology, Sources, Editorial Policy, and Medical Disclaimer pages are published.
19. Coverage matrix passes.
20. Light/Dark/mobile/Letter/A4 are visually verified.
21. Accessibility, type-check, lint, unit/E2E/content validation, and production build pass.
22. Any content that requires qualified clinical review under §17.7 is either reviewed or excluded from production; the product never falsely claims clinician review.

---

## 25. Implementation order

1. Rename/brand project as HowToBaby; establish domain, design tokens, static export, and CI.
2. Source registry, evidence classes, precision model, source lifecycle, and content schema.
3. Profile-free browse shell plus optional profile/storage/date utilities/age engine.
4. Actual vs browsed vs preview context model.
5. i18n infrastructure and parity checks.
6. Public route framework, header/profile/stage navigator, Sources/Methodology trust pages, and print framework.
7. Development/play migration and source audit.
8. Sleep duration/safe-sleep content and sleep engine migration.
9. Newborn responsive-rhythm mode.
10. Feeding domain including feeding safety/formula handling.
11. Safety resolver and Now composer.
12. Settling education and method-specific behavioral sleep library.
13. Static age/topic page generation from the canonical content graph.
14. Full source/precision/content audit, accessibility, visual QA, and deployment automation.

Do not build the final Now composer before independent domain resolvers, claim provenance, precision rules, and safety-context isolation are stable.

Do not add monetization or AI before the canonical content/source pipeline is trustworthy.

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
| Product brand is HowToBaby / `howtobaby.com` | Accepted in v0.3.0 | Aligns the product with the broader evidence-to-action mission rather than a three-tool bundle. |
| Public promise: “Know what your child needs. Right now.” | Accepted in v0.3.0 | Captures the core value of contextualizing official guidance. |
| External approved sources are authoritative; English is canonical product interpretation | Accepted in v0.3.0 | Avoids implying HowToBaby-authored prose is itself medical authority. |
| Browse without profile | Accepted in v0.3.0 | Improves privacy, accessibility, public usefulness, and discoverability. |
| Child display name optional | Accepted in v0.3.0 | Name is cosmetic and should not be required personal data. |
| No invented precision | Accepted in v0.3.0 | Exact child age must not create false exactness beyond source guidance. |
| Know/Do/Why/Watch/Source presentation model | Accepted in v0.3.0 | Converts evidence into useful action while preserving rationale and provenance. |
| Public and personalized views use one canonical content graph | Accepted in v0.3.0 | Prevents SEO/app content drift. |
| U.S. guidance is primary; WHO is global cross-check/context | Accepted in v0.3.0 | Matches primary jurisdiction while preserving global authority context. |
| Source disagreement is never silently averaged | Accepted in v0.3.0 | Prevents fabricated consensus. |
| Core evidence/safety guidance remains free | Accepted in v0.3.0 | Protects mission and trust if monetization is added later. |
| Commercial relationships cannot alter canonical guidance | Accepted in v0.3.0 | Separates evidence from revenue incentives. |
| English product content is canonical; Vietnamese is paired | Retained | Prevents divergent meaning. |
| Birth through `<5 years` | Retained | Matches intended product range. |
| No backend required in v1 | Retained | Personalization is local and deterministic. |
| Domain-specific stage engines | Retained | Different domains need different rules. |
| Corrected age applies automatically only to development/play | Retained | Prevents inappropriate propagation into feeding/safety. |
| Due-date `>21 days` rule is a proxy, not diagnosis | Retained | Matches corrected-age context without clinical labeling. |
| 4–6m feeding stage is readiness education, not automatic solids | Retained | Prevents age-only activation. |
| Newborn sleep defaults to responsive rhythm | Retained | Avoids false clock precision. |
| Sleep does not determine feeding frequency | Retained | Preserves responsive feeding. |
| Settling education and behavioral intervention are separate | Retained | Avoids treating 4 months as universal method approval. |
| Full infant safe-sleep scope is birth to `<12m` | Retained | Makes safety scope explicit. |
| Claim-level source attribution and source lifecycle | Retained | Enables precise review and supersession handling. |
| Dietary Guidelines 2025–2030 is current | Retained | Replaces superseded 2020–2025 baseline. |
| Next.js + TypeScript is preferred, not immutable | Retained | Keeps product contract framework-independent. |
| No live AI medical advice in v1 | Retained | Preserves safety and traceability. |
| Baby-modern glass Light/Dark style | Retained | Explicit design requirement. |

---

## 28. Definition of done for any content change

A content change is not done until:

- the canonical English claim/action text is updated;
- every health/safety statement has the correct evidence class;
- source URL is opened and verified;
- source title/scope/status are confirmed;
- source disagreement has been checked where multiple authorities are relevant;
- claim classification/evidence representation/safety level/precision class are correct;
- any evidence grade shown is source-derived and traceable rather than invented by HowToBaby;
- qualifiers, uncertainty, age ranges, contraindications, and stop conditions are preserved;
- practical interpretation does not introduce a stronger or more precise medical claim than the source supports;
- `reviewedAt` and `reviewStatus` are updated;
- Vietnamese translation is updated with semantic parity;
- content coverage, source, provenance, and precision checks pass;
- public and personalized renderings resolve to the same canonical claim IDs where contexts are equivalent;
- affected responsive/print views are reviewed;
- any required qualified review under §17.7 is complete before release;
- release notes identify meaningful parent-facing recommendation changes.

---

## 29. Trust and monetization boundaries

### 29.1 v1 access model

HowToBaby v1 is free. The project does not need a monetization mechanism to justify release.

### 29.2 What must remain free

Core age-appropriate evidence, safety guidance, source citations, escalation guidance, methodology, and correction notices must not be placed behind a paywall.

### 29.3 Acceptable future paid value

If monetization is introduced later, prefer charging for **convenience and workflow**, not privileged medical knowledge. Examples may include:

- multi-child profiles;
- optional encrypted sync;
- caregiver sharing;
- logs/history;
- reminders and stage-transition notifications;
- advanced print/export;
- cross-device continuity;
- other non-clinical organizational features.

### 29.4 Ads, affiliates, and sponsorship

v1 has none.

If introduced later:

- sponsored/affiliate content must be clearly separated and disclosed;
- it cannot modify canonical recommendations, evidence labels, ranking, or safety content;
- a commercial product must never be presented as medically preferred unless an approved source genuinely supports that claim;
- child profile data must not be sold or used for behavioral ad targeting.

---

## 30. Public content and discoverability

HowToBaby is both a personalized app and a public reference website.

### 30.1 Public route strategy

Generate useful static routes from the canonical content graph, for example:

```text
/6-months
/feeding/6-months
/play/6-months
/sleep/6-months
/safety/infant-sleep
/sources
/methodology
/editorial-policy
/medical-disclaimer
/changelog
```

Exact route naming is an implementation detail; the invariant is that public content and personalized content share the same reviewed claims.

### 30.2 SEO integrity

- Do not create unsupported medical claims solely for search traffic.
- Do not use clickbait/fear language that conflicts with the canonical content tone.
- Page titles/descriptions may summarize approved content but may not strengthen it.
- Structured data must not imply clinician authorship or medical review unless true.
- Personalized child data must never appear in indexable URLs or metadata.

### 30.3 Trust pages

The public site should make these easy to find:

- **Methodology** — how sources are selected, interpreted, classified, translated, and updated;
- **Sources** — source registry and status;
- **Editorial Policy** — conflicts, corrections, AI assistance, and commercial independence;
- **Medical Disclaimer** — clear scope and emergency limitations;
- **Changelog / Corrections** — meaningful recommendation changes and corrections.

---

## 31. Future AI / Ask HowToBaby policy

A future **Ask HowToBaby** feature may be added only after the canonical content graph and source governance are stable.

Requirements:

- retrieval must be constrained to approved HowToBaby claims/sources for health guidance;
- every substantive health answer must expose citations/provenance;
- the model may explain or organize approved guidance but must not invent a diagnosis, dosing regimen, contraindication, or unsupported recommendation;
- uncertainty and source disagreement must be preserved;
- high-risk/emergency intents must follow reviewed escalation policy;
- generated answers are not automatically promoted into canonical content;
- AI may assist internal drafting or translation, but source verification and semantic review remain required;
- do not market the assistant as a pediatrician or clinician replacement.

---

## 32. Final product statement

HowToBaby should become a durable, trustworthy **evidence-to-action layer for parents**: a place where a caregiver can immediately understand what matters at the child's current stage, what practical actions are reasonable, why they matter, what variation to expect, when to seek help, and exactly which authoritative sources support the guidance.

Its long-term value does not come from producing more medical information than CDC, AAP, FDA, USDA/HHS, NIH, WHO, or other authorities. It comes from making their guidance **contextual, navigable, practical, bilingual, transparent, and current** without turning generalized evidence into false individualized medicine.
