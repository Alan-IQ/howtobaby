# GUI_DESIGN — HowToBaby

> Canonical UI and design-behavior contract. The initial visual family is **Baby Modern Glass**. Detailed technical integration of first-party and purchased/third-party React themes is owned by `THEME_SYSTEM.md`.

## 1. UX goals

HowToBaby should feel:

- calm, modern, warm, and parent-friendly;
- trustworthy without looking clinical or institutional;
- information-dense enough to be useful but scannable with one hand on mobile;
- visually consistent across Guidance and Tools;
- clearly transparent about evidence/safety without turning every card into a warning box.

## 2. Top-level information architecture

Primary destinations:

1. **Now**
2. **Feeding**
3. **Play & Development**
4. **Sleep**
5. **Safety**
6. **Tools**

Trust destinations are globally accessible but need not occupy primary navigation permanently:

- Sources
- Methodology
- Editorial Policy
- Medical Disclaimer
- Changelog / Corrections
- License / Source Code


## 2.1 Global legal/source footer

Every production deployment should provide a compact globally reachable footer or equivalent legal/help surface containing at least:

- Sources / Methodology;
- Medical Disclaimer;
- Privacy;
- License;
- Source Code when the deployment is covered by AGPL source-availability obligations;
- Changelog / Corrections.

This surface must remain usable across themes and must not be removed by a vendor shell. Brand/trademark notices remain distinct from software/content licenses. Detailed legal scope: `LICENSING_POLICY.md`.

## 3. Theme behavior

HowToBaby separates **theme family** from **color mode** and treats theme choice as presentation only.

```ts
type ThemeId = "baby-modern-glass" | string;
type ColorMode = "light" | "dark";
```

A theme may come from HowToBaby itself or from a purchased/open-source React theme/template. In either case, product/domain components consume the stable HowToBaby Theme Contract rather than vendor-specific APIs.

UI-level invariants:

- changing theme never changes content, claim IDs, age resolution, safety state, or provenance;
- evidence/safety UI remains present and readable in every production-selectable theme;
- Light/Dark are modes of a theme family, not unrelated applications;
- theme-specific decoration may change; information hierarchy and required interactions do not silently disappear;
- vendor theme layouts may be adapted into approved shell slots, not allowed to redefine product semantics.

Technical token/primitive/adapter/license contract: `THEME_SYSTEM.md`.

## 4. Initial theme: Baby Modern Glass

### 4.1 Shared visual language

- translucent/glass-like cards;
- soft baby-modern accent colors;
- restrained circles/dots motifs;
- large enough typography for quick scanning;
- generous but efficient spacing;
- rounded geometry;
- subtle depth, not heavy neon/glow;
- professional icons rather than cartoon overload.

### 4.2 Light mode

Light mode should feel luminous, not washed out.

- off-white/very pale tinted canvas;
- glass cards with enough opacity and border definition to remain readable;
- stronger text than decorative background;
- gradients used sparingly and never behind dense medical copy without contrast protection.

### 4.3 Dark mode

Dark mode should remain baby-modern rather than becoming generic black SaaS.

- deep cool-neutral/tinted canvas;
- translucent surfaces with visible edge separation;
- accent colors retain softness but meet contrast requirements;
- decorative motifs remain subtle and do not compete with text.

### 4.4 Glass fallback

`backdrop-filter` is enhancement, not a requirement.

If unsupported or reduced-transparency preference applies:

- use a more opaque semantic surface;
- retain border/shadow hierarchy;
- never let text readability depend on blur.

## 5. Theme families and purchased-theme UX

The UI architecture should allow first-party families such as `minimal-clean`, `high-contrast`, or `paper-soft`, and should also be able to adapt high-quality React themes purchased later.

Purchased themes are welcome when they improve visual quality, but the resulting HowToBaby experience must still preserve:

- primary navigation semantics;
- evidence and Source access;
- safety severity meaning;
- EN/VI readability;
- mobile/keyboard accessibility;
- print fallback;
- Tools consistency.

