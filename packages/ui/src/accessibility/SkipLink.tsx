// SPDX-License-Identifier: AGPL-3.0-only
import type { ReactNode } from "react";

export interface SkipLinkProps {
  targetId: string;
  /** Localized label (plain text or a message leaf). */
  children: ReactNode;
}

/** Keyboard users jump past header/nav to the main landmark. */
export function SkipLink({ targetId, children }: SkipLinkProps) {
  return (
    <a className="htb-skip-link" href={`#${targetId}`}>
      {children}
    </a>
  );
}
