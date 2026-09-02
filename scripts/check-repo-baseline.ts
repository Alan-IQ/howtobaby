// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Repository-baseline check — verifies the physical layout, root workspace configuration, legal entry
 * points, workflow files, and documentation cross-references required by docs/REPOSITORY_STRUCTURE.md,
 * docs/LICENSING_POLICY.md and the Phase 0 gate in docs/IMPLEMENTATION_ROADMAP.md.
 *
 * Usage: node scripts/check-repo-baseline.ts
 * Exit code 1 when a required artifact is missing or a documentation reference is broken.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, posix, resolve } from "node:path";

import { git, repoRoot } from "./lib/git.ts";
import { Report } from "./lib/report.ts";

/** Directories that must exist so every owner in REPOSITORY_STRUCTURE.md §2 has a physical home. */
const REQUIRED_DIRECTORIES = [
  "apps/web/src/app",
  "apps/web/src/components",
  "apps/web/src/features/now",
  "apps/web/src/features/feeding",
  "apps/web/src/features/development",
  "apps/web/src/features/sleep",
  "apps/web/src/features/safety",
  "apps/web/src/features/tools",
  "apps/web/src/storage",
  "apps/web/src/print",
  "apps/web/public/icons",
  "apps/web/public/audio",
  "packages/core/src/age",
  "packages/core/src/context",
  "packages/core/src/applicability",
  "packages/core/src/types",
  "packages/knowledge/src/sources",
  "packages/knowledge/src/claims/feeding",
  "packages/knowledge/src/claims/development",
  "packages/knowledge/src/claims/sleep",
  "packages/knowledge/src/claims/safety",
  "packages/knowledge/src/guidance",
  "packages/knowledge/src/translations/vi",
  "packages/knowledge/src/coverage",
  "packages/knowledge/src/schemas",
  "packages/knowledge/repository",
  "packages/knowledge/generated",
  "packages/ui/src/primitives",
  "packages/ui/src/components",
  "packages/ui/src/evidence",
  "packages/ui/src/accessibility",
  "packages/themes/src/contract",
  "packages/themes/src/adapters",
  "packages/themes/src/registry",
  "packages/themes/src/baby-modern-glass",
  "packages/tool-platform/src/registry",
  "packages/tool-platform/src/runtime",
  "packages/tool-platform/src/audio",
  "packages/tool-platform/src/safety",
  "packages/i18n",
  "packages/validation",
  "vendor-themes",
  "tools/lullaby-player",
  "tools/ambient-audio",
  "evidence/adapters/cdc",
  "evidence/adapters/aap",
  "evidence/adapters/fda",
  "evidence/adapters/who",
  "evidence/adapters/generic-web",
  "evidence/watcher",
  "evidence/diff",
  "evidence/dependency-graph",
  "evidence/reports",
  "evidence/state",
  "evidence/cache",
  "evidence/schemas",
  "scripts",
  "docs",
  "tests/content",
  "tests/integration",
  "tests/e2e",
  "tests/visual",
  ".github/workflows",
];

const REQUIRED_FILES = [
  "package.json",
  "pnpm-workspace.yaml",
  "pnpm-lock.yaml",
  "tsconfig.json",
  ".gitignore",
  ".gitattributes",
  ".editorconfig",
  "CLAUDE.md",
  "README.md",
  "CONTRIBUTING.md",
  "LICENSE.md",
  "LICENSES/AGPL-3.0-only.txt",
  "LICENSES/CC-BY-NC-SA-4.0.txt",
  "THIRD_PARTY_NOTICES.md",
  "repo-health.config.json",
  "licenses.policy.json",
  "asset-rights.json",
  "vendor-themes/README.md",
  "vendor-themes/.gitkeep",
  "packages/knowledge/src/sources/registry.yaml",
  "scripts/validate-content.ts",
  "scripts/validate-sources.ts",
  "scripts/validate-provenance.ts",
  "scripts/validate-translations.ts",
  "scripts/build-knowledge-index.ts",
  "scripts/check-repo-health.ts",
  "scripts/build-evidence-index.ts",
  "scripts/generate-public-pages.ts",
  "scripts/evidence-watch.ts",
  "docs/PROJECT_PROFILE_v0.8.0.md",
  "docs/DOCS_INDEX.md",
  "docs/REPOSITORY_STRUCTURE.md",
  "docs/REPOSITORY_HEALTH.md",
  "docs/LICENSING_POLICY.md",
  "docs/GUIDANCE_CONTENT_CONTRACT.md",
  "docs/EVIDENCE_PROVENANCE.md",
  "docs/SYSTEM_ARCHITECTURE.md",
  "docs/GUI_DESIGN.md",
  "docs/THEME_SYSTEM.md",
  "docs/TOOL_PLATFORM.md",
  "docs/EVIDENCE_UPDATE_ENGINE.md",
  "docs/IMPLEMENTATION_ROADMAP.md",
];

