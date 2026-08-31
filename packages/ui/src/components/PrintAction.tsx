// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import { IconButton } from "../primitives/IconButton.tsx";

export interface PrintActionProps {
  label?: string;
  className?: string | undefined;
}

/** Triggers the browser print flow; the print profile (theme print tokens + print.css) does the rest. */
export function PrintAction({ label = "Print this page", className }: PrintActionProps) {
  return <IconButton icon="print" label={label} className={["htb-print-hidden", className].filter(Boolean).join(" ")} onClick={() => window.print()} />;
}
