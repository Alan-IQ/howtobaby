// SPDX-License-Identifier: AGPL-3.0-only
import type { ButtonHTMLAttributes } from "react";

import { buttonClassName, type ButtonSize, type ButtonVariant } from "./Button.tsx";
import { Icon, type IconName } from "./Icon.tsx";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  /** Required: icon-only controls must always have an accessible name. */
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function IconButton({ icon, label, variant = "ghost", size = "md", className, type = "button", ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={buttonClassName({ variant, size, className }, ["htb-icon-button", size === "sm" ? "htb-icon-button--sm" : ""])}
      {...rest}
    >
      <Icon name={icon} />
    </button>
  );
}
