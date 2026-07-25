import { IndustryRow, CategoryRow } from "./types";

export function buildComprasActionRecommendations(categories: CategoryRow[]): string[] {
  var critical = categories.filter(function (c) { return c.priority !== "Baixa"; });
  if (critical.length === 0) {
    return ["Manter monitoramento periodico da competitividade."];
  }

  var byWorst = critical.slice().sort(function (a, b) { return a.competitivePct - b.competitivePct; });
  var lines: string[] = [];
  lines.push(
    "Priorizar negociacao da categoria " + byWorst[0].category + ", com competitividade de " + byWorst[0].competitivePct + "%."
  );
  if (byWorst.length > 1) {
    lines.push("Revisar tambem a categoria " + byWorst[1].category + " junto ao fornecedor.");
  }
  lines.push("Avaliar oportunidades de reducao de custo e ampliacao de mix nas categorias criticas.");
  return lines;
}

type SeverityTier = "alta" | "moderada" | "leve" | "insuficiente";

// Avalia a situacao de forma qualitativa, cruzando: gap medio das categorias prioritarias,
// quantidade de itens em desvantagem, presenca de categoria em Prioridade Maxima, e se o
// concorrente tem mais itens cadastrados que a Martins na industria (impacto no mix).
// Nao gera um percentual fixo - serve apenas como direcionamento comercial.
function assessSeverity(priorityCategories: CategoryRow[], industry: IndustryRow | undefined): SeverityTier {
  if (priorityCategories.length === 0) return "insuficiente";

  var hasMaxima = priorityCategories.some(function (c) { return c.priority === "Prioridade Maxima"; });
  var totalDisadvantage = priorityCategories.reduce(function (sum, c) { return sum + c.disadvantage; }, 0);
  var gapValues = priorityCategories
    .map(function (c) { return c.avgDisadvantagePct; })
    .filter(function (v) { return v !== null; }) as number[];
  var avgGap = gapValues.length > 0 ? gapValues.reduce(function (s, v) { return s + v; }, 0) / gapValues.length : 0;
  var mixImpact = industry ? industry.diferenca > 0 : false;

  if (hasMaxima || avgGap >= 10 || totalDisadvantage >= 10) return "alta";
  if (avgGap >= 5 || totalDisadvantage >= 5 || mixImpact) return "moderada";
  if (gapValues.length === 0 && totalDisadvantage === 0) return "insuficiente";
  return "leve";
}

function recommendationTextFor(tier: SeverityTier): string {
  if (tier === "alta") {
    return "Diante do volume de itens em desvantagem e da diferenca expressiva de preco identificada, recomenda-se priorizar a negociacao nas categorias destacadas, com foco em recuperar competitividade e reduzir o risco de perda de participacao no mercado.";
  }
  if (tier === "moderada") {
    return "Os indicadores apontam oportunidades relevantes de negociacao nas categorias destacadas. Recomenda-se avaliar condicoes comerciais para fortalecer a competitividade e ampliar a participacao nessas categorias.";
  }
  if (tier === "leve") {
    return "Recomenda-se avaliar oportunidades pontuais de negociacao nas categorias destacadas, de forma a consolidar a competitividade ja observada.";
  }
  return "Recomenda-se avaliar oportunidades comerciais para fortalecimento da competitividade nas categorias priorizadas.";
}

export function buildComprasEmail(industry: IndustryRow | undefined, categories: CategoryRow[]) {
  var fornecedor = industry ? industry.fornecedor : "[Industria]";
  var subject = "Analise de Competitividade - " + fornecedor;

  var priorityCategories = categories
    .filter(function (c) { return c.priority !== "Baixa"; })
    .sort(function (a, b) { return a.competitivePct - b.competitivePct; })
    .slice(0, 3);

  var severity = assessSeverity(priorityCategories, industry);
  var recommendationText = recommendationTextFor(severity);

  var lines: string[] = [];
  lines.push("Ola,");
  lines.push("");
  lines.push("Esperamos que esteja bem.");
  lines.push("");
  lines.push(
    "Realizamos uma analise de competitividade da industria " +
      fornecedor +
      ", comparando nosso portfolio com os principais concorrentes do mercado."
  );
  lines.push("");

  if (priorityCategories.length > 0) {
    lines.push("Durante essa analise identificamos oportunidades relevantes para fortalecer a competitividade da industria, principalmente nas categorias:");
    lines.push("");
    priorityCategories.forEach(function (c) {
      lines.push("- " + c.category);
    });
    lines.push("");
  }

  lines.push(
    "Os indicadores apontam oportunidades para ampliar a competitividade da industria, fortalecer categorias estrategicas e aumentar a participacao frente ao mercado."
  );
  lines.push("");
  lines.push(recommendationText);
  lines.push("");
  lines.push("Caso considerem oportuno, ficamos a disposicao para apresentar os detalhes da analise e discutir oportunidades de desenvolvimento conjunto.");
  lines.push("");
  lines.push("Agradecemos pela parceria e permanecemos a disposicao.");

  return { subject: subject, body: lines.join("\n") };
}
