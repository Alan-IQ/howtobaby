// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Framework-free claim-text structure helper, safe to import from client components (no
 * repository / node:fs dependency).
 */

/**
 * Split a canonical claim text into its lead paragraph(s), list items (`- ` lines) and trailing
 * paragraph(s). Milestone and activity claims are authored as one lead line followed by items so
 * a list can render as a list on screen and paper — never as checkboxes (milestones are references,
 * not a pass/fail checklist). A claim without `- ` lines is a single paragraph list.
 */
export interface ClaimTextParts {
  lead: string[];
  items: string[];
  trailing: string[];
}

export function splitClaimText(text: string): ClaimTextParts {
  const lead: string[] = [];
  const items: string[] = [];
  const trailing: string[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (line === "") continue;
    if (line.startsWith("- ")) items.push(line.slice(2).trim());
    else if (items.length === 0) lead.push(line);
    else trailing.push(line);
  }
  return { lead, items, trailing };
}
