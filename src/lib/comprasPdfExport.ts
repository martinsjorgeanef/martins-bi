import jsPDF from "jspdf";
import "jspdf-autotable";
import { IndustryRow, CategoryRow } from "./types";
import { buildComprasActionRecommendations } from "./comprasEmailBuilder";

export function exportComprasPdf(industry: IndustryRow | undefined, categories: CategoryRow[]) {
  var doc = new jsPDF();
  var fornecedor = industry ? industry.fornecedor : "Analise Geral";

  doc.setFontSize(16);
  doc.text("Analise de Competitividade para Compradores", 14, 16);
  doc.setFontSize(12);
  doc.text("Industria: " + fornecedor, 14, 24);

  var kpiRows = [
    ["Posicionamento", (industry ? industry.competitivePct : 0) + "%"],
    ["Itens Martins", String(industry ? industry.itensMartins : 0)],
    ["Itens Concorrente", String(industry ? industry.itensConcorrenteCadastrados : 0)],
    ["Itens em Desvantagem", String(industry ? industry.disadvantage : 0)],
    ["Prioridade", industry ? industry.priority : "-"]
  ];

  (doc as unknown as { autoTable: (opts: Record<string, unknown>) => void }).autoTable({
    startY: 30,
    head: [["Indicador", "Valor"]],
    body: kpiRows,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [30, 58, 138] }
  });

  var afterKpiY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  var catHeader = ["Categoria", "Competitividade", "Desvantagem", "Prioridade"];
  var catRows = categories.map(function (c) {
    return [c.category, c.competitivePct + "%", String(c.disadvantage), c.priority];
  });

  (doc as unknown as { autoTable: (opts: Record<string, unknown>) => void }).autoTable({
    startY: afterKpiY,
    head: [catHeader],
    body: catRows,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 58, 138] }
  });

  var afterCatY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  doc.setFontSize(12);
  doc.text("Acoes Recomendadas", 14, afterCatY);

  var acoes = buildComprasActionRecommendations(categories);
  var y = afterCatY + 7;
  doc.setFontSize(10);
  acoes.forEach(function (a) {
    var splitText = doc.splitTextToSize("- " + a, 180);
    doc.text(splitText, 14, y);
    y += splitText.length * 5 + 2;
  });

  var fileName = "analise_compradores_" + fornecedor.replace(/\s+/g, "_") + ".pdf";
  doc.save(fileName);
}
