import jsPDF from "jspdf";
import "jspdf-autotable";
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
    pageSize: "500",
    sortBy: "diffPct",
    sortDir: "asc"
  });
  const res = await fetch("/api/products?" + params.toString());
  const data = await res.json();
  return data.rows || [];
}

export async function exportComprasPdf(industry: IndustryRow | undefined, categories: CategoryRow[]) {
  var doc = new jsPDF();
  var fornecedor = industry ? industry.fornecedor : "Analise Geral";

  doc.setFontSize(13);
  doc.text("Analise de Competitividade para Compradores", 14, 14);
  doc.setFontSize(9);
  doc.text("Industria: " + fornecedor, 14, 20);

  var kpiRows = [
    ["Posicionamento", (industry ? industry.competitivePct : 0) + "%"],
    ["Itens Martins", String(industry ? industry.itensMartins : 0)],
    ["Itens Concorrente", String(industry ? industry.itensConcorrenteCadastrados : 0)],
    ["Itens em Desvantagem", String(industry ? industry.disadvantage : 0)],
    ["Prioridade", industry ? industry.priority : "-"]
  ];

  (doc as unknown as { autoTable: (opts: Record<string, unknown>) => void }).autoTable({
    startY: 25,
    head: [["Indicador", "Valor"]],
    body: kpiRows,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [30, 58, 138], fontSize: 8 }
  });

  var afterKpiY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

  var catHeader = ["Categoria", "Competitividade", "Desvantagem", "Prioridade"];
  var catRows = categories.map(function (c) {
    return [c.category, c.competitivePct + "%", String(c.disadvantage), c.priority];
  });

  (doc as unknown as { autoTable: (opts: Record<string, unknown>) => void }).autoTable({
    startY: afterKpiY,
    head: [catHeader],
    body: catRows,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [30, 58, 138], fontSize: 8 }
  });

  var afterCatY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  doc.setFontSize(10);
  doc.text("Acoes Recomendadas", 14, afterCatY);

  var acoes = buildComprasActionRecommendations(categories);
  var y = afterCatY + 5;
  doc.setFontSize(8);
  acoes.forEach(function (a) {
    var splitText = doc.splitTextToSize("- " + a, 180);
    doc.text(splitText, 14, y);
    y += splitText.length * 4 + 2;
  });

  var products = await fetchProductRows();
  var afterAcoesY = y + 4;

  doc.setFontSize(10);
  doc.text("Analise de Produtos", 14, afterAcoesY);

  var prodHeader = ["EAN", "Descricao", "Categoria", "Martins", "Concorrente", "Dif. (%)", "Status"];
  var prodRows = products.map(function (p) {
    return [
      p.ean,
      p.description.length > 40 ? p.description.slice(0, 40) + "..." : p.description,
      p.category ? p.category : "-",
      money(p.martinsPrice),
      p.marketPrice !== null ? money(p.marketPrice) : "-",
      p.diffPct !== null ? (Math.round(p.diffPct * 1000) / 10) + "%" : "-",
      STATUS_LABEL[p.status]
    ];
  });

  (doc as unknown as { autoTable: (opts: Record<string, unknown>) => void }).autoTable({
    startY: afterAcoesY + 4,
    head: [prodHeader],
    body: prodRows,
    styles: { fontSize: 6.5 },
    headStyles: { fillColor: [30, 58, 138], fontSize: 7 }
  });

  var fileName = "analise_compradores_" + fornecedor.replace(/\s+/g, "_") + ".pdf";
  doc.save(fileName);
}
