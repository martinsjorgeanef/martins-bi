"use client";

import { IndustryRow, CategoryRow } from "@/lib/types";

interface Props {
  competitive: number;
  disadvantage: number;
  industry: IndustryRow | undefined;
  categories: CategoryRow[];
}

export function PriorityActions({ competitive, disadvantage, industry, categories }: Props) {
  const items: { emoji: string; text: string }[] = [];

  if (disadvantage > 0) {
    items.push({ emoji: "🔴", text: "Negociar os " + disadvantage + " itens em desvantagem." });
  }

  if (industry && industry.diferenca > 0) {
    items.push({ emoji: "🟠", text: "Avaliar " + industry.diferenca + " oportunidades de ampliacao de mix." });
  }

  const worstCategory = categories.find(function (c) { return c.priority !== "Baixa"; });
  if (worstCategory) {
    items.push({ emoji: "🟡", text: "Priorizar a categoria " + worstCategory.category + "." });
  }

  if (competitive > 0) {
    items.push({ emoji: "🟢", text: "Monitorar os " + competitive + " itens ja competitivos." });
  }

  if (items.length === 0) return null;

  return (
    <div className="rounded-xl bg-white p-4 shadow-card">
      <h3 className="text-[12px] font-semibold text-[#1F2937]">Acoes Prioritarias</h3>
      <ul className="mt-2.5 flex flex-col gap-1.5">
        {items.map(function (item, i) {
          return (
            <li key={i} className="flex items-start gap-2 text-[9px] leading-relaxed text-[#6B7280]">
              <span className="shrink-0 text-[10px]">{item.emoji}</span>
              {item.text}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
