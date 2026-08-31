// SPDX-License-Identifier: AGPL-3.0-only
import type { SVGProps } from "react";

export type IconName =
  | "home"
  | "feeding"
  | "play"
  | "sleep"
  | "safety"
  | "tools"
  | "sun"
  | "moon"
  | "system"
  | "palette"
  | "print"
  | "menu"
  | "close"
  | "check"
  | "external"
  | "globe"
  | "document"
  | "calendar"
  | "info";

/** Minimal line-icon set drawn in-house (no third-party icon font/asset). Decorative by default. */
const PATHS: Record<IconName, string> = {
  home: "M3 11.5 12 4l9 7.5M5 10v10h14V10",
  feeding: "M9 3h6M10 3v3.5a2 2 0 0 1-.6 1.4L8 9.3A3 3 0 0 0 7 11.5V19a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-7.5a3 3 0 0 0-1-2.2L14.6 7.9A2 2 0 0 1 14 6.5V3M7 14h10",
  play: "M4 10h7v7H4zM13 4h7v7h-7zM13 13l7 7M20 13l-7 7",
  sleep: "M20 14.5A8.5 8.5 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5Z",
  safety: "M12 3l7 3v5c0 4.5-3 7.7-7 10-4-2.3-7-5.5-7-10V6l7-3ZM9 12l2 2 4-4",
  tools: "M14.5 4.5a4 4 0 0 0-5 5L4 15v5h5l5.5-5.5a4 4 0 0 0 5-5l-2.5 2.5-2.5-2.5 2.5-2.5Z",
  sun: "M12 4v2M12 18v2M4 12h2M18 12h2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M6.3 17.7l1.4-1.4M16.3 7.7l1.4-1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",
  moon: "M20 14.5A8.5 8.5 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5Z",
  system: "M4 5h16v11H4zM9 20h6M12 16v4",
  palette: "M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 0-4H12a1.5 1.5 0 0 1 0-3h4a4 4 0 0 0 4-4 7 7 0 0 0-8-7ZM7.5 10.5h.01M10.5 6.5h.01M15.5 6.5h.01",
  print: "M7 8V4h10v4M6 17H4v-6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6h-2M7 14h10v6H7z",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M6 6l12 12M18 6 6 18",
  check: "M5 12l4 4L19 7",
  external: "M14 5h5v5M19 5l-8 8M17 14v5H5V7h5",
  globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM3 12h18M12 3c2.4 2.5 3.7 5.6 3.7 9s-1.3 6.5-3.7 9c-2.4-2.5-3.7-5.6-3.7-9s1.3-6.5 3.7-9Z",
  document: "M7 3h7l4 4v14H7V3ZM14 3v4h4M10 12h5M10 16h5",
  calendar: "M5 5.5h14V20H5V5.5ZM5 9.5h14M8.5 3v4M15.5 3v4",
  info: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 11v5M12 7.6h.01",
};

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  /** Accessible label; omit for purely decorative use (aria-hidden). */
  label?: string;
}

export function Icon({ name, label, className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={["htb-icon", className].filter(Boolean).join(" ")}
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      focusable="false"
      {...rest}
    >
      {label ? <title>{label}</title> : null}
      <path d={PATHS[name]} />
    </svg>
  );
}
