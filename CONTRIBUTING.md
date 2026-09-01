# Contributing to HowToBaby

HowToBaby is currently establishing its implementation and editorial workflow. Contributions must preserve the project's evidence, licensing, and provenance boundaries.

## Before contributing

Read:

- `CLAUDE.md`
- `docs/PROJECT_PROFILE_v0.8.0.md`
- `docs/DOCS_INDEX.md`
- `docs/LICENSING_POLICY.md`

## Software contributions

Unless explicitly agreed otherwise, accepted original software contributions are provided under **AGPL-3.0-only**.

## Knowledge and documentation contributions

Do **not** submit canonical medical/parenting knowledge, translations, or substantial editorial content unless the project has explicitly opened that contribution path and the required contribution-rights process is in place.

The public knowledge/documentation license is **CC-BY-NC-SA-4.0**, but future commercial operation or separate licensing may require additional permissions from external contributors. Until a contributor-rights/CLA process is adopted, maintainers may decline external canonical-content contributions for this reason.

## Third-party material

Never submit copied medical/public-health source bodies, purchased theme code/assets, copyrighted audio, images, fonts, or other third-party material without explicit redistribution rights and required notices.

## Evidence changes

A source URL alone is not enough. Health/safety content changes must preserve claim-level provenance, source locators, qualifiers, review status, and English/Vietnamese parity where applicable.

## Development setup

### Requirements

- Node.js `>= 22.18` (see `.nvmrc`).
- pnpm `11`, pinned in `package.json` → `packageManager`. Run `corepack enable` once; every `pnpm` invocation then resolves to the pinned version automatically (no global pnpm install needed). If Corepack is missing, `npm install -g corepack` restores it.
- Package scripts run through pnpm's POSIX shell emulator (`shellEmulator: true` in `pnpm-workspace.yaml`), so env-prefixed scripts like `DEPLOY_TARGET=static next build` work on Windows too. pnpm also enforces the supply-chain policy there (`minimumReleaseAge: 1440`): a dependency release younger than 24 hours cannot be resolved into the lockfile — if an install fails on a brand-new release, wait out the window or pick an older version instead of relaxing the policy.

### Everyday commands

```bash
pnpm install --frozen-lockfile        # install exactly what pnpm-lock.yaml pins; postinstall writes packages/ui/src/theme-tokens.generated.css
pnpm dev                              # build:knowledge (derived read models), then the Next.js dev server for apps/web
pnpm build                            # build:knowledge + default profile: static-first, server-capable (.next)
pnpm --filter @howtobaby/web start    # serve that default-profile build locally (next start) — server-capable verification
pnpm build:static                     # build:knowledge + DEPLOY_TARGET=static export → apps/web/out (the profile production deploys)
pnpm validate                         # every CI gate, in CI order (see below)
```

`pnpm --filter @howtobaby/web start` serves the default build only; the static export in `apps/web/out` is plain files — open it with any static file server.

### Validation gates

`pnpm validate` = `pnpm check && pnpm lint && pnpm test && pnpm check:knowledge-determinism && pnpm build && pnpm build:static`, where:

```bash
pnpm check                            # typecheck + check:baseline + check:repo-health + check:theme-boundary + validate:knowledge + report:licenses --strict
pnpm typecheck                        # tsc over scripts/, then every workspace package/app (apps/web runs `next typegen` first)
pnpm check:baseline                   # layout, workspace config, workflows, license entry points, doc links
pnpm check:repo-health                # large-blob guard, deny patterns, size report (--base=origin/main for PR diff)
pnpm check:theme-boundary             # semantic tokens only; no vendor-theme / theme-pack imports in product code
pnpm validate:knowledge               # validate-sources → validate-content → validate-provenance → validate-translations over canonical YAML
pnpm report:licenses --strict         # dependency + tracked-asset license report; --strict fails on findings
pnpm lint                             # ESLint in every workspace that defines it (apps/web)
pnpm test                             # Vitest in every workspace that defines it, then `pnpm test:scripts` (node:test for scripts/lib)
pnpm check:knowledge-determinism      # two from-scratch builds of every derived knowledge artifact must be byte-identical
pnpm build:knowledge                  # build-knowledge-index (knowledge.sqlite + manifests) + build-evidence-index (evidence indexes)
```

The `scripts/` gates run on plain Node + Git (native type stripping); no build step is required. Unit tests are Vitest files colocated with their package (`packages/*/src/**/*.test.ts`, `packages/knowledge/tests/*.test.ts`, `apps/web/src/**/*.test.ts(x)`); tests for the plain-Node scripts live in `scripts/lib/*.test.ts` and run on `node --test` so they need no dependencies.

### Cleaning up

Use the cross-platform cleanup scripts instead of hand-written shell commands (`rm -rf **/node_modules`, `Remove-Item`, …). They run on plain Node — no dependencies, so they work after `node_modules` is gone — and delete only generated/disposable paths:

```bash
pnpm clean:modules                    # root + every workspace node_modules
pnpm clean:build                      # rebuildable output/caches: apps/web/.next, apps/web/out, next-env.d.ts, *.tsbuildinfo,
                                      # packages/knowledge/generated/* (keeps .gitkeep), packages/ui/src/theme-tokens.generated.css,
                                      # coverage/, dist/, .turbo/, .eslintcache, reports/
pnpm clean:local                      # both of the above — a full, safe local reset
node scripts/clean.ts local --dry-run # list what would be removed without deleting anything
```

