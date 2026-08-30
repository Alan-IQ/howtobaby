<!-- Keep the title as a plain-language imperative summary (no type/scope prefix). -->

## What changed

<!-- One paragraph. Then bullets in the CONTRIBUTING.md commit format, e.g. `- feat(core): ...` -->

## Why

<!-- Link the roadmap phase / doc section / issue that requires this change. -->

## Checklist

- [ ] Change stays inside the current phase of `docs/IMPLEMENTATION_ROADMAP.md`; no later-phase behavior added.
- [ ] Ownership boundaries in `docs/REPOSITORY_STRUCTURE.md` are respected (no medical prose in UI/core, no vendor-theme imports in domain code).
- [ ] No generated SQLite/indexes, evidence cache/source bodies, build output, bulk media, vendor theme source, or secrets are committed; `node scripts/check-repo-health.ts` passes locally.
- [ ] New dependencies/assets have compatible licenses and are recorded (`licenses.policy.json` review decisions, `asset-rights.json` records, `THIRD_PARTY_NOTICES.md` when required).
- [ ] Health/safety content changes keep claim-level provenance, qualifiers, review status and EN/VI parity (from Phase 2 onward).
- [ ] Docs updated only where the implementation makes them inaccurate; canonical owners in `docs/DOCS_INDEX.md` unchanged unless approved.
- [ ] Validation actually run is listed below.

## Validation performed

<!-- Commands actually executed and their result. Do not list checks that were not run. -->
