# HowToBaby

> Know what your child needs. Right now.

**Evidence-to-action guidance and practical tools for parents — organized around the child's current stage.**

🫆 Traceable sources • 🔒 Local-first personalization • :globe_with_meridians: Multi-language support

## About [HowToBaby](https://howtobaby.com)

HowToBaby is being built to make trusted child-development and parenting guidance easier to use in everyday life.

Instead of asking parents to read and reconcile many separate documents from organizations such as the **CDC, AAP, FDA, USDA/HHS, NIH, and WHO**, HowToBaby organizes approved guidance by age and context, preserves its source and uncertainty, and turns it into practical actions that are easier to understand and apply.

The product has two equal pillars:

- **Guidance** — evidence-backed information for Feeding, Play & Development, Sleep, Safety, and future age-relevant domains.
- **Tools** — practical utilities such as age calculators, routines/timers, lullaby or ambient-audio players, and other parent-facing helpers. Tools do not receive medical claims merely because they exist inside HowToBaby.

> HowToBaby is a practical parent reference, not a medical record, diagnosis engine, developmental screening test, emergency service, or substitute for pediatric care.

## Current status

**Architecture/documentation baseline: v0.8.0 — implementation has not started yet.**

The current repository contract intentionally defines product behavior, evidence governance, repository ownership, theme integration, storage boundaries, and implementation phases before production code is scaffolded.

## What makes HowToBaby different

### Evidence you can verify

Every health or safety claim is designed to trace back through one provenance graph:

```text
Original authority
      ↓
 SourceRecord + locator
      ↓
  ClaimSourceRef
      ↓
     Claim
      ↓
 Guidance / applicability
      ↓
 Now · Public pages · Tools · Print
      ↓
 Source chip · Evidence drawer · References
      ↓
 View original source
```

The goal is not to say *“trust us, this is evidence-based.”* The goal is to let the parent see **which source supports which claim, where the source came from, when it was verified, and the original authority page**.

### No invented precision

Personalization can know that a child is exactly six months and twelve days old. That does not allow HowToBaby to turn guidance such as **“around 6 months”** into a fabricated exact threshold.

Source qualifiers, uncertainty, jurisdiction, readiness conditions, contraindications, and safety limits must survive simplification.

### Local-first personalization

Public guidance remains browseable without a profile. A parent may optionally provide a date of birth and estimated due date to create a personalized **Now** view.

For v1, child-profile data remains in the browser. Personalization selects approved content; it does not create personalized medicine.

### Guidance and utilities, without mixing claims

A utility can be useful without claiming a therapeutic effect. For example, an audio tool may expose lullabies, ambient sound, or a user-selectable 432 Hz option without claiming that a frequency improves sleep or development unless approved evidence actually supports that claim.

## Planned product areas

| Area | Purpose |
|---|---|
| **Now** | What matters for the child's current context |
| **Feeding** | What/how to offer, readiness, textures, allergens, choking and milk/formula safety |
| **Play & Development** | Milestone context, skills, practical activities and observations |
| **Sleep** | Sleep-duration guidance, safe sleep, typical patterns, routines and settling education |
| **Safety** | Current safety guidance and reviewed escalation/red-flag content |
| **Tools** | Parent-facing utilities that may be guidance-linked or claim-neutral |
| **Sources & Methodology** | Public provenance, source status, editorial method and corrections |

## Architecture direction

HowToBaby is **static-first, server-capable**.

The planned web stack is **Next.js + TypeScript**, without permanently locking the application to a full static-export-only architecture. Public age/topic pages should be statically rendered whenever appropriate, while future server features can be added without moving reviewed knowledge out of Git.

```text
                           HowToBaby
                               │
              ┌────────────────┴────────────────┐
              │                                 │
        Public / static-first              Personalized Now
              │                                 │
      age/topic/trust pages                 local profile
              │                                 │
              └───────────────┬─────────────────┘
                              │
                     KnowledgeRepository
                              │
                 compiled read-model boundary
                              │
             ┌────────────────┴────────────────┐
             │                                 │
       Canonical source                  Derived stores
        YAML / Git                         SQLite
             │                         JSON/manifests
             │                         future DB projection
             └──────────── authoritative ───────┘
```