The scripts never touch canonical YAML/Markdown/JSON, source code, docs, tests, `.git`, `.github`, or `evidence/` (including the Evidence Watch cache); `scripts/lib/clean.ts` checks every path against an allowlist of disposable names and a denylist of protected roots before removing it. After `clean:modules`/`clean:local`, run `pnpm install --frozen-lockfile` again; after `clean:build`, the next `pnpm dev`/`pnpm build` regenerates everything (or run `pnpm gen:theme-css` for the theme reference CSS alone).

About the many `node_modules` folders: a pnpm workspace has one `node_modules` at the root plus one per workspace package (`apps/*`, `packages/*`, `tools/*`) — that is normal, not duplication. pnpm keeps a single copy of every package version in its content-addressable global store and hard-links it into the root virtual store (`node_modules/.pnpm`); workspace `node_modules` folders mostly contain symlinks into that virtual store, so their on-disk footprint is small. `pnpm store path` shows where the global store lives. `pnpm store prune` removes unreferenced packages from that global store; it is an optional, occasional housekeeping step (for example after removing several projects), not part of the routine cleanup — it affects every pnpm project on the machine and only forces re-downloads later.

## Coding conventions

- TypeScript, strict mode, ES modules; `.editorconfig` defines indentation (2 spaces for TS/JS/JSON, LF endings).
- English for code, identifiers, comments, commit messages, and technical docs. English docs are canonical; Vietnamese companions mirror decisions.
- New original source files start with `// SPDX-License-Identifier: AGPL-3.0-only` (software) — knowledge/docs are CC-BY-NC-SA-4.0 by path, see `LICENSE.md`.
- Respect package ownership and dependency direction from `docs/REPOSITORY_STRUCTURE.md`. No medical prose in `apps/web`, `packages/core`, or `packages/ui`; no vendor-theme imports in product/domain code.
- In `packages/themes`, relative imports keep explicit `.ts` extensions (the package must stay runnable on plain Node for `scripts/generate-theme-reference-css.ts`); ignore/disable your IDE's "import can be shortened" suggestion there — `scripts/check-theme-boundary.ts` fails CI if an import is shortened.
- Styling uses semantic tokens only (`var(--htb-…)` emitted by the css-vars adapter).
- Accessibility gates live in the theme tests: every installable theme must pass the WCAG contrast pairs in `packages/themes/src/contract/contrast-gate.ts`, and no interactive control may render below `layout.touchTarget` (44px).
- The Theme Lab (`/theme-lab`) shows every primitive/state and switches installed themes/modes. It is on in `pnpm dev`; for a production-profile build use `NEXT_PUBLIC_THEME_LAB=1 pnpm build`. Without the flag the route 404s and the vendor fixture theme is not even bundled. `?theme=<id>&mode=light|dark|system` previews without persisting. Add new showcase entries in `apps/web/src/theme-lab/sections.tsx`. Raw colour values belong in theme packs under `packages/themes/src`; `scripts/check-theme-boundary.ts` fails CI otherwise. Product code imports `@howtobaby/themes` (contract + registry) only, never a theme pack or `vendor-themes/**` by path.
- Stable claim/source/tool/theme IDs never change because files move or labels change.
- Do not implement behavior from a later phase of `docs/IMPLEMENTATION_ROADMAP.md`.

## Repository hygiene

- Never commit `knowledge.sqlite`/generated indexes, `evidence/cache/**`, build output, bulk media, vendor theme source, or secrets. `.gitignore` blocks the defaults and `scripts/check-repo-health.ts` fails CI on violations.
- Blobs ≥ 10 MiB warn; ≥ 25 MiB are blocked. A justified exception is added to `repo-health.config.json` → `exceptions[]` with pattern, reason, owner, and date — never by raising the threshold.
- New dependencies must classify as allowed in `licenses.policy.json`; copyleft/unknown licenses need a recorded `reviewed[]` decision. Tracked media/font/icon files need a record in `asset-rights.json`.

## Commits and pull requests

- Work on a branch and open a pull request; CI (`ci.yml`, `repo-health.yml`) runs on every push and PR. **A push to `main` deploys production** (`deploy.yml` → `https://howtobaby.com`) once the `production` GitHub Environment is configured, so never push unreviewed work to `main`.
- Branch protection is **not yet enabled** on GitHub (it is a repository setting, not configurable from this codebase). Until a maintainer enables it, a direct push to `main` is technically possible and CI failures are advisory. Required setup (GitHub → Settings → Branches → add rule for `main`): require a pull request before merging; require status checks `Repository baseline` and `App lint, typecheck, tests, builds` (CI) and `Large-blob guard and size report` (Repository health) to pass; require branches to be up to date; block force pushes and deletions.
- Commit subject: plain-language imperative describing the whole change, no type/scope prefix. Body bullets use the most specific Conventional Commits prefix (`feat`, `fix`, `docs`, `refactor`, `test`, `build`, `ci`, `chore`, `perf`, `revert`) with an optional scope:

  ```text
  Establish the repository-health gate.

  - feat(scripts): add check-repo-health.ts with large-blob guard and allowlist.
  - ci: run the health check on push and pull requests.
  ```

- One logical change per PR; do not mix refactors, formatting, renames, or dependency upgrades with feature work.
- Fill in `.github/PULL_REQUEST_TEMPLATE.md`, listing only validation that was actually run.
