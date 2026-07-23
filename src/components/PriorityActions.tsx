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
    items.push({
      emoji: "🔴",
      text: "Negociar os " + disadvantage + " itens em desvantagem."
    });
  }

  if (industry && industry.diferenca > 0) {
    items.push({
      emoji: "🟠",
      text: "Avaliar " + industry.diferenca + " oportunidades de ampliação de mix."
    });
  }

  const worstCategory = categories.find((c) => c.priority !== "Baixa");
  if (worstCategory) {
    items.push({
      emoji: "🟡",
      text: "Priorizar a categoria " + worstCategory.category + "."
    });
  }

  if (competitive > 0) {
    items.push({
      emoji: "🟢",
      text: "Monitorar os " + competitive + " itens já competitivos."
    });
  }

  if (items.length === 0) return null;

  return (
    <div className="rounded-xl bg-white p-4 shadow-card">
      <h3 className="text-[16px] font-semibold text-ink-950">Ações Prioritárias</h3>
      <ul className="mt-2.5 flex flex-col gap-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-[13px] leading-relaxed text-ink-800">
            <span className="shrink-0">{item.emoji}</span>
            {item.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
