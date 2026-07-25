"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
  total?: number;
}

export function Pagination({ page, totalPages, onPage, total }: Props) {
  return (
    <div className="flex items-center justify-between border-t border-line px-3 py-2">
      <span className="text-[13px] text-ink-600">
        {total !== undefined ? total.toLocaleString("pt-BR") + " registros - " : ""}
        Pagina {page} de {totalPages}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={function () { onPage(Math.max(1, page - 1)); }}
          disabled={page <= 1}
          className="rounded-md border border-line p-1.5 text-ink-700 disabled:opacity-30"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          onClick={function () { onPage(Math.min(totalPages, page + 1)); }}
          disabled={page >= totalPages}
          className="rounded-md border border-line p-1.5 text-ink-700 disabled:opacity-30"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
