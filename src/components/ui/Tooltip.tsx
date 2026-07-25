"use client";

import { ReactNode, useState } from "react";

interface Props {
  content: string;
  children: ReactNode;
}

export function Tooltip({ content, children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={function () { setOpen(true); }}
      onMouseLeave={function () { setOpen(false); }}
    >
      {children}
      {open ? (
        <span className="absolute bottom-full left-1/2 z-30 mb-1.5 w-max max-w-[220px] -translate-x-1/2 rounded-md bg-ink-950 px-2.5 py-1.5 text-[12px] leading-snug text-white shadow-card">
          {content}
        </span>
      ) : null}
    </span>
  );
}
