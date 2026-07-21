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
  if (diffPct === null) return <span className="text-xs text-ink-500">—</span>;
  const pct = diffPct * 100;
  const clamped = Math.max(-30, Math.min(30, pct));
  const widthPct = (Math.abs(clamped) / 30) * 50;
  const positive = pct >= 0;

  return (
    <div className="flex items-center gap-2">
      <div className="relative h-1.5 w-24 rounded-full bg-line">
        <div className="absolute left-1/2 h-full w-px bg-ink-500/30" />
        <div
          className={clsx("absolute h-full rounded-full", positive ? "bg-good" : "bg-bad")}
          style={
            positive
              ? { left: "50%", width: `${widthPct}%` }
              : { right: "50%", width: `${widthPct}%` }
          }
        />
      </div>
      <span
        className={clsx(
          "min-w-[52px] text-right text-sm font-semibold tabular-nums",
          positive ? "text-good" : "text-bad"
        )}
      >
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
        "cursor-pointer select-none whitespace-nowrap px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink-600 hover:text-ink-950",
        align === "right" && "text-right"
      )}
    >
      <span className={clsx("inline-flex items-center gap-1", align === "right" && "flex-row-reverse")}>
        {label}
        <ArrowUpDown size={11} className={active ? "text-accent" : "text-ink-500/40"} />
      </span>
    </th>
  );
}

export function ProductsTable({ rows, loading, page, totalPages, total, onPage, sortBy, sortDir, onSort }: Props) {
  return (
    <div className="rounded-xl border border-line bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] border-collapse">
          <thead className="sticky top-0 border-b border-line bg-surface">
            <tr>
              <SortHeader label="EAN" field="ean" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
              <SortHeader label="Descrição" field="description" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
              <SortHeader label="Fornecedor" field="supplier" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
              <SortHeader label="Preço Martins" field="martinsPrice" sortBy={sortBy} sortDir={sortDir} onSort={onSort} align="right" />
              <SortHeader label="Preço Mercado" field="marketPrice" sortBy={sortBy} sortDir={sortDir} onSort={onSort} align="right" />
              <th className="whitespace-nowrap px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink-600">Concorrente</th>
              <SortHeader label="Diferença" field="diffPct" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
              <th className="whitespace-nowrap px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-line/60">
                  <td colSpan={8} className="px-4 py-3">
                    <div className="h-4 w-full animate-pulse rounded bg-line/60" />
                  </td>
                </tr>
              ))}

            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-ink-600">
                  Nenhum produto encontrado com esses filtros.
                </td>
              </tr>
            )}

            {!loading &&
              rows.map((r) => (
                <tr key={r.id} className="border-b border-line/60 hover:bg-surface/60">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-ink-700">{r.ean}</td>
                  <td className="max-w-[240px] truncate px-4 py-3 text-sm text-ink-950" title={r.description}>
                    {r.description}
                    {r.category && <div className="text-xs text-ink-500">{r.category}</div>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {r.supplier ? (
                      <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent-dark">
                        {r.supplier}
                      </span>
                    ) : (
                      <span className="text-xs text-ink-500">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium tabular-nums text-ink-950">
                    {money(r.martinsPrice)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm tabular-nums text-ink-700">
                    {r.marketPrice !== null ? money(r.marketPrice) : "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-ink-600">{r.bestCompetitor ?? "—"}</td>
                  <td className="px-4 py-3">
                    <DiffBar diffPct={r.diffPct} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-line px-4 py-3">
        <span className="text-xs text-ink-600">
          {total.toLocaleString("pt-BR")} produto{total !== 1 ? "s" : ""} · página {page} de {totalPages}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="rounded-lg border border-line p-1.5 text-ink-700 disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => onPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="rounded-lg border border-line p-1.5 text-ink-700 disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
