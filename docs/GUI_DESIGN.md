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
- gradients used sparingly and never behind dense medical copy without contrast protection;
- domain accents fresh and distinct at a glance — Feeding coral/warm orange, Play mint green,
  Sleep lavender/periwinkle, Safety rose, Tools sky cyan, Brand clean blue — the same six
  families as dark mode, re-derived for the light canvas rather than copied. Each domain accent
  has two roles with two tokens: `accent.*` is the TEXT-SAFE label tone (eyebrows, navigation
  label/icon ink, badge text and selected stage-chip text in every color mode) and stays the
  deepest saturated tone that clears the 4.5:1 text gate on canvas, cards and its own tints;
  `accent.*.visual` is the NON-TEXT domain identity colour (card title icon, the 3px card identity
  strip, the navigation underline, the actual-stage ring/dot marker) and is clearly brighter and
  fresher in light mode while clearing the 3:1 non-text gate on every surface it is drawn on:
  canvas, cards (`surface.1`), stage chips (`surface.2`), the glass pill (`surface.glass`) and its
  reduced-transparency swap (`surface.glass.solid`), plus its own soft/glass tints. The pastel `accent.*.soft` / `accent.*.glass` surfaces and the vivid
  `accent.*.glass.border` carry the rest of the brightness. Meaning is never carried by the
  visual colour alone — the icon and strip always sit beside the domain title.

### 4.3 Dark mode

Dark panels keep the same "glass with a defined rim" read as light mode: a thin, restrained
light edge (glass border + subtle inset top highlight) so cards and evidence panels never look
flat — never a bright or heavy outline.

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
Document metadata (`<title>`) stays in the canonical prerender locale. Public routes are not
locale-prefixed: Phase 3 shipped the age routes (`/play|/feeding|/sleep/<stage slug>`) as
locale-neutral static paths, and locale-prefixed routing stays a candidate for the public
discoverability phase (Phase 10) rather than a Phase 3 deliverable.

### Page and site references in copy

When user-facing copy names a specific destination — a HowToBaby page (`Now`, `Feeding`,
`Privacy`, …), a trust/legal page, the HowToBaby site itself as a destination, or an external
site/page the reader is being pointed to — that name is rendered as a link to the destination,
never as plain text that could read as an ordinary word. Rules:

- an internal HowToBaby page links to its canonical route and opens in the same tab;
- an external site/page opens in a new tab with `target="_blank"` and
  `rel="noopener noreferrer"` (the shared `ExternalLink`), footer and trust pages included;
- only a real destination is linked — a topic used as an ordinary noun ("Feeding guidance",
  "Play & Development guidance") or a tool group that has no page yet is not;
- the link wraps the page name itself, not the whole sentence, and the wording is never
  contorted to fit a link;
- the anchor text is the destination's own localized name in the active language (for a
  primary destination the full `domain.*.title`, for a trust page its `trust.*.label`), so it is
  meaningful on its own — never "here" or "see more";
- A destination name is linked when it points to another page. When copy refers to the page the user is already viewing, use natural wording such as “this page” instead of rendering a self-link.
- in app copy the reference is written as a `{link:<key>}` token resolved from the
  `MESSAGE_LINKS` registry (`apps/web/src/site.ts`); `<T>` renders it as the link, no HTML is
  injected, and tests reject an unknown key, an EN/VI mismatch of named destinations, or a
  tokenised message rendered through the plain string translator.

### Vietnamese copy quality

All Vietnamese user-facing copy follows `GUIDANCE_CONTENT_CONTRACT.md` §10. UI copy must be
concise, native-sounding and professional; it must not mirror English word order or rely on
literal one-to-one terminology. Short controls should prefer familiar Vietnamese labels, while
evidence/safety copy may use more explicit wording when clarity matters. Exact source titles,
proper names, URLs, license identifiers and canonical IDs remain untranslated as defined above.

### Vietnamese parent-facing evidence terminology

Vietnamese evidence/provenance presentation uses document-oriented wording for parents.

- Generic user-facing `source` → `tài liệu`.
- Collections/headings use `Tài liệu tham khảo`.
- `Original source` → `Tài liệu gốc`.
- Relationship labels:
  - `Primary source` → `Tài liệu tham khảo chính`
  - `Direct support` → `Tài liệu hỗ trợ trực tiếp`
  - `Corroborating source` → `Tài liệu đối chiếu`
  - `Contextual source` → `Tài liệu bổ trợ`
  - `Conflicting source/view` → `Tài liệu có khuyến nghị khác`
- `Current source version` → `Phiên bản tài liệu hiện tại`.
- `Source status` → `Trạng thái tài liệu`.
- `Source temporarily unavailable` → `Tài liệu hiện tạm thời không truy cập được`.
- `Relationship to the guidance above` → `Mối liên hệ với nội dung hướng dẫn ở trên`.
- `View original source` → `Xem tài liệu gốc`.

