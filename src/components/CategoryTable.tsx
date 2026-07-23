"use client";

import { CategoryRow } from "@/lib/types";
import { clsx } from "clsx";

const PRIORITY_STYLES: Record<string, string> = {
  Alta: "bg-bad-bg text-bad",
  Média: "bg-warn-bg text-warn",
  Baixa: "bg-good-bg text-good"
};

export function CategoryTable({ categories }: { categories: CategoryRow[] }) {
  if (categories.length === 0) {
    return <p className="text-[9px] text-[#94A3B8]">Nenhuma categoria com dados de mercado ainda.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] border-collapse">
        <thead>
          <tr className="text-left text-[8px] uppercase tracking-wide text-[#94A3B8]">
            <th className="pb-2 pr-2 font-medium">Categoria</th>
            <th className="pb-2 pr-2 text-right font-medium">Posicionamento de Mercado</th>
            <th className="pb-2 pr-2 text-right font-medium">Em desvantagem</th>
            <th className="pb-2 text-right font-medium">Prioridade</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(function (c) {
            return (
              <tr key={c.category} className="border-t border-line/50">
                <td className="py-1.5 pr-2 text-[9px] font-medium text-[#1F2937]">{c.category}</td>
                <td className="py-1.5 pr-2 text-right text-[9px] tabular-nums text-[#6B7280]">{c.competitivePct}%</td>
                <td className="py-1.5 pr-2 text-right text-[9px] tabular-nums text-[#DC2626]">{c.disadvantage}</td>
                <td className="py-1.5 text-right">
                  <span className={clsx("rounded-full px-2 py-0.5 text-[8px] font-medium", PRIORITY_STYLES[c.priority])}>
                    {c.priority}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
