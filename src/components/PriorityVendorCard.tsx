"use client";

import { IndustryRow } from "@/lib/types";
import { Factory } from "lucide-react";

function buildRecommendation(i: IndustryRow): string {
  const parts: string[] = [];
  if (i.disadvantage > 0) parts.push("priorizar negociação dos itens em desvantagem");
  if (i.diferenca > 0) parts.push("avaliar ampliação do mix da indústria");
  if (parts.length === 0) return i.summary;
  return parts.length === 1 ? "Recomendamos " + parts[0] + "." : "Recomendamos " + parts.join(" e ") + ".";
}

export function PriorityVendorCard({ industry }: { industry: IndustryRow | undefined }) {
  if (!industry) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-white p-4 text-center">
        <h3 className="text-[16px] font-semibold text-ink-950">Fornecedor Prioritário</h3>
        <p className="mt-1 text-[13px] text-ink-600">
          Envie a planilha de um concorrente para ver aqui a indústria em análise.
        </p>
      </div>
    );
  }

  const stat = (label: string, value: string, accent = "text-ink-950") => (
    <div>
      <div className={"text-[20px] font-bold tabular-nums " + accent}>{value}</div>
      <div className="text-[12px] text-ink-500">{label}</div>
    </div>
  );

  return (
    <div className="rounded-xl bg-white p-4 shadow-card">
      <div className="flex items-center gap-1.5">
        <Factory size={14} className="text-accent" />
        <span className="text-[13px] font-medium uppercase tracking-wide text-ink-500">Fornecedor Prioritário</span>
      </div>
      <div className="mt-1 text-[16px] font-semibold text-ink-950">{industry.fornecedor}</div>

      <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
        {stat("Competitividade", industry.competitivePct + "%")}
        {stat("Itens Martins", String(industry.itensMartins))}
        {stat("Itens Concorrente", String(industry.itensConcorrenteCadastrados))}
        {stat(
          "Diferença de Mix",
          (industry.diferenca > 0 ? "+" : "") + industry.diferenca,
          industry.diferenca > 0 ? "text-bad" : industry.diferenca < 0 ? "text-good" : "text-ink-950"
        )}
        {stat("Em desvantagem", String(industry.disadvantage), "text-bad")}
      </div>

      {industry.categoriesAffected.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {industry.categoriesAffected.map((c) => (
            <span key={c} className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium text-ink-700">
              {c}
            </span>
          ))}
        </div>
      )}

      <p className="mt-3 rounded-lg bg-accent/[0.06] px-3 py-2 text-[13px] leading-relaxed text-ink-800">
        <strong>Ação recomendada:</strong> {buildRecommendation(industry)}
      </p>
    </div>
  );
}