### Canonical knowledge stays in YAML/Git

Reviewed knowledge and provenance remain permanently canonical as Git-tracked structured text, even if HowToBaby later gains:

- PostgreSQL or another runtime database;
- accounts and cloud sync;
- subscriptions;
- an editorial CMS;
- server APIs;
- a source-grounded assistant.

SQLite is introduced early as a **derived, rebuildable read model** for validation, joins, reverse dependency queries, Evidence Watch impact analysis, and build-time compilation. It is never an authoring authority.

## Evidence Update Engine

The planned update system is deterministic first; AI is optional.

```text
CDC / AAP / FDA / WHO / ...
             ↓
       source adapters
             ↓
 fetch + normalize + fingerprint
             ↓
          diff
             ↓
 source → affected claims/routes/tools
             ↓
       review-required
             ↓
  human/source verification
             ↓
       canonical YAML/Git
             ↓
       validate + build
```

AI may later help summarize diffs, triage impact, draft proposed English changes, or assist translation. AI output does **not** become canonical guidance automatically.

## Theme system

HowToBaby uses a vendor-neutral theme contract rather than hard-coding one visual style into product components.

The first-party reference theme is **Baby Modern Glass**, with coordinated Light and Dark modes. Future first-party or purchased React themes can be integrated through:

1. **Token adapters**
2. **Primitive adapters**
3. **Approved shell/layout adapters**

Domain components never depend directly on a theme vendor's API. Commercial theme code and assets are isolated according to their license and redistribution rights.

## Repository and storage philosophy

GitHub stores **authored, reviewable knowledge and provenance** — not bulk artifacts.

Normal Git is intended for YAML/Markdown/JSON, source metadata, schemas, code, tests, documentation, and reasonably sized first-party assets.

The following stay outside normal Git by default:

- generated `knowledge.sqlite` databases;
- crawler/source-download caches;
- full third-party HTML/PDF snapshots used only for diffing;
- generated build output;
- large audio/video/image libraries.

Large production media belongs in object storage/CDN. CI will enforce conservative repository-health budgets before GitHub's own limits become a problem.

See [`docs/REPOSITORY_HEALTH.md`](docs/REPOSITORY_HEALTH.md).

## Planned repository structure

```text
howtobaby/
├─ apps/web/                       # Next.js product
├─ packages/
│  ├─ core/                        # age/context/applicability logic
│  ├─ knowledge/                   # canonical YAML + derived read models
│  ├─ ui/                          # reusable product/evidence primitives
│  ├─ themes/                      # theme contract + adapters
│  ├─ tool-platform/               # Tool Registry/runtime contracts
│  ├─ i18n/
│  └─ validation/
├─ tools/                          # individual parent utilities
├─ evidence/                       # monitoring/diff/impact operations
├─ scripts/                        # validators/compilers/health checks
├─ docs/                           # canonical product/architecture contracts
├─ tests/
└─ .github/workflows/
```

The detailed ownership contract lives in [`docs/REPOSITORY_STRUCTURE.md`](docs/REPOSITORY_STRUCTURE.md).

## Documentation

English documentation is canonical for implementation. Vietnamese companion documents are provided for review/readability while preserving English identifiers and code contracts.

