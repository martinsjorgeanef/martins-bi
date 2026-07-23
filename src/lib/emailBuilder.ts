import { CategoryRow, IndustryRow } from "./types";

export interface StatsForEmail {
  matchedProducts: number;
  competitive: number;
  attention: number;
  disadvantage: number;
}

function formatPct(n: number): string {
  return n.toFixed(1).replace(".", ",") + "%";
}

export function buildComprasEmail(
  categories: CategoryRow[],
  industry: IndustryRow | undefined,
  buyerName: string,
  state: string
) {
  const industryName = industry ? industry.fornecedor : "[Nome da Indústria]";
  const buyer = buyerName.trim() || "[Nome do Comprador]";
  const uf = state.trim() || "[Estado]";

  const subject = "Análise de Competitividade - Estado do " + uf + " | Indústria " + industryName;

  const opportunityCategories = categories
    .filter((c) => c.priority !== "Baixa")
    .sort((a, b) => a.competitivePct - b.competitivePct);

  const lines: string[] = [];
  lines.push("Olá, " + buyer + ",");
  lines.push("");
  lines.push(
    "Segue a análise de competitividade realizada no estado do " +
      uf +
      ", comparando o desempenho da Martins em relação aos principais distribuidores do mercado para a indústria " +
      industryName +
      "."
  );
  lines.push("");

  if (opportunityCategories.length > 0) {
    lines.push("Nesta atualização, identificamos oportunidades de melhoria concentradas principalmente nas seguintes categorias:");
    lines.push("");
    for (const c of opportunityCategories) {
      const desvantagem = c.avgDisadvantagePct !== null ? formatPct(c.avgDisadvantagePct) : "—";
      lines.push("- " + c.category + " — Competitividade: " + formatPct(c.competitivePct) + " | Desvantagem média: " + desvantagem);
    }
    lines.push("");
    lines.push("Essas categorias concentram nossas maiores oportunidades de recuperação de competitividade no estado.");
    lines.push("");
  }

  if (industry && industry.diferenca > 0) {
    lines.push(
      "Além disso, identificamos uma oportunidade de ampliação de mix: o concorrente possui " +
        industry.diferenca +
        " itens cadastrados dessa indústria que a Martins ainda não trabalha. Como a indústria já performa bem no estado, esse pode ser um caminho interessante para aumentar o número de SKUs ativos."
    );
    lines.push("");
  }

  lines.push(
    "Gostaria de contar com seu apoio na avaliação dessas categorias e na priorização das negociações, buscando reduzir a diferença em relação aos concorrentes e fortalecer nosso posicionamento no mercado."
  );
  lines.push("");
  lines.push("Na sequência, segue o detalhamento completo dos itens analisados para apoiar as negociações.");
  lines.push("");
  lines.push("Desde já, agradeço pela parceria e pelo apoio de sempre.");
  lines.push("");
  lines.push("Atenciosamente,");

  return { subject: subject, body: lines.join("\n") };
}
