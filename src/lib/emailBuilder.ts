import { CategoryRow, IndustryRow } from "./types";

export interface StatsForEmail {
  matchedProducts: number;
  competitive: number;
  attention: number;
  disadvantage: number;
}

export function buildComprasEmail(stats: StatsForEmail, categories: CategoryRow[], industries: IndustryRow[]) {
  const pct = stats.matchedProducts > 0 ? Math.round((stats.competitive / stats.matchedProducts) * 100) : 0;
  const priorityCategories = categories.filter((c) => c.priority !== "Baixa").slice(0, 3).map((c) => c.category);
  const priorityIndustries = industries.filter((i) => i.priority !== "Baixa").slice(0, 3).map((i) => i.fornecedor);

  const subject = "Análise de Competitividade - Painel Martins";
  const lines: string[] = [
    "Olá,",
    "",
    "Realizamos a atualização da análise de competitividade dos preços da Martins em comparação com os principais concorrentes.",
    "",
    "Resumo da análise",
    "- Produtos monitorados: " + stats.matchedProducts,
    "- Competitivos: " + stats.competitive + " (" + pct + "%)",
    "- Em negociação: " + stats.attention,
    "- Em desvantagem: " + stats.disadvantage,
    ""
  ];

  if (priorityCategories.length > 0) {
    lines.push("As principais oportunidades concentram-se nas categorias:");
    priorityCategories.forEach((c) => lines.push("- " + c));
    lines.push("");
  }

  if (priorityIndustries.length > 0) {
    lines.push("As indústrias que mais demandam atenção são:");
    priorityIndustries.forEach((i) => lines.push("- " + i));
    lines.push("");
  }

  lines.push(
    "Solicitações para a área de Compras",
    "- Priorizar negociação dos itens classificados como Em Desvantagem.",
    "- Revisar categorias com menor competitividade.",
    "- Avaliar oportunidades de ampliação do mix.",
    "- Acompanhar a evolução dos indicadores após as negociações.",
    "",
    "Obrigado."
  );

  return { subject: subject, body: lines.join("\n") };
}
