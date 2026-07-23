"use client";

import { Sparkles } from "lucide-react";
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

  const pctCompetitive = (stats.competitive / stats.matchedProducts) * 100;
  const industriaAtiva = industries[0];

  const insights: string[] = [];

  insights.push(`${pctCompetitive.toFixed(0)}% dos produtos comparados estão competitivos frente ao mercado.`);

  if (stats.disadvantage > 0) {
    insights.push(
      `${stats.disadvantage} produto${stats.disadvantage !== 1 ? "s precisam" : " precisa"} de revisão imediata de preço (em desvantagem).`
    );
  }

  if (industriaAtiva) {
    insights.push(`Os dados em análise agora se concentram na indústria ${industriaAtiva.fornecedor}.`);
  }

  if (stats.attention > 0) {
    insights.push(
      `${stats.attention} produto${stats.attention !== 1 ? "s estão" : " está"} próximo${stats.attention !== 1 ? "s" : ""} da faixa de desvantagem (negociação pontual).`
    );
  }

  return (
    <div className="rounded-xl border border-accent/20 bg-accent/[0.04] p-4">
      <div className="mb-2 flex items-center gap-1.5">
        <Sparkles size={14} className="text-accent" />
        <h3 className="font-display text-xs font-semibold text-ink-950">Insights automáticos</h3>
      </div>
      <ul className="space-y-1">
        {insights.map((text, i) => (
          <li key={i} className="flex items-start gap-2 text-[12px] leading-relaxed text-ink-800">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
}