/**
 * Workflow contract (docs/REPOSITORY_STRUCTURE.md §12): ONE primary pipeline owns CI, repository
 * health and production deploy; Evidence Watch stays a separate manual-only Phase 9 workflow.
 */
const PRIMARY_PIPELINE = "pipeline.yml";
const REQUIRED_WORKFLOWS = [PRIMARY_PIPELINE, "evidence-watch.yml"];
const PIPELINE_JOBS = ["repository-health", "quality-build", "deploy-production"] as const;
/** Workflows replaced by the primary pipeline; their presence would re-create duplicate runs per push. */
const OBSOLETE_WORKFLOWS = ["ci.yml", "repo-health.yml", "deploy.yml"];

/**
 * Layout is verified against the Git index, not the working tree, so a local run matches a fresh CI checkout
 * (an untracked or gitignored directory exists locally but is missing after clone).
 */
function checkLayout(report: Report, root: string): void {
  report.section("Physical layout (verified against tracked files)");
  const tracked = git(["ls-files", "-z", "--cached"], { cwd: root }).split("\0").filter(Boolean);
  const trackedSet = new Set(tracked);
  let missing = 0;
  for (const dir of REQUIRED_DIRECTORIES) {
    const prefix = `${dir}/`;
    if (!tracked.some((p) => p.startsWith(prefix))) {
      missing += 1;
      const hint = existsSync(join(root, dir)) && statSync(join(root, dir)).isDirectory()
        ? "exists locally but has no tracked file (untracked, gitignored, or an empty directory) — add a .gitkeep or fix .gitignore"
        : "is missing";
      report.error("layout", `required directory from REPOSITORY_STRUCTURE.md ${hint}`, dir);
    }
  }
  for (const file of REQUIRED_FILES) {
    if (!trackedSet.has(file)) {
      missing += 1;
      report.error("layout", existsSync(join(root, file)) ? "required file exists locally but is not tracked by Git" : "required file is missing", file);
    }
  }
  if (missing === 0) report.info("layout", `${REQUIRED_DIRECTORIES.length} directories and ${REQUIRED_FILES.length} files present`);
}

function checkWorkspace(report: Report, root: string): void {
  report.section("Root workspace configuration");
  const pkgPath = join(root, "package.json");
  if (!existsSync(pkgPath)) return;
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as Record<string, unknown>;
  if (pkg["private"] !== true) report.error("workspace", "root package.json must be private", "package.json");
  if (pkg["license"] !== "AGPL-3.0-only") report.error("workspace", "root package.json license must be the SPDX id AGPL-3.0-only (docs/LICENSING_POLICY.md §2)", "package.json");
  if (typeof pkg["packageManager"] !== "string" || !String(pkg["packageManager"]).startsWith("pnpm@")) {
    report.error("workspace", "root package.json must pin the pnpm version via packageManager", "package.json");
  }
  const engines = pkg["engines"] as Record<string, string> | undefined;
  if (!engines?.["node"]) report.error("workspace", "root package.json must declare engines.node", "package.json");

  const wsPath = join(root, "pnpm-workspace.yaml");
  if (existsSync(wsPath)) {
    const ws = readFileSync(wsPath, "utf8");
    for (const glob of ["apps/*", "packages/*", "tools/*"]) {
      if (!ws.includes(`"${glob}"`) && !ws.includes(`'${glob}'`) && !ws.includes(`- ${glob}`)) {
        report.error("workspace", `pnpm-workspace.yaml must include the workspace glob ${glob}`, "pnpm-workspace.yaml");
      }
    }
  }
  if (report.errors.length === 0) report.info("workspace", "package.json / pnpm-workspace.yaml / tsconfig.json are consistent with the monorepo contract");
}

