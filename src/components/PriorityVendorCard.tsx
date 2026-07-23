"use client";

import { IndustryRow } from "@/lib/types";
import { Factory } from "lucide-react";

function buildRecommendation(i: IndustryRow): string {
  const parts: string[] = [];
  if (i.disadvantage > 0) parts.push("priorizar negociacao dos itens em desvantagem");
  if (i.diferenca > 0) parts.push("avaliar ampliacao do mix da industria");
  if (parts.length === 0) return i.summary;
  return parts.length === 1 ? "Recomendamos " + parts[0] + "." : "Recomendamos " + parts.join(" e ") + ".";
}

export function PriorityVendorCard({ industry }: { industry: IndustryRow | undefined }) {
  if (!industry) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-white p-4 text-center">
        <h3 className="text-[12px] font-semibold text-[#1F2937]">Fornecedor Prioritario</h3>
        <p className="mt-1 text-[9px] text-[#94A3B8]">
          Envie a planilha de um concorrente para ver aqui a industria em analise.
        </p>
      </div>
    );
  }

  function stat(label: string, value: string, color: string) {
    return (
      <div>
        <div className={"text-[14px] font-bold tabular-nums " + color}>{value}</div>
        <div className="text-[8px] text-[#94A3B8]">{label}</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-card">
      <div className="flex items-center gap-1.5">
        <Factory size={12} className="text-accent" />
        <span className="text-[8px] font-medium uppercase tracking-wide text-[#94A3B8]">Fornecedor Prioritario</span>
      </div>
      <div className="mt-1 text-[12px] font-semibold text-[#1F2937]">{industry.fornecedor}</div>

      <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
        {stat("Posicionamento de Mercado", industry.competitivePct + "%", "text-[#1F2937]")}
        {stat("Itens Martins", String(industry.itensMartins), "text-[#1F2937]")}
        {stat("Itens Concorrente", String(industry.itensConcorrenteCadastrados), "text-[#1F2937]")}
        {stat(
          "Diferenca de Mix",
          (industry.diferenca > 0 ? "+" : "") + industry.diferenca,
          industry.diferenca > 0 ? "text-[#DC2626]" : industry.diferenca < 0 ? "text-[#16A34A]" : "text-[#1F2937]"
        )}
        {stat("Em desvantagem", String(industry.disadvantage), "text-[#DC2626]")}
      </div>

      {industry.categoriesAffected.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {industry.categoriesAffected.map(function (c) {
            return (
              <span key={c} className="rounded-full bg-surface px-2 py-0.5 text-[8px] font-medium text-[#2563EB]">
                {c}
              </span>
            );
          })}
        </div>
      ) : null}

      <p className="mt-3 rounded-lg bg-accent/[0.06] px-3 py-2 text-[9px] leading-relaxed text-[#1F2937]">
        <strong>Acao recomendada:</strong> {buildRecommendation(industry)}
      </p>
    </div>
  );
}
