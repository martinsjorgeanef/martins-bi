"use client";

import { ProductRow } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { clsx } from "clsx";
import { cleanProductName } from "@/lib/productNameCleaner";

export interface ColumnVisibility {
  ean: boolean;
  descricao: boolean;
  categoria: boolean;
  fornecedor: boolean;
  distribuidor: boolean;
  precoMartins: boolean;
  precoConcorrente: boolean;
  diferenca: boolean;
  status: boolean;
  marca: boolean;
}

export var DEFAULT_COLUMN_VISIBILITY: ColumnVisibility = {
  ean: true,
  descricao: true,
  categoria: true,
  fornecedor: false,
  distribuidor: true,
  precoMartins: true,
  precoConcorrente: true,
  diferenca: true,
  status: true,
  marca: false
};

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
  visibleColumns: ColumnVisibility;
}

var HEADER_BG = "#EFF6FF";
var HEADER_TEXT = "#1E3A8A";

function money(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function DiffCell({ diffPct }: { diffPct: number | null }) {
  if (diffPct === null) return <span className="text-[11px] text-ink-500">-</span>;
  const pct = diffPct * 100;
  const positive = pct >= 0;
  return (
    <span className={clsx("text-[11px] font-medium tabular-nums", positive ? "text-good" : "text-bad")}>
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
        "cursor-pointer select-none whitespace-nowrap px-2.5 py-1.5 hover:opacity-80",
        align === "right" && "text-right",
        align === "center" && "text-center"
      )}
    >
      <span
        style={{ color: HEADER_TEXT, fontSize: "11.5px", fontWeight: 600 }}
        className={clsx(
          "inline-flex items-center gap-1 uppercase tracking-wide",
          align === "right" && "flex-row-reverse",
          align === "center" && "justify-center"
        )}
      >
        {label}
        <ArrowUpDown size={9} style={{ color: active ? "#2563EB" : "#94A3B8" }} />
      </span>
    </th>
  );
}

var FIXED_WIDTHS: Record<string, number> = {
  ean: 11,
  precoMartins: 12,
  precoConcorrente: 13,
  diferenca: 9,
  status: 9
};
var SIMULACAO_WIDTH = 8;
var FLEXIBLE_KEYS: (keyof ColumnVisibility)[] = ["descricao", "categoria", "fornecedor", "distribuidor", "marca"];

