"use client";

import { useEffect, useState, useCallback } from "react";
import { Filters } from "./Filters";
import { ProductsTable, ColumnVisibility, DEFAULT_COLUMN_VISIBILITY } from "./ProductsTable";
import { ColumnVisibilityBar, loadSavedColumnVisibility } from "./ColumnVisibilityBar";
import { ExportButtons } from "./ExportButtons";
import { ProductRow } from "@/lib/types";

export function ProductAnalysisScreen() {
  const [activeCompetitors, setActiveCompetitors] = useState<string[]>([]);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const [rows, setRows] = useState<ProductRow[]>([]);
  const [rowsLoading, setRowsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [filterOptions, setFilterOptions] = useState<{ categories: string[]; supplierNames: string[]; distributorNames: string[] }>({
    categories: [],
    supplierNames: [],
    distributorNames: []
  });

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [supplier, setSupplier] = useState("");
  const [distributor, setDistributor] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("diffPct");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [threshold, setThreshold] = useState(5);

  const [visibleColumns, setVisibleColumns] = useState<ColumnVisibility>(DEFAULT_COLUMN_VISIBILITY);

  useEffect(function () {
    setVisibleColumns(loadSavedColumnVisibility(DEFAULT_COLUMN_VISIBILITY));
  }, []);

  useEffect(function () {
    fetch("/api/settings")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var current = data.activeCompetitors
          ? data.activeCompetitors.split(",").filter(function (s: string) { return s.length > 0; })
          : [];
        setActiveCompetitors(current);
        setThreshold(data.thresholdPct);
        setSettingsLoaded(true);
      });
  }, []);

  useEffect(function () {
    var params = new URLSearchParams({ competitors: activeCompetitors.join(",") });
    fetch("/api/stats?" + params.toString())
      .then(function (r) { return r.json(); })
      .then(function (data) {
        setFilterOptions({
          categories: data.categories || [],
          supplierNames: data.supplierNames || [],
          distributorNames: data.competitorNames || []
        });
      });
  }, [activeCompetitors]);

  useEffect(function () {
    const t = setTimeout(function () { setDebouncedSearch(search); }, 350);
    return function () { clearTimeout(t); };
  }, [search]);

  useEffect(function () {
    setPage(1);
  }, [debouncedSearch, category, status, supplier, distributor]);

  const loadRows = useCallback(async function () {
    if (!settingsLoaded) return;
    setRowsLoading(true);
    const params = new URLSearchParams({
      search: debouncedSearch,
      category: category,
      status: status,
      competitors: activeCompetitors.join(","),
      supplier: supplier,
      distributor: distributor,
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
  }, [settingsLoaded, debouncedSearch, category, status, activeCompetitors, supplier, distributor, page, sortBy, sortDir]);

  useEffect(function () { loadRows(); }, [loadRows]);

  const fetchAllFilteredRows = useCallback(async function () {
    const params = new URLSearchParams({
      search: debouncedSearch,
      category: category,
      status: status,
      competitors: activeCompetitors.join(","),
      supplier: supplier,
      distributor: distributor,
      page: "1",
      pageSize: "5000",
      sortBy: sortBy,
      sortDir: sortDir
    });
    const res = await fetch("/api/products?" + params.toString());
    const data = await res.json();
    return data.rows as ProductRow[];
  }, [debouncedSearch, category, status, activeCompetitors, supplier, distributor, sortBy, sortDir]);

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
    loadRows();
  }

  return (
    <div className="mx-auto flex max-w-[1800px] w-[95%] flex-col gap-2.5 py-4">
      <h1 className="text-[15px] font-bold text-[#1F2937]">Analise de Produtos</h1>

      <div className="flex items-center justify-between">
        <ExportButtons fetchAllRows={fetchAllFilteredRows} />
      </div>

      <Filters
        search={search}
        onSearch={setSearch}
        category={category}
        onCategory={setCategory}
        status={status}
        onStatus={setStatus}
        supplier={supplier}
        onSupplier={setSupplier}
        distributor={distributor}
        onDistributor={setDistributor}
        categories={filterOptions.categories}
        supplierNames={filterOptions.supplierNames}
        distributorNames={filterOptions.distributorNames}
        threshold={threshold}
        onThreshold={handleThresholdChange}
      />

      <ColumnVisibilityBar visibleColumns={visibleColumns} onChange={setVisibleColumns} />

      <span className="text-[12px] font-medium text-ink-700">
        {total.toLocaleString("pt-BR")} produto{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
      </span>

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
        visibleColumns={visibleColumns}
      />
    </div>
  );
}
