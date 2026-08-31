// SPDX-License-Identifier: AGPL-3.0-only
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [".next/**", "out/**", "next-env.d.ts"],
  },
  {
    rules: {
      // Product/domain code must not reach vendor theme source or theme packs by path (docs/THEME_SYSTEM.md §2).
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["**/vendor-themes/**", "vendor-themes/**"], message: "Vendor theme source is reachable only through a packages/themes adapter." },
            { group: ["@howtobaby/themes/*", "**/packages/themes/src/**"], message: "Import from the @howtobaby/themes entry (registry/contract) only." },
          ],
        },
      ],
    },
  },
];

export default config;
