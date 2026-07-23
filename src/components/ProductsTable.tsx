"use client";

import { ProductRow } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { clsx } from "clsx";

interface Props {
  rows: ProductRow[];
  loading: boolean;
  page: number;
  totalPages: number;
  total: number;
  onPage: (p: number) => void;
  sortBy: string;
  sortDir: "asc" | "desc";
  onSort: (field: string) => void;
}

var HEADER_BG = "#EFF6FF";
var HEADER_TEXT = "#1E3A8A";
var EAN_WIDTH = 130;

function money(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function DiffCell({ diffPct }: { diffPct: number | null }) {
  if (diffPct === null) return <span className="text-[12px] text-ink-500">-</span>;
  const pct = diffPct * 100;
  const positive = pct >= 0;
  return (
    <span className={clsx("text-[12px] font-medium tabular-nums", positive ? "text-good" : "text-bad")}>
      {positive ? "+" : ""}
      {pct.toFixed(1)}%
    </span>
  );
}

function SortHeader({
  label,
  field,
  sortBy,
  sortDir,
  onSort,
  align = "left",
  sticky = false
}: {
  label: string;
  field: string;
  sortBy: string;
  sortDir: "asc" | "desc";
  onSort: (f: string) => void;
  align?: "left" | "right" | "center";
  sticky?: boolean;
}) {
  const active = sortBy === field;
  return (
    <th
      onClick={function () { onSort(field); }}
      style={sticky ? { position: "sticky", left: 0, background: HEADER_BG, zIndex: 2 } : undefined}
      className={clsx(
        "cursor-pointer select-none whitespace-nowrap px-3 py-3 hover:opacity-80",
        align === "right" && "text-right",
        align === "center" && "text-center"
      )}
    >
      <span
        style={{ color: HEADER_TEXT, fontSize: "13px", fontWeight: 600 }}
        className={clsx(
          "inline-flex items-center gap-1 uppercase tracking-wide",
          align === "right" && "flex-row-reverse",
          align === "center" && "justify-center"
        )}
      >
        {label}
        <ArrowUpDown size={10} style={{ color: active ? "#2563EB" : "#94A3B8" }} />
      </span>
    </th>
  );
}

export function ProductsTable({ rows, loading, page, totalPages, total, onPage, sortBy, sortDir, onSort }: Props) {
  return (
    <div className="rounded-lg border border-line bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1270px] border-collapse">
          <colgroup>
            <col style={{ width: EAN_WIDTH }} />
            <col style={{ width: 380 }} />
            <col style={{ width: 220 }} />
            <col style={{ width: 110 }} />
            <col style={{ width: 130 }} />
            <col style={{ width: 110 }} />
            <col style={{ width: 90 }} />
            <col style={{ width: 100 }} />
          </colgroup>
          <thead className="border-b border-line" style={{ background: HEADER_BG }}>
            <tr>
              <SortHeader label="EAN" field="ean" sortBy={sortBy} sortDir={sortDir} onSort={onSort} sticky />
              <SortHeader label="Descricao" field="description" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
              <th
                className="whitespace-nowrap px-3 py-3 text-left text-[13px] font-semibold uppercase tracking-wide"
                style={{ color: HEADER_TEXT }}
              >
                Categoria
              </th>
              <SortHeader label="Preco Martins" field="martinsPrice" sortBy={sortBy} sortDir={sortDir} onSort={onSort} align="right" />
              <SortHeader label="Preco Concorrente" field="marketPrice" sortBy={sortBy} sortDir={sortDir} onSort={onSort} align="right" />
              <th
                className="whitespace-nowrap px-3 py-3 text-left text-[13px] font-semibold uppercase tracking-wide"
                style={{ color: HEADER_TEXT }}
              >
                Distribuidor
              </th>
              <SortHeader label="Diferenca" field="diffPct" sortBy={sortBy} sortDir={sortDir} onSort={onSort} align="right" />
              <th
                className="whitespace-nowrap px-3 py-3 text-center text-[13px] font-semibold uppercase tracking-wide"
                style={{ color: HEADER_TEXT }}
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 10 }).map(function (_, i) {
                  return (
                    <tr key={i} className="border-b border-line/60">
                      <td colSpan={8} className="px-3 py-2">
                        <div className="h-3 w-full animate-pulse rounded bg-line/60" />
                      </td>
                    </tr>
                  );
                })
              : null}

            {!loading && rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-[13px] text-ink-600">
                  Nenhum produto encontrado com esses filtros.
                </td>
              </tr>
            ) : null}

            {!loading
              ? rows.map(function (r, idx) {
                  var rowBg = idx % 2 === 1 ? "#F8FAFC" : "#FFFFFF";
                  return (
                    <tr
                      key={r.id}
                      className="border-b border-line/50 hover:bg-[#EEF4FF]"
                      style={{ background: rowBg }}
                    >
                      <td
                        className="whitespace-nowrap px-3 py-2 font-mono text-[12px] text-ink-700"
                        style={{ position: "sticky", left: 0, background: rowBg }}
                      >
                        {r.ean}
                      </td>
                      <td className="truncate px-3 py-2 text-[12px] text-ink-950" title={r.description}>
                        {r.description}
                      </td>
                      <td className="truncate px-3 py-2 text-[12px] text-ink-700" title={r.category || ""}>
                        {r.category ? r.category : "-"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-right text-[12px] font-medium tabular-nums text-ink-950">
                        {money(r.martinsPrice)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-right text-[12px] font-medium tabular-nums text-ink-700">
                        {r.marketPrice !== null ? money(r.marketPrice) : "-"}
                      </td>
                      <td className="truncate px-3 py-2 text-[12px] font-medium text-ink-700" title={r.bestCompetitor || ""}>
                        {r.bestCompetitor ? r.bestCompetitor : "-"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-right">
                        <DiffCell diffPct={r.diffPct} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-center">
                        <StatusBadge status={r.status} />
                        {r.simulatedStatus && r.simulatedStatus !== r.status ? (
                          <div className="mt-0.5 text-[10px] font-medium text-good">
                            seta {r.simulatedStatus === "COMPETITIVO" ? "Competitivo" : "Negociacao pontual"} com desconto
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  );
                })
              : null}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-line px-3 py-2">
        <span className="text-[12px] text-ink-600">
          {total.toLocaleString("pt-BR")} produto{total !== 1 ? "s" : ""} - pagina {page} de {totalPages}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={function () { onPage(Math.max(1, page - 1)); }}
            disabled={page <= 1}
            className="rounded-md border border-line p-1 text-ink-700 disabled:opacity-30"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={function () { onPage(Math.min(totalPages, page + 1)); }}
            disabled={page >= totalPages}
            className="rounded-md border border-line p-1 text-ink-700 disabled:opacity-30"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
