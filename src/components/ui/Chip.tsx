"use client";

import { ReactNode } from "react";
import { clsx } from "clsx";

interface Props {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
}

export function Chip({ children, active, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "h-[38px] rounded-full border px-3.5 text-[13px] font-medium transition",
        active ? "border-accent bg-accent text-white" : "border-line bg-white text-ink-600 hover:bg-surface"
      )}
    >
      {children}
    </button>
  );
}
