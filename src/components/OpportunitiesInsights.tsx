"use client";

import { CategoryRow } from "@/lib/types";

const MEDALS = ["🥇", "🥈"];
const LABELS = ["Principal oportunidade", "Segunda prioridade"];

export function OpportunitiesInsights({ categories }: { categories: CategoryRow[] }) {
  const priority = categories.filter(function (c) { return c.priority !== "Baixa"; }).slice(0, 2);

  if (priority.length === 0) return null;

  const actionText =
    priority.length === 2
      ? "Priorizar a negociacao das categorias " + priority[0].category + " e " + priority[1].category + " para recuperar competitividade no estado."
      : "Priorizar a negociacao da categoria " + priority[0].category + " para recuperar competitividade no estado.";

  return (
    <div className="rounded-xl bg-white p-4 shadow-card">
      <h3 className="text-[12px] font-semibold text-[#1F2937]">📌 Prioridades de Negociacao</h3>

      <div className="mt-3 flex flex-col gap-3">
        {priority.map(function (c, idx) {
          return (
            <div key={c.category}>
              <div className="flex items-center gap-1.5">
                <span className="text-[12px]">{MEDALS[idx]}</span>
                <span className="text-[8px] font-medium uppercase tracking-wide text-[#94A3B8]">{LABELS[idx]}</span>
              </div>
              <div className="mt-0.5 text-[9px] font-semibold text-[#2563EB]">{c.category}</div>
              <ul className="mt-1 space-y-0.5 text-[8px] text-[#6B7280]">
                <li>Posicionamento de mercado: {c.competitivePct}%</li>
                <li>Itens em desvantagem: {c.disadvantage}</li>
                <li>Gap medio: {c.avgDisadvantagePct !== null ? c.avgDisadvantagePct.toFixed(1).replace(".", ",") + "%" : "-"}</li>
              </ul>
            </div>
          );
        })}
      </div>

      <div className="mt-3 rounded-lg bg-[#F59E0B]/10 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[12px]">🎯</span>
          <span className="text-[8px] font-medium uppercase tracking-wide text-[#94A3B8]">Acao recomendada</span>
        </div>
        <p className="mt-0.5 text-[9px] leading-relaxed text-[#1F2937]">{actionText}</p>
      </div>
    </div>
  );
}
