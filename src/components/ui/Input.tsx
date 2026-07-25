"use client";

import { InputHTMLAttributes } from "react";
import { clsx } from "clsx";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export function Input({ icon, className, ...rest }: Props) {
  if (icon) {
    return (
      <div className="relative w-full">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500">{icon}</span>
        <input
          {...rest}
          className={clsx(
            "h-[38px] w-full rounded-lg border border-line bg-surface pl-8 pr-3 text-[13px] text-ink-800 outline-none focus:border-accent",
            className
          )}
        />
      </div>
    );
  }
  return (
    <input
      {...rest}
      className={clsx(
        "h-[38px] rounded-lg border border-line bg-surface px-3 text-[13px] text-ink-800 outline-none focus:border-accent",
        className
      )}
    />
  );
}
