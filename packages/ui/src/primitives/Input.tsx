// SPDX-License-Identifier: AGPL-3.0-only
import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";

interface FieldChrome {
  label: ReactNode;
  hint?: ReactNode;
  className?: string;
}

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className">, FieldChrome {}

export function Input({ label, hint, className, id, ...rest }: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  return (
    <div className={["htb-field", className].filter(Boolean).join(" ")}>
      <label className="htb-field__label" htmlFor={inputId}>
        {label}
      </label>
      <input id={inputId} className="htb-input" aria-describedby={hintId} {...rest} />
      {hint ? (
        <p id={hintId} className="htb-field__hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "className">, FieldChrome {
  options: readonly SelectOption[];
}

export function Select({ label, hint, className, id, options, ...rest }: SelectProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const hintId = hint ? `${selectId}-hint` : undefined;
  return (
    <div className={["htb-field", className].filter(Boolean).join(" ")}>
      <label className="htb-field__label" htmlFor={selectId}>
        {label}
      </label>
      <select id={selectId} className="htb-select" aria-describedby={hintId} {...rest}>
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
      {hint ? (
        <p id={hintId} className="htb-field__hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
