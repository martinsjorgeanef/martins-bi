"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";

interface Props {
  search: string;
  onSearch: (v: string) => void;
  category: string;
  onCategory: (v: string) => void;
  status: string;
  onStatus: (v: string) => void;
  selectedCompetitors: string[];
  onSelectedCompetitorsChange: (v: string[]) => void;
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
  const search = props.search;
  const onSearch = props.onSearch;
  const category = props.category;
  const onCategory = props.onCategory;
  const status = props.status;
  const onStatus = props.onStatus;
  const selectedCompetitors = props.selectedCompetitors;
  const onSelectedCompetitorsChange = props.onSelectedCompetitorsChange;
  const supplier = props.supplier;
  const onSupplier = props.onSupplier;
  const categories = props.categories;
  const competitorNames = props.competitorNames;
  const supplierNames = props.supplierNames;
  const threshold = props.threshold;
  const onThreshold = props.onThreshold;

  const [compOpen, setCompOpen] = useState(false);
  const allSelected = selectedCompetitors.length === 0;

  function toggleCompetitor(name: string) {
    if (selectedCompetitors.indexOf(name) !== -1) {
      onSelectedCompetitorsChange(selectedCompetitors.filter(function (c) { return c !== name; }));
    } else {
      onSelectedCompetitorsChange(selectedCompetitors.concat([name]));
    }
  }

  var competitorLabel = allSelected
    ? "Todos os concorrentes"
    : selectedCompetitors.length + " concorrente" + (selectedCompetitors.length !== 1 ? "s" : "");

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

      <div className="relative shrink-0">
        <button
          onClick={function () { setCompOpen(!compOpen); }}
          className={FIELD_CLASS + " flex items-center gap-1.5 whitespace-nowrap"}
        >
          {competitorLabel}
          <ChevronDown size={13} />
        </button>
        {compOpen ? (
          <div className="absolute left-0 top-10 z-20 w-52 rounded-lg border border-line bg-white p-2 shadow-card">
            <label className="flex items-center gap-2 rounded px-2 py-1.5 text-[12px] hover:bg-surface">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={function () { onSelectedCompetitorsChange([]); }}
              />
              Todos
            </label>
            <div className="my-1 border-t border-line" />
            {competitorNames.map(function (name) {
              return (
                <label key={name} className="flex items-center gap-2 rounded px-2 py-1.5 text-[12px] hover:bg-surface">
                  <input
                    type="checkbox"
                    checked={selectedCompetitors.indexOf(name) !== -1}
                    onChange={function () { toggleCompetitor(name); }}
                  />
                  {name}
                </label>
              );
            })}
          </div>
        ) : null}
      </div>

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
