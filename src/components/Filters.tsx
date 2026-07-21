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
    <div className="flex flex-col gap-3 rounded-xl border border-line bg-white p-3 shadow-card lg:flex-row lg:flex-wrap lg:items-center">
      <div className="relative flex-1 lg:min-w-[200px]">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Buscar por EAN ou descrição..."
          className="w-full rounded-lg border border-line bg-surface py-2 pl-9 pr-3 text-sm outline-none focus:border-accent"
        />
      </div>

      <select
        value={supplier}
        onChange={(e) => onSupplier(e.target.value)}
        className="rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
      >
        <option value="">Todos os fornecedores</option>
        {supplierNames.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select
        value={category}
        onChange={(e) => onCategory(e.target.value)}
        className="rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
      >
        <option value="">Todas as categorias</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        value={status}
        onChange={(e) => onStatus(e.target.value)}
        className="rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
      >
        <option value="">Todos os status</option>
        <option value="COMPETITIVO">Competitivo</option>
        <option value="ATENCAO">Negociação pontual</option>
        <option value="DESVANTAGEM">Desvantagem</option>
        <option value="SEM_DADOS">Sem dados de mercado</option>
      </select>

      <select
        value={competitor}
        onChange={(e) => onCompetitor(e.target.value)}
        className="rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
      >
        <option value="">Todos os concorrentes</option>
        {competitorNames.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2">
        <SlidersHorizontal size={14} className="text-ink-500" />
        <label className="whitespace-nowrap text-xs text-ink-600">Limite negociação</label>
        <input
          type="number"
          min={0}
          max={100}
          step={0.5}
          value={threshold}
          onChange={(e) => onThreshold(Number(e.target.value))}
          className="w-14 bg-transparent text-sm font-semibold text-ink-950 outline-none"
        />
        <span className="text-sm text-ink-600">%</span>
      </div>
    </div>
  );
}
