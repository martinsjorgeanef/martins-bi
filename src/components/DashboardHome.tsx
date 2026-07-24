"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { KpiCards } from "./KpiCards";
import { CadgerInfoCard } from "./CadgerInfoCard";
import { RecoveryPotentialCard } from "./RecoveryPotentialCard";
import { ExecutiveSummary } from "./ExecutiveSummary";
import { CategoryTable } from "./CategoryTable";
import { TopDisadvantageChart } from "./Charts";
import { DashboardStats, IndustryRow, CategoryRow } from "@/lib/types";
import { ArrowRight } from "lucide-react";

interface StatsResponse extends DashboardStats {
  thresholdPct: number;
  topDisadvantage: { ean: string; description: string; category: string | null; diffPct: number }[];
  recoveryPotential: {
    avgDiscountPct: number;
    itemsRecoverable: number;
    oldCompetitivePct: number;
    newCompetitivePct: number;
    green: number;
    yellow: number;
    red: number;
  } | null;
}

export function DashboardHome() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [industries, setIndustries] = useState<IndustryRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async function () {
    setLoading(true);
    const settingsRes = await fetch("/api/settings");
    const settingsData = await settingsRes.json();
    const activeCompetitors = settingsData.activeCompetitors || "";
    const params = new URLSearchParams({ competitors: activeCompetitors });

    const statsRes = await fetch("/api/stats?" + params.toString());
    const industriesRes = await fetch("/api/industries");
    const categoriesRes = await fetch("/api/categories");

    const statsData = await statsRes.json();
    const industriesData = await industriesRes.json();
    const categoriesData = await categoriesRes.json();

    setStats(statsData);
    setIndustries(industriesData.industries || []);
    setCategories(categoriesData.categories || []);
    setLoading(false);
  }, []);

  useEffect(function () { loadAll(); }, [loadAll]);

  return (
    <div className="mx-auto flex max-w-[1400px] w-[95%] flex-col gap-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-[#1F2937]">Dashboard</h1>
          <p className="text-[12px] text-[#6B7280]">Visao executiva da competitividade</p>
        </div>
        <Link
          href="/produtos"
          className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-[13px] font-semibold text-white hover:bg-accent-dark"
        >
          Abrir analise detalhada
          <ArrowRight size={14} />
        </Link>
      </div>

      <KpiCards stats={stats} loading={loading} />

      <CadgerInfoCard />

      {stats ? (
        <RecoveryPotentialCard
          recovery={stats.recoveryPotential}
          competitive={stats.competitive}
          matchedProducts={stats.matchedProducts}
        />
      ) : null}

      {stats ? <ExecutiveSummary stats={stats} industries={industries} categories={categories} /> : null}

      {stats ? <TopDisadvantageChart data={stats.topDisadvantage} /> : null}

      <div className="rounded-xl bg-white p-4 shadow-card">
        <h3 className="text-[12px] font-semibold text-[#1F2937]">Categorias</h3>
        <p className="mt-0.5 text-[11px] text-[#94A3B8]">Da pior para a melhor posicionamento de mercado</p>
        <div className="mt-3">
          <CategoryTable categories={categories} />
        </div>
      </div>
    </div>
  );
}
