# Third-Party Notices

HowToBaby intentionally separates original project material from third-party material.

## Authoritative source material

HowToBaby may cite, link to, monitor, or derive original interpretations from authoritative sources such as CDC, AAP, FDA, USDA/HHS, NIH, WHO, and other approved organizations.

Unless explicitly stated otherwise:

- the original source material is **not** owned by HowToBaby;
- it is **not** relicensed under the HowToBaby software or content licenses;
- original source URLs, attribution, and source-specific terms must be preserved;
- fetched HTML/PDF/source snapshots used by monitoring workflows are temporary by default and are not redistributed as project content.

## Commercial themes and UI assets

Purchased or otherwise restricted React themes, templates, UI kits, icons, fonts, illustrations, and related assets remain subject to their vendor licenses. They may be excluded from the public repository entirely.

Adapters and integration code written by HowToBaby may be licensed separately from the vendor asset itself.

## Audio and media

Music, lullabies, sound effects, recordings, images, and other media must carry explicit rights metadata before production use. Bulk media is expected to use object storage/CDN delivery rather than Git.

## Dependencies

Software dependencies remain subject to their respective upstream licenses. `scripts/report-licenses.ts` reports every workspace dependency with its SPDX license, classified against `licenses.policy.json`; review decisions for copyleft/unknown licenses are recorded there. Rights metadata for media/font/icon files tracked in Git lives in `asset-rights.json`. Both reports run in CI (`.github/workflows/pipeline.yml`, `quality-build` job).

## Adding third-party material

Do not add a third-party asset or source body merely because it is publicly accessible. Before adding it, confirm:

1. the project has the right to use it for the intended purpose;
2. redistribution is allowed if the material will be committed or shipped;
3. attribution/notice obligations are recorded;
4. commercial-use restrictions are compatible with the intended deployment;
5. the material is assigned to the correct license boundary rather than silently inheriting the repository default.
