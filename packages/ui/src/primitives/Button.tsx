// SPDX-License-Identifier: AGPL-3.0-only
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "subtle" | "ghost";
export type ButtonSize = "md" | "sm";

interface BaseProps {
  variant?: ButtonVariant | undefined;
  size?: ButtonSize | undefined;
  className?: string | undefined;
  children?: ReactNode;
}

export type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
export type LinkButtonProps = BaseProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export function buttonClassName({ variant = "secondary", size = "md", className }: BaseProps, extra: string[] = []): string {
  return ["htb-button", `htb-button--${variant}`, size === "sm" ? "htb-button--sm" : "", ...extra, className].filter(Boolean).join(" ");
}

/** Button, or an anchor styled as a button when `href` is given (navigation stays a link for a11y/print). */
export function Button(props: ButtonProps | LinkButtonProps) {
  if (props.href !== undefined) {
    const { variant, size, className, children, ...anchor } = props as LinkButtonProps;
    return (
      <a className={buttonClassName({ variant, size, className })} {...anchor}>
        {children}
      </a>
    );
  }
  const { variant, size, className, children, type = "button", ...button } = props as ButtonProps;
  return (
    <button type={type} className={buttonClassName({ variant, size, className })} {...button}>
      {children}
    </button>
  );
}
