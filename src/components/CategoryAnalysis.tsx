"use client";

import { CategoryRow } from "@/lib/types";
import { clsx } from "clsx";

const PRIORITY_STYLES: Record<string, string> = {
  Alta: "bg-bad-bg text-bad",
  Média: "bg-warn-bg text-warn",
  Baixa: "bg-good-bg text-good"
};

export function CategoryAnalysis({ categories }: { categories: CategoryRow[] }) {
  if (categories.length === 0) {
    return (
      <p className="text-[13px] text-ink-600">
        Nenhuma categoria com dados de mercado ainda. Envie uma planilha de concorrente para começar.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {categories.map((c) => (
        <div key={c.category} className="rounded-lg bg-surface/60 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[13px] font-semibold text-ink-950">{c.category}</span>
            <span className={clsx("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium", PRIORITY_STYLES[c.priority])}>
              {c.priority}
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-[12px] text-ink-500">
            <span>
              Monitorados: <strong className="text-ink-800">{c.monitored}</strong>
            </span>
            <span>
              Competitividade: <strong className="text-ink-800">{c.competitivePct}%</strong>
            </span>
            <span>
              Desvantagem: <strong className="text-ink-800">{c.disadvantage}</strong>
            </span>
          </div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-700">{c.summary}</p>
        </div>
      ))}
    </div>
  );
}
