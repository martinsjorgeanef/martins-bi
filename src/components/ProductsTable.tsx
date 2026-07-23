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

const money = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function DiffBar({ diffPct }: { diffPct: number | null }) {
  if (diffPct === null) return <span className="text-[10px] text-ink-500">—</span>;
  const pct = diffPct * 100;
  const clamped = Math.max(-30, Math.min(30, pct));
  const widthPct = (Math.abs(clamped) / 30) * 50;
  const positive = pct >= 0;

  return (
    <div className="flex items-center gap-1">
      <div className="relative h-1 w-12 rounded-full bg-line">
        <div className="absolute left-1/2 h-full w-px bg-ink-500/30" />
        <div
          className={clsx("absolute h-full rounded-full", positive ? "bg-good" : "bg-bad")}
          style={positive ? { left: "50%", width: `${widthPct}%` } : { right: "50%", width: `${widthPct}%` }}
        />
      </div>
      <span className={clsx("min-w-[36px] text-right text-[10px] font-semibold tabular-nums", positive ? "text-good" : "text-bad")}>
        {positive ? "+" : ""}
        {pct.toFixed(1)}%
      </span>
    </div>
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
  align?: "left" | "right";
}) {
  const active = sortBy === field;
  return (
    <th
      onClick={() => onSort(field)}
      className={clsx(
        "cursor-pointer select-none whitespace-nowrap px-2 py-1.5 text-[9px] font-semibold uppercase tracking-wide text-ink-600 hover:text-ink-950",
        align === "right" && "text-right"
      )}
    >
      <span className={clsx("inline-flex items-center gap-1", align === "right" && "flex-row-reverse")}>
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
        <table className="w-full min-w-[860px] border-collapse">
          <thead className="sticky top-0 border-b border-line bg-surface">
            <tr>
              <SortHeader label="Fornecedor" field="supplier" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
              <SortHeader label="EAN" field="ean" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
              <SortHeader label="Descrição" field="description" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
              <SortHeader label="Preço Martins" field="martinsPrice" sortBy={sortBy} sortDir={sortDir} onSort={onSort} align="right" />
              <SortHeader label="Preço Concorrente" field="marketPrice" sortBy={sortBy} sortDir={sortDir} onSort={onSort} align="right" />
              <SortHeader label="Diferença" field="diffPct" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
              <th className="whitespace-nowrap px-2 py-1.5 text-[9px] font-semibold uppercase tracking-wide text-ink-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-line/60">
                  <td colSpan={7} className="px-2 py-1.5">
                    <div className="h-3 w-full animate-pulse rounded bg-line/60" />
                  </td>
                </tr>
              ))}

            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-2 py-8 text-center text-[11px] text-ink-600">
                  Nenhum produto encontrado com esses filtros.
                </td>
              </tr>
            )}

            {!loading &&
              rows.map((r) => (
                <tr key={r.id} className="border-b border-line/60 hover:bg-surface/60">
                  <td className="whitespace-nowrap px-2 py-1.5">
                    {r.supplier ? (
                      <span className="inline-flex items-center rounded-full bg-accent/10 px-1.5 py-0.5 text-[9px] font-medium text-accent-dark">
                        {r.supplier}
                      </span>
                    ) : (
                      <span className="text-[9px] text-ink-500">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-2 py-1.5 font-mono text-[10px] text-ink-700">{r.ean}</td>
                  <td className="max-w-[200px] truncate px-2 py-1.5 text-[11px] text-ink-950" title={r.description}>
                    {r.description}
                    {r.category && <div className="text-[9px] text-ink-500">{r.category}</div>}
                  </td>
                  <td className="whitespace-nowrap px-2 py-1.5 text-right text-[11px] font-medium tabular-nums text-ink-950">
                    {money(r.martinsPrice)}
                  </td>
                  <td className="whitespace-nowrap px-2 py-1.5 text-right text-[11px] tabular-nums text-ink-700">
                    {r.marketPrice !== null ? money(r.marketPrice) : "—"}
                  </td>
                  <td className="px-2 py-1.5">
                    <DiffBar diffPct={r.diffPct} />
                  </td>
                  <td className="whitespace-nowrap px-2 py-1.5">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-line px-2 py-1.5">
        <span className="text-[10px] text-ink-600">
          {total.toLocaleString("pt-BR")} produto{total !== 1 ? "s" : ""} · página {page} de {totalPages}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="rounded-md border border-line p-1 text-ink-700 disabled:opacity-30"
          >
            <ChevronLeft size={13} />
          </button>
          <button
            onClick={() => onPage(Math.min(totalPages, page + 1))}
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
