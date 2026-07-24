"use client";

import { Search, SlidersHorizontal } from "lucide-react";

interface Props {
  search: string;
  onSearch: (v: string) => void;
  category: string;
  onCategory: (v: string) => void;
  status: string;
  onStatus: (v: string) => void;
  supplier: string;
  onSupplier: (v: string) => void;
  distributor: string;
  onDistributor: (v: string) => void;
  categories: string[];
  supplierNames: string[];
  distributorNames: string[];
  threshold: number;
  onThreshold: (v: number) => void;
}

var FIELD_CLASS = "h-8 rounded-lg border border-line bg-surface px-2.5 text-[12px] text-ink-800 outline-none focus:border-accent";

export function Filters(props: Props) {
  const search = props.search;
  const onSearch = props.onSearch;
  const category = props.category;
  const onCategory = props.onCategory;
  const status = props.status;
  const onStatus = props.onStatus;
  const supplier = props.supplier;
  const onSupplier = props.onSupplier;
  const distributor = props.distributor;
  const onDistributor = props.onDistributor;
  const categories = props.categories;
  const supplierNames = props.supplierNames;
  const distributorNames = props.distributorNames;
  const threshold = props.threshold;
  const onThreshold = props.onThreshold;

  return (
    <div className="flex flex-nowrap items-center gap-2 overflow-x-auto rounded-xl border border-line bg-white p-2 shadow-card">
      <div className="relative min-w-[180px] shrink-0 flex-1">
        <Search size={12} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-500" />
        <input
          value={search}
          onChange={function (e) { onSearch(e.target.value); }}
          placeholder="🔍 Buscar por EAN, descricao, marca, categoria..."
          className={FIELD_CLASS + " w-full pl-7"}
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
        value={distributor}
        onChange={function (e) { onDistributor(e.target.value); }}
        className={FIELD_CLASS + " shrink-0"}
      >
        <option value="">Distribuidor</option>
        {distributorNames.map(function (d) {
          return <option key={d} value={d}>{d}</option>;
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

      <div className={FIELD_CLASS + " flex shrink-0 items-center gap-1"}>
        <SlidersHorizontal size={11} className="text-ink-500" />
        <span className="whitespace-nowrap text-[11px] text-ink-500">Limite Negociacao</span>
        <input
          type="number"
          min={0}
          max={100}
          step={0.5}
          value={threshold}
          onChange={function (e) { onThreshold(Number(e.target.value)); }}
          className="w-9 bg-transparent text-[12px] font-semibold text-ink-950 outline-none"
        />
        <span className="text-[12px] text-ink-600">%</span>
      </div>
    </div>
  );
}
