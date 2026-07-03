import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type SharedProps = {
  children: ReactNode;
  variant?: "solid" | "outline";
  className?: string;
};

type AnchorProps = SharedProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

type NativeButtonProps = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

type GoldButtonProps = AnchorProps | NativeButtonProps;

export function GoldButton({ children, variant = "solid", className = "", ...props }: GoldButtonProps) {
  const classes = `gold-button gold-button-${variant} ${className}`.trim();

  if ("href" in props && typeof props.href === "string") {
    const { href, ...anchorProps } = props as AnchorProps;

    return (
      <a className={classes} href={href} {...anchorProps}>
        <span>{children}</span>
      </a>
    );
  }

  const buttonProps = props as NativeButtonProps;

  return (
    <button className={classes} {...buttonProps}>
      <span>{children}</span>
    </button>
  );
}