export function ProductsTable({ rows, loading, page, totalPages, total, onPage, sortBy, sortDir, onSort, visibleColumns }: Props) {
  var fixedSum = SIMULACAO_WIDTH;
  Object.keys(FIXED_WIDTHS).forEach(function (key) {
    if (visibleColumns[key as keyof ColumnVisibility]) {
      fixedSum += FIXED_WIDTHS[key];
    }
  });

  var flexCount = FLEXIBLE_KEYS.filter(function (k) { return visibleColumns[k]; }).length;
  var flexWidth = flexCount > 0 ? (100 - fixedSum) / flexCount : 0;

  return (
    <div className="rounded-lg border border-line bg-white shadow-card">
      <div className="max-h-[780px] overflow-y-auto">
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            {visibleColumns.ean ? <col style={{ width: FIXED_WIDTHS.ean + "%" }} /> : null}
            {visibleColumns.descricao ? <col style={{ width: flexWidth + "%" }} /> : null}
            {visibleColumns.categoria ? <col style={{ width: flexWidth + "%" }} /> : null}
            {visibleColumns.fornecedor ? <col style={{ width: flexWidth + "%" }} /> : null}
            {visibleColumns.distribuidor ? <col style={{ width: flexWidth + "%" }} /> : null}
            {visibleColumns.precoMartins ? <col style={{ width: FIXED_WIDTHS.precoMartins + "%" }} /> : null}
            {visibleColumns.precoConcorrente ? <col style={{ width: FIXED_WIDTHS.precoConcorrente + "%" }} /> : null}
            {visibleColumns.diferenca ? <col style={{ width: FIXED_WIDTHS.diferenca + "%" }} /> : null}
            {visibleColumns.status ? <col style={{ width: FIXED_WIDTHS.status + "%" }} /> : null}
            {visibleColumns.marca ? <col style={{ width: flexWidth + "%" }} /> : null}
            <col style={{ width: SIMULACAO_WIDTH + "%" }} />
          </colgroup>
          <thead className="sticky top-0 z-10 border-b border-line" style={{ background: HEADER_BG }}>
            <tr>
              {visibleColumns.ean ? (
                <SortHeader label="EAN" field="ean" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
              ) : null}
              {visibleColumns.descricao ? (
                <SortHeader label="Descricao" field="description" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
              ) : null}
              {visibleColumns.categoria ? (
                <th className="whitespace-nowrap px-2.5 py-1.5 text-left" style={{ color: HEADER_TEXT, fontSize: "11.5px", fontWeight: 600 }}>
                  Categoria
                </th>
              ) : null}
              {visibleColumns.fornecedor ? (
                <th className="whitespace-nowrap px-2.5 py-1.5 text-left" style={{ color: HEADER_TEXT, fontSize: "11.5px", fontWeight: 600 }}>
                  Fornecedor
                </th>
              ) : null}
              {visibleColumns.distribuidor ? (
                <th className="whitespace-nowrap px-2.5 py-1.5 text-left" style={{ color: HEADER_TEXT, fontSize: "11.5px", fontWeight: 600 }}>
                  Distribuidor
                </th>
              ) : null}
              {visibleColumns.precoMartins ? (
                <SortHeader label="Preco Martins" field="martinsPrice" sortBy={sortBy} sortDir={sortDir} onSort={onSort} align="right" />
              ) : null}
              {visibleColumns.precoConcorrente ? (
                <SortHeader label="Preco Concorrente" field="marketPrice" sortBy={sortBy} sortDir={sortDir} onSort={onSort} align="right" />
              ) : null}
              {visibleColumns.diferenca ? (
                <SortHeader label="Diferenca" field="diffPct" sortBy={sortBy} sortDir={sortDir} onSort={onSort} align="right" />
              ) : null}
              {visibleColumns.status ? (
                <th className="whitespace-nowrap px-2.5 py-1.5 text-center" style={{ color: HEADER_TEXT, fontSize: "11.5px", fontWeight: 600 }}>
                  Status
                </th>
              ) : null}
              {visibleColumns.marca ? (
                <th className="whitespace-nowrap px-2.5 py-1.5 text-left" style={{ color: HEADER_TEXT, fontSize: "11.5px", fontWeight: 600 }}>
                  Marca
                </th>
              ) : null}
              <th className="whitespace-nowrap px-2.5 py-1.5 text-center" style={{ color: HEADER_TEXT, fontSize: "11.5px", fontWeight: 600 }}>
                Simulacao
              </th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 10 }).map(function (_, i) {
                  return (
                    <tr key={i} className="border-b border-line/60">
                      <td colSpan={11} className="px-2.5 py-1.5">
                        <div className="h-2.5 w-full animate-pulse rounded bg-line/60" />
                      </td>
                    </tr>
                  );
                })
              : null}

            {!loading && rows.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-2.5 py-8 text-center text-[12px] text-ink-600">
                  Nenhum produto encontrado com esses filtros.
                </td>
              </tr>
            ) : null}

            {!loading
              ? rows.map(function (r, idx) {
                  var rowBg = idx % 2 === 1 ? "#F8FAFC" : "#FFFFFF";
                  var marcaLabel = visibleColumns.marca ? cleanProductName(r.description, r.category).brand : "";
                  return (
                    <tr key={r.id} className="border-b border-line/50 hover:bg-[#EEF4FF]" style={{ background: rowBg }}>
                      {visibleColumns.ean ? (
                        <td className="whitespace-nowrap px-2.5 py-1.5 font-mono text-[11px] text-ink-700" title={r.ean}>
                          {r.ean}
                        </td>
                      ) : null}
                      {visibleColumns.descricao ? (
                        <td className="whitespace-normal break-words px-2.5 py-1.5 text-[12px] text-ink-950" title={r.description}>
                          {r.description}
                        </td>
                      ) : null}
                      {visibleColumns.categoria ? (
                        <td className="truncate px-2.5 py-1.5 text-[12px] text-ink-700" title={r.category || ""}>
                          {r.category ? r.category : "-"}
                        </td>
                      ) : null}
                      {visibleColumns.fornecedor ? (
                        <td className="truncate px-2.5 py-1.5 text-[12px] text-ink-700" title={r.supplier || ""}>
                          {r.supplier ? r.supplier : "-"}
                        </td>
                      ) : null}
                      {visibleColumns.distribuidor ? (
                        <td className="truncate px-2.5 py-1.5 text-[12px] font-medium text-ink-700" title={r.bestCompetitor || ""}>
                          {r.bestCompetitor ? r.bestCompetitor : "-"}
                        </td>
                      ) : null}
                      {visibleColumns.precoMartins ? (
                        <td className="whitespace-nowrap px-2.5 py-1.5 text-right text-[13px] font-medium tabular-nums text-ink-950">
                          {money(r.martinsPrice)}
                        </td>
                      ) : null}
                      {visibleColumns.precoConcorrente ? (
                        <td className="whitespace-nowrap px-2.5 py-1.5 text-right text-[12px] font-medium tabular-nums text-ink-700">
                          {r.marketPrice !== null ? money(r.marketPrice) : "-"}
                        </td>
                      ) : null}
                      {visibleColumns.diferenca ? (
                        <td className="whitespace-nowrap px-2.5 py-1.5 text-right">
                          <DiffCell diffPct={r.diffPct} />
                        </td>
                      ) : null}
                      {visibleColumns.status ? (
                        <td className="whitespace-nowrap px-2.5 py-1.5 text-center">
                          <StatusBadge status={r.status} />
                        </td>
                      ) : null}
                      {visibleColumns.marca ? (
                        <td className="truncate px-2.5 py-1.5 text-[12px] text-ink-700" title={marcaLabel}>
                          {marcaLabel}
                        </td>
                      ) : null}
                      <td className="whitespace-nowrap px-2.5 py-1.5 text-center">
                        {r.requiredDiscountPct !== undefined ? (
                          <span
                            title={"Aplicando " + (r.requiredDiscountPct * 100).toFixed(1).replace(".", ",") + "% de desconto, este item torna-se competitivo."}
                            className="inline-flex items-center gap-0.5 rounded-full bg-surface px-1.5 py-0.5 text-[10px] font-medium text-[#374151]"
                          >
                            {r.requiredDiscountPct * 100 <= 2 ? "🟢" : r.requiredDiscountPct * 100 <= 5 ? "🟡" : "🔴"}
                            {(r.requiredDiscountPct * 100).toFixed(1).replace(".", ",") + "%"}
                          </span>
                        ) : (
                          <span className="text-[10px] text-ink-500">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              : null}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-line px-2.5 py-1.5">
        <span className="text-[11px] text-ink-600">Pagina {page} de {totalPages}</span>
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
