"use client";

import { SelectHTMLAttributes } from "react";
import { clsx } from "clsx";

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ className, children, ...rest }: Props) {
  return (
    <select
      {...rest}
      className={clsx(
        "h-[38px] rounded-lg border border-line bg-surface px-3 text-[13px] text-ink-800 outline-none focus:border-accent",
        className
      )}
    >
      {children}
    </select>
  );
}
