"use client";

import { useEffect, useState, useCallback } from "react";
import { KpiCards } from "./KpiCards";
import { ExecutiveSummary } from "./ExecutiveSummary";
import { PriorityActions } from "./PriorityActions";
import { PriorityVendorCard } from "./PriorityVendorCard";
import { OpportunitiesInsights } from "./OpportunitiesInsights";
import { TopDisadvantageChart } from "./Charts";
import { CategoryTable } from "./CategoryTable";
import { Filters } from "./Filters";
import { ProductsTable } from "./ProductsTable";
import { UploadPanel } from "./UploadPanel";
import { ExportButtons } from "./ExportButtons";
import { DashboardStats, ProductRow, IndustryRow, CategoryRow } from "@/lib/types";
import { UploadCloud, BarChart3, Megaphone } from "lucide-react";
import Link from "next/link";

interface StatsResponse extends DashboardStats {
  thresholdPct: number;
  statusDistribution: { name: string; value: number; key: string }[];
  topDisadvantage: { ean: string; description: string; category: string | null; diffPct: number }[];
}

export function Dashboard() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [rows, setRows] = useState<ProductRow[]>([]);
  const [rowsLoading, setRowsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [industries, setIndustries] = useState<IndustryRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [competitor, setCompetitor] = useState("");
  const [supplier, setSupplier] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("diffPct");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [threshold, setThreshold] = useState(5);

  const [uploadOpen, setUploadOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(function () { setDebouncedSearch(search); }, 350);
    return function () { clearTimeout(t); };
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, status, competitor, supplier]);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    const res = await fetch("/api/stats");
    const data = await res.json();
    setStats(data);
    setThreshold(data.thresholdPct);
    setStatsLoading(false);
  }, []);

  const loadRows = useCallback(async () => {
    setRowsLoading(true);
    const params = new URLSearchParams({
      search: debouncedSearch,
      category: category,
      status: status,
      competitor: competitor,
      supplier: supplier,
      page: String(page),
      pageSize: "50",
      sortBy: sortBy,
      sortDir: sortDir
    });
    const res = await fetch("/api/products?" + params.toString());
    const data = await res.json();
    setRows(data.rows);
    setTotal(data.total);
    setTotalPages(data.totalPages);
    setRowsLoading(false);
  }, [debouncedSearch, category, status, competitor, supplier, page, sortBy, sortDir]);

  const loadIndustries = useCallback(async () => {
    const res = await fetch("/api/industries");
    const data = await res.json();
    setIndustries(data.industries || []);
  }, []);

  const loadCategories = useCallback(async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data.categories || []);
  }, []);

  const fetchAllFilteredRows = useCallback(async (): Promise<ProductRow[]> => {
    const params = new URLSearchParams({
      search: debouncedSearch,
      category: category,
      status: status,
      competitor: competitor,
      supplier: supplier,
      page: "1",
      pageSize: "5000",
      sortBy: sortBy,
      sortDir: sortDir
    });
    const res = await fetch("/api/products?" + params.toString());
    const data = await res.json();
    return data.rows as ProductRow[];
  }, [debouncedSearch, category, status, competitor, supplier, sortBy, sortDir]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadRows(); }, [loadRows]);
  useEffect(() => { loadIndustries(); }, [loadIndustries]);
  useEffect(() => { loadCategories(); }, [loadCategories]);

  function handleSort(field: string) {
    if (field === sortBy) {
      setSortDir(function (d) { return d === "asc" ? "desc" : "asc"; });
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  }

  async function handleThresholdChange(value: number) {
    setThreshold(value);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ thresholdPct: value })
    });
    loadStats();
    loadRows();
    loadCategories();
    loadIndustries();
  }

  function handleUploadSuccess() {
    setUploadOpen(false);
    loadStats();
    loadRows();
    loadIndustries();
    loadCategories();
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-30 border-b border-line bg-ink-950">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 lg:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <BarChart3 size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-[13px] font-semibold leading-tight text-white">Painel de Competitividade</h1>
              <p className="text-[9px] leading-tight text-white/50">Martins x Mercado</p>
            </div>
          </div>
          <button
            onClick={function () { setUploadOpen(true); }}
            className="flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2 text-[11px] font-medium text-white transition hover:bg-accent-dark"
          >
            <UploadCloud size={14} />
            <span className="hidden sm:inline">Enviar planilha</span>
          </button>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6 lg:px-6">
        {!statsLoading && stats && stats.matchedProducts === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl bg-white p-10 text-center shadow-card">
            <UploadCloud size={26} className="text-accent" />
            <h2 className="text-[12px] font-semibold text-[#1F2937]">Nenhum dado carregado ainda</h2>
            <p className="max-w-md text-[9px] text-[#6B7280]">
              Envie primeiro a planilha de precos da Martins e depois a planilha de um concorrente para comecar a
              comparar precos.
            </p>
            <button
              onClick={function () { setUploadOpen(true); }}
              className="mt-1 rounded-lg bg-accent px-4 py-2 text-[11px] font-semibold text-white hover:bg-accent-dark"
            >
              Enviar primeira planilha
            </button>
          </div>
        ) : null}

        <KpiCards stats={stats} loading={statsLoading} />

        {stats ? <ExecutiveSummary stats={stats} industries={industries} categories={categories} /> : null}

        {stats ? (
          <PriorityActions
            competitive={stats.competitive}
            disadvantage={stats.disadvantage}
            industry={industries[0]}
            categories={categories}
          />
        ) : null}

        <PriorityVendorCard industry={industries[0]} />

        <Link
          href="/vendas"
          className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-card transition hover:shadow-md"
        >
          <div className="flex items-center gap-2">
            <Megaphone size={14} className="text-good" />
            <span className="text-[11px] font-medium text-[#1F2937]">
              Divulgar oportunidades para o Time de Vendas
            </span>
          </div>
        </Link>

        <OpportunitiesInsights categories={categories} />

        <OpportunitiesInsights categories={categories} />

        {stats ? <TopDisadvantageChart data={stats.topDisadvantage} /> : null}

        <div className="rounded-xl bg-white p-4 shadow-card">
          <h3 className="text-[12px] font-semibold text-[#1F2937]">Categorias</h3>
          <p className="mt-0.5 text-[8px] text-[#94A3B8]">Da pior para a melhor posicionamento de mercado</p>
          <div className="mt-3">
            <CategoryTable categories={categories} />
          </div>
        </div>

        <Filters
          search={search}
          onSearch={setSearch}
          category={category}
          onCategory={setCategory}
          status={status}
          onStatus={setStatus}
          competitor={competitor}
          onCompetitor={setCompetitor}
          supplier={supplier}
          onSupplier={setSupplier}
          categories={stats ? stats.categories : []}
          competitorNames={stats ? stats.competitorNames : []}
          supplierNames={stats ? stats.supplierNames : []}
          threshold={threshold}
          onThreshold={handleThresholdChange}
        />

        <div className="flex justify-end">
          <ExportButtons fetchAllRows={fetchAllFilteredRows} />
        </div>

        <ProductsTable
          rows={rows}
          loading={rowsLoading}
          page={page}
          totalPages={totalPages}
          total={total}
          onPage={setPage}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
        />
      </main>

      <UploadPanel open={uploadOpen} onClose={function () { setUploadOpen(false); }} onSuccess={handleUploadSuccess} />
    </div>
  );
}
