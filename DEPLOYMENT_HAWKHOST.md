# HowToBaby — HawkHost production deployment

This package is prepared for the repository `Alan-IQ/howtobaby`.

## Deployment model

`main` push -> GitHub Actions -> Next.js static export -> SSH/rsync -> HawkHost document root.

The Next.js application remains server-capable. Static export is enabled only when
`DEPLOY_TARGET=static`.

## Required GitHub Environment secrets

Create a GitHub Environment named `production` and add:

- `HH_SSH_HOST` — HawkHost SSH hostname from the New Account Information email.
- `HH_SSH_PORT` — normally `22`.
- `HH_SSH_USER` — cPanel username.
- `HH_SSH_PRIVATE_KEY` — private half of a dedicated Ed25519 deploy key.
- `HH_SSH_KNOWN_HOSTS` — verified `known_hosts` line for the HawkHost SSH server.
- `HH_DEPLOY_PATH` — absolute document-root path, for example:
  `/home/CPANEL_USER/public_html/howtobaby.com`

Never store the private SSH key in the repository.

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

## Generate a dedicated deploy key locally

Example:

```bash
ssh-keygen -t ed25519 -C "howtobaby-github-actions" -f howtobaby_hawkhost
```

Import `howtobaby_hawkhost.pub` into HawkHost and authorize it.

Put the complete contents of `howtobaby_hawkhost` into GitHub secret
`HH_SSH_PRIVATE_KEY`.

## Create the verified known-hosts secret

From a trusted local machine:

```bash
ssh-keyscan -p 22 YOUR_HAWKHOST_SSH_HOST
```

Verify the fingerprint independently before trusting it, then save the
appropriate output line as GitHub secret `HH_SSH_KNOWN_HOSTS`.

## Cloudflare

Create DNS records pointing `howtobaby.com` to the HawkHost origin IP and enable
Cloudflare proxying for the web hostname.

Recommended SSL/TLS mode: `Full (strict)` after HawkHost has a valid origin
certificate (for example its cPanel AutoSSL certificate).

Do not use Cloudflare Flexible SSL.

Recommended canonical-host setup:

- `howtobaby.com` is the canonical hostname.
- Redirect `www.howtobaby.com` -> `https://howtobaby.com`.
- Enable Always Use HTTPS.

## Next.js application requirement

`apps/web/next.config.ts` uses a deployment-target switch:

```text
DEPLOY_TARGET=static -> full static export to apps/web/out
otherwise            -> normal server-capable Next.js configuration
```

The GitHub workflow sets `DEPLOY_TARGET=static`.

## Production flow

Once the actual Next.js app and root pnpm workspace exist:

```text
git push origin main
    |
    v
GitHub Actions
    |
    +-- pnpm install --frozen-lockfile
    +-- DEPLOY_TARGET=static pnpm --dir apps/web build
    +-- verify apps/web/out/index.html
    +-- rsync apps/web/out/ -> HawkHost document root
    +-- curl https://howtobaby.com
```

## Rollback

The simplest initial rollback is:

1. GitHub -> repository -> Actions.
2. Revert the bad commit on `main`, or create a revert commit.
3. Push the revert to `main`.
4. The workflow rebuilds and redeploys the previous code.

For a later production phase, add versioned release directories and atomic
symlink switching if the hosting layout supports it.

## Important

Phase 0 decision: `deploy.yml` is trigger-restricted to `workflow_dispatch`
(manual) because the `apps/web` application does not exist yet and a push to
`main` would have nothing buildable to deploy. When Phase 1 creates the actual
Next.js application, re-add the `push: branches: [main]` trigger. The
static-first/server-capable posture is unchanged: `DEPLOY_TARGET=static` is a
deployment profile, not the canonical application architecture.
