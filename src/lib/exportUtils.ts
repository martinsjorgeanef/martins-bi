import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { ProductRow } from "./types";
import { STATUS_LABEL } from "./calculations";

function buildTableData(rows: ProductRow[]) {
  const headers = [
    "EAN",
    "Descrição",
    "Fornecedor",
    "Preço Martins",
    "Preço Mercado",
    "Concorrente",
    "Diferença (%)",
    "Status"
  ];
  const data = rows.map((r) => [
    r.ean,
    r.description,
    r.supplier ?? "",
    r.martinsPrice,
    r.marketPrice ?? "",
    r.bestCompetitor ?? "",
    r.diffPct !== null ? (r.diffPct * 100).toFixed(1) : "",
    STATUS_LABEL[r.status]
  ]);
  return { headers, data };
}

export function exportProductsToExcel(rows: ProductRow[], filename = "produtos.xlsx") {
  const { headers, data } = buildTableData(rows);
  const sheetData = [headers, ...data];
  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  ws["!cols"] = [
    { wch: 16 },
    { wch: 45 },
    { wch: 28 },
    { wch: 14 },
    { wch: 14 },
    { wch: 18 },
    { wch: 14 },
    { wch: 18 }
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Produtos");
  XLSX.writeFile(wb, filename);
}

export function exportProductsToPdf(rows: ProductRow[], filename = "produtos.pdf") {
  const { headers, data } = buildTableData(rows);
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(12);
  doc.text("Painel de Competitividade - Produtos", 14, 12);
  (doc as unknown as { autoTable: (opts: Record<string, unknown>) => void }).autoTable({
    head: [headers],
    body: data,
    startY: 18,
    styles: { fontSize: 7 },
    headStyles: { fillColor: [15, 23, 42] }
  });
  doc.save(filename);
}
