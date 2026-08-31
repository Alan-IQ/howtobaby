// SPDX-License-Identifier: AGPL-3.0-only
export interface SkipLinkProps {
  targetId: string;
  children: string;
}

/** Keyboard users jump past header/nav to the main landmark. */
export function SkipLink({ targetId, children }: SkipLinkProps) {
  return (
    <a className="htb-skip-link" href={`#${targetId}`}>
      {children}
    </a>
  );
}
