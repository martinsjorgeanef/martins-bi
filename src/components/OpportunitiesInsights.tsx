"use client";

import { DisadvantageItem } from "./Charts";

function buildCategoryInsights(items: DisadvantageItem[]) {
  const map = new Map<string, { count: number; sum: number }>();
  for (const it of items) {
    const cat = it.category || "Sem categoria";
    const entry = map.get(cat) ?? { count: 0, sum: 0 };
    entry.count++;
    entry.sum += Math.abs(it.diffPct);
    map.set(cat, entry);
  }
  return Array.from(map.entries())
    .map(function (entry) {
      const category = entry[0];
      const v = entry[1];
      return { category: category, count: v.count, avg: v.sum / v.count };
    })
    .sort(function (a, b) {
      if (b.count !== a.count) return b.count - a.count;
      return b.avg - a.avg;
    });
}

export function OpportunitiesInsights({ items }: { items: DisadvantageItem[] }) {
  if (items.length === 0) return null;

  const insights = buildCategoryInsights(items).slice(0, 2);
  if (insights.length === 0) return null;

  const labels = ["Categoria com maior necessidade de negociacao", "Segunda categoria mais critica"];

  let summary: string;
  if (insights.length === 2) {
    summary =
      "A analise demonstra que as maiores perdas de competitividade estao concentradas nas categorias " +
      insights[0].category +
      " e " +
      insights[1].category +
      ", indicando que negociacoes nessas categorias podem gerar o maior impacto na recuperacao da competitividade da Martins.";
  } else {
    summary =
      "A analise demonstra que a maior perda de competitividade esta concentrada na categoria " +
      insights[0].category +
      ", indicando que negociacoes nessa categoria podem gerar o maior impacto na recuperacao da competitividade da Martins.";
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-card">
      <h3 className="text-[16px] font-semibold text-ink-950">Oportunidades Identificadas</h3>

      <div className="mt-3 flex flex-col gap-3">
        {insights.map(function (ins, idx) {
          return (
            <div key={ins.category}>
              <div className="text-[11px] font-medium uppercase tracking-wide text-ink-500">{labels[idx]}</div>
              <div className="mt-0.5 text-[13px] font-semibold text-ink-950">{ins.category}</div>
              <ul className="mt-1 space-y-0.5 text-[12px] text-ink-700">
                <li>{ins.count} itens entre os maiores gaps de preco.</li>
                <li>Desvantagem media de {ins.avg.toFixed(1).replace(".", ",")}%.</li>
              </ul>
            </div>
          );
        })}
      </div>

      <p className="mt-3 rounded-lg bg-surface px-3 py-2 text-[12px] leading-relaxed text-ink-800">{summary}</p>
    </div>
  );
}