Evidence Drawer Vietnamese presentation therefore reads naturally, for example:

```text
Tài liệu tham khảo cho hướng dẫn này

CDC · Tài liệu tham khảo chính
<exact upstream title>

Phần liên quan: …
Phạm vi áp dụng: Hoa Kỳ
Phiên bản tài liệu hiện tại: 14/04/2026
HowToBaby kiểm chứng lần cuối: 31/08/2026
Mối liên hệ với nội dung hướng dẫn ở trên: Tài liệu do CDC công bố là tài liệu tham khảo chính mà HowToBaby sử dụng để xây dựng nội dung hướng dẫn phía trên.
Xem tài liệu gốc
```

The exact upstream title remains untranslated. Internal component/model names such as `SourceChip`, `SourceRecord`, `/sources`, source IDs, and provenance schema identifiers are unchanged. This is a presentation-language rule, not a data-model rename; §11 renders Vietnamese wording per this contract.

### Primary navigation

Desktop: horizontal navigation.

Mobile: compact sticky navigation, segmented tabs, or bottom/scroll-aware pattern as validated by usability. No horizontal page overflow.

The active bottom-navigation item combines a lit-glass pill — a translucent film with a
hairline DOUBLE rim from the dedicated token pair `surface.glass.glow` (inner 1px) and
`surface.glass.seam` (outer 1px), whose brightness INVERTS between modes: in light the inner
ring glares (equal to the glass highlight) over a darker outer seam; in dark the outer seam is
the thin luminous line and the inner ring recedes darker — glass catching light from outside.
Both rings stay 1px: delicate, never a thick bright border — heavier
icon/label in the text-safe domain accent (`accent.*`), and a short centred underline
in the visual domain accent (`accent.*.visual`) — state is never carried by colour alone, and the indicator must not add
height or break the bar's equal-column alignment. The desktop row's active pill wears the same
frosted-glass treatment. The glass pill and the underline are painted by ONE persistent active
indicator that slides between the equal-width
items on route change; the desktop row's soft active pill is likewise a persistent shared
indicator. Indicators are PERSISTENT by contract: they exist from the prerendered HTML on (the
tab bar's is positioned purely from the active index — no measurement, no hydration dependency),
are only ever repositioned — never unmounted or remounted on a route change — and on a route
outside the navigation they fade out in place, keeping their last position and accent so
returning slides in from where they left. The underline may never mount-and-vanish, and
icons/labels may not flash on a route change. Both follow the Motion contract below, and
`aria-current` plus the active link's own colour/weight remain the state carrier, so navigation
state never depends on the animation.

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

Sliding indicators are persistent single elements: they never remount when the selection
changes (remounting is what causes flicker), they animate with transform/opacity rather than
layout-affecting properties wherever possible, they fade out in place when nothing is selected,
and repositioning for a non-selection reason (hydration hand-over, resize, font load) is applied
WITHOUT animation so the indicator never visibly jumps.

All motion uses the semantic motion duration/easing tokens (fast/base ≈ 120–200 ms, standard
easing; no bounce or exaggerated animation). Keyboard operability, focus behavior and visible
state never depend on an animation. Under `prefers-reduced-motion: reduce` or the project
reduced-motion preference the motion tokens collapse to 0 ms, so every transition becomes
effectively instant while the end states stay identical.

## 7. Now page

Phase 3 ships the first item — the child/context summary: an optional local **ProfileEditor**
(DOB required, due date and name optional, saved to localStorage only, with an explicit
"could not save, applies to this visit" state), the **ChildSummary** (age today, corrected
development age and the due-date-proxy explanation when it applies, current stage per domain
linking into public browsing, infant safe-sleep scope note) and a session-only **preview plan
date** with its **PreviewBanner** — the preview resolves into its own context and never
replaces today's safety context. The remaining items belong to the Now composer phase.

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

Every page — domain and trust/legal alike — renders through ONE shared page-shell/container
contract: the same content max-width, the same horizontal padding per breakpoint, the same
vertical spacing rhythm and the same header/body alignment. The page-shell toolbar row reserves
a constant height whether or not a print action renders, so titles start at the same y on every
page. No page may ship its own diverging container or spacing system without a documented
reason.

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

The chip is a quiet hairline pill: transparent fill, subtle border, and on hover a soft tint
with a stronger border. The engraved feel lives in the TYPE, not the box — a hairline of the
theme's glass highlight under the ink letterpresses the text into the glass, in light AND dark
(the dark highlight token is tuned to stay just visible). Never an inset well or engraved
border, and clearly lighter than any button-tier control.

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

`EvidenceDrawer` is the default detailed provenance surface. It shows the HowToBaby claim/context being supported, then for each source the organization, the exact title and the relationship badge (primary/direct support/corroborating/contextual/conflicting), followed by the metadata **in this fixed order**:

1. `Relevant section` / VI `Phần liên quan` — locator such as section/heading/page, when available;
2. `Applies to: United States` / `Scope: Global` (VI `Phạm vi áp dụng`);
3. source publication/version metadata — the conditional matrix from EVIDENCE_PROVENANCE.md §14:
   - `publishedAt` only → `Published: …` (VI `Ngày xuất bản`);
   - `updatedAt` only → `Current source version: Apr 14, 2026` (VI `Phiên bản tài liệu hiện tại: 14/04/2026`);
   - both and equal → `Published: …` only (the same date is never repeated as `Updated`);
   - both and `updatedAt` later → `Published: Jan 10, 2025` + `Updated: Apr 14, 2026` (VI `Ngày xuất bản` + `Ngày cập nhật`);
   - neither → no source-date rows at all (never an inferred date);
4. `Last verified by HowToBaby: Aug 31, 2026` / VI `HowToBaby kiểm chứng lần cuối: 31/08/2026` — HowToBaby's own review confirmation, never a crawl or deploy time;
5. `Relationship to the guidance above` / VI `Mối liên hệ với nội dung hướng dẫn ở trên` — derived from the canonical relationship;
6. **View original source** / VI **Xem tài liệu gốc** action.

Relationship explanations name the source organization and refer explicitly to the HowToBaby guidance displayed above. They must not rely on ambiguous wording such as “this guidance”, “this statement” or “this organization”.

A status badge is rendered only when a status needs attention (`changed-review-required`, `superseded`, `retired`, `temporarily-unreachable`); a healthy `current` source carries no status UI. A concise interpretation/uncertainty/conflict note follows when needed.

The drawer must not imply that CDC/AAP/WHO/FDA reviewed or endorsed HowToBaby.

### 11.4 Page References

Every evidence-backed domain/age page ends with a collapsible or conventional **Sources used on this page** section.

The list is generated from the rendered claim IDs and deduplicated by source ID. Do not manually maintain a separate references array in page code.

Each entry may show:

```text
CDC
When, What, and How to Introduce Solid Foods
Published: Jan 10, 2025 · Updated: Apr 14, 2026 · Last verified by HowToBaby: Aug 31, 2026 · View original source ↗
```

The source-date segment follows the same conditional matrix as the drawer (`Published` only,
`Current source version`, `Published` + `Updated` only when the update is later, or omitted when
the authority provides no date) and always precedes the HowToBaby verification date; a non-current status (e.g. `Reviewing
an update`) is appended after the verification date, while a healthy `current` source shows no
status text. References stay one line per source — the joined form is the compact variant, no
extra rows.

### 11.5 Evidence detail page

Support a trust/audit route such as:

```text
/evidence/feeding-solids-start
```

This page may expose claim text, classification, applicability, source relationships/locators, verification status, and meaningful revision history. It renders canonical data and is not edited independently.

### 11.6 Sources/Methodology trust pages

`/sources` exposes the actual source registry used by the product. `/methodology` explains how sources become claims and how freshness/review works. Both should deep-link to original authorities.

Source status on `/sources` uses the same semantic tone mapping as the Evidence Drawer: a healthy
`current` source renders no status badge — its meta line carries the current source version and
the HowToBaby verification date instead; `changed-review-required` renders as quiet caution; and
superseded/retired/temporarily-unreachable states follow the same non-current attention
treatment — honest, never alarmist (see §11.8).

### 11.7 Original-source link behavior

- use clear wording such as **View original source**;
- indicate external navigation where appropriate;
- never place affiliate tracking on evidence links;
- source links remain available even if the Evidence Drawer uses progressive disclosure;
- unavailable/changed source status is shown honestly rather than silently removing evidence.

### 11.8 Freshness signals

Keep public states calm and understandable. A healthy `current` source is a machine lifecycle
state, not a public claim: it renders **no** status badge/chip. Its trust information is labeled
dates, always in this order:

- the authority's own dates per the source date provenance contract (EVIDENCE_PROVENANCE.md §14):
  `Published: …` alone (also when `updatedAt` equals `publishedAt`), `Current source version: …`
  when only `updatedAt` exists, `Published: …` + `Updated: …` only when the update is later (VI
  `Ngày xuất bản` / `Ngày cập nhật` / `Phiên bản tài liệu hiện tại`), and nothing at all when the authority
  provides neither — never an invented date, never `Published`
  for a date the authority did not call a publication date;
- `Last verified by HowToBaby: Aug 31, 2026` / VI `HowToBaby kiểm chứng lần cuối: 31/08/2026` —
  HowToBaby's verification, a different fact.

Status UI is conditional: it renders only when a state needs attention —
`changed-review-required`, `superseded`, `retired`, `temporarily-unreachable`.

Non-current states stay visible with the same attention treatment on every surface:

- `Reviewing an update` / VI `Đang rà soát bản cập nhật`
- `Superseded`, `Retired`, `Source temporarily unavailable`

The same status vocabulary (features/evidence STATUS_LABELS, non-current states only) is the ONE
source for every surface that shows a source status — the /sources registry, the Evidence Drawer
badges, evidence detail rows and page References — so wording can never drift between surfaces.

A changed source should not visually imply immediate danger unless the claim's safety level independently warrants that treatment.

### 11.9 Guidance content-language override

Guidance surfaces default to the global language. While the global language is not the canonical
locale, a guidance card additionally offers a quiet LOCAL control — a SINGLE binary toggle
button, not a pair of options:

- one tap/click flips that surface's canonical content between the active global locale and the
  canonical locale; the user never has to choose one of two buttons;
- its track wears a whisper-weight version of the header controls' glass (a faint film of the
  glass surface, a softened hairline ring, a bare inset highlight — the toggle sits ON a card,
  so it must never carry an opaque fill or a strong border that pops it off its own
  background), in the card and in the Evidence Drawer alike;
