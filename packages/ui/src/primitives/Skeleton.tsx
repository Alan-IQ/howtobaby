// SPDX-License-Identifier: AGPL-3.0-only
import type { HTMLAttributes } from "react";

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  width?: string;
  height?: string;
}

/** Loading placeholder. Motion stops automatically under reduced motion (duration tokens collapse to 0). */
export function Skeleton({ width = "100%", height = "1em", className, style, ...rest }: SkeletonProps) {
  return <span aria-hidden="true" className={["htb-skeleton", className].filter(Boolean).join(" ")} style={{ width, height, ...style }} {...rest} />;
}
