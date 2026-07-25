"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({ open, onClose, title, children, maxWidth }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 p-4">
      <div className={"w-full rounded-2xl bg-white p-5 shadow-xl " + (maxWidth || "max-w-md")}>
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-[#1F2937]">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-ink-500 hover:bg-surface">
            <X size={18} />
          </button>
        </div>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}
