# LICENSING_POLICY — HowToBaby

> Canonical licensing and rights-boundary contract for the HowToBaby repository. This document explains **which material is licensed under which terms**, what is excluded, and how future contributions, vendor assets, authoritative sources, and commercialization must be handled.

## 1. Goals

The licensing model must support all of the following at the same time:

- keep the software source visible and reusable while discouraging closed hosted forks from taking improvements private;
- let parents access HowToBaby for free without granting unrestricted commercial reuse of the curated knowledge base;
- preserve the project owner's ability to monetize services or grant separate commercial permissions later;
- avoid accidentally relicensing CDC/AAP/FDA/WHO or other third-party material;
- keep purchased themes, audio, fonts, icons, and other restricted assets isolated;
- keep licensing understandable at the path/file level rather than relying on one ambiguous repository-wide license.

## 2. Multi-license model

HowToBaby is intentionally **multi-licensed**.

### 2.1 Software

Original HowToBaby software is licensed under:

```text
AGPL-3.0-only
```

This includes original code in application/runtime packages, evidence tooling, scripts, validators, adapters, tool runtime, theme adapters, and other software unless a more specific notice applies.

Why AGPL instead of MIT/Apache/GPL:

- MIT/Apache would allow proprietary hosted forks with very few reciprocity obligations;
- GPL copyleft is strong for distributed software but does not specifically close the network-service gap;
- AGPL extends the source-availability obligation to modified covered software used to provide a service over a network.

AGPL still permits commercial use. It is not a noncommercial license.

### 2.2 Original knowledge and documentation

Original HowToBaby-authored knowledge, editorial explanations, structured claim text, original translations, and project documentation are licensed under:

```text
CC-BY-NC-SA-4.0
```

This allows noncommercial reuse/adaptation with attribution and ShareAlike while requiring separate permission for commercial reuse.

Creative Commons licenses are used for content/documentation, **not** for software.

### 2.3 Brand/trademark rights

No repository license grants permission to use:

- the HowToBaby name;
- logos;
- product marks;
- domain identity;
- confusingly similar branding that implies endorsement or affiliation.

Trademark rights remain outside AGPL and CC licenses.

## 3. Path-oriented default license map

Unless a more specific notice exists:

| Path/material | Default treatment |
|---|---|
| `apps/**` | AGPL-3.0-only |
| `packages/core/**` | AGPL-3.0-only |
| `packages/ui/**` | AGPL-3.0-only |
| `packages/tool-platform/**` | AGPL-3.0-only |
| `packages/themes/**` first-party code | AGPL-3.0-only |
| `evidence/**` software | AGPL-3.0-only |
| `scripts/**` | AGPL-3.0-only |
| `tools/**` original software | AGPL-3.0-only |
| `packages/knowledge/**` original authored knowledge | CC-BY-NC-SA-4.0 |
| `docs/**` | CC-BY-NC-SA-4.0 |
| English/Vietnamese original editorial translations | CC-BY-NC-SA-4.0 |
| `vendor-themes/**` | vendor license; may be private/excluded |
| third-party audio/images/fonts/icons | asset-specific license |
| authoritative source bodies | upstream/source-specific rights; not relicensed |
| generated SQLite/build/cache artifacts | derived artifacts; not canonical and normally not committed |

When a file contains material from more than one legal source, it must carry explicit notices or be restructured so that scope is clear.

## 4. Authoritative-source boundary

HowToBaby's provenance model does **not** mean HowToBaby owns the authoritative sources it cites.

Default reuse strategy remains:

```text
read/verify original authority
        ↓
write original HowToBaby interpretation
        ↓
store source provenance + locator
        ↓
link user back to original source
```

Do not automatically place copied source text, PDF bodies, screenshots, syndicated material, or substantial quotations under CC-BY-NC-SA-4.0.

If a source has explicit reuse/syndication terms, those terms control the reused material and must be recorded separately.

## 5. Commercialization

The public licenses do not prevent the copyright holder from:

- operating HowToBaby commercially;
- charging for hosting, convenience features, subscriptions, support, or other services;
- granting separate commercial-use permissions for content rights they control;
- dual-licensing their own material.

However:

- previously granted public licenses are not retroactively revoked;
- external contributions may create additional copyright holders;
- the project cannot separately relicense rights it does not own or have permission to relicense.

Therefore future contribution policy is part of commercialization strategy, not an afterthought.

## 6. Contribution-rights policy

### 6.1 Code

Accepted software contributions are expected to be contributed under AGPL-3.0-only unless a separate written agreement says otherwise.

If HowToBaby later wants to offer a proprietary closed-source license for a combined codebase containing external contributions, a contributor agreement or separate permission may be required.

### 6.2 Canonical knowledge and documentation

External canonical knowledge/translation contributions should **not** be accepted by default until a contribution-rights policy/CLA is deliberately adopted.

Reason: CC-BY-NC-SA-4.0 permits the public noncommercial use of accepted content, but future commercial/relicensing rights for externally authored material depend on the rights granted by those contributors.

Until that process exists:

- issues/suggestions/source pointers are welcome conceptually;
- maintainers may rewrite accepted ideas independently into project-authored canonical content;
- substantial external canonical text should not be merged casually.

## 7. Vendor themes and templates

Commercial React themes/templates are not automatically open source because their adapter is open source.

Requirements:

- store vendor source/assets only where the vendor license permits;
- keep restricted vendor packages private or gitignored when redistribution is prohibited;
- isolate integration behind the Theme Contract;
- record vendor name, license/order reference, redistribution rule, allowed deployments, and update notes privately or in allowed metadata;
- never copy restricted vendor source into public examples merely to simplify setup.

## 8. Audio, media, fonts, icons, and tools

Every production media asset must have rights metadata such as:

```text
assetId
creator/source
license
commercialUseAllowed
redistributionAllowed
attributionRequired
attributionText
sourceUrl/orderReference
```

No production asset is approved merely because it is free to download or publicly accessible.

## 9. Dependency licenses

Implementation should add automated dependency-license reporting during early repository setup.

At minimum CI/release review should identify:

- dependency name/version;
- SPDX license where available;
- unknown/custom licenses;
- strong-copyleft dependencies whose integration implications need review;
- dependencies/assets incompatible with intended distribution.

Never automatically classify a dependency as acceptable solely because `npm install` succeeds.

## 10. SPDX and notices

Preferred identifiers:

```text
AGPL-3.0-only
CC-BY-NC-SA-4.0
```

As implementation starts, source files or package metadata may use SPDX identifiers where practical.

Root legal entry points:

```text
LICENSE.md
LICENSES/AGPL-3.0-only.txt
LICENSES/CC-BY-NC-SA-4.0.txt
THIRD_PARTY_NOTICES.md
CONTRIBUTING.md
```

## 11. Change control

Changing a repository license or its scope is a product/legal decision, not a routine refactor.

AI agents and contributors must not:

- change AGPL/CC license choices;
- broaden/narrow which paths they cover;
- copy third-party material into licensed paths;
- add a vendor/media dependency with unclear rights;
- change trademark permissions;

without explicit maintainer approval.

## 12. Pre-public-release legal review

Before a materially commercial launch, paid subscription launch, broad external-contribution program, or significant trademark filing, obtain qualified legal review of:

- software/content licensing boundaries;
- contributor agreements if needed;
- commercial theme/media licenses;
- third-party source reuse practices;
- trademark strategy;
- website Terms of Use/Privacy/medical disclaimers.

This document is an engineering/product licensing policy, not legal advice.
