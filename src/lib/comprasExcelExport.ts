import * as XLSX from "xlsx";
import { IndustryRow, CategoryRow, ProductRow } from "./types";
import { buildComprasActionRecommendations } from "./comprasEmailBuilder";
import { STATUS_LABEL } from "./calculations";

function money(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

async function fetchProductRows(): Promise<ProductRow[]> {
  const settingsRes = await fetch("/api/settings");
  const settingsData = await settingsRes.json();
  const activeCompetitors = settingsData.activeCompetitors || "";
  const params = new URLSearchParams({
    competitors: activeCompetitors,
    page: "1",
    pageSize: "5000",
    sortBy: "diffPct",
    sortDir: "asc"
  });
  const res = await fetch("/api/products?" + params.toString());
  const data = await res.json();
  return data.rows || [];
}

export async function exportComprasExcel(industry: IndustryRow | undefined, categories: CategoryRow[]) {
  var wb = XLSX.utils.book_new();

  var resumoRows: (string | number)[][] = [
    ["Fornecedor", industry ? industry.fornecedor : "-"],
    ["Itens Martins", industry ? industry.itensMartins : 0],
    ["Itens Concorrente Cadastrados", industry ? industry.itensConcorrenteCadastrados : 0],
    ["Diferenca de Mix", industry ? industry.diferenca : 0],
    ["Posicionamento (%)", industry ? industry.competitivePct : 0],
    ["Itens em Desvantagem", industry ? industry.disadvantage : 0],
    ["Prioridade", industry ? industry.priority : "-"]
  ];
  var resumoSheet = XLSX.utils.aoa_to_sheet(resumoRows);
  resumoSheet["!cols"] = [{ wch: 28 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, resumoSheet, "Resumo Industria");

  var catHeader: (string | number)[] = [
    "Categoria",
    "Monitorados",
    "Competitivos",
    "Em Desvantagem",
    "Competitividade (%)",
    "Gap Medio (%)",
    "Prioridade"
  ];
  var catRows: (string | number)[][] = categories.map(function (c) {
    return [
      c.category,
      c.monitored,
      c.competitive,
      c.disadvantage,
      c.competitivePct,
      c.avgDisadvantagePct !== null ? c.avgDisadvantagePct : "-",
      c.priority
    ];
  });
  var catSheet = XLSX.utils.aoa_to_sheet([catHeader].concat(catRows));
  catSheet["!cols"] = [{ wch: 30 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 18 }, { wch: 14 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, catSheet, "Categorias");

  var acoes = buildComprasActionRecommendations(categories);
  var acoesRows: string[][] = [["Acoes Recomendadas"]].concat(acoes.map(function (a) { return [a]; }));
  var acoesSheet = XLSX.utils.aoa_to_sheet(acoesRows);
  acoesSheet["!cols"] = [{ wch: 80 }];
  XLSX.utils.book_append_sheet(wb, acoesSheet, "Acoes Recomendadas");

  var products = await fetchProductRows();
  var prodHeader: (string | number)[] = ["EAN", "Descricao", "Categoria", "Preco Martins", "Preco Concorrente", "Distribuidor", "Diferenca (%)", "Status"];
  var prodRows: (string | number)[][] = products.map(function (p) {
    return [
      p.ean,
      p.description,
      p.category ? p.category : "-",
      money(p.martinsPrice),
      p.marketPrice !== null ? money(p.marketPrice) : "-",
      p.bestCompetitor ? p.bestCompetitor : "-",
      p.diffPct !== null ? Math.round(p.diffPct * 1000) / 10 : "-",
      STATUS_LABEL[p.status]
    ];
  });
  var prodSheet = XLSX.utils.aoa_to_sheet([prodHeader].concat(prodRows));
  prodSheet["!cols"] = [
    { wch: 16 },
    { wch: 45 },
    { wch: 22 },
    { wch: 14 },
    { wch: 16 },
    { wch: 18 },
    { wch: 14 },
    { wch: 18 }
  ];
  XLSX.utils.book_append_sheet(wb, prodSheet, "Analise de Produtos");

  var fileName = "analise_compradores_" + (industry ? industry.fornecedor.replace(/\s+/g, "_") : "geral") + ".xlsx";
  XLSX.writeFile(wb, fileName);
}
