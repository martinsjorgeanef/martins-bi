"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { ProductRow } from "@/lib/types";
import { exportProductsToExcel, exportProductsToPdf } from "@/lib/exportUtils";

interface Props {
  fetchAllRows: () => Promise<ProductRow[]>;
}

export function ExportButtons({ fetchAllRows }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<"excel" | "pdf" | null>(null);

  async function handleExport(kind: "excel" | "pdf") {
    setLoading(kind);
    setOpen(false);
    try {
      const rows = await fetchAllRows();
      if (kind === "excel") exportProductsToExcel(rows);
      else exportProductsToPdf(rows);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-xs font-medium text-ink-700 hover:bg-surface"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
        Exportar
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-40 rounded-lg border border-line bg-white shadow-card">
          <button
            onClick={() => handleExport("excel")}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-ink-700 hover:bg-surface"
          >
            <FileSpreadsheet size={14} className="text-good" />
            Excel (.xlsx)
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-ink-700 hover:bg-surface"
          >
            <FileText size={14} className="text-bad" />
            PDF
          </button>
        </div>
      )}
    </div>
  );
}
