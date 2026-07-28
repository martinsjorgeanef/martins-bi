import { CategoryRow, IndustryRow } from "./types";

export interface StatsForEmail {
  matchedProducts: number;
  competitive: number;
  attention: number;
  disadvantage: number;
}

export interface SupplierHistoryRowForEmail {
  mes: string;
  metaVenda: number;
  venda: number;
  clientesAtendidos: number;
}

function formatPct(n: number): string {
  return n.toFixed(1).replace(".", ",") + "%";
}

function formatMoneyBR(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

var MESES_NOMES_EMAIL = ["", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function formatMesEmail(mes: string): string {
  var ano = mes.slice(0, 4);
  var mesNum = mes.slice(4, 6);
  var idx = parseInt(mesNum, 10);
  return (MESES_NOMES_EMAIL[idx] || mesNum) + "/" + ano;
}

export function buildHistoryParagraph(rows: SupplierHistoryRowForEmail[], estadoLabel: string): string | null {
  if (rows.length === 0) return null;

  var sorted = rows.slice().sort(function (a, b) { return a.mes.localeCompare(b.mes); });
  var comMeta = sorted.filter(function (r) { return r.metaVenda > 0; });
  if (comMeta.length === 0) return null;

  var ultimos6 = comMeta.slice(-6);
  var n = ultimos6.length;

  var mesesAbaixo = 0;
  for (var i = 0; i < ultimos6.length; i++) {
    var pctCheck = (ultimos6[i].venda / ultimos6[i].metaVenda) * 100;
    if (pctCheck < 100) mesesAbaixo++;
  }

  var linhas: string[] = [];
  linhas.push(
    "Trazendo o histórico dos últimos " + n + " meses no estado do " + estadoLabel +
      ", o desempenho da indústria mês a mês foi o seguinte:"
  );
  linhas.push("");

  for (var j = 0; j < ultimos6.length; j++) {
    var row = ultimos6[j];
    var pct = (row.venda / row.metaVenda) * 100;
    linhas.push(
      "- " + formatMesEmail(row.mes) + ": " + formatPct(pct) + " da meta (" +
        formatMoneyBR(row.venda) + " de " + formatMoneyBR(row.metaVenda) + "), " +
        row.clientesAtendidos + " clientes atendidos."
    );
  }

  linhas.push("");
  if (mesesAbaixo > 0) {
    linhas.push(
      "Em " + mesesAbaixo + " desses " + n + " meses o resultado ficou abaixo da meta. Acreditamos que, com seu apoio na priorização das negociações, " +
        "conseguimos destravar juntos o potencial de crescimento da indústria no estado do " + estadoLabel + " nos próximos meses."
    );
  } else {
    linhas.push(
      "A indústria vem entregando um bom resultado no período, e contar com seu apoio nas negociações pode ajudar a sustentar e ampliar ainda mais esse crescimento no estado do " +
        estadoLabel + "."
    );
  }

  return linhas.join("\n");
}

export function buildComprasEmail(
  categories: CategoryRow[],
  industry: IndustryRow | undefined,
  buyerName: string,
  state: string,
  historyParagraph?: string | null
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

  if (historyParagraph) {
    lines.push(historyParagraph);
    lines.push("");
  }

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
