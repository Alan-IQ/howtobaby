# REPOSITORY_HEALTH — HowToBaby

> Canonical contract for Git/GitHub repository size, large-file handling, generated/cache exclusions, media storage, CI health gates, and future repository-splitting criteria.

## 1. Purpose

HowToBaby intentionally keeps reviewed knowledge in Git because text history, diffs, pull requests, rollback, and provenance review are product advantages. That does **not** make GitHub an unlimited object store.

The goal is to keep canonical knowledge portable and auditable for the life of the project while preventing binary/media/cache growth from degrading clone, CI, review, or maintenance performance.

## 2. External GitHub guardrails

Current GitHub guidance should be re-verified periodically rather than treated as a permanent product constant. At the v0.7.0 baseline:

- regular Git files above 50 MiB trigger a warning;
- regular Git files above 100 MiB are blocked;
- repositories are recommended to remain ideally below 1 GB;
- remaining below 5 GB is strongly recommended.

References:

- https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github
- https://docs.github.com/en/billing/concepts/product-billing/git-lfs

HowToBaby uses stricter internal thresholds so GitHub limits are never the first warning signal.

## 3. What belongs in normal Git

Normal Git is the preferred home for compact, authored, reviewable state:

- canonical YAML/Markdown/JSON knowledge;
- EN canonical content and VI translations;
- SourceRecord / ClaimSourceRef / SourceLocator metadata;
- fingerprints and reviewed source-change metadata when compact;
- schemas, code, tests, CI configuration, docs;
- tool definitions and media metadata;
- first-party theme code/assets that are small and license-compatible;
- permitted vendor adapters/metadata.

Text-file count alone is not a reason to add a database backend or abandon Git.

## 4. What must stay out of normal Git by default

- `knowledge.sqlite` and any generated database/read model;
- generated manifests/indexes/route bundles when reproducible;
- build output and dependency caches;
- `evidence/cache/**`;
- downloaded CDC/AAP/FDA/WHO HTML/PDF/source bodies used only for diffing;
- parser scratch data and monitoring screenshots;
- large audio/video/image libraries;
- large licensed vendor-theme archives/packages;
- secrets, private user exports, or production data.

If an artifact is generated from canonical Git inputs, deletion plus rebuild must be the normal recovery path.

## 5. Internal repository budget

These are HowToBaby engineering guardrails, not GitHub hard limits.

| Metric | Target / action |
|---|---|
| Canonical knowledge working tree | Target `< 250 MiB` before architecture review |
| Whole checked-out authored tree (excluding dependencies/generated/cache) | Warn near `500 MiB` |
| Git repository/object database | Review when approaching `1 GiB` |
| New ordinary Git blob | Warn at `10 MiB`; block above `25 MiB` unless explicitly allowlisted |
| Generated SQLite | `0 MiB` committed; always gitignored/rebuildable |
| Evidence fetched bodies/cache | `0 MiB` committed by default |
| Bulk media library | External object storage/CDN once it is more than small fixtures |

A budget exception requires a documented reason and an explicit allowlist; increasing a threshold merely to make CI green is not a fix.

## 6. CI repository-health gate

CI must run a repository-health check that reports at minimum:

- largest new/changed blobs;
- tracked files matching generated/cache/database/media deny patterns;
- Git object/repository size indicators;
- unexpectedly large authored directories;
- committed `knowledge.sqlite` or generated DB/index artifacts;
- committed Evidence Watch cache/source bodies;
- oversized binary/theme/media files outside an allowlist.

Recommended implementation:

- custom `scripts/check-repo-health.ts` for project-specific path/pattern/size rules;
- `git-sizer` when available for deeper Git-health diagnostics;
- `git count-objects -vH` / equivalent metrics for reporting;
- CI failure for hard-policy violations and warning output for approaching budgets.

The check must be deterministic enough to run locally and in GitHub Actions.

Implementation: the `repository-health` job of `.github/workflows/pipeline.yml` (full-history checkout, plain Node from `.nvmrc`, no dependency install) on every push/PR and weekly; production deploy depends on it. Locally it is part of `pnpm check`.

## 7. `.gitignore` / deny-pattern baseline

At minimum protect patterns conceptually equivalent to:

```text
packages/knowledge/generated/*.sqlite
packages/knowledge/generated/**/*.sqlite
packages/knowledge/generated/**/cache/**
evidence/cache/**
.next/**
out/**
dist/**
coverage/**
node_modules/**
*.tmp
*.cache
```

Exact patterns are implementation-owned. Do not ignore authored manifests or review records merely because they are YAML/JSON.

## 8. Media policy

Small development/MVP fixtures may be tracked when all are true:

- useful for deterministic development/test;
- redistribution/license permits it;
- file size is comfortably within internal budget;
- history growth is acceptable.

Production media libraries should use object storage/CDN. Git stores metadata such as:

```text
assetId
content type
duration/dimensions
license/attribution
content hash/version
object-storage key or delivery URL
```

Git LFS is **not** the default architecture for HowToBaby media or knowledge. It may be approved for a specific collaborative binary workflow, but canonical YAML/Markdown/JSON never moves to LFS merely because the repository has many files.

## 9. SQLite policy

`knowledge.sqlite` is an early derived read model, not stored history.

Invariant:

```text
delete knowledge.sqlite
+ checkout canonical Git knowledge/code/schemas
→ rebuild
→ equivalent validated projection
```

Local/CI builds may cache or publish SQLite as a CI artifact for speed. Such artifacts have retention/expiry and are not reviewed as content.

## 10. Evidence-source storage policy

Evidence Watch can fetch entire source documents temporarily. Persistent proof is the structured provenance record and review history, not a permanent copy of every authority document.

Store compact persistent state when useful:

- canonical URL;
- source/section locator;
- ETag/Last-Modified;
- document/section fingerprint;
- check/review timestamps;
- parser version;
- change classification/review record.

Retain full snapshots only when a specific legal/licensing/audit requirement justifies them and place them in an appropriate restricted store rather than assuming public Git is acceptable.

## 11. Backup and portability

GitHub hosting is not the only copy of canonical knowledge. Periodically maintain a restorable mirror/archive of the repository and Git history outside the primary GitHub repository. Generated caches/databases need not be backed up if they are reproducible.

## 12. When to split repositories

Do **not** split merely because there are many YAML files.

Consider a separate canonical knowledge repository only when one or more are materially true:

- Git/object size approaches the internal review threshold despite correct exclusions;
- knowledge and application require different access-control/review teams;
- CI/clone performance is measurably impaired;
- release cadence/permissions require independent versioning;
- licensed/private material creates a real repository-boundary requirement.

If split:

```text
howtobaby-knowledge (canonical YAML/Git)
        ↓ pinned commit/content version
compile → SQLite/route bundles
        ↓
howtobaby application
```

Git/YAML remains authoritative.

## 13. Definition of done

Repository-health policy is implemented when:

- generated SQLite/cache/source bodies are gitignored or otherwise blocked;
- large-blob/deny-pattern checks run in CI;
- current repository-size metrics are visible in CI output;
- exceptions are explicit and reviewable;
- bulk media has an external-storage path before it becomes a repository problem;
- canonical knowledge can be cloned, reviewed, rebuilt, and restored without relying on generated databases.
