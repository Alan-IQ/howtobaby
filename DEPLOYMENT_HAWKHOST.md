# HowToBaby — HawkHost production deployment

This runbook belongs to the repository `Alan-IQ/HowToBaby` and is implemented by the
`deploy-production` job of `.github/workflows/pipeline.yml` (Phase 1; consolidated with CI and
repository health so one push to `main` produces one pipeline run).

## Deployment model

`main` push -> GitHub Actions -> Next.js static export -> SSH/rsync -> HawkHost document root.

The Next.js application remains server-capable. Static export is enabled only when
`DEPLOY_TARGET=static`.

Workflow jobs:

1. `verify` — `pnpm install --frozen-lockfile`, `pnpm check` (typecheck, repository baseline,
   repository health, theme boundary, strict license report), `pnpm lint`, `pnpm test`,
   `pnpm build:static` (`DEPLOY_TARGET=static`), then verifies `apps/web/out/index.html`,
   `404.html` and `.htaccess` exist and uploads `apps/web/out` as a build artifact.
2. `deploy` — runs in the GitHub Environment `production` (so environment protection rules and
   required reviewers apply), fails fast if any `HH_*` secret is missing, checks over SSH that
   `HH_DEPLOY_PATH/.howtobaby-deploy-root` exists and `rsync` is available on the host, then
   `rsync --archive --checksum --delete` from the artifact into `HH_DEPLOY_PATH`, then smoke-checks
   `https://howtobaby.com` (expects HTTP 200 and the HowToBaby shell markup) and reports whether
   `https://www.howtobaby.com` redirects to the canonical host.

Nothing host-specific is hard-coded in the workflow; every value comes from the `production`
environment secrets. Deploys are serialised (`concurrency: deploy-production`) and never cancelled
mid-transfer. `rsync --delete` protects `.howtobaby-deploy-root`, `.well-known/` (AutoSSL/ACME
validation) and `cgi-bin/` from deletion.

## Required GitHub Environment secrets

Create a GitHub Environment named `production` (repository → Settings → Environments → New
environment) and add these **environment** secrets (not repository secrets):

| Secret | Value |
| --- | --- |
| `HH_SSH_HOST` | HawkHost SSH server hostname (or IP) |
| `HH_SSH_PORT` | SSH port, normally `22` |
| `HH_SSH_USER` | cPanel username |
| `HH_SSH_PRIVATE_KEY` | private half of the dedicated deploy key, full file contents |
| `HH_SSH_KNOWN_HOSTS` | one verified host-key line for that server |
| `HH_DEPLOY_PATH` | absolute path of the dedicated document root |

Never store the private SSH key in the repository.

Recommended environment protection: restrict deployment branches to `main`; optionally add a
required reviewer so a `main` push waits for approval before touching the host.

### How to determine each value

Work through these in order; later values are verified with earlier ones. Commands are shown for
Windows PowerShell (built-in OpenSSH); the same commands work in any POSIX shell.

**`HH_SSH_HOST`** — the server you SSH into, NOT `howtobaby.com` (which resolves to Cloudflare once
proxied, and Cloudflare does not forward SSH). Use the server hostname from the HawkHost
New Account Information email (e.g. `veridian.hawkhost.com`) or the "Server Information" panel in
cPanel; the server's IP address also works and is immune to DNS changes. Verify:
`ssh <HH_SSH_USER>@<HH_SSH_HOST>` must reach a shell.

**`HH_SSH_PORT`** — `22` unless HawkHost's account email says otherwise. Verify with the same login;
if `22` times out, check the email/panel for a custom port and use that number everywhere below
(`ssh -p`, `ssh-keyscan -p`).

**`HH_SSH_USER`** — the cPanel username (shown in the account email and at the cPanel dashboard,
also the first path segment of your home directory, `/home/<user>`). Not an email address, not a
Cloudflare or GitHub account.

**`HH_SSH_PRIVATE_KEY`** — generate a dedicated key pair used ONLY by this workflow (never reuse a
personal key):

```powershell
ssh-keygen -t ed25519 -C "howtobaby-github-actions" -f howtobaby_hawkhost
# passphrase: leave EMPTY — CI cannot type one
```

This produces two files. Import and authorize `howtobaby_hawkhost.pub` (the public half) in
cPanel → SSH Access → Manage SSH Keys. The secret value is the complete contents of the file
WITHOUT `.pub`:

```powershell
Get-Content howtobaby_hawkhost -Raw
```

Paste everything including the `-----BEGIN OPENSSH PRIVATE KEY-----` and
`-----END OPENSSH PRIVATE KEY-----` lines. Verify before saving:

```powershell
ssh -i howtobaby_hawkhost -p 22 <HH_SSH_USER>@<HH_SSH_HOST> "rsync --version"
```

