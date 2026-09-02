# SPDX-License-Identifier: AGPL-3.0-only
<#
.SYNOPSIS
  Add the HowToBaby/dev ignore block to Dropbox's rules.dropboxignore (Windows helper).

.DESCRIPTION
  Dropbox reads `rules.dropboxignore` at the Dropbox ROOT (gitignore-style, recursive `**` globs)
  and skips matching paths on THIS machine only. This script:
    - verifies the Dropbox root you pass exists (it never guesses the root);
    - creates or updates rules.dropboxignore safely, preserving every rule you wrote yourself;
    - manages exactly one clearly marked "howtobaby/dev" block (idempotent — re-running never
      duplicates rules);
    - adds the generic development rules: **/node_modules/  **/.next/  **/out/  **/coverage/

  `pnpm setup:dropbox -- "<root>"` runs the cross-platform Node twin (scripts/setup-dropbox-ignore.ts);
  both keep identical markers and rules.

.PARAMETER DropboxRoot
  Path to your Dropbox root folder (the folder that contains your synced files), e.g.
  "C:\Users\<user>\Dropbox". Required.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts\setup-dropbox-ignore.ps1 "C:\Users\me\Dropbox"

.NOTES
  - rules.dropboxignore is LOCAL-ONLY: Dropbox does not sync it, so run this on every machine.
  - Rules apply going forward only. Folders Dropbox already synced stay synced until you remove
    and recreate them: `pnpm clean:local` then `pnpm install --frozen-lockfile`.
  - Never commit your rules.dropboxignore to the repository.
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true, Position = 0, HelpMessage = 'Path to your Dropbox root folder, e.g. C:\Users\<user>\Dropbox')]
  [string]$DropboxRoot
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Keep these in sync with scripts/lib/dropbox-ignore.ts (guarded by scripts/lib/dropbox-ignore.test.ts).
$BlockStart = '# >>> howtobaby/dev — managed by scripts/setup-dropbox-ignore (do not edit inside this block) >>>'
$BlockEnd = '# <<< howtobaby/dev <<<'
$DevRules = @('**/node_modules/', '**/.next/', '**/out/', '**/coverage/')
$BlockLines = @($BlockStart, '# Generic development artifacts. Local-only: Dropbox does not sync this file, run the helper on every machine.') + $DevRules + @($BlockEnd)

if (-not (Test-Path -LiteralPath $DropboxRoot -PathType Container)) {
  Write-Error "Dropbox root does not exist or is not a directory: $DropboxRoot`nPass the folder that contains your synced files, e.g. `"C:\Users\<user>\Dropbox`"."
  exit 1
}
$Root = (Resolve-Path -LiteralPath $DropboxRoot).Path
$File = Join-Path $Root 'rules.dropboxignore'

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$action = 'created'
if (Test-Path -LiteralPath $File -PathType Leaf) {
  $existing = [System.IO.File]::ReadAllText($File)
  $eol = if ($existing.Contains("`r`n")) { "`r`n" } else { "`n" }
  $lines = [System.Collections.Generic.List[string]]($existing -split "`r?`n")
  $start = $lines.IndexOf($BlockStart)
  $end = $lines.IndexOf($BlockEnd)
  if ($start -ge 0 -and $end -gt $start) {
    $next = @()
    if ($start -gt 0) { $next += $lines.GetRange(0, $start) }
    $next += $BlockLines
    if ($end + 1 -lt $lines.Count) { $next += $lines.GetRange($end + 1, $lines.Count - $end - 1) }
  } elseif ($start -ge 0 -or $end -ge 0) {
    Write-Error "rules.dropboxignore has an unbalanced howtobaby/dev block; fix the markers by hand before re-running."
    exit 1
  } else {
    $trimmed = $existing -replace '(\r?\n)+$', ''
    $next = @()
    if ($trimmed -ne '') { $next += ($trimmed -split "`r?`n"); $next += '' }
    $next += $BlockLines
  }
  $text = ($next -join $eol)
  if (-not $text.EndsWith($eol)) { $text += $eol }
  $action = if ($text -eq $existing) { 'unchanged' } else { 'updated' }
} else {
  $text = ($BlockLines -join "`n") + "`n"
}

if ($action -ne 'unchanged') { [System.IO.File]::WriteAllText($File, $text, $utf8NoBom) }

$verb = switch ($action) { 'created' { 'Created' } 'updated' { 'Updated' } default { 'Already up to date' } }
Write-Host "${verb}: $File"
Write-Host "Managed rules: $($DevRules -join '  ')"
Write-Host ''
Write-Host 'Notes:'
Write-Host '- rules.dropboxignore is LOCAL-ONLY (Dropbox does not sync it): run this on every machine that syncs the repo.'
Write-Host '- Rules apply going forward only. Folders Dropbox already synced stay synced until you remove and recreate them:'
Write-Host '    pnpm clean:local ; pnpm install --frozen-lockfile'
Write-Host '- Your own rules outside the marked block are left untouched; re-running never duplicates the block.'