- placement: on wide/desktop layouts it sits IN FLOW directly under the card title
  (left-aligned pill row); on mobile (tab-bar widths) it pins to the card's top-right corner
  beside the eyebrow; in the Evidence Drawer it sits in the header area;
- it is styled as a compact slider pill: its outer height is `layout.touchTarget − 4px` (40px
  overall, 3px padding + 1px border included), i.e. 6px lower than the 46px theme-mode segmented
  control (whose options keep the full `touchTarget − 6px` inner height), with a slightly
  translucent thumb so the selection sits into the card rather than popping off it (both colour
  modes): BOTH full native names stay visible (`Tiếng Việt`,
  `English`, later e.g. `Español`) — never short codes such as `EN`/`VI` — each carrying its own
  `lang` attribute, with one persistent raised thumb resting on the language the content is
  CURRENTLY displayed in. Despite the slider look it remains ONE button: a tap anywhere flips
  the state and the thumb slides across; the accessible name stays
  `<control label>: <displayed native name>`;
- it is hidden entirely while the global language IS the canonical locale;
- the card and its Evidence Drawer render the SAME control over ONE shared content-locale
  state: switching in the card updates the drawer and switching in the drawer updates the card,
  and the drawer always renders in the same content locale as its card;
- the local switch never touches the global preference; a global language change resets/syncs
  every local override to the new global locale;
