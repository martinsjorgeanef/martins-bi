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

export function Filters({
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
}: Props) {
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
        <option value="">Todos os