HowToBaby may adopt vendor tokens, approved primitives, decorative assets, or page-shell styling. Domain content cards and trust/safety behavior remain product-owned.

Technical integration levels, adapters, and license handling: `THEME_SYSTEM.md`.

## 6. Application shell

### Header

Contains:

- HowToBaby brand/home;
- compact current-child/age context when available;
- language switch;
- theme control;
- print where contextually relevant;
- profile edit/personalize control.

Avoid making the header tall on mobile.

### Primary navigation

Desktop: horizontal navigation.

Mobile: compact sticky navigation, segmented tabs, or bottom/scroll-aware pattern as validated by usability. No horizontal page overflow.

## 7. Now page

Order:

1. child/context summary;
2. **What matters now**;
3. four focus cards: Feed, Play & Develop, Sleep, Safety;
4. example/routine timeline where appropriate;
5. relevant tools shortcuts;
6. sources/freshness summary.

Each focus card should show only high-value actions and link deeper.

Where useful, expandable structure:

```text
Know
Do
Why
Watch
Source
```

## 8. Domain pages

Common page anatomy:

- title + age/stage context;
- stage navigator;
- at-a-glance summary;
- priority guidance cards;
- detailed sections;
- safety callouts;
- practical examples;
- source drawer/inline provenance;
- previous/next age navigation.

Manual browsing must be visually distinct from the actual child's current stage.

## 9. Tools hub

Tools is a first-class destination.

### Hub layout

Group tools by purpose, not implementation technology:

- Soothe & Sound
- Plan & Routine
- Calculate
- Track (future)
- Print & Share

Each Tool Card shows:

- name;
- one-line purpose;
- icon;
- whether it is purely utility or guidance-linked;
- optional age relevance;
- offline/local indicator where useful.

Do not put an `Official guidance` badge on a tool merely because the tool is in HowToBaby.

## 10. Audio tool UX

For lullaby/ambient/frequency tools:

- explicit Play action; no autoplay;
- persistent mini-player is allowed across HowToBaby pages after user starts audio;
- clear Stop/Pause and volume controls;
- sleep timer/fade-out may be provided;
- audio choice can include named options such as lullabies, ambient noise, or 432 Hz;
- a frequency option is a preference, not a therapeutic claim;
- any safety note must be sourced and visually separate from marketing/description.

## 11. Evidence and provenance UI

Detailed data/provenance rules live in `EVIDENCE_PROVENANCE.md`. GUI owns how that provenance is presented without overwhelming the parent.

### 11.1 Evidence labels

Visible compact content-class labels:

- Official guidance
- Evidence synthesis
- Typical pattern
- Example plan
- Practical interpretation
- Product heuristic

These labels describe **what kind of statement this is**. They are not substitutes for source provenance.

### 11.2 Inline SourceChip

Health/safety cards/claims with provenance should expose a compact source affordance, for example:

```text
Official guidance · CDC · WHO
```

Rules:

- show organization abbreviations/names, not raw URLs;
- chips/buttons open evidence detail, not a misleading generic organization homepage;
- do not add every citation inline as full bibliographic text;
- when multiple nearby claims use the same support, grouping at the card/block level is allowed only if the mapping remains unambiguous.

### 11.3 EvidenceDrawer

`EvidenceDrawer` is the default detailed provenance surface. It should show:

- HowToBaby claim/context being supported;
- source organization and exact title;
- relationship: primary/direct support/corroborating/contextual/conflicting;
- locator such as section/heading/page when available;
- jurisdiction/context;
- last verified date;
- current/reviewing-update status;
- **View original source** action;
- concise interpretation/uncertainty/conflict note when needed.

The drawer must not imply that CDC/AAP/WHO/FDA reviewed or endorsed HowToBaby.

### 11.4 Page References

Every evidence-backed domain/age page ends with a collapsible or conventional **Sources used on this page** section.

The list is generated from the rendered claim IDs and deduplicated by source ID. Do not manually maintain a separate references array in page code.

Each entry may show:

