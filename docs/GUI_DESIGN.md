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

Navigation labels stay short: **Play & Development** appears as **Play** (VI: **Chơi**) in top
and bottom navigation ONLY. Everywhere a destination is presented as content — its page title,
a destination card on Now/Home, any display name — the full domain title is used (**Play &
Development** / **Chơi & Phát triển**). The two are distinct dictionary keys by contract
(`nav.<domain>.label` vs `domain.<domain>.title`); a navigation label is never reused as a
generic domain display title, so the shortening cannot regress onto content surfaces. All of
them resolve from the app message dictionary in the active language — never from per-locale
navigation config.

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
- theme control;
- language control, outermost right;
- print where contextually relevant;
- profile edit/personalize control.

Avoid making the header tall on mobile.

### Language control

One global language preference drives all site chrome and page copy. The header control is the
only global switch:

- a single compact trigger — globe icon above the active locale code (`EN`, `VI`, …);
- clicking opens an accessible popover listing every locale from the supported-locale registry
  (`@howtobaby/i18n`); nothing in the control is hard-coded to a specific locale pair, so a new
  locale appears in the menu without redesign;
- the active language is marked by selection state plus a check mark, never colour alone;
- the popover is keyboard operable (arrow keys, Escape) and announced via listbox semantics;
- the control's visual language matches the adjacent theme-mode control;
- the preference persists locally (SYSTEM_ARCHITECTURE.md §10) and `<html lang>` always follows
  the active global language.

Every currently shipped user-facing page follows the global language — the trust/legal pages
(`/sources`, `/methodology`, `/editorial-policy`, `/disclaimer`, `/privacy`, `/license`,
`/changelog`), the evidence detail pages and the not-found/error UI included; there is no
English-only page exception. Never translated: exact original source titles, organization and
other proper names, URLs, license identifiers such as `AGPL-3.0-only` / `CC BY-NC-SA 4.0`, and
canonical identifiers/IDs — the labels and context around them localize. Localized presentation
of canonical evidence data goes through locale-generic presenters/view models built for every
registered locale — no page hard-codes an English presentation or branches on a locale pair.
Document metadata (`<title>`) stays in the canonical prerender locale until locale-prefixed
public routes land; those are a Phase 3 routing concern.

### Primary navigation

Desktop: horizontal navigation.

Mobile: compact sticky navigation, segmented tabs, or bottom/scroll-aware pattern as validated by usability. No horizontal page overflow.

The active bottom-navigation item combines a soft domain-accent tint, heavier icon/label, and a
short centred underline in the domain accent — state is never carried by colour alone, and the
indicator must not add height or break the bar's equal-column alignment. The underline is ONE
shared indicator that slides between the equal-width items on route change; the desktop row's
soft active pill is likewise a shared indicator that slides between items. Both follow the
Motion contract below, and the statically styled active link (aria-current, tint, weight)
remains the prerender/no-JS state, so navigation state never depends on the animation.

### Motion

Stateful/sliding controls animate state changes instead of repainting them instantly, within one
calm system:

- segmented controls (e.g. the theme colour-mode switch) move ONE shared selection pill between
  options — never per-option background swaps;
- primary navigation (bottom tab bar and desktop row) moves its shared active indicator to the
  new item, as above;
- the local guidance-language toggle swaps its label with a subtle slide;
- the global language popover opens with a short slide-down + fade and closes with the reverse
  transition, absolutely positioned so open/close never shifts layout.

All motion uses the semantic motion duration/easing tokens (fast/base ≈ 120–200 ms, standard
easing; no bounce or exaggerated animation). Keyboard operability, focus behavior and visible
state never depend on an animation. Under `prefers-reduced-motion: reduce` or the project
reduced-motion preference the motion tokens collapse to 0 ms, so every transition becomes
effectively instant while the end states stay identical.

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

Source status on `/sources` uses the same semantic tone mapping as the Evidence Drawer:
`current` renders as a calm/neutral badge; `changed-review-required` as quiet caution; and
superseded/retired/temporarily-unreachable states follow the same non-current attention
treatment — honest, never alarmist (see §11.8).

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

### 11.9 Guidance content-language override

Guidance surfaces default to the global language. While the global language is not the canonical
locale, a guidance card additionally offers a quiet LOCAL control — a SINGLE binary toggle
button, not a pair of options:

- one tap/click flips that surface's canonical content between the active global locale and the
  canonical locale; the user never has to choose one of two buttons;
- the visible text is always the full native name of the language the content is CURRENTLY
  displayed in (`Tiếng Việt`, `English`, later e.g. `Español`) — never a short code such as
  `EN`/`VI` — and carries that language's `lang` attribute;
- it is hidden entirely while the global language IS the canonical locale;
- the card and its Evidence Drawer render the SAME control over ONE shared content-locale
  state: switching in the card updates the drawer and switching in the drawer updates the card,
  and the drawer always renders in the same content locale as its card;
- the local switch never touches the global preference; a global language change resets/syncs
  every local override to the new global locale;
- content rendered in a locale other than `<html lang>` carries an explicit `lang` attribute;
- the label swap animates with a subtle token-driven slide (see §6 Motion; reduced motion makes
  it instant);
- the toggle is visually lighter than the global language control and must not compete with the
  SourceChip;
- the semantics are generic `canonical ↔ active locale` (owned by `@howtobaby/i18n`,
  `toggleContentLocale`), so a newly registered locale needs no redesign — nothing hard-codes
  the EN/VI pair.

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
