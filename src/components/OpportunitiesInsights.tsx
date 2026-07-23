"use client";

import { CategoryRow } from "@/lib/types";

function buildMotivos(critical: CategoryRow[]): string[] {
  var motivos: string[] = [];
  var totalDisadvantage = critical.reduce(function (sum, c) { return sum + c.disadvantage; }, 0);

  if (totalDisadvantage > 0) {
    motivos.push("maior quantidade de itens em desvantagem");
  }
  motivos.push("maior impacto potencial nas vendas");
  motivos.push("oportunidade de recuperar participacao de mercado");

  return motivos;
}

export function OpportunitiesInsights({ categories }: { categories: CategoryRow[] }) {
  var critical = categories.filter(function (c) {
    return c.priority !== "Baixa";
  });

  if (critical.length === 0) {
    return (
      <div className="rounded-xl bg-white p-4 shadow-card">
        <h3 className="text-[16px] font-semibold text-[#1F2937]">Sugestao de Negociacao</h3>
        <p className="mt-2 text-[12px] text-[#94A3B8]">Nenhuma categoria critica identificada no momento.</p>
      </div>
    );
  }

  var hasAlta = critical.some(function (c) { return c.priority === "Alta"; });
  var priorityLabel = hasAlta ? "Prioridade Alta" : "Prioridade Media";
  var priorityColor = hasAlta ? "bg-bad-bg text-bad" : "bg-warn-bg text-warn";

  var suggestedCategories = critical
    .slice()
    .sort(function (a, b) { return a.competitivePct - b.competitivePct; })
    .slice(0, 3);

  var motivos = buildMotivos(critical);

  return (
    <div className="rounded-xl bg-white p-4 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-semibold text-[#1F2937]">Sugestao de Negociacao</h3>
        <span className={"rounded-full px-2.5 py-1 text-[11px] font-semibold " + priorityColor}>{priorityLabel}</span>
      </div>

      <div className="mt-3">
        <div className="text-[11px] font-medium uppercase tracking-wide text-[#94A3B8]">Categorias sugeridas</div>
        <ul className="mt-1 space-y-0.5">
          {suggestedCategories.map(function (c) {
            return (
              <li key={c.category} className="text-[12px] text-[#1F2937]">
                • {c.category}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-3">
        <div className="text-[11px] font-medium uppercase tracking-wide text-[#94A3B8]">Motivos</div>
        <ul className="mt-1 space-y-0.5">
          {motivos.map(function (m, i) {
            return (
              <li key={i} className="text-[12px] text-[#6B7280]">
                • {m}
              </li>
            );
          })}
        </ul>
      </div>

      <p className="mt-3 rounded-lg bg-surface px-3 py-2 text-[12px] leading-snug text-[#1F2937]">
        <strong>Proxima acao:</strong> Priorizar negociacao destas categorias junto a industria.
      </p>
    </div>
  );
}