```text
CDC
When, What, and How to Introduce Solid Foods
Verified Aug 26, 2026 · View original source ↗
```

### 11.5 Evidence detail page

Support a trust/audit route such as:

```text
/evidence/feeding-solids-start
```

This page may expose claim text, classification, applicability, source relationships/locators, verification status, and meaningful revision history. It renders canonical data and is not edited independently.

### 11.6 Sources/Methodology trust pages

`/sources` exposes the actual source registry used by the product. `/methodology` explains how sources become claims and how freshness/review works. Both should deep-link to original authorities.

### 11.7 Original-source link behavior

- use clear wording such as **View original source**;
- indicate external navigation where appropriate;
- never place affiliate tracking on evidence links;
- source links remain available even if the Evidence Drawer uses progressive disclosure;
- unavailable/changed source status is shown honestly rather than silently removing evidence.

### 11.8 Freshness signals

Keep public states calm and understandable:

- `Verified Aug 26, 2026`
- `Reviewing an update`

A changed source should not visually imply immediate danger unless the claim's safety level independently warrants that treatment.

## 12. Safety UI

Safety severity is communicated by icon/text/structure as well as color.

- `info`: ordinary explanatory style;
- `caution`: visible but not alarming;
- `clinician`: clear action to discuss/contact;
- `urgent`: prominent, not collapsible;
- `emergency`: highest-priority action surface.

Do not use cute decorative treatment around urgent/emergency copy.

## 13. Stage navigator

- horizontal stage chips;
- hidden scrollbar;
- left/right arrows on pointer devices;
- touch swipe/drag;
- current-child stage marker distinct from browsed stage;
- keyboard-operable;
- browsing never mutates actual profile context.

## 14. Responsive behavior

Design mobile-first around common parent use:

- one-hand controls where practical;
- no essential hover behavior;
- forms stack to one column;
- cards avoid excessively tall padding;
- source details use drawers/accordions sensibly;
- audio mini-player never hides primary actions;
- safe areas respected on mobile browsers.

## 15. Print design

Print is a dedicated render profile, not a screenshot of glass UI.

- Letter + A4;
- remove navigation/interactive controls;
- use ink-efficient surfaces;
- no clipped gradients;
- keep logical cards together when practical;
- repeat context headings across pages;
- include source references suitable for printed output, generated from the same claim provenance graph;
- include content version/verification context or stable HowToBaby evidence URL where practical;
- current plan and all-stage reference modes may differ.

## 16. Accessibility

- WCAG-oriented semantics/contrast;
- keyboard navigation;
- visible focus;
- reduced motion;
- do not rely on color alone;
- respect reduced-transparency where feasible;
- appropriate button/slider labels in audio tools;
- live-region announcements only for meaningful context changes.

## 17. Core component inventory

```text
AppShell
AppHeader
PrimaryNav
ProfileEditor
ChildSummary
AgeContextBadge
StageNavigator
GuidanceLabel
SourceChip
EvidenceStatusBadge
FocusCard
GuidanceCard
SafetyCallout
EvidenceDrawer
ReferenceList
EvidenceDetail
WhyThisStage
Timeline
ActivityCard
FeedingCard
SleepSummaryBadge
MethodCard
ToolCard
ToolShell
AudioPlayer
MiniPlayer
TimerControl
ThemeProvider
ThemeSwitcher
LanguageSwitcher
PrintAction
PreviewBanner
```

## 18. Theme validation

CI/visual QA should verify the requirements delegated from `THEME_SYSTEM.md`, including:

- Theme Manifest and capability completeness;
- every required semantic token/primitive state resolves;
- no forbidden raw palette values or direct vendor imports in product/domain components where linting can enforce it;
- Light/Dark behavior or an explicitly approved limitation;
- mobile/desktop EN/VI screenshots;
- reduced transparency/motion fallback;
- print profile;
- evidence/source-chip/drawer/status contrast;
- safety meaning without color-only signaling;
- tool/player states;
- third-party theme license/source isolation.