This must log in without a password prompt and print an rsync version. The `.pub` file goes only
into cPanel; it is not the value of any secret.

**`HH_SSH_KNOWN_HOSTS`** — the SSH **host key** of the HawkHost server, so CI can prove it is
talking to the right machine (`StrictHostKeyChecking=yes`). Do not confuse it with the deploy key:
the deploy key is YOUR identity (you generated it); the host key is the SERVER's identity (the
server generated it). The two never match. Obtain it:

```powershell
ssh-keyscan -p 22 <HH_SSH_HOST>
```

Take exactly one full output line — prefer the `ssh-ed25519` one:

```text
server.hawkhost.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA...
```

Before trusting it, verify the fingerprint against what your own machine recorded when the
`ssh -i howtobaby_hawkhost ...` test above succeeded:

```powershell
ssh-keyscan -p 22 <HH_SSH_HOST> 2>$null | ssh-keygen -lf -
ssh-keygen -lf $env:USERPROFILE\.ssh\known_hosts
```

The `SHA256:...` fingerprint on the ED25519 rows must be identical in both outputs (the local
`known_hosts` file may show hashed `|1|...` hostnames — compare by fingerprint, not by name). If
HawkHost publishes host-key fingerprints in the panel/email, compare with those too. If the port is
not 22, the line looks like `[server.hawkhost.com]:2222 ssh-ed25519 AAAA...` — keep the brackets.

**`HH_DEPLOY_PATH`** — the ABSOLUTE path of the document root that serves `howtobaby.com` (the
workflow rejects a relative value, and `~` is not expanded). cPanel → Domains shows the document
root for the domain; confirm the absolute form on the server:

```bash
ssh -i howtobaby_hawkhost -p 22 <HH_SSH_USER>@<HH_SSH_HOST>
cd <document root as cPanel shows it>   # e.g. cd ~/apps/howtobaby.com
pwd                                     # prints e.g. /home/<user>/apps/howtobaby.com  ← the value
touch .howtobaby-deploy-root            # the sentinel the deploy job requires
```

Use exactly what `pwd` prints (some HawkHost servers use `/home2/...`), no trailing slash. Two
checks that must both hold: the path is the SAME directory cPanel serves the domain from (rsync to
a directory Apache does not serve deploys nothing visible), and the directory is DEDICATED to this
site (`rsync --delete` mirrors it; unrelated files would be removed — the sentinel check exists to
enforce this decision).

## HawkHost preparation

1. cPanel -> Domains -> Create A New Domain.
2. Add `howtobaby.com`.
3. Do not share the document root with another site.
4. Note the document root shown by cPanel.
5. cPanel -> SSH Access -> Manage SSH Keys.
6. Import and authorize the public half of a dedicated deploy key.
7. Confirm SSH login works with that key.
8. Confirm `rsync` is available:
   `rsync --version`
9. Confirm the exact HowToBaby document root. It must be dedicated to this site.
10. Inside that exact directory, create the deployment sentinel:
    `touch .howtobaby-deploy-root`

The workflow refuses to deploy unless `.howtobaby-deploy-root` exists in the
configured `HH_DEPLOY_PATH`. This is a guard against deploying to a mistyped or
wrong directory.

If `howtobaby.com` is the cPanel Main Domain, its document root is normally
`/home/CPANEL_USER/public_html` and cannot be changed from the Domains UI.

IMPORTANT: the workflow uses `rsync --delete`. Do not use a shared document root
that contains unrelated websites or files. If `public_html` contains addon-domain
directories or other content you need to preserve, either move those sites to
their own document roots and explicitly protect them, or do not enable this
workflow until the production root is dedicated/safely isolated.

## Cloudflare

Create DNS records pointing `howtobaby.com` to the HawkHost origin IP and enable
Cloudflare proxying for the web hostname:

- `A     howtobaby.com      <HawkHost origin IP>`   (proxied)
- `CNAME www                howtobaby.com`          (proxied) — required so the `www` redirect can be served

Recommended SSL/TLS mode: `Full (strict)` after HawkHost has a valid origin
certificate (for example its cPanel AutoSSL certificate).

Do not use Cloudflare Flexible SSL.

Recommended canonical-host setup:

- `howtobaby.com` is the canonical hostname (`apps/web/src/site.ts` → `SITE.url`, used for
  `metadataBase`/canonical URLs).
- Redirect `www.howtobaby.com` -> `https://howtobaby.com` at the edge: Rules → Redirect Rules →
  create a rule matching hostname `www.howtobaby.com`, dynamic redirect to
  `concat("https://howtobaby.com", http.request.uri.path)`, status 301, preserve query string.
- Enable Always Use HTTPS.

