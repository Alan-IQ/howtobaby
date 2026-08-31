// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Theme Lab gate. The lab is a development/QA surface (docs/GUI_DESIGN.md §18 visual QA): it never appears
 * in production navigation and its route 404s in production builds unless explicitly enabled.
 *
 * Enable outside `next dev` with:  NEXT_PUBLIC_THEME_LAB=1 pnpm build
 * The flag is inlined at build time, so a production bundle built without it contains no lab UI and no
 * fixture theme CSS.
 */
export const THEME_LAB_ENABLED = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_THEME_LAB === "1";
