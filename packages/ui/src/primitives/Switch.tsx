// SPDX-License-Identifier: AGPL-3.0-only
import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "type" | "role"> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: ReactNode;
}

/** Accessible toggle (role="switch"); keyboard: Space/Enter via native button. */
export function Switch({ checked, onCheckedChange, label, className, disabled, ...rest }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={["htb-switch", className].filter(Boolean).join(" ")}
      onClick={() => onCheckedChange(!checked)}
      {...rest}
    >
      <span className="htb-switch__track" aria-hidden="true">
        <span className="htb-switch__thumb" />
      </span>
      <span>{label}</span>
    </button>
  );
}
