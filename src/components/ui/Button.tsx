"use client";

import { ReactNode } from "react";
import { clsx } from "clsx";

export type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "ghost";

interface Props {
  children: ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  type?: "button" | "submit";
  title?: string;
  className?: string;
}

var VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white hover:bg-accent-dark",
  secondary: "bg-good text-white hover:opacity-90",
  outline: "border border-line bg-white text-ink-700 hover:bg-surface",
  danger: "border border-bad/40 text-bad hover:bg-bad/10",
  ghost: "text-ink-700 hover:bg-surface"
};

export function Button({ children, onClick, variant, disabled, type, title, className }: Props) {
  var v = variant || "primary";
  return (
    <button
      type={type || "button"}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={clsx(
        "flex h-[38px] items-center justify-center gap-1.5 rounded-lg px-3.5 text-[13px] font-medium transition disabled:opacity-50",
        VARIANT_CLASSES[v],
        className
      )}
    >
      {children}
    </button>
  );
}
