// SPDX-License-Identifier: AGPL-3.0-only
/**
 * FIXTURE — a stand-in for a third-party React theme/UI-kit token export.
 *
 * This file imitates the *shape* of a vendor's design-token module (vendor-specific names, its own scale, no
 * knowledge of HowToBaby semantics). A real purchased theme would live in vendor-themes/<id>/ (gitignored) or a
 * private registry and be imported ONLY by its adapter, never by product/domain code. The values below are
 * HowToBaby-authored test data, not vendor material.
 */

export interface VendorSampleKitTokens {
  readonly kitName: string;
  readonly kitVersion: string;
  readonly palette: {
    readonly brand: string;
    readonly brandDeep: string;
    readonly paper: string;
    readonly paperTint: string;
    readonly card: string;
    readonly cardAlt: string;
    readonly ink: string;
    readonly inkSoft: string;
    readonly inkFaint: string;
    readonly line: string;
    readonly lineBold: string;
    readonly success: string;
    readonly warning: string;
    readonly danger: string;
    readonly dangerDeep: string;
    readonly violet: string;
    readonly teal: string;
    readonly coral: string;
    readonly rose: string;
  };
  readonly paletteDark: VendorSampleKitTokens["palette"];
  readonly shape: { readonly cornerSm: number; readonly cornerMd: number; readonly cornerLg: number };
  readonly type: { readonly family: string; readonly baseSize: number };
}

export const vendorSampleKit: VendorSampleKitTokens = {
  kitName: "Paper Soft Kit (fixture)",
  kitVersion: "0.0.0-fixture",
  palette: {
    brand: "#0f766e",
    brandDeep: "#115e59",
    paper: "#fbfaf6",
    paperTint: "#f3efe4",
    card: "#ffffff",
    cardAlt: "#f5f2ea",
    ink: "#1f2421",
    inkSoft: "#4b524d",
    inkFaint: "#66706a",
    line: "rgba(31, 36, 33, 0.12)",
    lineBold: "rgba(31, 36, 33, 0.5)",
    success: "#2a744a",
    warning: "#9a5b00",
    danger: "#b42318",
    dangerDeep: "#7a1a12",
    violet: "#6d4aa3",
    teal: "#0f766e",
    coral: "#b03a0a",
    rose: "#a8335a",
  },
  paletteDark: {
    brand: "#5eead4",
    brandDeep: "#99f6e4",
    paper: "#161a19",
    paperTint: "#1c2321",
    card: "#1f2624",
    cardAlt: "#283130",
    ink: "#f2f4f2",
    inkSoft: "#c6ccc8",
    inkFaint: "#9aa39d",
    line: "rgba(255, 255, 255, 0.12)",
    lineBold: "rgba(255, 255, 255, 0.45)",
    success: "#7bd39a",
    warning: "#f4c56b",
    danger: "#ff9b90",
    dangerDeep: "#ffb4ab",
    violet: "#c9b0ee",
    teal: "#5eead4",
    coral: "#f9a07a",
    rose: "#f1a0b8",
  },
  shape: { cornerSm: 6, cornerMd: 10, cornerLg: 14 },
  type: { family: 'Georgia, "Iowan Old Style", "Palatino Linotype", ui-serif, serif', baseSize: 17 },
};
