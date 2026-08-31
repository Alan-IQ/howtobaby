// SPDX-License-Identifier: AGPL-3.0-only
import type { HTMLAttributes } from "react";

export function Divider({ className, ...rest }: HTMLAttributes<HTMLHRElement>) {
  return <hr className={["htb-divider", className].filter(Boolean).join(" ")} {...rest} />;
}
