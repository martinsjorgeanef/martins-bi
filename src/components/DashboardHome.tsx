"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { KpiCards } from "./KpiCards";
import { CadgerInfoCard } from "./CadgerInfoCard";
import { RecoveryPotentialCard } from "./RecoveryPotentialCard";
import { TopDisadvantageChart } from "./Charts";
import { DashboardStats } from "@/lib/types";
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
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async function () {
    setLoading(true);
    const settingsRes = await fetch("/api/settings");
    const settingsData = await settingsRes.json();
    const activeCompetitors = settingsData.activeCompetitors || "";
    const params = new URLSearchParams({ competitors: activeCompetitors });
    const res = await fetch("/api/stats?" + params.toString());
    const data = await res.json();
    setStats(data);
    setLoading(false);
  }, []);

  useEffect(function () { loadStats(); }, [loadStats]);

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

      {stats ? <TopDisadvantageChart data={stats.topDisadvantage} /> : null}
    </div>
  );
}
