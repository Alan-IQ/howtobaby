// SPDX-License-Identifier: AGPL-3.0-only
/** PrintAction with its accessible label following the ONE global language preference. */

"use client";

import { PrintAction } from "@howtobaby/ui";

import { useMessages } from "@/i18n/T";

export function LocalizedPrintAction({ className }: { className?: string }) {
  const t = useMessages();
  return <PrintAction label={t("action.print.label")} {...(className !== undefined ? { className } : {})} />;
}
