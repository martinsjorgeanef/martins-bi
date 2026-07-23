"use client";

import { TrendingUp, AlertTriangle, Factory } from "lucide-react";
import { IndustryRow } from "@/lib/types";

interface StatsLike {
  matchedProducts: number;
  competitive: number;
  attention: number;
  disadvantage: number;
}

interface Props {
  stats: StatsLike | null;
  industries: IndustryRow[];
}

export function InsightsPanel({ stats, industries }: Props) {
  if (!stats || stats.matchedProducts === 0) return null;

  const pctCompetitive = Math.round((stats.competitive / stats.matchedProducts) * 100);
  const industriaAtiva = industries[0];

  const opportunityText = industriaAtiva
    ? `${industriaAtiva.fornecedor} concentra a maior parte dos itens em desvantagem.`
    : "Nenhuma indústria em análise no momento.";

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="rounded-xl bg-white p-4 shadow-card">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-good" />
          <span className="text-[13px] font-semibold text-ink-950">Competitividade</span>
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-700">
          <strong className="text-[16px] text-ink-950">{pctCompetitive}%</strong> dos produtos estão competitivos.
        </p>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-card">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-bad" />
          <span className="text-[13px] font-semibold text-ink-950">Prioridade</span>
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-700">
          <strong className="text-[16px] text-ink-950">{stats.disadvantage}</strong> produto
          {stats.disadvantage !== 1 ? "s" : ""} precisa{stats.disadvantage !== 1 ? "m" : ""} de negociação imediata.
        </p>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-card">
        <div className="flex items-center gap-2">
          <Factory size={16} className="text-accent" />
          <span className="text-[13px] font-semibold text-ink-950">Principal oportunidade</span>
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-700">{opportunityText}</p>
      </div>
    </div>
  );
}
