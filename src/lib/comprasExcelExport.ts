import ExcelJS from "exceljs";
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

interface PrintRow {
  competitorName: string;
  mimeType: string;
  imageBase64: string;
}

async function fetchPrints(fornecedor: string): Promise<PrintRow[]> {
  try {
    const res = await fetch("/api/competitors/prints?fornecedor=" + encodeURIComponent(fornecedor));
    if (!res.ok) return [];
    const data = await res.json();
    return data.prints || [];
  } catch {
    return [];
  }
}

interface MissingItemRow {
  ean: string;
  description: string;
  price: number | null;
  competitorName: string;
}

async function fetchMissingItems(fornecedor: string): Promise<MissingItemRow[]> {
  try {
    const res = await fetch("/api/competitors/missing-items?fornecedor=" + encodeURIComponent(fornecedor));
    if (!res.ok) return [];
    const data = await res.json();
    return data.missing || [];
  } catch {
    return [];
  }
}

function downloadBuffer(buffer: ArrayBuffer, fileName: string) {
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportComprasExcel(industry: IndustryRow | undefined, categories: CategoryRow[]) {
  const workbook = new ExcelJS.Workbook();

  const resumoSheet = workbook.addWorksheet("Resumo Industria");
  resumoSheet.columns = [{ width: 28 }, { width: 30 }];
  const resumoRows: Array<[string, string | number]> = [
    ["Fornecedor", industry ? industry.fornecedor : "-"],
    ["Itens Martins", industry ? industry.itensMartins : 0],
    ["Itens Concorrente Cadastrados", industry ? industry.itensConcorrenteCadastrados : 0],
    ["Diferenca de Mix", industry ? industry.diferenca : 0],
    ["Posicionamento (%)", industry ? industry.competitivePct : 0],
    ["Itens em Desvantagem", industry ? industry.disadvantage : 0],
    ["Prioridade", industry ? industry.priority : "-"]
  ];
  resumoRows.forEach(function (row) { resumoSheet.addRow(row); });

  const catSheet = workbook.addWorksheet("Categorias");
  catSheet.columns = [
    { header: "Categoria", width: 30 },
    { header: "Monitorados", width: 14 },
    { header: "Competitivos", width: 14 },
    { header: "Em Desvantagem", width: 16 },
    { header: "Competitividade (%)", width: 18 },
    { header: "Gap Medio (%)", width: 14 },
    { header: "Prioridade", width: 18 }
  ];
  catSheet.getRow(1).font = { bold: true };
  categories.forEach(function (c) {
    catSheet.addRow([
      c.category,
      c.monitored,
      c.competitive,
      c.disadvantage,
      c.competitivePct,
      c.avgDisadvantagePct !== null ? c.avgDisadvantagePct : "-",
      c.priority
    ]);
  });

  const acoes = buildComprasActionRecommendations(categories);
  const acoesSheet = workbook.addWorksheet("Acoes Recomendadas");
  acoesSheet.getColumn(1).width = 80;
  const acoesHeaderRow = acoesSheet.addRow(["Acoes Recomendadas"]);
  acoesHeaderRow.font = { bold: true };
  acoes.forEach(function (a) { acoesSheet.addRow([a]); });

  const products = await fetchProductRows();
  const prodSheet = workbook.addWorksheet("Analise de Produtos");
  prodSheet.columns = [
    { header: "EAN", width: 16 },
    { header: "Descricao", width: 45 },
    { header: "Categoria", width: 22 },
    { header: "Preco Martins", width: 14 },
    { header: "Preco Concorrente", width: 16 },
    { header: "Distribuidor", width: 18 },
    { header: "Diferenca (%)", width: 14 },
    { header: "Status", width: 18 }
  ];
  prodSheet.getRow(1).font = { bold: true };
  products.forEach(function (p) {
    prodSheet.addRow([
      p.ean,
      p.description,
      p.category ? p.category : "-",
      money(p.martinsPrice),
      p.marketPrice !== null ? money(p.marketPrice) : "-",
      p.bestCompetitor ? p.bestCompetitor : "-",
      p.diffPct !== null ? Math.round(p.diffPct * 1000) / 10 : "-",
      STATUS_LABEL[p.status]
    ]);
  });

  if (industry) {
    const missingItems = await fetchMissingItems(industry.fornecedor);
    if (missingItems.length > 0) {
      const missingSheet = workbook.addWorksheet("Itens Sem Cadastro Martins");
      missingSheet.columns = [
        { header: "EAN", width: 16 },
        { header: "Descricao", width: 50 },
        { header: "Concorrente", width: 20 },
        { header: "Preco Concorrente", width: 18 }
      ];
      missingSheet.getRow(1).font = { bold: true };
      missingItems.forEach(function (item) {
        missingSheet.addRow([
          item.ean,
          item.description,
          item.competitorName,
          item.price !== null ? money(item.price) : "-"
        ]);
      });
    }

    const prints = await fetchPrints(industry.fornecedor);
    if (prints.length > 0) {
      const printSheet = workbook.addWorksheet("Print Concorrente");
      printSheet.getColumn(1).width = 90;
      let currentRow = 1;
      for (const print of prints) {
        printSheet.getCell("A" + currentRow).value = print.competitorName;
        printSheet.getCell("A" + currentRow).font = { bold: true };
        currentRow += 1;

        const ext = print.mimeType === "image/jpeg" ? "jpeg" : print.mimeType === "image/gif" ? "gif" : "png";
        const imageId = workbook.addImage({ base64: print.imageBase64, extension: ext });
        printSheet.addImage(imageId, {
          tl: { col: 0, row: currentRow },
          ext: { width: 500, height: 350 }
        });
        currentRow += 20;
      }
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const fileName =
    "analise_compradores_" + (industry ? industry.fornecedor.replace(/\s+/g, "_") : "geral") + ".xlsx";
  downloadBuffer(buffer as ArrayBuffer, fileName);
}
