"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { CategoryRow, IndustryRow } from "@/lib/types";
import { EmailComprasModal } from "./EmailComprasModal";

interface StatsLike {
  matchedProducts: number;
  competitive: number;
  attention: number;
  disadvantage: number;
}

interface Props {
  stats: StatsLike | null;
  industries: IndustryRow[];
  categories: CategoryRow[];
}

export function ExecutiveSummary({ stats, industries, categories }: Props) {
  const [emailOpen, setEmailOpen] = useState(false);

  if (!stats || stats.matchedProducts === 0) return null;

  const pctCompetitive = Math.round((stats.competitive / stats.matchedProducts) * 100);
  const pctDisadvantage = Math.round((stats.disadvantage / stats.matchedProducts) * 100);
  const industriaAtiva = industries[0];
  const priorityCategories = categories.filter((c) => c.priority !== "Baixa").slice(0, 3);

  const recommendationParts: string[] = [];
  if (stats.disadvantage > 0) recommendationParts.push("priorizar a negociação dos itens em desvantagem");
  if (industriaAtiva && industriaAtiva.diferenca > 0) recommendationParts.push("revisar oportunidades de ampliação do mix");
  const recommendation =
    recommendationParts.length > 0
      ? "Recomendamos " + recommendationParts.join(" e ") + "."
      : "Situação estável, sem ações críticas no momento.";

  return (
    <div className="rounded-xl bg-white p-4 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-semibold text-ink-950">Resumo Executivo</h3>
        <button
          onClick={() => setEmailOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-accent-dark"
        >
          <Mail size={13} />
          Gerar e-mail para Compras
        </button>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <div className="text-[12px] font-medium uppercase tracking-wide text-ink-500">Situação Geral</div>
          <ul className="mt-1.5 space-y-1 text-[13px] text-ink-800">
            <li>{stats.matchedProducts} produtos monitorados</li>
            <li>
              {stats.competitive} competitivos ({pctCompetitive}%)
            </li>
            <li>
              {stats.disadvantage} em desvantagem ({pctDisadvantage}%)
            </li>
          </ul>
        </div>

        <div>
          <div className="text-[12px] font-medium uppercase tracking-wide text-ink-500">Fornecedor Prioritário</div>
          <p className="mt-1.5 text-[13px] font-semibold text-ink-950">
            {industriaAtiva ? industriaAtiva.fornecedor : "Nenhum em análise"}
          </p>

          {priorityCategories.length > 0 && (
            <>
              <div className="mt-3 text-[12px] font-medium uppercase tracking-wide text-ink-500">
                Categorias Prioritárias
              </div>
              <ul className="mt-1.5 space-y-0.5 text-[13px] text-ink-800">
                {priorityCategories.map((c) => (
                  <li key={c.category}>{c.category}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      <p className="mt-3 rounded-lg bg-surface px-3 py-2 text-[13px] leading-relaxed text-ink-800">
        <strong>Ação Recomendada:</strong> {recommendation}
      </p>

      <EmailComprasModal
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        categories={categories}
        industry={industriaAtiva}
      />
    </div>
  );
}
