// SPDX-License-Identifier: AGPL-3.0-only
"use client";

import Link from "next/link";

import type { NavigationLinkProps } from "@howtobaby/ui";

/** Router-aware link handed to the Navigation primitive. */
export function NavLink({ href, children, ...rest }: NavigationLinkProps) {
  return (
    <Link href={href} {...rest}>
      {children}
    </Link>
  );
}
