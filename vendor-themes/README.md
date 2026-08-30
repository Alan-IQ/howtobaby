# vendor-themes/

Optional home for **licensed/purchased theme source and assets** that may not be redistributed. See `docs/THEME_SYSTEM.md` §9 and `docs/LICENSING_POLICY.md` §7.

## Rules

- Everything in this directory except this README and `.gitkeep` is **gitignored** (`vendor-themes/*`). Restricted vendor code never enters public Git history by default; `scripts/check-repo-health.ts` fails if a tracked file appears here without a reviewed exception in `repo-health.config.json`.
- Vendor material is integrated only through the Theme Contract (`packages/themes/src/contract`) via an adapter in `packages/themes/src/adapters/vendor-*`. Product/domain code never imports `vendor-themes/*`.
- A vendor theme is not open source because its adapter is. The adapter can be AGPL-3.0-only while the theme stays under the vendor license.
- Record vendor name, version, license/order reference, redistribution rule, allowed deployments, and update notes as a `ThemeLicenseRecord` (see `docs/THEME_SYSTEM.md`) in the adapter metadata — without publishing restricted source.
- The first-party Baby Modern Glass theme must always keep development and tests working when nothing is installed here.

## Installing a licensed theme locally

```text
vendor-themes/
  README.md          # this file (public)
  .gitkeep           # keeps the directory (public)
  <theme-id>/        # private: unpack the purchased package here, or point the adapter at a private registry/submodule
```

If a build requires a private theme package, CI must fail clearly when it is unavailable rather than silently falling back to partial vendor assets.
