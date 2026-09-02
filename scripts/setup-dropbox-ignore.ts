// SPDX-License-Identifier: AGPL-3.0-only
/**
 * `pnpm setup:dropbox -- "<Dropbox root>"` — add the HowToBaby/dev ignore block to Dropbox's
 * `rules.dropboxignore` (CONTRIBUTING.md "Dropbox and other syncing folders").
 *
 * The Dropbox root is REQUIRED and never guessed (Dropbox may live on any drive or under a team
 * folder). Windows users can run scripts/setup-dropbox-ignore.ps1 directly for the same result.
 */

import { DEV_RULES, DROPBOX_IGNORE_FILE, setupDropboxIgnore } from "./lib/dropbox-ignore.ts";

function main(argv: string[]): number {
  const root = argv.find((arg) => !arg.startsWith("--"));
  if (root === undefined || argv.includes("--help")) {
    console.error(`usage: pnpm setup:dropbox -- "<path_to_your_Dropbox_root>"`);
    console.error(`   e.g. pnpm setup:dropbox -- "C:\\Users\\<user>\\Dropbox"   (Windows)`);
    console.error(`        pnpm setup:dropbox -- "$HOME/Dropbox"                (macOS/Linux)`);
    console.error(`The Dropbox root is not guessed: pass the folder that contains your synced files.`);
    return 2;
  }
  let result;
  try {
    result = setupDropboxIgnore(root);
  } catch (error) {
    console.error((error as Error).message);
    return 1;
  }
  const verb = { created: "Created", updated: "Updated", unchanged: "Already up to date" }[result.action];
  console.log(`${verb}: ${result.file}`);
  console.log(`Managed rules: ${DEV_RULES.join("  ")}`);
  console.log("");
  console.log(`Notes:`);
  console.log(`- ${DROPBOX_IGNORE_FILE} is LOCAL-ONLY (Dropbox does not sync it): run this on every machine that syncs the repo.`);
  console.log(`- Rules apply going forward only. Folders Dropbox already synced stay synced until you remove and recreate them:`);
  console.log(`    pnpm clean:local && pnpm install --frozen-lockfile`);
  console.log(`- Your own rules outside the marked block are left untouched; re-running never duplicates the block.`);
  return 0;
}

process.exitCode = main(process.argv.slice(2));