| Document | Purpose |
|---|---|
| [`PROJECT_PROFILE_v0.8.0.md`](docs/PROJECT_PROFILE_v0.8.0.md) | Product mission, scope and non-negotiable decisions |
| [`DOCS_INDEX.md`](docs/DOCS_INDEX.md) | Documentation ownership and conflict resolution |
| [`GUIDANCE_CONTENT_CONTRACT.md`](docs/GUIDANCE_CONTENT_CONTRACT.md) | Age/domain/content/safety rules |
| [`EVIDENCE_PROVENANCE.md`](docs/EVIDENCE_PROVENANCE.md) | Claim-to-source traceability and public evidence |
| [`SYSTEM_ARCHITECTURE.md`](docs/SYSTEM_ARCHITECTURE.md) | Runtime/build/evidence architecture |
| [`REPOSITORY_STRUCTURE.md`](docs/REPOSITORY_STRUCTURE.md) | Repo/package ownership and boundaries |
| [`REPOSITORY_HEALTH.md`](docs/REPOSITORY_HEALTH.md) | Git/storage budgets and CI safeguards |
| [`LICENSING_POLICY.md`](docs/LICENSING_POLICY.md) | Software/content licensing and third-party rights boundaries |
| [`GUI_DESIGN.md`](docs/GUI_DESIGN.md) | Product UI behavior, accessibility and evidence UX |
| [`THEME_SYSTEM.md`](docs/THEME_SYSTEM.md) | First/third-party theme integration contract |
| [`TOOL_PLATFORM.md`](docs/TOOL_PLATFORM.md) | Utility/tool architecture |
| [`EVIDENCE_UPDATE_ENGINE.md`](docs/EVIDENCE_UPDATE_ENGINE.md) | Source monitoring and update workflow |
| [`IMPLEMENTATION_ROADMAP.md`](docs/IMPLEMENTATION_ROADMAP.md) | Phase ordering and release gates |

## Roadmap overview

```text
Phase 0   Documentation + repository baseline
Phase 1   App shell + theme engine
Phase 2   Content/source schema + SQLite read model
Phase 3   Age/context + public browse routing
Phase 4   Play & Development
Phase 5   Sleep + Safe Sleep
Phase 6   Feeding + Feeding Safety
Phase 7   Personalized Now
Phase 8   Tools + Audio MVP
Phase 9   Evidence Watch v1
Phase 10  Trust / SEO / Print / Accessibility
Phase 11  Public v1
Phase 12  Post-v1 evolution
```

The detailed gates live in [`docs/IMPLEMENTATION_ROADMAP.md`](docs/IMPLEMENTATION_ROADMAP.md).

## Development

Production code has not been scaffolded yet. Verified install/build/test commands will be added here during **Phase 0/Phase 1** after the repository tooling exists.

Do not copy unverified placeholder commands into CI or contributor instructions.

## Privacy and safety

- Public content must be usable without supplying child data.
- v1 child-profile data is local-first and remains in-browser.
- Browsing another age/stage must never weaken safety guidance that applies to the actual child.
- HowToBaby does not diagnose conditions or infer medical contraindications silently.
- Safety-critical claims require explicit provenance and review status.
- Source updates may be detected automatically; semantic medical changes are not silently auto-published.

## 🔑 License

HowToBaby uses a **multi-license model** so software, knowledge, documentation, branding, authoritative source material, and third-party assets are not incorrectly treated as one legal category.

| Material | License / treatment |
|---|---|
| Original HowToBaby software | **AGPL-3.0-only** |
| Original HowToBaby knowledge, editorial content, translations, and documentation | **CC-BY-NC-SA-4.0** |
| HowToBaby name, logo, and brand identity | **Reserved; no trademark license granted** |
| CDC/AAP/FDA/WHO/other authoritative source material | **Original source rights/terms; not relicensed by HowToBaby** |
| Purchased themes, audio, fonts, icons, images, and other third-party assets | **Asset/vendor-specific license** |

The AGPL still permits commercial use of the software, but modified covered software offered as a network service must comply with the AGPL source-availability requirements. The CC BY-NC-SA license allows attributed noncommercial reuse/adaptation of original HowToBaby content while reserving commercial reuse for separate permission.

See [`LICENSE.md`](LICENSE.md) and [`docs/LICENSING_POLICY.md`](docs/LICENSING_POLICY.md) for the exact scope, exclusions, contribution-rights policy, and third-party boundaries.

---
**[HowToBaby.com](https://howtobaby.com)** — trusted guidance, practical action, transparent evidence.
