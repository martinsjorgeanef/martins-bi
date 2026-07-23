"use client";

import { Search, SlidersHorizontal } from "lucide-react";

interface Props {
  search: string;
  onSearch: (v: string) => void;
  category: string;
  onCategory: (v: string) => void;
  status: string;
  onStatus: (v: string) => void;
  competitor: string;
  onCompetitor: (v: string) => void;
  supplier: string;
  onSupplier: (v: string) => void;
  categories: string[];
  competitorNames: string[];
  supplierNames: string[];
  threshold: number;
  onThreshold: (v: number) => void;
}

var FIELD_CLASS = "h-9 rounded-lg border border-line bg-surface px-3 text-[13px] text-ink-800 outline-none focus:border-accent";

export function Filters(props: Props) {
  const {
    search,
    onSearch,
    category,
    onCategory,
    status,
    onStatus,
    competitor,
    onCompetitor,
    supplier,
    onSupplier,
    categories,
    competitorNames,
    supplierNames,
    threshold,
    onThreshold
  } = props;

  return (
    <div className="flex flex-nowrap items-center gap-2 overflow-x-auto rounded-xl border border-line bg-white p-3 shadow-card">
      <div className="relative min-w-[200px] shrink-0 flex-1">
        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
        <input
          value={search}
          onChange={function (e) { onSearch(e.target.value); }}
          placeholder="🔍 Buscar por EAN ou descricao..."
          className={FIELD_CLASS + " w-full pl-8"}
        />
      </div>

      <select
        value={supplier}
        onChange={function (e) { onSupplier(e.target.value); }}
        className={FIELD_CLASS + " shrink-0"}
      >
        <option value="">Fornecedor</option>
        {supplierNames.map(function (s) {
          return <option key={s} value={s}>{s}</option>;
        })}
      </select>

      <select
        value={category}
        onChange={function (e) { onCategory(e.target.value); }}
        className={FIELD_CLASS + " shrink-0"}
      >
        <option value="">Categoria</option>
        {categories.map(function (c) {
          return <option key={c} value={c}>{c}</option>;
        })}
      </select>

      <select
        value={competitor}
        onChange={function (e) { onCompetitor(e.target.value); }}
        className={FIELD_CLASS + " shrink-0"}
      >
        <option value="">Concorrente</option>
        {competitorNames.map(function (c) {
          return <option key={c} value={c}>{c}</option>;
        })}
      </select>

      <select
        value={status}
        onChange={function (e) { onStatus(e.target.value); }}
        className={FIELD_CLASS + " shrink-0"}
      >
        <option value="">Status</option>
        <option value="COMPETITIVO">Competitivo</option>
        <option value="ATENCAO">Negociacao pontual</option>
        <option value="DESVANTAGEM">Desvantagem</option>
        <option value="SEM_DADOS">Sem dados</option>
      </select>

      <div className={FIELD_CLASS + " flex shrink-0 items-center gap-1.5"}>
        <SlidersHorizontal size={13} className="text-ink-500" />
        <span className="whitespace-nowrap text-[12px] text-ink-500">Limite Negociacao</span>
        <input
          type="number"
          min={0}
          max={100}
          step={0.5}
          value={threshold}
          onChange={function (e) { onThreshold(Number(e.target.value)); }}
          className="w-10 bg-transparent text-[13px] font-semibold text-ink-950 outline-none"
        />
        <span className="text-[13px] text-ink-600">%</span>
      </div>
    </div>
  );
}
