// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Dropbox ignore helper — shared rule block + safe merge (CONTRIBUTING.md "Dropbox and other
 * syncing folders").
 *
 * Dropbox reads `rules.dropboxignore` at the Dropbox ROOT (gitignore-style, recursive `**` globs)
 * and skips matching paths on this machine only. The helper owns exactly ONE clearly marked block
 * in that file and never touches the user's own rules outside it, so it is safe to re-run.
 *
 * `scripts/setup-dropbox-ignore.ps1` is the self-contained Windows PowerShell twin of this logic;
 * both must keep the same markers and rules (guarded by scripts/lib/dropbox-ignore.test.ts).
 *
 * Plain Node only — no third-party imports.
 */

import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

export const DROPBOX_IGNORE_FILE = "rules.dropboxignore";

/** Marker lines fencing the managed block. Anything outside them belongs to the user. */
export const BLOCK_START = "# >>> howtobaby/dev — managed by scripts/setup-dropbox-ignore (do not edit inside this block) >>>";
export const BLOCK_END = "# <<< howtobaby/dev <<<";

/** Generic development artifacts Dropbox must never sync (disposable, rebuilt by pnpm/Next). */
export const DEV_RULES: readonly string[] = ["**/node_modules/", "**/.next/", "**/out/", "**/coverage/"];

export function managedBlock(): string {
  return [BLOCK_START, "# Generic development artifacts. Local-only: Dropbox does not sync this file, run the helper on every machine.", ...DEV_RULES, BLOCK_END].join("\n");
}

export interface MergeResult {
  text: string;
  /** "created" — no file existed; "updated" — block replaced/added; "unchanged" — already current. */
  action: "created" | "updated" | "unchanged";
}

/**
 * Merge the managed block into an existing `rules.dropboxignore` text.
 * - No existing text → block only.
 * - Existing block (between markers) → replaced in place; everything else preserved byte-for-byte.
 * - No block → appended after the user's rules, separated by one blank line.
 * Idempotent: merging the output again yields "unchanged".
 */
export function mergeDropboxIgnore(existing: string | undefined): MergeResult {
  const block = managedBlock();
  if (existing === undefined) return { text: `${block}\n`, action: "created" };
  const eol = existing.includes("\r\n") ? "\r\n" : "\n";
  const lines = existing.split(/\r?\n/);
  const start = lines.indexOf(BLOCK_START);
  const end = lines.indexOf(BLOCK_END);
  let next: string[];
  if (start !== -1 && end > start) {
    next = [...lines.slice(0, start), ...block.split("\n"), ...lines.slice(end + 1)];
  } else if (start !== -1 || end !== -1) {
    throw new Error(`${DROPBOX_IGNORE_FILE} has an unbalanced howtobaby/dev block; fix the markers by hand before re-running.`);
  } else {
    const trimmed = existing.replace(/(\r?\n)+$/, "");
    next = [...(trimmed === "" ? [] : [...trimmed.split(/\r?\n/), ""]), ...block.split("\n")];
  }
  let text = next.join(eol);
  if (!text.endsWith(eol)) text += eol;
  return { text, action: text === existing ? "unchanged" : "updated" };
}

export interface SetupResult extends MergeResult {
  file: string;
}

/** Verify the Dropbox root and write the merged file. Never guesses the root — the caller passes it. */
export function setupDropboxIgnore(dropboxRoot: string): SetupResult {
  const root = resolve(dropboxRoot);
  if (!existsSync(root) || !statSync(root).isDirectory()) throw new Error(`Dropbox root does not exist or is not a directory: ${root}`);
  const file = join(root, DROPBOX_IGNORE_FILE);
  const existing = existsSync(file) ? readFileSync(file, "utf8") : undefined;
  const merged = mergeDropboxIgnore(existing);
  if (merged.action !== "unchanged") writeFileSync(file, merged.text, "utf8");
  return { ...merged, file };
}
