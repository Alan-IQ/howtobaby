// SPDX-License-Identifier: AGPL-3.0-only
import { cloneElement, useId, type ReactElement, type ReactNode } from "react";

export interface TooltipProps {
  /** Short, supplemental text only — never the only place an instruction lives. */
  content: ReactNode;
  /** A single focusable trigger element; the tooltip is attached via aria-describedby. */
  children: ReactElement<{ "aria-describedby"?: string | undefined; className?: string | undefined }>;
  /** Placement relative to the trigger. */
  side?: "top" | "bottom";
  className?: string | undefined;
}

/**
 * CSS-driven tooltip: appears on hover AND keyboard focus, dismisses on blur/pointer-out (WCAG 1.4.13's
 * hoverable/persistent requirements are satisfied by the bridge padding and pure-CSS visibility). No
 * pointer-only behaviour: the content is always available to assistive tech via aria-describedby.
 */
export function Tooltip({ content, children, side = "top", className }: TooltipProps) {
  const id = useId();
  const trigger = cloneElement(children, {
    "aria-describedby": [children.props["aria-describedby"], id].filter(Boolean).join(" "),
  });
  return (
    <span className={["htb-tooltip-anchor", className].filter(Boolean).join(" ")} data-side={side}>
      {trigger}
      <span role="tooltip" id={id} className="htb-tooltip">
        {content}
      </span>
    </span>
  );
}
