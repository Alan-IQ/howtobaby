// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Dropbox ignore helper proofs (node:test): the managed block is created, replaced in place and
 * never duplicated; user rules outside the block survive byte-for-byte; the Dropbox root is
 * verified, never guessed; and the PowerShell twin carries the same markers and rules.
 */

import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { BLOCK_END, BLOCK_START, DEV_RULES, DROPBOX_IGNORE_FILE, managedBlock, mergeDropboxIgnore, setupDropboxIgnore } from "./dropbox-ignore.ts";

const count = (text: string, needle: string) => text.split(needle).length - 1;

test("creates the block when no file exists", () => {
  const result = mergeDropboxIgnore(undefined);
  assert.equal(result.action, "created");
  assert.equal(result.text, `${managedBlock()}\n`);
  for (const rule of ["**/node_modules/", "**/.next/", "**/out/", "**/coverage/"]) assert.ok(result.text.includes(`\n${rule}\n`), rule);
});

test("appends after existing user rules without touching them, then stays idempotent", () => {
  const user = "# my rules\n*.tmp\nPhotos/raw/\n";
  const first = mergeDropboxIgnore(user);
  assert.equal(first.action, "updated");
  assert.ok(first.text.startsWith(user), "user rules preserved at the top");
  assert.equal(count(first.text, BLOCK_START), 1);
  const second = mergeDropboxIgnore(first.text);
  assert.equal(second.action, "unchanged");
  assert.equal(second.text, first.text);
  assert.equal(count(second.text, "**/node_modules/"), 1, "no duplicated rules");
});

test("replaces a stale block in place and keeps rules before and after it", () => {
  const stale = ["before/", BLOCK_START, "**/old-rule/", BLOCK_END, "after/", ""].join("\n");
  const result = mergeDropboxIgnore(stale);
  assert.equal(result.action, "updated");
  assert.ok(result.text.startsWith("before/\n"));
  assert.ok(result.text.endsWith("after/\n"));
  assert.ok(!result.text.includes("**/old-rule/"));
  assert.equal(count(result.text, BLOCK_START), 1);
  assert.equal(count(result.text, BLOCK_END), 1);
});

test("preserves CRLF line endings of an existing Windows-authored file", () => {
  const result = mergeDropboxIgnore("*.tmp\r\n");
  assert.ok(result.text.includes("\r\n"));
  assert.ok(!/[^\r]\n/.test(result.text), "no bare LF introduced");
});

test("refuses an unbalanced block instead of guessing", () => {
  assert.throws(() => mergeDropboxIgnore(`${BLOCK_START}\n**/node_modules/\n`), /unbalanced/);
});

test("setupDropboxIgnore verifies the root and writes the file", () => {
  const root = mkdtempSync(join(tmpdir(), "htb-dropbox-"));
  try {
    assert.throws(() => setupDropboxIgnore(join(root, "missing")), /does not exist/);
    writeFileSync(join(root, DROPBOX_IGNORE_FILE), "*.tmp\n");
    const first = setupDropboxIgnore(root);
    assert.equal(first.action, "updated");
    const written = readFileSync(join(root, DROPBOX_IGNORE_FILE), "utf8");
    assert.ok(written.startsWith("*.tmp\n"));
    assert.equal(setupDropboxIgnore(root).action, "unchanged");
    assert.equal(readFileSync(join(root, DROPBOX_IGNORE_FILE), "utf8"), written);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("the PowerShell twin carries identical markers and rules", () => {
  const ps1 = readFileSync(new URL("../setup-dropbox-ignore.ps1", import.meta.url), "utf8");
  assert.ok(ps1.includes(`$BlockStart = '${BLOCK_START}'`), "BLOCK_START in sync");
  assert.ok(ps1.includes(`$BlockEnd = '${BLOCK_END}'`), "BLOCK_END in sync");
  const rules = /\$DevRules = @\(([^)]*)\)/.exec(ps1)?.[1] ?? "";
  const psRules = [...rules.matchAll(/'([^']+)'/g)].map((m) => m[1]);
  assert.deepEqual(psRules, [...DEV_RULES]);
  assert.ok(ps1.includes("Mandatory = $true"), "Dropbox root is a required parameter, never guessed");
});
