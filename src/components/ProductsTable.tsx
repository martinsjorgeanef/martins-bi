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

function money(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function DiffCell({ diffPct }: { diffPct: number | null }) {
  if (diffPct === null) return <span className="text-[11px] text-ink-500">-</span>;
  const pct = diffPct * 100;
  const positive = pct >= 0;
  return (
    <span className={clsx("text-[12px] font-semibold tabular-nums", positive ? "text-good" : "text-bad")}>
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
  align = "left"
}: {
  label: string;
  field: string;
  sortBy: string;
  sortDir: "asc" | "desc";
  onSort: (f: string) => void;
  align?: "left" | "right" | "center";
}) {
  const active = sortBy === field;
  return (
    <th
      onClick={function () { onSort(field); }}
      className={clsx(
        "cursor-pointer select-none whitespace-nowrap px-2 py-1.5 text-[12px] font-semibold uppercase tracking-wide text-ink-600 hover:text-ink-950",
        align === "right" && "text-right",
        align === "center" && "text-center"
      )}
    >
      <span
        className={clsx(
          "inline-flex items-center gap-1",
          align === "right" && "flex-row-reverse",
          align === "center" && "justify-center"
        )}
      >
        {label}
        <ArrowUpDown size={9} className={active ? "text-accent" : "text-ink-500/40"} />
      </span>
    </th>
  );
}

export function ProductsTable({ rows, loading, page, totalPages, total, onPage, sortBy, sortDir, onSort }: Props) {
  return (
    <div className="rounded-lg border border-line bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            <col style={{ width: "10%" }} />
            <col style={{ width: "30%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "7%" }} />
            <col style={{ width: "5%" }} />
          </colgroup>
          <thead className="sticky top-0 border-b border-line bg-surface">
            <tr>
              <SortHeader label="EAN" field="ean" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
              <SortHeader label="Descricao" field="description" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
              <th className="whitespace-nowrap px-2 py-1.5 text-left text-[12px] font-semibold uppercase tracking-wide text-ink-600">
                Categoria
              </th>
              <SortHeader label="Preco Martins" field="martinsPrice" sortBy={sortBy} sortDir={sortDir} onSort={onSort} align="right" />
              <SortHeader label="Preco Concorrente" field="marketPrice" sortBy={sortBy} sortDir={sortDir} onSort={onSort} align="right" />
              <th className="whitespace-nowrap px-2 py-1.5 text-left text-[12px] font-semibold uppercase tracking-wide text-ink-600">
                Distribuidor
              </th>
              <SortHeader label="Diferenca" field="diffPct" sortBy={sortBy} sortDir={sortDir} onSort={onSort} align="right" />
              <th className="whitespace-nowrap px-2 py-1.5 text-center text-[12px] font-semibold uppercase tracking-wide text-ink-600">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 10 }).map(function (_, i) {
                  return (
                    <tr key={i} className="border-b border-line/60">
                      <td colSpan={8} className="px-2 py-1">
                        <div className="h-3 w-full animate-pulse rounded bg-line/60" />
                      </td>
                    </tr>
                  );
                })
              : null}

            {!loading && rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-2 py-8 text-center text-[12px] text-ink-600">
                  Nenhum produto encontrado com esses filtros.
                </td>
              </tr>
            ) : null}

            {!loading
              ? rows.map(function (r) {
                  return (
                    <tr key={r.id} className="border-b border-line/50 hover:bg-surface/60">
                      <td className="truncate px-2 py-1 font-mono text-[11px] text-ink-700">{r.ean}</td>
                      <td className="truncate px-2 py-1 text-[12px] text-ink-950" title={r.description}>
                        {r.description}
                      </td>
                      <td className="truncate px-2 py-1 text-[11px] text-ink-700" title={r.category || ""}>
                        {r.category ? r.category : "-"}
                      </td>
                      <td className="whitespace-nowrap px-2 py-1 text-right text-[12px] font-medium tabular-nums text-ink-950">
                        {money(r.martinsPrice)}
                      </td>
                      <td className="whitespace-nowrap px-2 py-1 text-right text-[12px] tabular-nums text-ink-700">
                        {r.marketPrice !== null ? money(r.marketPrice) : "-"}
                      </td>
                      <td className="truncate px-2 py-1 text-[11px] font-medium text-ink-700" title={r.bestCompetitor || ""}>
                        {r.bestCompetitor ? r.bestCompetitor : "-"}
                      </td>
                      <td className="whitespace-nowrap px-2 py-1 text-right">
                        <DiffCell diffPct={r.diffPct} />
                      </td>
                      <td className="whitespace-nowrap px-2 py-1 text-center">
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  );
                })
              : null}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-line px-3 py-2">
        <span className="text-[11px] text-ink-600">
          {total.toLocaleString("pt-BR")} produto{total !== 1 ? "s" : ""} - pagina {page} de {totalPages}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={function () { onPage(Math.max(1, page - 1)); }}
            disabled={page <= 1}
            className="rounded-md border border-line p-1 text-ink-700 disabled:opacity-30"
          >
            <ChevronLeft size={13} />
          </button>
          <button
            onClick={function () { onPage(Math.min(totalPages, page + 1)); }}
            disabled={page >= totalPages}
            className="rounded-md border border-line p-1 text-ink-700 disabled:opacity-30"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