- content rendered in a locale other than `<html lang>` carries an explicit `lang` attribute;
- the thumb slide is the state-change motion (see §6 Motion; reduced motion makes it instant);
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

Implementation (Phase 3): chips are plain links to the static stage routes
(`/<destination>/<stage slug>`, slugs are broad age bins such as `6-9-months`, never child
data). The browsed stage carries aria-current="page". In both light and dark modes, its chip
uses the domain’s tinted-glass surface, matching glass border, text-safe domain accent and
semibold label. If the browsed stage is also the actual child’s stage, the brand ring remains the
actual-stage marker; the glass border is removed to avoid a double outline, and the dot follows
the selected text colour. Differences between light and dark come from theme token values, not
from different component-state styling. The actual child's stage — resolved client-side from
the local profile only — carries that brand-colour ring plus dot and a visually hidden "your
child's current stage" label, so the two states never look alike and prerendered HTML never
contains a child marker. Each stage page pairs the navigator
with a **WhyThisStage** card (stage range in ordinary language — `6 to under 9 months` — with the
`about` qualifier where the source wording has it, the age basis used for the actual child —
chronological or corrected-development — the browsed-vs-actual relation, a session preview
date if set, and the standing "age selects candidate guidance; it does not prove readiness"
limitation) and previous/next stage links. Safety has no stage navigator: its context card
reads the actual child only.

Stage boundaries remain half-open internally (`[min,max)`), but parent-facing labels must express those boundaries in ordinary language rather than interval notation. For example: “under 4 months”, “4 to under 6 months”, and “about 6 to under 8 months”. The UI must not expose forms such as “4–<6 months” or “~6–<8 mo”. The same
wording is used wherever a stage range is shown to a parent: page title and document metadata,
the stage navigator chips and their `title` tooltip, WhyThisStage, ChildSummary, PreviewPlanDate
and the previous/next stage pager. Route slugs (`/feeding/6-8-months`) are unchanged.

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