The exported `.htaccess` (`apps/web/public/.htaccess`) also redirects `www` → apex and `http` →
`https` at the origin, so the canonical host holds even if the Cloudflare rule is missing, as long
as the `www` DNS record resolves to the same document root (add `www.howtobaby.com` as an alias of
the domain in cPanel if it is not created automatically).

## Next.js application requirement

`apps/web/next.config.ts` uses a deployment-target switch:

```text
DEPLOY_TARGET=static -> full static export to apps/web/out
otherwise            -> normal server-capable Next.js configuration
```

The GitHub workflow sets `DEPLOY_TARGET=static`.

## Production flow

```text
git push origin main
    |
    v
GitHub Actions (pipeline.yml — one run)
    |
    +-- repository-health   (parallel) full-history checkout, Node 24, no install:
    |                       large-blob guard / deny patterns / size report
    +-- quality-build       (parallel) Node 24 + pinned pnpm, ONE frozen install:
    |     +-- pnpm check:quality && pnpm lint && pnpm test && pnpm check:knowledge-determinism
    |     +-- pnpm build && pnpm build:static  (DEPLOY_TARGET=static)
    |     +-- verify apps/web/out/{index.html,404.html,.htaccess}
    |     +-- upload apps/web/out as artifact static-export-<sha>   (main production runs only)
    +-- deploy-production   needs BOTH jobs above; main only; no checkout/install/build:
          +-- HH_* secrets present, HH_DEPLOY_PATH absolute
          +-- download artifact static-export-<sha>, verify index.html + .htaccess
          +-- ssh (StrictHostKeyChecking=yes): test -f "$HH_DEPLOY_PATH/.howtobaby-deploy-root"
          +-- rsync --delete out/ -> $HH_DEPLOY_PATH   (sentinel, .well-known/, cgi-bin/ protected)
          +-- curl https://howtobaby.com  (+ www canonical redirect check)
          +-- remove deploy key
```

## First deployment checklist (manual steps outside the repository)

The workflow cannot create hosting accounts, DNS records, keys or GitHub settings. Complete these
once, in order; each maps to a check the workflow performs.

1. HawkHost/cPanel: create the `howtobaby.com` domain with a **dedicated** document root (or confirm
   the main-domain `public_html` contains nothing but this site). Note the absolute path.
2. Inside that exact directory run `touch .howtobaby-deploy-root`. Without it the deploy job stops
   before `rsync`.
3. Generate a dedicated Ed25519 deploy key locally; import and authorize the public half in
   cPanel → SSH Access; confirm `ssh -i <key> -p 22 <user>@<host> 'rsync --version'` works.
4. Run `ssh-keyscan -p 22 <host>`, verify the fingerprint as described in
   "How to determine each value", keep the matching `ssh-ed25519` line for `HH_SSH_KNOWN_HOSTS`.
5. GitHub: create Environment `production`; add secrets `HH_SSH_HOST`, `HH_SSH_PORT`, `HH_SSH_USER`,
   `HH_SSH_PRIVATE_KEY`, `HH_SSH_KNOWN_HOSTS`, `HH_DEPLOY_PATH` (values per
   "How to determine each value" above); restrict deployment branches to `main`.
6. Cloudflare: add the `A` (apex) and `CNAME www` records (proxied), set SSL/TLS to
   `Full (strict)` once AutoSSL has issued the origin certificate, enable Always Use HTTPS, add the
   `www` → apex redirect rule.
7. Trigger the workflow (push to `main`, or Actions → Pipeline → Run workflow on `main` with
   `deploy` ticked) and read the smoke-check step: HTTP 200 on `https://howtobaby.com` and a 301
   from `www`.
8. Optional but recommended: enable branch protection on `main` (see `CONTRIBUTING.md`) so only
   reviewed, green commits reach production.

## Rollback

The simplest initial rollback is:

1. GitHub -> repository -> Actions.
2. Revert the bad commit on `main`, or create a revert commit.
3. Push the revert to `main`.
4. The workflow rebuilds and redeploys the previous code.

For a later production phase, add versioned release directories and atomic
symlink switching if the hosting layout supports it.

## Important

Status (Phase 1): the `deploy-production` job of `.github/workflows/pipeline.yml` implements this
runbook and runs on every push to `main` (and on manual dispatch with `deploy: true`), only after
the `repository-health` and `quality-build` jobs of the same run succeed. Pull requests and the
weekly scheduled run never deploy. Production deploys use a dedicated concurrency group with
`cancel-in-progress: false`: a newer deploy waits for a running transfer instead of interrupting
it, while superseded gate jobs of an older push may be cancelled. Until the manual steps above are
completed the workflow fails safely: the gate jobs still prove the build, and `deploy-production`
stops at the missing-secrets or sentinel check without contacting or modifying anything.

The static-first/server-capable posture is unchanged: `DEPLOY_TARGET=static` is a deployment
profile, not the canonical application architecture.
