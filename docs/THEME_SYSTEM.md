# THEME_SYSTEM — HowToBaby

> Canonical technical contract for first-party and third-party theme integration. `GUI_DESIGN.md` owns UX/visual behavior; this document owns the theme API, adapter boundary, integration modes, vendor isolation, and license-aware packaging.

## 1. Goal

HowToBaby should be able to:

- ship a first-party **Baby Modern Glass** theme;
- add or replace theme families without rewriting product/domain features;
- adopt high-quality purchased/open-source React themes or UI kits when useful;
- keep evidence, safety, accessibility, routing, and domain behavior independent from any theme vendor;
- remove/replace a vendor theme without migrating canonical product logic.

A purchased theme can accelerate visual polish, but it is **presentation source material**, not the product architecture.

## 2. Core invariant

```text
Domain/Product behavior
        ↓
HowToBaby UI primitives + semantic slots
        ↓
Theme Contract
        ↓
┌───────────────────┬─────────────────────┐
│ First-party pack  │ Third-party adapter │
└───────────────────┴─────────────────────┘
        ↓
Tokens / primitive implementation / optional shell assets
```

Product/domain components MUST NOT import vendor theme code directly.

Examples of prohibited coupling:

```ts
// prohibited inside FeedingCard, EvidenceDrawer, NowPage, etc.
import { FancyVendorCard } from "premium-baby-theme";
```

Instead:

```ts
import { Card } from "@howtobaby/ui";
```

The active theme may change how `Card` is rendered, but `FeedingCard` does not know which theme vendor is active.

## 3. Theme integration levels

A theme pack declares one of three primary integration levels.

### Level A — Token pack

Best case and preferred default.

Theme supplies:

- colors;
- typography tokens;
- radii;
- spacing adjustments within allowed ranges;
- shadows;
- motion values;
- decorative assets/motifs.

HowToBaby components remain unchanged.

Use when a purchased theme is mostly a visual system or can be mapped cleanly to CSS variables/Tailwind tokens.

### Level B — Primitive adapter

Theme may provide implementations for approved presentation primitives, for example:

- Button;
- Card;
- Badge;
- Tabs;
- Drawer/Dialog;
- Input/Select;
- Navigation shell;
- Tooltip;
- Progress/skeleton surfaces.

Vendor components are wrapped behind `@howtobaby/ui` adapters.

Domain-specific components such as `FeedingCard`, `SafetyCallout`, `EvidenceDrawer`, `ToolShell`, or `SleepTimeline` remain HowToBaby-owned compositions.

### Level C — Shell/template adapter

For purchased React templates that include strong layout/navigation/page-shell design.

A theme may provide approved shell slots such as:

```text
AppFrame
HeaderFrame
PrimaryNavFrame
PageFrame
SectionFrame
FooterFrame
```

It MUST NOT own:

- routes or route semantics;
- claim selection;
- age/stage resolution;
- evidence/source rendering rules;
- safety escalation logic;
- Tool medical/safety rules;
- canonical content.

A vendor page template may inspire or implement shell composition, but domain page content is injected through HowToBaby-owned slots.

## 4. Theme contract

Conceptual contract:

```ts
type ThemeSource = "first-party" | "third-party";
type ThemeIntegrationLevel = "tokens" | "primitives" | "shell";
type ColorMode = "light" | "dark";

interface ThemeManifest {
  id: string;
  label: string;
  source: ThemeSource;
  integrationLevel: ThemeIntegrationLevel;
  modes: ColorMode[];
  adapterId: string;
  capabilities: ThemeCapabilities;
  licenseRef?: string;
  assets?: ThemeAssetManifest;
}

interface ThemeCapabilities {
  glass?: boolean;
  decorativeMotifs?: boolean;
  reducedTransparencyFallback: boolean;
  printProfile: boolean;
  supportsEvidenceStates: boolean;
  supportsSafetyStates: boolean;
  supportsToolSurfaces: boolean;
}
```

A theme is installable only if its manifest passes the contract and all required semantic tokens/primitive states resolve.

## 5. Stable semantic tokens

Theme vendors map into HowToBaby semantics; HowToBaby does not map domain components to vendor color names.

Required examples:

```text
canvas
surface.1
surface.2
surface.glass
text.primary
text.secondary
border.subtle
focus.ring
status.info
status.caution
status.clinician
status.urgent
status.emergency
accent.feeding
accent.play
accent.sleep
accent.safety
accent.tools
```

Foundation geometry/accessibility tokens may have controlled theme overrides, but critical minimums remain enforced by HowToBaby.

## 6. Stable UI primitive boundary

`packages/ui` defines the product primitive API. A theme adapter can change implementation, not semantic intent.

Initial primitive set should include at least:

```text
Button
IconButton
Card
Surface
Badge
Tabs
Drawer
Dialog
Input
Select
Switch
Tooltip
Popover
Navigation
Skeleton
Divider
```

Evidence and domain components are NOT vendor primitives. They stay owned by `packages/ui` or product features:

```text
GuidanceLabel
SourceChip
EvidenceDrawer
ReferenceList
SafetyCallout
WhyThisStage
FeedingCard
ActivityCard
SleepSummaryBadge
ToolCard
ToolShell
```

## 7. Adapter architecture

Recommended layout:

```text
packages/themes/
  src/
    contract/
    registry/
    adapters/
      css-vars/
      tailwind/
      shadcn/
      mui/
      vendor-*/
    baby-modern-glass/

vendor-themes/
  README.md
  <licensed-theme>/     # private/gitignored unless redistribution allowed
```

An adapter may:

- translate vendor tokens into HowToBaby semantic tokens;
- wrap vendor primitives;
- expose approved shell slots;
- normalize dark/light behavior;
- provide asset mapping.

An adapter may not:

- fetch or resolve medical content;
- know child age/context;
- change evidence classifications;
- hide required safety/evidence UI;
- redefine product navigation semantics without an explicit GUI contract change.

## 8. Third-party theme adoption workflow

Before integrating a purchased/open-source theme:

1. Record the theme/vendor/version and source URL.
2. Review license and redistribution rights.
3. Choose integration level A/B/C.
4. Map vendor tokens to HowToBaby semantic tokens.
5. Map/wrap only the approved primitives or shell slots needed.
6. Keep canonical product components unchanged where practical.
7. Run theme capability validation.
8. Run accessibility/contrast/focus/reduced-motion checks.
9. Run evidence/safety state screenshots.
10. Run mobile/desktop/print visual QA.
11. Record known theme-specific limitations.

Do not import an entire purchased application template into `apps/web` and then retrofit domain logic into vendor pages. Treat it as a theme source and adapt it inward through the contract.

## 9. Licensing and repository policy

Commercial theme code/assets may have licenses that allow use in one product but prohibit redistribution or public source publication.

Rules:

- never assume purchase means redistribution rights;
- store a public `ThemeLicenseRecord`/installation note without publishing restricted source;
- keep restricted code/assets in `vendor-themes/`, a private registry, private submodule/repository, or deployment secret/artifact channel as appropriate;
- `.gitignore` restricted source in a public repo unless the license explicitly permits publication;
- CI must be able to fail clearly if a required private theme package is unavailable;
- retain a first-party baseline theme so development/tests do not become impossible when proprietary assets are absent;
- keep large proprietary/theme media packages outside normal Git when size or license makes repository storage inappropriate, following `REPOSITORY_HEALTH.md`.

Conceptual record:

```ts
interface ThemeLicenseRecord {
  themeId: string;
  vendor?: string;
  version?: string;
  licenseType: string;
  redistribution: "allowed" | "restricted" | "unknown";
  sourceLocation: string;
  reviewedAt: string;
  notes?: string;
}
```

## 10. Baby Modern Glass baseline

Baby Modern Glass remains the first-party reference implementation and compatibility baseline.

It must cover:

- Light/Dark;
- all required semantic tokens;
- all primitive states;
- evidence/safety states;
- Tool/audio states;
- responsive desktop/mobile;
- reduced transparency;
- print profile.

Third-party theme compatibility is measured against the same capability matrix, not against visual similarity to Baby Modern Glass.

## 11. Theme capability gates

A theme cannot be production-selectable if it breaks a required product surface.

Minimum gates:

- token completeness;
- primitive state completeness;
- keyboard/focus behavior;
- contrast;
- reduced motion/transparency;
- evidence source/status visibility;
- safety severity visibility without color-only meaning;
- mobile navigation;
- Tools/audio controls;
- print fallback;
- no layout clipping at supported text expansion lengths for EN/VI.

A theme that cannot support a feature may declare a capability false only when the product has an approved fallback implementation.

## 12. Runtime theme selection

Theme choice is a presentation preference only.

```text
themeId + colorMode
```

may be stored locally. It must not change:

- selected claim IDs;
- content version;
- age resolution;
- safety state;
- evidence provenance;
- Tool output semantics.

Server-side user preferences may be added later, but theme preference remains separate from canonical knowledge.

## 13. Performance

Do not ship every installed theme to every user by default.

Prefer:

- lazy loading non-default theme assets/adapters;
- code splitting by theme pack where practical;
- CSS variable/token packs for low-cost themes;
- optimized local assets;
- no remote vendor runtime dependency required solely for styling.

Purchased themes must not introduce analytics/tracking scripts by default.

## 14. Theme definition of done

A new theme is done only when:

- manifest/license record exists;
- integration level is declared;
- no domain component imports vendor code directly;
- all required tokens/primitives/capabilities validate;
- EN/VI responsive snapshots pass;
- evidence and safety UI remain readable/auditable;
- Light/Dark behavior is documented or an approved single-mode limitation exists;
- print fallback passes;
- proprietary source is stored in a license-compliant location;
- switching back to Baby Modern Glass requires no content/domain migration.


## Licensing cross-reference — v0.8.0

Theme integration must comply with `LICENSING_POLICY.md`. A public adapter can be AGPL-licensed while the underlying purchased theme remains private/restricted. Do not assume vendor source, fonts, icons, illustrations, or demo assets are redistributable merely because the adapter is.
