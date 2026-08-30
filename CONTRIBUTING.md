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

Requirements: Node.js `>= 22.18` (see `.nvmrc`) and pnpm `10` (pinned in `package.json` → `packageManager`; `corepack enable` installs it).

```bash
pnpm install --frozen-lockfile
pnpm check            # typecheck + baseline + repository health + strict license report
```

Individual gates:

```bash
pnpm typecheck                        # TypeScript check of scripts/
node scripts/check-repo-baseline.ts   # layout, workspace config, workflows, license entry points, doc links
node scripts/check-repo-health.ts     # large-blob guard, deny patterns, size report (--base=origin/main for PR diff)
node scripts/report-licenses.ts       # dependency + asset license report (--strict to fail on findings)
```

The scripts run on plain Node + Git (native type stripping); no build step is required.

## Coding conventions

- TypeScript, strict mode, ES modules; `.editorconfig` defines indentation (2 spaces for TS/JS/JSON, LF endings).
- English for code, identifiers, comments, commit messages, and technical docs. English docs are canonical; Vietnamese companions mirror decisions.
- New original source files start with `// SPDX-License-Identifier: AGPL-3.0-only` (software) — knowledge/docs are CC-BY-NC-SA-4.0 by path, see `LICENSE.md`.
- Respect package ownership and dependency direction from `docs/REPOSITORY_STRUCTURE.md`. No medical prose in `apps/web`, `packages/core`, or `packages/ui`; no vendor-theme imports in product/domain code.
- Stable claim/source/tool/theme IDs never change because files move or labels change.
- Do not implement behavior from a later phase of `docs/IMPLEMENTATION_ROADMAP.md`.

## Repository hygiene

- Never commit `knowledge.sqlite`/generated indexes, `evidence/cache/**`, build output, bulk media, vendor theme source, or secrets. `.gitignore` blocks the defaults and `scripts/check-repo-health.ts` fails CI on violations.
- Blobs ≥ 10 MiB warn; ≥ 25 MiB are blocked. A justified exception is added to `repo-health.config.json` → `exceptions[]` with pattern, reason, owner, and date — never by raising the threshold.
- New dependencies must classify as allowed in `licenses.policy.json`; copyleft/unknown licenses need a recorded `reviewed[]` decision. Tracked media/font/icon files need a record in `asset-rights.json`.

## Commits and pull requests

- Work on a branch and open a pull request; CI (`ci.yml`, `repo-health.yml`) runs on every push and PR.
- Branch protection is **not yet enabled** on GitHub (it is a repository setting, not configurable from this codebase). Until a maintainer enables it, a direct push to `main` is technically possible and CI failures are advisory. Required setup (GitHub → Settings → Branches → add rule for `main`): require a pull request before merging; require status checks `Repository baseline` (CI) and `Large-blob guard and size report` (Repository health) to pass; require branches to be up to date; block force pushes and deletions.
- Commit subject: plain-language imperative describing the whole change, no type/scope prefix. Body bullets use the most specific Conventional Commits prefix (`feat`, `fix`, `docs`, `refactor`, `test`, `build`, `ci`, `chore`, `perf`, `revert`) with an optional scope:

  ```text
  Establish the repository-health gate.

  - feat(scripts): add check-repo-health.ts with large-blob guard and allowlist.
  - ci: run the health check on push and pull requests.
  ```

- One logical change per PR; do not mix refactors, formatting, renames, or dependency upgrades with feature work.
- Fill in `.github/PULL_REQUEST_TEMPLATE.md`, listing only validation that was actually run.
