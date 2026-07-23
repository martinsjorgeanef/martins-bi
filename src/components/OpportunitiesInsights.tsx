"use client";

import { CategoryRow } from "@/lib/types";

const MEDALS = ["🥇", "🥈"];
const LABELS = ["1a Prioridade", "2a Prioridade"];

function buildActionPlan(critical: CategoryRow[]): string[] {
  if (critical.length === 0) {
    return ["Nenhuma categoria critica identificada no momento. Manter monitoramento da competitividade."];
  }

  const byCompetitivePct = critical.slice().sort(function (a, b) {
    return a.competitivePct - b.competitivePct;
  });
  const byDisadvantage = critical.slice().sort(function (a, b) {
    return b.disadvantage - a.disadvantage;
  });

  const bullets: string[] = [];
  const first = byCompetitivePct[0];
  bullets.push(
    "Priorizar negociacao da categoria " +
      first.category +
      ", que apresenta a menor competitividade (" +
      first.competitivePct +
      "%)."
  );

  const secondCandidate = byDisadvantage.find(function (c) {
    return c.category !== first.category;
  });
  if (secondCandidate) {
    bullets.push(
      "Revisar a categoria " +
        secondCandidate.category +
        ", responsavel pelo maior numero de itens em desvantagem (" +
        secondCandidate.disadvantage +
        " itens)."
    );
  }

  bullets.push(
    "Avaliar oportunidades de reducao de custo junto aos fornecedores dessas categorias para recuperar competitividade no estado."
  );

  return bullets.slice(0, 3);
}

export function OpportunitiesInsights({ categories }: { categories: CategoryRow[] }) {
  const priority = categories
    .filter(function (c) {
      return c.priority !== "Baixa";
    })
    .slice(0, 2);

  const actionPlan = buildActionPlan(
    categories.filter(function (c) {
      return c.priority !== "Baixa";
    })
  );

  return (
    <div className="rounded-xl bg-white p-4 shadow-card">
      <h3 className="text-[12px] font-semibold text-[#1F2937]">📌 Prioridades de Negociacao</h3>

      {priority.length > 0 ? (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {priority.map(function (c, idx) {
            return (
              <div key={c.category} className="rounded-lg bg-surface px-3 py-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px]">{MEDALS[idx]}</span>
                  <span className="text-[8px] font-medium uppercase tracking-wide text-[#94A3B8]">{LABELS[idx]}</span>
                </div>
                <div className="mt-0.5 text-[10px] font-semibold text-[#2563EB]">{c.category}</div>
                <ul className="mt-1 space-y-0.5 text-[8px] text-[#6B7280]">
                  <li>Posicionamento de mercado: {c.competitivePct}%</li>
                  <li>Itens em desvantagem: {c.disadvantage}</li>
                  <li>Gap medio: {c.avgDisadvantagePct !== null ? c.avgDisadvantagePct.toFixed(1).replace(".", ",") + "%" : "-"}</li>
                </ul>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-2 text-[9px] text-[#94A3B8]">Nenhuma categoria critica no momento.</p>
      )}

      <div className="mt-3 rounded-lg bg-[#FEF9E7] px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[12px]">🎯</span>
          <span className="text-[9px] font-semibold uppercase tracking-wide text-[#92400E]">Plano de Acao</span>
        </div>
        <ul className="mt-1.5 space-y-1 text-[12px] leading-snug text-[#1F2937]">
          {actionPlan.map(function (text, i) {
            return (
              <li key={i} className="flex items-start gap-1.5">
                <span className="mt-0.5 shrink-0">•</span>
                {text}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
