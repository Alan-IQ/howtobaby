# HowToBaby Documentation Map

> Documentation ownership map for HowToBaby. Each permanent rule should have one canonical owner to prevent drift and duplicated contracts.

| Document | Role | Owns | Must not duplicate in detail |
|---|---|---|---|
| `PROJECT_PROFILE_v0.6.0.md` | Canonical product contract | mission, scope, product pillars, non-negotiable invariants, trust/monetization/AI boundaries | component specs, repo tree, crawler selectors, detailed claim schemas |
| `REPOSITORY_STRUCTURE.md` | Canonical repo/ownership contract | folders/packages, dependency direction, authored/generated/cache boundaries, workflow ownership | medical rules, UI appearance |
| `GUIDANCE_CONTENT_CONTRACT.md` | Canonical guidance/domain contract | age logic, stage maps, feeding/play/sleep/safety behavior, claim classes, content release rules | page styling, crawler implementation |
| `EVIDENCE_PROVENANCE.md` | Canonical evidence traceability contract | SourceRecord↔Claim relationships, locators, public citations, Evidence Drawer, page references, evidence routes, source-link/reuse policy, audit history | source-fetch implementation, domain medical wording |
| `SYSTEM_ARCHITECTURE.md` | Canonical software architecture | runtime/build/evidence planes, package interaction, compiled indexes, deployment/security boundaries | detailed repo tree, medical prose |
| `GUI_DESIGN.md` | Canonical UI/design-behavior contract | information architecture, visual behavior, evidence/safety UI, responsive/print/accessibility behavior | theme adapter internals, medical policy, source-monitor internals |
| `THEME_SYSTEM.md` | Canonical theme integration contract | semantic theme API, token/primitive/shell adapters, first/third-party theme integration, capability gates, licensing/vendor isolation | domain behavior, medical policy, page information architecture |
| `TOOL_PLATFORM.md` | Canonical utility/tool contract | Tool Registry, safety classes, audio architecture, guidance-linked tool behavior | evidence crawling, domain medical rules |
| `EVIDENCE_UPDATE_ENGINE.md` | Canonical source-monitoring/update contract | adapters, change detection, fingerprints/diffs, dependency invalidation, review workflow, AI-assist boundary | public citation UX, domain medical rules |
| `IMPLEMENTATION_ROADMAP.md` | Canonical execution sequence | phases, dependencies, gates, release readiness | permanent rules already owned elsewhere |

## Conflict resolution

When documents conflict:

1. `PROJECT_PROFILE_v0.6.0.md` wins for product-level non-negotiable decisions.
2. The specialist owner in the table above wins for its domain.
3. Specialist contracts such as `THEME_SYSTEM.md` control their owned technical domain.
4. `IMPLEMENTATION_ROADMAP.md` controls sequence only and never overrides a permanent contract.

A product-invariant change updates Project Profile + Decision Log first. Implementation-only changes update the specialist owner without expanding Project Profile unnecessarily.

## Cross-document references

- `GUIDANCE_CONTENT_CONTRACT.md` defines **what a claim means** and whether it may be shown.
- `EVIDENCE_PROVENANCE.md` defines **how that claim proves where it came from**.
- `EVIDENCE_UPDATE_ENGINE.md` defines **how the original source is monitored for change**.
- `GUI_DESIGN.md` defines **how provenance is exposed to the parent**.
- `REPOSITORY_STRUCTURE.md` defines **where all of those artifacts live**.
- `THEME_SYSTEM.md` defines **how first-party and purchased/third-party visual systems plug into the product without owning it**.

## Canonical language

English documents are canonical for implementation. Vietnamese companion documents are review/readability aids and must preserve the same decisions. Identifiers, schemas, filenames, routes, and code contracts remain English in both versions.
