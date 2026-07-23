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
    return (
      <p className="text-[13px] text-ink-600">Nenhuma categoria com dados de mercado ainda.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] border-collapse">
        <thead>
          <tr className="text-left text-[12px] uppercase tracking-wide text-ink-500">
            <th className="pb-2 pr-2 font-medium">Categoria</th>
            <th className="pb-2 pr-2 text-right font-medium">Competitividade</th>
            <th className="pb-2 pr-2 text-right font-medium">Em desvantagem</th>
            <th className="pb-2 text-right font-medium">Prioridade</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.category} className="border-t border-line/60">
              <td className="py-2 pr-2 text-[13px] font-medium text-ink-950">{c.category}</td>
              <td className="py-2 pr-2 text-right text-[13px] tabular-nums text-ink-800">{c.competitivePct}%</td>
              <td className="py-2 pr-2 text-right text-[13px] tabular-nums text-bad">{c.disadvantage}</td>
              <td className="py-2 text-right">
                <span className={clsx("rounded-full px-2 py-0.5 text-[11px] font-medium", PRIORITY_STYLES[c.priority])}>
                  {c.priority}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