function checkWorkflows(report: Report, root: string): void {
  report.section("GitHub Actions workflows");
  for (const name of REQUIRED_WORKFLOWS) {
    const file = join(root, ".github/workflows", name);
    const rel = `.github/workflows/${name}`;
    if (!existsSync(file)) {
      report.error("workflow", "required workflow file is missing", rel);
      continue;
    }
    const text = readFileSync(file, "utf8");
    if (text.trim().length === 0 || !/^on:/m.test(text) || !/^jobs:/m.test(text)) {
      report.error("workflow", "workflow file is empty or lacks `on:`/`jobs:`; GitHub reports such files as invalid", rel);
    }
  }
  for (const name of OBSOLETE_WORKFLOWS) {
    if (existsSync(join(root, ".github/workflows", name))) {
      report.error("workflow", `obsolete workflow must be deleted; its jobs live in ${PRIMARY_PIPELINE}`, `.github/workflows/${name}`);
    }
  }
  const pipelineFile = join(root, ".github/workflows", PRIMARY_PIPELINE);
  if (existsSync(pipelineFile)) {
    const pipeline = readFileSync(pipelineFile, "utf8");
    const rel = `.github/workflows/${PRIMARY_PIPELINE}`;
    for (const job of PIPELINE_JOBS) {
      if (!new RegExp(`^  ${job}:`, "m").test(pipeline)) report.error("workflow", `primary pipeline lacks the \`${job}\` job`, rel);
    }
    // The repository-health gate must be a real job step (docs/REPOSITORY_HEALTH.md §6), not a comment.
    if (!/^\s+run: node scripts\/check-repo-health\.ts/m.test(pipeline)) {
      report.error("workflow", "primary pipeline does not run scripts/check-repo-health.ts (docs/REPOSITORY_HEALTH.md §6)", rel);
    }
    // Production deploy must depend on BOTH gates; a deploy that skips either would bypass a release gate.
    if (!/^\s+needs:\s*\[\s*repository-health\s*,\s*quality-build\s*]/m.test(pipeline)) {
      report.error("workflow", "`deploy-production` must declare `needs: [repository-health, quality-build]`", rel);
    }
    if (!/^\s+group: deploy-production\s*$/m.test(pipeline) || !/cancel-in-progress: false/.test(pipeline)) {
      report.error("workflow", "production deploy must use the dedicated `deploy-production` concurrency group with `cancel-in-progress: false`", rel);
    }
  }
  if (report.errors.filter((f) => f.check === "workflow").length === 0) report.info("workflow", "primary pipeline + evidence-watch are present, obsolete workflows are gone, and the repository-health gate is wired into the pipeline");
}

function checkLicenseEntryPoints(report: Report, root: string): void {
  report.section("License entry points");
  const license = readFileSync(join(root, "LICENSE.md"), "utf8");
  for (const spdx of ["AGPL-3.0-only", "CC-BY-NC-SA-4.0"]) {
    if (!license.includes(spdx)) report.error("license", `LICENSE.md must reference SPDX id ${spdx}`, "LICENSE.md");
    if (!existsSync(join(root, "LICENSES", `${spdx}.txt`))) report.error("license", `LICENSES/${spdx}.txt is missing`, `LICENSES/${spdx}.txt`);
  }
  for (const [file, needle] of [
    ["LICENSE.md", "THIRD_PARTY_NOTICES.md"],
    ["LICENSE.md", "docs/LICENSING_POLICY.md"],
    ["CONTRIBUTING.md", "LICENSING_POLICY.md"],
    ["README.md", "LICENSE.md"],
  ] as const) {
    if (!readFileSync(join(root, file), "utf8").includes(needle)) report.error("license", `${file} must route readers to ${needle}`, file);
  }
  if (report.errors.filter((f) => f.check === "license").length === 0) report.info("license", "LICENSE.md, LICENSES/*, THIRD_PARTY_NOTICES.md and CONTRIBUTING.md are present and cross-linked");
}

/** Every relative Markdown link in root/docs Markdown must resolve to an existing file. */
function checkDocLinks(report: Report, root: string): void {
  report.section("Documentation cross-references");
  const files = [
    ...readdirSync(root).filter((f) => f.endsWith(".md")).map((f) => join(root, f)),
    ...readdirSync(join(root, "docs")).filter((f) => f.endsWith(".md")).map((f) => join(root, "docs", f)),
  ];
  const linkRe = /\[[^\]]*]\(([^)\s]+)\)/g;
  let broken = 0;
  let checked = 0;
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    for (const match of text.matchAll(linkRe)) {
      const target = match[1]!;
      if (/^[a-z]+:/i.test(target) || target.startsWith("#") || target.startsWith("mailto:")) continue;
      const clean = target.split("#")[0]!;
      if (!clean) continue;
      checked += 1;
      const resolved = resolve(dirname(file), clean);
      if (!existsSync(resolved)) {
        broken += 1;
        report.error("doc-link", `broken relative link \`${target}\``, posix.relative(root, file).replace(/\\/g, "/"));
      }
    }
  }
  // Every doc named in DOCS_INDEX.md and CLAUDE.md must exist in docs/.
  for (const entry of ["docs/DOCS_INDEX.md", "CLAUDE.md"]) {
    const text = readFileSync(join(root, entry), "utf8");
    for (const match of text.matchAll(/`(?:docs\/)?([A-Z_a-z0-9.]+\.md)`/g)) {
      const name = match[1]!;
      const candidates = [join(root, "docs", name), join(root, name)];
      checked += 1;
      if (!candidates.some((c) => existsSync(c))) {
        broken += 1;
        report.error("doc-link", `references \`${name}\`, which does not exist in docs/ or the repository root`, entry);
      }
    }
  }
  if (broken === 0) report.info("doc-link", `${checked} documentation references resolve`);
}

function main(): number {
  const root = repoRoot();
  const report = new Report("Repository baseline");
  checkLayout(report, root);
  checkWorkspace(report, root);
  checkWorkflows(report, root);
  checkLicenseEntryPoints(report, root);
  checkDocLinks(report, root);
  return report.finish();
}

process.exitCode = main();
